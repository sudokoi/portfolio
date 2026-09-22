import Link from 'next/link';
import Image from 'next/image';
import { getAsset, getProfile, listPosts } from '@/modules/content';
import { JsonLd } from '@/modules/seo';
import { canonical } from '@/shared/config/site';
import styles from './home.module.css';

export function HomePage() {
  const profile = getProfile();
  const photo = profile.photo ? getAsset(profile.photo.asset._ref) : undefined;
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
            ...(photo ? { image: canonical(photo.path) } : {}),
            url: canonical(),
            sameAs: profile.links
              .filter((link) => link.href.startsWith('https:'))
              .map((link) => link.href),
          },
        }}
      />
      <section
        className={`${styles.intro} ${photo ? styles.withPhoto : ''}`}
        aria-labelledby="intro-title"
      >
        <h1 id="intro-title">My small corner of the internet.</h1>
        <div className={styles.introLayout}>
          {photo && profile.photo ? (
            <Image
              className={styles.portrait}
              src={photo.path}
              alt={profile.photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 768px) 96px, 176px"
              preload
            />
          ) : null}
          <div className={styles.introCopy}>
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
          </div>
        </div>
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
            {profile.projects.slice(0, 3).map((project) => (
              <article className={styles.project} key={project.name}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <Link
                  href={`/projects${project.slug ? `#${project.slug}` : ''}`}
                  prefetch={false}
                  data-umami-event="project_link_click"
                  data-umami-event-project={project.name}
                >
                  Explore {project.name} →
                </Link>
              </article>
            ))}
            <p>
              <Link href="/projects" prefetch={false}>
                All projects →
              </Link>
            </p>
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
