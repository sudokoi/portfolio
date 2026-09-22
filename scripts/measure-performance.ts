import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const baseURL = process.env.PERF_URL || 'http://localhost:3000';
const browser = await chromium.launch();
const profile = {
  viewport: { width: 390, height: 844 },
  cpuSlowdown: 4,
  downloadMbps: 1.6,
  uploadKbps: 750,
  latencyMs: 150,
  cache: 'cold',
  runs: 3,
};
const measurements = [];
try {
  for (const route of ['/', '/blogs', '/blog/expense-buddy']) {
    const runs: {
      lcp: number;
      cls: number;
      maxInteraction: number;
      transferredBytes: number;
      javascriptBytes: number;
    }[] = [];
    for (let run = 0; run < 3; run++) {
      const context = await browser.newContext({
        viewport: profile.viewport,
        isMobile: true,
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,
        downloadThroughput: (1.6 * 1_000_000) / 8,
        uploadThroughput: (750 * 1000) / 8,
      });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.addInitScript(() => {
        const metrics = { lcp: 0, cls: 0, maxInteraction: 0 };
        Object.assign(window, { perfMetrics: metrics });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) metrics.lcp = entry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        let sessionValue = 0,
          sessionStart = 0,
          lastShift = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
            if (shift.hadRecentInput) continue;
            if (entry.startTime - lastShift > 1000 || entry.startTime - sessionStart > 5000) {
              sessionValue = 0;
              sessionStart = entry.startTime;
            }
            sessionValue += shift.value;
            lastShift = entry.startTime;
            metrics.cls = Math.max(metrics.cls, sessionValue);
          }
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const interaction = entry as PerformanceEntry & { interactionId?: number };
            if (interaction.interactionId)
              metrics.maxInteraction = Math.max(metrics.maxInteraction, entry.duration);
          }
        }).observe({
          type: 'event',
          buffered: true,
          durationThreshold: 16,
        } as PerformanceObserverInit);
      });
      await page.goto(baseURL + route, { waitUntil: 'networkidle' });
      if (route === '/blogs') {
        await page.getByLabel('Search the journal').fill('React');
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await page.getByRole('status').filter({ hasText: /found/ }).waitFor();
      }
      const metrics = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return {
          ...(
            window as unknown as {
              perfMetrics: { lcp: number; cls: number; maxInteraction: number };
            }
          ).perfMetrics,
          transferredBytes: resources.reduce((total, entry) => total + entry.transferSize, 0),
          javascriptBytes: resources
            .filter((entry) => entry.initiatorType === 'script')
            .reduce((total, entry) => total + entry.encodedBodySize, 0),
        };
      });
      runs.push(metrics);
      await context.close();
    }
    const median = (key: keyof (typeof runs)[number]) =>
      runs.map((run) => run[key]).sort((a, b) => a - b)[1];
    measurements.push({
      route,
      runs,
      median: {
        lcp: median('lcp'),
        cls: median('cls'),
        maxInteraction: median('maxInteraction'),
        transferredBytes: median('transferredBytes'),
        javascriptBytes: median('javascriptBytes'),
      },
    });
  }
  let commit = 'uncommitted';
  try {
    commit = execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    /* initial bootstrap */
  }
  const report = {
    recordedAt: new Date().toISOString(),
    baseURL,
    commit,
    browser: browser.version(),
    node: process.version,
    platform: process.platform,
    profile,
    note: 'Local lab measurements; maxInteraction is an observed interaction duration, not field INP. Transfer bytes exclude navigation HTML.',
    measurements,
  };
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/performance.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (
    measurements.some(
      (item) => item.median.lcp <= 0 || item.median.lcp > 2500 || item.median.cls > 0.1,
    )
  )
    process.exitCode = 1;
} finally {
  await browser.close();
}
