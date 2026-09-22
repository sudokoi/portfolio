import Link from 'next/link';
import { getProfile, listPosts } from '@/modules/content';
import { JsonLd } from '@/modules/seo';
import { canonical } from '@/shared/config/site';
import styles from './home.module.css';

export function HomePage() {
  const profile = getProfile();
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          url: canonical(),
          mainEntity: {
            '@type': 'Person',
            name: profile.name,
            jobTitle: profile.role,
            url: canonical(),
            sameAs: profile.links
              .filter((link) => link.href.startsWith('https:'))
              .map((link) => link.href),
          },
        }}
      />
      <section className={styles.intro} aria-labelledby="intro-title">
        <h1 id="intro-title">A small corner of the internet.</h1>
        <p>{profile.introduction[0]}</p>
        <blockquote>{profile.aside}</blockquote>
        {profile.introduction.slice(1).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p>
          For a detailed overview,{' '}
          <a href="/resume" data-umami-event="resume_link_click">
            download my resume
          </a>
          .
        </p>
      </section>
      <div className={styles.sections}>
        <section aria-labelledby="experience">
          <h2 id="experience">Experience</h2>
          <ol className={styles.experience}>
            {profile.experience.map((job) => (
              <li key={job.company}>
                <h3>{job.role}</h3>
                <p>
                  <a href={job.href}>{job.company}</a> <span className="muted">/ {job.period}</span>
                </p>
                <ul>
                  {job.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
        <div>
          <section aria-labelledby="projects">
            <h2 id="projects">Projects</h2>
            {profile.projects.map((project) => (
              <article className={styles.project} key={project.name}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <a href={project.href} data-umami-event="project_link_click">
                  View source ↗<span className="sr-only"> for {project.name}</span>
                </a>
              </article>
            ))}
          </section>
          <section aria-labelledby="skills">
            <h2 id="skills">Skills</h2>
            <ul className={styles.skills}>
              {profile.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <section className={styles.writing} aria-labelledby="writing">
        <h2 id="writing">From the journal</h2>
        <p>I write about things I build and the problems I run into.</p>
        <ul>
          {listPosts()
            .slice(0, 3)
            .map((post) => (
              <li key={post.id}>
                <Link href={`/blog/${post.slug}`} prefetch={false}>
                  {post.title}
                </Link>
              </li>
            ))}
        </ul>
        <p>
          <Link href="/blogs" prefetch={false}>
            All posts →
          </Link>
        </p>
      </section>
      <section className={styles.contact} aria-labelledby="contact">
        <h2 id="contact">Contact</h2>
        <div className={styles.links}>
          {profile.links.map((link) => (
            <a key={link.label} href={link.href} rel="me" data-umami-event="contact_link_click">
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
