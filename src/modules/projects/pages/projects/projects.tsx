import Image from 'next/image';
import { getAsset, getProfile } from '@/modules/content';
import { JsonLd } from '@/modules/seo';
import { canonical } from '@/shared/config/site';
import styles from './projects.module.css';

export function ProjectsPage() {
  const { projects } = getProfile();
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Projects by Sudhanshu Ranjan',
          url: canonical('/projects'),
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: projects.map((project, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: project.name,
              url: canonical(`/projects${project.slug ? `#${project.slug}` : ''}`),
            })),
          },
        }}
      />
      <header className={styles.header}>
        <h1>Things I’ve built.</h1>
        <p>
          Independent projects, from the first idea to the details that make them useful every day.
        </p>
      </header>
      <div className={styles.projects}>
        {projects.map((project) => {
          const icon = project.icon ? getAsset(project.icon.asset._ref) : undefined;
          const screenshot = project.screenshot
            ? getAsset(project.screenshot.asset._ref)
            : undefined;
          return (
            <article key={project.name} id={project.slug} className={styles.project}>
              <div className={styles.identity}>
                {icon && project.icon ? (
                  <Image
                    className={styles.icon}
                    src={icon.path}
                    alt={project.icon.alt}
                    width={80}
                    height={80}
                    sizes="80px"
                  />
                ) : null}
                <div>
                  <h2>{project.name}</h2>
                  <p className={styles.meta}>
                    {[
                      project.platform,
                      project.status === 'released'
                        ? 'Public release'
                        : project.status === 'in-development'
                          ? 'In development'
                          : undefined,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
              <div className={`${styles.detail} ${screenshot ? styles.withScreenshot : ''}`}>
                <div>
                  <p className={styles.description}>{project.description}</p>
                  {project.highlights?.length ? (
                    <ul className={styles.highlights}>
                      {project.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  ) : null}
                  {project.stack?.length ? (
                    <p className={styles.stack}>
                      <span>Built with</span> {project.stack.join(' · ')}
                    </p>
                  ) : null}
                  {project.playStoreUrl || project.href ? (
                    <div className={styles.links}>
                      {project.playStoreUrl ? (
                        <a
                          href={project.playStoreUrl}
                          data-umami-event="project_link_click"
                          data-umami-event-project={project.name}
                        >
                          Get it on Google Play<span className="sr-only">: {project.name}</span> ↗
                        </a>
                      ) : null}
                      {project.href ? (
                        <a
                          href={project.href}
                          data-umami-event="project_link_click"
                          data-umami-event-project={project.name}
                        >
                          View source<span className="sr-only">: {project.name}</span> ↗
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {screenshot && project.screenshot ? (
                  <figure className={styles.screenshot}>
                    <Image
                      src={screenshot.path}
                      alt={project.screenshot.alt}
                      width={screenshot.width}
                      height={screenshot.height}
                      sizes="(max-width: 768px) 220px, 240px"
                    />
                  </figure>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
