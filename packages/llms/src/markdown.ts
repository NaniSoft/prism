/**
 * The MDX → Markdown lane (ticket 16 §2): the docs MDX is authoritative prose,
 * emitted to `.md` by stripping frontmatter and MDX machinery and replacing
 * each `ComponentDemo` element with that example's fenced TSX — lossless
 * because ticket 12's self-contained contract makes every demo one file.
 */
import type { ExtractedInterface } from './extractor.js';

/** Frontmatter prism-llms consumes — fumadocs defaults only (ticket 12 §3). */
export interface DocMeta {
  title?: string;
  description?: string;
}

export interface ParsedMdx {
  data: DocMeta;
  body: string;
}

/** Parse `---`-delimited `key: value` frontmatter (the fumadocs default schema — no nesting). */
export function parseMdx(raw: string): ParsedMdx {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return { data: {}, body: normalized };
  const close = normalized.indexOf('\n---', 4);
  if (close === -1) return { data: {}, body: normalized };
  const front = normalized.slice(4, close);
  const data: DocMeta = {};
  for (const line of front.split('\n')) {
    const match = /^(\w+):\s*(.*)$/.exec(line);
    if (!match) continue;
    const value = (match[2] ?? '').replace(/^['"]|['"]$/g, '');
    if (match[1] === 'title' || match[1] === 'description') data[match[1]] = value;
  }
  return { data, body: normalized.slice(close + 4).replace(/^\n+/, '') };
}

/** Inline code fences in the emitted Markdown. */
export function fence(code: string, language: string): string {
  return `\`\`\`${language}\n${code.replace(/\r\n/g, '\n').replace(/\n$/, '')}\n\`\`\``;
}

/**
 * Replace every `<ComponentDemo id="…" [title="…"] />` element outside code
 * fences with that example's fenced TSX. `readDemo` returns the example source
 * (or undefined for an unknown id — a hard error: the cross-ref would be dead).
 */
export function renderComponentDemos(body: string, readDemo: (id: string) => string | undefined): string {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    const demo = /^\s*<ComponentDemo\s+([^>]*?)\/>\s*$/.exec(line);
    if (!demo) {
      out.push(line);
      continue;
    }
    const id = /\bid=["']([^"']+)["']/.exec(demo[1] ?? '')?.[1];
    if (!id) throw new Error(`ComponentDemo element without an id attribute: ${line.trim()}`);
    const code = readDemo(id);
    if (code === undefined) throw new Error(`ComponentDemo references unknown example id '${id}'`);
    const title = /\btitle=["']([^"']+)["']/.exec(demo[1] ?? '')?.[1];
    if (title) out.push(`**${title}**`);
    out.push(fence(code, 'tsx'));
  }
  return out.join('\n');
}

/**
 * Strip MDX machinery for the `.md` lane: import statements and JSX comment
 * markers. Fence-aware — fenced import lines are content (the copyable import
 * line of the page skeleton), MDX top-level imports are machinery.
 */
export function stripMdxMechanics(body: string): string {
  const kept: string[] = [];
  let inFence = false;
  for (const line of body.replace(/\r\n/g, '\n').split('\n')) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence && /^\s*import\b/.test(line)) continue;
    if (!inFence && /^\s*\{\/\*[\s\S]*\*\/\}\s*$/.test(line)) continue;
    kept.push(line);
  }
  return kept
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\s+$/, '');
}

/** Render a Markdown table; cells are pipe-escaped and flattened. */
export function renderTable(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const escape = (cell: string) => cell.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
  const head = `| ${headers.map(escape).join(' | ')} |`;
  const rule = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map(escape).join(' | ')} |`);
  return [head, rule, ...body].join('\n');
}

const NO_ADDITIONAL_PROPS = '_No additional Prism-authored props are declared for this item._';

/**
 * Render the public props section from Prism's built declarations. Items whose
 * declarations expose no authored props collapse to one explicit API note;
 * internal accessibility primitives are never presented as consumer props.
 */
export function renderPropsSection(interfaces: readonly ExtractedInterface[]): string {
  const withProps = interfaces.filter((iface) => iface.props.length > 0);
  if (withProps.length === 0) return `## Props\n\n${NO_ADDITIONAL_PROPS}`;

  const parts: string[] = ['## Props'];
  for (const iface of withProps) {
    if (withProps.length > 1) parts.push(`### ${iface.typeName}`);
    const rows = iface.props.map((prop) => [
      `\`${prop.name}\`${prop.required ? '' : ' (optional)'}`,
      prop.typeText,
      prop.defaultValue ? `\`${prop.defaultValue}\`` : '—',
      prop.description ?? '—',
    ]);
    parts.push(renderTable(['Prop', 'Type', 'Default', 'Description'], rows));
  }
  return parts.join('\n\n');
}
