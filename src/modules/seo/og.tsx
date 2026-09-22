import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function socialImage(title: string, description: string) {
  const [font, logo] = await Promise.all([
    readFile(path.join(process.cwd(), 'src/modules/seo/fonts/JetBrainsMono-Bold.ttf')),
    readFile(path.join(process.cwd(), 'public/assets/logo.png')),
  ]);
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#F3F2F8',
        color: '#363681',
        padding: '48px 64px',
        fontFamily: 'Journal Mono',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          fontSize: 30,
          borderBottom: '2px solid #d3d0e5',
          paddingBottom: 22,
        }}
      >
        {/* ImageResponse requires a native img; these bytes never reach the browser bundle. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${logo.toString('base64')}`}
          width={38}
          height={48}
          alt=""
        />
        Sudhanshu’s Corner
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
        <div
          style={{
            fontSize: title.length > 80 ? 42 : 50,
            lineHeight: 1.2,
            letterSpacing: '-1.5px',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 23, lineHeight: 1.45, marginTop: 24, color: '#555574' }}>
          {description.slice(0, 220)}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 21,
          color: '#b82e50',
          paddingTop: 20,
          borderTop: '2px solid #d3d0e5',
        }}
      >
        <span>sudh.online</span>
        <span>@sudokaii</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Journal Mono', data: font, style: 'normal', weight: 700 }],
    },
  );
}
