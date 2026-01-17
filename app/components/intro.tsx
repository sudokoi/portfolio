import LinkedinIcon from "~/assets/icons/linkedin-in.svg?react";
import TwitterIcon from "~/assets/icons/x-twitter.svg?react";
import GithubIcon from "~/assets/icons/github.svg?react";
import MailIcon from "~/assets/icons/envelope-regular.svg?react";
import InstagramIcon from "~/assets/icons/instagram.svg?react";
import {
  EMAIL,
  GITHUB_HANDLE,
  INSTAGRAM_HANDLE,
  LINKEDIN_HANDLE,
  TWITTER_HANDLE,
} from "~/utils/contants";

export function Intro() {
  return (
    <div className="grid gap-2 text-base font-medium">
      <section title="introduction" className="grid gap-2 text-balance">
        <p>
          Hi, I&apos;m Sudhanshu Ranjan. I&apos;m a senior frontend engineer
          with 6+ years of experience building fast, responsive, accessible
          products. I focus on frontend architecture, cross-browser behavior,
          and shipping features end-to-end with product, design, and backend
          teams. Outside of work, I enjoy video games, anime, and reading.
        </p>
        <blockquote className="my-2 block border-l-4 border-accent py-2 pl-4 italic text-secondary">
          Ask me about iframes or forms &mdash; I&apos;ve solved my fair share
          of tricky problems there.
        </blockquote>
        <p>
          I&apos;m currently working as a senior software engineer (frontend
          lead) at{" "}
          <a
            href="https://fletch.co"
            target="_blank"
            rel="noreferrer noopenner"
            className="text-secondary hover:text-accent focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
          >
            Fletch
          </a>
          .
        </p>
        <p>I like learning new things and sharing my knowledge with others.</p>
        <p>
          For a detailed overview, you can download my{" "}
          <a
            href="/resume"
            title="Download resume"
            aria-label="Download resume"
            className="text-secondary hover:text-accent focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
          >
            resume
          </a>
          <span className="text-secondary">.</span>
        </p>
      </section>

      <section title="experience">
        <h2 className="text-xl font-bold">Experience</h2>
        <ul className="grid gap-4">
          <li className="grid gap-2 rounded-lg border border-secondary/20 p-4">
            <h3 className="text-lg font-semibold">
              Senior Software Engineer (Frontend Lead)
            </h3>
            <p className="text-base">
              <a
                href="https://fletch.co/"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-accent focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
              >
                Fletch
              </a>
              <span className="text-secondary">, Dec 2022 - present</span>
            </p>
            <ul className="list-disc pl-5 text-base">
              <li>
                Led frontend architecture for a multi-tenant pet insurance
                platform<span className="text-secondary">.</span>
              </li>
              <li>
                Built an internal form builder and shipped analytics, A/B
                testing, and partner widgets with Web Components
                <span className="text-secondary">.</span>
              </li>
            </ul>
          </li>
          <li className="grid gap-2 rounded-lg border border-secondary/20 p-4">
            <h3 className="text-lg font-semibold">Software Engineer</h3>
            <p className="text-base">
              <a
                href="https://interviewkickstart.com/"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-accent focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
              >
                Interview Kickstart
              </a>
              <span className="text-secondary">, Nov 2021 - Nov 2022</span>
            </p>
            <ul className="list-disc pl-5 text-base">
              <li>
                Led i18n and built analytics and payment integrations
                <span className="text-secondary">.</span>
              </li>
              <li>
                Improved DX with Storybook and a monorepo, and contributed
                backend APIs<span className="text-secondary">.</span>
              </li>
            </ul>
          </li>
          <li className="grid gap-2 rounded-lg border border-secondary/20 p-4">
            <h3 className="text-lg font-semibold">
              Software Development Engineer (Frontend Lead)
            </h3>
            <p className="text-base">
              <a
                href="https://paytm.com/"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-accent focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
              >
                Aptus Data Labs
              </a>
              <span className="text-secondary">, Jan 2019 - Aug 2021</span>
            </p>
            <ul className="list-disc pl-5 text-base">
              <li>
                Led analytics dashboards, implemented RBAC, and migrated to
                TypeScript<span className="text-secondary">.</span>
              </li>
              <li>
                Automated deployments with Docker and improved platform
                reliability<span className="text-secondary">.</span>
              </li>
            </ul>
          </li>
        </ul>
      </section>
      <section title="projects" className="grid gap-2">
        <h2 className="text-xl font-bold">Projects</h2>
        <ul className="grid gap-3">
          <li className="grid gap-2 rounded-lg border border-secondary/20 p-4">
            <h3 className="text-lg font-semibold">Expense Buddy</h3>
            <p className="text-base">
              Cross-platform expense tracker built with React Native and Expo
              <span className="text-secondary">.</span>
            </p>
            <a
              href="https://github.com/sudokoi/expense-buddy"
              target="_blank"
              rel="noreferrer"
              className="text-secondary hover:text-accent focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
            >
              github.com/sudokoi/expense-buddy
            </a>
          </li>
          <li className="grid gap-2 rounded-lg border border-secondary/20 p-4">
            <h3 className="text-lg font-semibold">Portfolio &amp; Blog</h3>
            <p className="text-base">
              Remix portfolio and blog with TypeScript, MDX, and dynamic OG
              images<span className="text-secondary">.</span>
            </p>
            <a
              href="https://github.com/sudokoi/portfolio"
              target="_blank"
              rel="noreferrer"
              className="text-secondary hover:text-accent focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
            >
              github.com/sudokoi/portfolio
            </a>
          </li>
        </ul>
      </section>
      <section title="skills">
        <h2 className="text-xl font-bold">Skills</h2>
        <ul className="max-w-lg columns-2 text-secondary">
          <li>TypeScript / JavaScript</li>
          <li>React / Next.js / Remix</li>
          <li>React Native</li>
          <li>Tailwind / MUI / Chakra</li>
          <li>Node.js / Django</li>
          <li>REST APIs / SQL</li>
          <li>Docker / CI/CD</li>
          <li>GTM / GA / Adobe</li>
          <li>Accessibility / Performance</li>
          <li>A/B Testing</li>
        </ul>
      </section>
      <section title="contact">
        <h2 className="text-xl font-bold">Contact</h2>
        <ul className="flex gap-4 pt-2">
          <li>
            <a
              href={`https://www.linkedin.com/in/${LINKEDIN_HANDLE}/`}
              target="_blank"
              rel="me noreferrer"
              className="text-accent hover:underline focus:outline-offset-2 focus:outline-accent"
            >
              <LinkedinIcon className="size-6 fill-accent" />
            </a>
          </li>
          <li>
            <a
              href={`https://twitter.com/${TWITTER_HANDLE}`}
              target="_blank"
              rel="me noreferrer"
              className="text-accent hover:underline focus:outline-offset-2 focus:outline-accent"
            >
              <TwitterIcon className="size-6 fill-accent" />
            </a>
          </li>
          <li>
            <a
              href={`https://github.com/${GITHUB_HANDLE}`}
              target="_blank"
              rel="me noreferrer"
              className="text-accent hover:underline focus:outline-offset-2 focus:outline-accent"
            >
              <GithubIcon className="size-6 fill-accent" />
            </a>
          </li>
          <li>
            <a
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="me noreferrer"
              className="text-accent hover:underline focus:outline-offset-2 focus:outline-accent"
            >
              <InstagramIcon className="size-6 fill-accent" />
            </a>
          </li>
          <li>
            <a
              href={`mailto:${EMAIL}`}
              className="text-accent focus:outline-offset-2 focus:outline-accent"
            >
              <MailIcon className="size-6 fill-accent" />
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
