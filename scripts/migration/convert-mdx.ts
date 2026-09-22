import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import {
  postSchema,
  type ArticleBlock,
  type PublishedPost,
  type TextBlock,
} from '../../src/modules/content/schema';

type Node = {
  type: string;
  name?: string;
  value?: string;
  url?: string;
  alt?: string;
  lang?: string;
  depth?: number;
  ordered?: boolean;
  children?: Node[];
  attributes?: { name?: string; value?: unknown }[];
  position?: { start: { line: number } };
};
type ImageBlock = Extract<ArticleBlock, { _type: 'image' }>;
const children = (node: Node) => node.children ?? [];
const attr = (node: Node, name: string) => {
  const value = node.attributes?.find((attribute) => attribute.name === name)?.value;
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') throw new Error(`Expression attribute ${name} is not supported`);
  return value;
};
const plain = (node: Node): string => node.value ?? children(node).map(plain).join('');

/** Parse only: legacy MDX imports, exports and expressions are never evaluated. */
export async function convertMdx(
  source: string,
  slug: string,
  resolveAsset: (url: string) => Promise<string>,
): Promise<PublishedPost> {
  const { data, content } = matter(source);
  const tree = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .parse(content) as unknown as Node;
  let sequence = 0;
  const key = () => `k${++sequence}`;
  const fail = (node: Node): never => {
    throw new Error(
      `${slug}:${node.position?.start.line ?? '?'} unsupported ${node.type}${node.name ? ` <${node.name}>` : ''}`,
    );
  };

  function textBlock(nodes: Node[], style: TextBlock['style'] = 'normal'): TextBlock {
    const block: TextBlock = { _type: 'block', _key: key(), style, markDefs: [], children: [] };
    function inline(node: Node, marks: string[] = []) {
      if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'break') {
        block.children.push({
          _type: 'span',
          _key: key(),
          text: node.type === 'break' ? '\n' : (node.value ?? ''),
          marks: node.type === 'inlineCode' ? [...marks, 'code'] : marks,
        });
      } else if (node.type === 'strong' || node.type === 'emphasis' || node.type === 'delete') {
        children(node).forEach((child) =>
          inline(child, [
            ...marks,
            node.type === 'strong' ? 'strong' : node.type === 'delete' ? 'strike-through' : 'em',
          ]),
        );
      } else if (node.type === 'link' || (node.name === 'a' && node.type.startsWith('mdxJsx'))) {
        const mark = key();
        block.markDefs.push({
          _type: 'link',
          _key: mark,
          href: node.url ?? attr(node, 'href') ?? fail(node),
        });
        children(node).forEach((child) => inline(child, [...marks, mark]));
      } else if (
        (node.type.startsWith('mdxJsx') && ['span', 'p', 'figcaption'].includes(node.name ?? '')) ||
        node.type === 'paragraph'
      ) {
        const className = attr(node, 'className') ?? '';
        children(node).forEach((child) =>
          inline(child, className.includes('font-bold') ? [...marks, 'strong'] : marks),
        );
      } else fail(node);
    }
    nodes.forEach((node) => inline(node));
    return block;
  }
  async function convertImage(node: Node, caption?: string, href?: string): Promise<ImageBlock> {
    const url = node.url ?? attr(node, 'src') ?? fail(node);
    return {
      _type: 'image',
      _key: key(),
      asset: { _type: 'reference', _ref: await resolveAsset(url) },
      alt:
        node.alt ||
        attr(node, 'alt') ||
        caption ||
        url
          .split('/')
          .pop()!
          .replace(/[-_]/g, ' ')
          .replace(/\.[^.]+$/, ''),
      ...(caption ? { caption } : {}),
      ...(href ? { href } : {}),
    };
  }
  async function blocks(
    nodes: Node[],
    context: { quote?: boolean; list?: 'bullet' | 'number'; level?: number } = {},
  ): Promise<ArticleBlock[]> {
    const result: ArticleBlock[] = [];
    for (const node of nodes) {
      if (node.type === 'mdxjsEsm') continue;
      if (
        node.type === 'heading' &&
        children(node).some(
          (child) => child.type === 'mdxTextExpression' && child.value === 'frontmatter.title',
        )
      )
        continue;
      if (node.type === 'paragraph' || node.type === 'heading') {
        if (children(node).some((child) => child.type === 'image' || child.name === 'img')) {
          for (const child of children(node)) {
            if (child.type === 'image' || child.name === 'img')
              result.push(await convertImage(child));
            else if (plain(child).trim()) result.push(textBlock([child]));
          }
        } else {
          const block = textBlock(
            children(node),
            context.quote
              ? 'blockquote'
              : node.type === 'heading'
                ? (`h${Math.max(2, node.depth ?? 2)}` as TextBlock['style'])
                : 'normal',
          );
          if (context.list) {
            block.listItem = context.list;
            block.level = context.level ?? 1;
          }
          result.push(block);
        }
      } else if (node.type === 'code')
        result.push({
          _type: 'code',
          _key: key(),
          language: node.lang || 'text',
          code: node.value ?? '',
        });
      else if (node.type === 'blockquote')
        result.push(...(await blocks(children(node), { ...context, quote: true })));
      else if (node.type === 'list')
        result.push(
          ...(await blocks(children(node), {
            ...context,
            list: node.ordered ? 'number' : 'bullet',
            level: (context.level ?? 0) + 1,
          })),
        );
      else if (node.type === 'listItem') result.push(...(await blocks(children(node), context)));
      else if (node.type === 'thematicBreak') result.push({ _type: 'divider', _key: key() });
      else if (node.type === 'image') result.push(await convertImage(node));
      else if (node.type === 'table')
        result.push({
          _type: 'table',
          _key: key(),
          rows: children(node).map((row) => ({
            _key: key(),
            cells: children(row).map((cell) => ({
              _key: key(),
              content: [textBlock(children(cell))],
            })),
          })),
        });
      else if (node.type.startsWith('mdxJsx')) {
        if (node.name === 'BlogTimestamp' || node.name === 'BlogTags') continue;
        if (['HaloEffect', 'WrongHaloEffect', 'WrongHaloEffect2'].includes(node.name ?? '')) {
          const variant =
            node.name === 'WrongHaloEffect'
              ? 'wrong-image'
              : node.name === 'WrongHaloEffect2'
                ? 'wrong-box'
                : attr(node, 'haloClassName')
                  ? 'prominent'
                  : 'halo';
          result.push({ _type: 'demo', _key: key(), variant });
        } else if (node.name === 'figure') {
          const elements = children(node).flatMap((child) =>
            child.type === 'paragraph' ? children(child) : [child],
          );
          const img = elements.find((child) => child.name === 'img');
          if (!img || elements.some((child) => !['img', 'figcaption'].includes(child.name ?? '')))
            fail(node);
          const caption = elements.find((child) => child.name === 'figcaption');
          result.push(await convertImage(img!, caption ? plain(caption).trim() : undefined));
        } else if (node.name === 'div' && children(node).every((child) => child.name === 'img')) {
          result.push({
            _type: 'gallery',
            _key: key(),
            images: await Promise.all(children(node).map((child) => convertImage(child))),
          });
        } else if (
          node.name === 'a' &&
          children(node).length === 1 &&
          children(node)[0].name === 'img'
        ) {
          result.push(await convertImage(children(node)[0], undefined, attr(node, 'href')));
        } else if (node.name === 'img') result.push(await convertImage(node));
        else if (node.name === 'span' || node.name === 'p')
          result.push(textBlock(children(node), context.quote ? 'blockquote' : 'normal'));
        else fail(node);
      } else fail(node);
    }
    return result;
  }
  // Legacy dates are calendar dates, not local-midnight instants.
  const sourceDate = /^([A-Za-z]+) (\d{1,2}), (\d{4})$/.exec(String(data.date));
  if (!sourceDate) throw new Error(`${slug}: unsupported legacy publication date`);
  const month =
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(
      sourceDate[1].slice(0, 3),
    ) + 1;
  const publishedAt = `${sourceDate[3]}-${String(month).padStart(2, '0')}-${sourceDate[2].padStart(2, '0')}`;
  return postSchema.parse({
    id: `post-${slug}`,
    slug,
    title: data.title,
    description: data.description,
    publishedAt,
    tags: data.tags ?? [],
    body: await blocks(children(tree)),
  });
}
