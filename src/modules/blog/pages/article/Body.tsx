import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { codeToHtml, bundledLanguages } from 'shiki';
import { getAsset, type ArticleBlock, type TextBlock } from '@/modules/content';
import styles from './article.module.css';

function RichText({ value }: { value: TextBlock[] }) {
  return (
    <PortableText
      value={value}
      components={{
        marks: { link: ({ value, children }) => <a href={value?.href}>{children}</a> },
      }}
    />
  );
}
function Figure({ image }: { image: Extract<ArticleBlock, { _type: 'image' }> }) {
  const asset = getAsset(image.asset._ref);
  const visual = (
    <Image
      src={asset.path}
      alt={image.alt}
      width={asset.width}
      height={asset.height}
      sizes="(max-width: 640px) 90vw, 720px"
      unoptimized={asset.mimeType === 'image/svg+xml'}
    />
  );
  return (
    <figure className={styles.figure}>
      {image.href ? <a href={image.href}>{visual}</a> : visual}
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  );
}
async function Block({ block }: { block: Exclude<ArticleBlock, TextBlock> }) {
  switch (block._type) {
    case 'code': {
      const lang =
        block.language in bundledLanguages
          ? (block.language as keyof typeof bundledLanguages)
          : 'text';
      const html = await codeToHtml(block.code, { lang, theme: 'github-dark-high-contrast' });
      return (
        <div
          className={styles.code}
          tabIndex={0}
          role="region"
          aria-label={`${block.language} code`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    case 'image':
      return <Figure image={block} />;
    case 'gallery':
      return (
        <div className={styles.gallery}>
          {block.images.map((image) => (
            <Figure key={image._key} image={image} />
          ))}
        </div>
      );
    case 'table':
      return (
        <div className={styles.table} tabIndex={0} role="region" aria-label="Article table">
          <table>
            <thead>
              <tr>
                {block.rows[0].cells.map((cell) => (
                  <th scope="col" key={cell._key}>
                    <RichText value={cell.content} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.slice(1).map((row) => (
                <tr key={row._key}>
                  {row.cells.map((cell) => (
                    <td key={cell._key}>
                      <RichText value={cell.content} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'demo':
      return (
        <div
          role="img"
          aria-label={`Live halo demonstration: ${block.variant}`}
          className={`${styles.demo} ${block.variant === 'prominent' ? styles.prominent : block.variant === 'wrong-box' ? styles.wrongBox : block.variant === 'wrong-image' ? styles.wrongImage : ''}`}
        >
          <div className={styles.halo} />
          <Image src="/assets/logo.png" width={40} height={40} alt="" />
        </div>
      );
    case 'divider':
      return <hr />;
  }
}
export async function Body({ body }: { body: ArticleBlock[] }) {
  // Keep adjacent Portable Text blocks together so lists retain their semantics.
  const groups: (TextBlock[] | Exclude<ArticleBlock, TextBlock>)[] = [];
  for (const block of body) {
    if (block._type === 'block') {
      const last = groups.at(-1);
      if (Array.isArray(last)) last.push(block);
      else groups.push([block]);
    } else groups.push(block);
  }
  return (
    <div className={styles.body}>
      {await Promise.all(
        groups.map(async (group) =>
          Array.isArray(group) ? (
            <RichText key={group[0]._key} value={group} />
          ) : (
            <Block key={group._key} block={group} />
          ),
        ),
      )}
    </div>
  );
}
