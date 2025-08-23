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
          Hi, I&apos;m Sudhanshu Ranjan. I&apos;m a frontend developer with more
          than 6 years of experience building applications that are fast,
          responsive, and accessible. I currently work as a senior frontend
          developer at Fletch, where I focus on creating user-friendly
          interfaces with React and TypeScript. Outside of work, I enjoy video
          games, anime, and reading.
          <blockquote className="my-2 block border-l-4 border-accent py-2 pl-4 italic text-secondary">
            Ask me about iframes or forms &mdash; I&apos;ve solved my fair share
            of tricky problems there.
          </blockquote>
        </p>
        <p>
          I&apos;m currently working as a senior frontend developer at{" "}
          <a
            href="https://fletch.co"
            target="_blank"
            rel="noreferrer noopenner"
            className="text-accent focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
          >
            Fletch
          </a>
          .
        </p>
        <p>
          I like learning new things and sharing my knowledge with others. When
          I&apos;m not coding, I&apos;m probably playing video games, watching
          anime or reading books.
        </p>
      </section>

      <section title="experience">
        <h2 className="text-xl font-bold">Experience</h2>
        <ul>
          <li>
            <h3 className="text-lg font-semibold">Senior Frontend Developer</h3>
            <p className="text-base">
              <a
                href="https://fletch.co/"
                target="_blank"
                rel="noreferrer"
                className="text-accent focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
              >
                Fletch
              </a>
              <span className="text-secondary">, Jan 2023 - present</span>
            </p>
          </li>
          <li>
            <h3 className="text-lg font-semibold">Software Engineer</h3>
            <p className="text-base">
              <a
                href="https://interviewkickstart.com/"
                target="_blank"
                rel="noreferrer"
                className="text-accent focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
              >
                Interview Kickstart
              </a>
              <span className="text-secondary">, Nov 2021 - Nov 2022</span>
            </p>
          </li>
          <li>
            <h3 className="text-lg font-semibold">Software Engineer</h3>
            <p className="text-base">
              <a
                href="https://paytm.com/"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
              >
                Paytm
              </a>
              <span className="text-secondary">, Aug 2021 - Nov 2021</span>
            </p>
          </li>
          <li>
            <h3 className="text-lg font-semibold">Software Engineer</h3>
            <p className="text-base">
              <a
                href="https://www.aptusdatalabs.com/"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
              >
                Aptus Data Labs
              </a>
              <span className="text-secondary">, July 2019 - Aug 2021</span>
            </p>
          </li>
        </ul>
      </section>
      <section title="skills">
        <h2 className="text-xl font-bold">Skills</h2>
        <ul className="max-w-lg columns-2 text-secondary">
          <li>React.js</li>
          <li>Next.js</li>
          <li>Remix</li>
          <li>TypeScript</li>
          <li>Tailwind CSS</li>
          <li>Git</li>
          <li>Docker</li>
          <li>Node.js</li>
          <li>Python</li>
          <li>Django</li>
        </ul>
      </section>
      <section title="contact">
        <h2 className="text-xl font-bold">Contact</h2>
        <ul className="flex gap-4 pt-2">
          <li>
            <a
              href={`https://www.linkedin.com/in/${LINKEDIN_HANDLE}/`}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline focus:outline-offset-2 focus:outline-accent"
            >
              <LinkedinIcon className="size-6 fill-accent" />
            </a>
          </li>
          <li>
            <a
              href={`https://twitter.com/${TWITTER_HANDLE}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline focus:outline-offset-2 focus:outline-accent"
            >
              <TwitterIcon className="size-6 fill-accent" />
            </a>
          </li>
          <li>
            <a
              href={`https://github.com/${GITHUB_HANDLE}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline focus:outline-offset-2 focus:outline-accent"
            >
              <GithubIcon className="size-6 fill-accent" />
            </a>
          </li>
          <li>
            <a
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noreferrer"
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
