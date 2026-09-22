import type { ArticleBlock, TextBlock } from './schema';
const inlineText = (block: TextBlock) =>
  block.children
    .map((child) => {
      let value = child.text;
      for (const mark of child.marks) {
        if (mark === 'code') value = `\`${value}\``;
        const link = block.markDefs.find((def) => def._key === mark);
        if (link) value = `[${value}](${link.href})`;
      }
      return value;
    })
    .join('');
export function articleText(body: ArticleBlock[]): string {
  return body
    .map((block) => {
      switch (block._type) {
        case 'block':
          return `${/^h[234]$/.test(block.style) ? '#'.repeat(Number(block.style[1])) + ' ' : block.listItem ? '- ' : ''}${inlineText(block)}`;
        case 'code':
          return `\`\`\`${block.language}\n${block.code}\n\`\`\``;
        case 'image':
          return [block.alt, block.caption, block.href].filter(Boolean).join(' — ');
        case 'gallery':
          return block.images
            .map((image) => [image.alt, image.caption].filter(Boolean).join(' — '))
            .join('\n');
        case 'table':
          return block.rows
            .map((row) =>
              row.cells.map((cell) => cell.content.map(inlineText).join(' ')).join(' | '),
            )
            .join('\n');
        case 'demo':
          return `[Live CSS demonstration: ${block.variant}]`;
        case 'divider':
          return '---';
      }
    })
    .join('\n\n');
}
