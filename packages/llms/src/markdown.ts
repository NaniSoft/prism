/**
 * The MDX to Markdown lane and the fixed per-item spec renderers.
 *
 * The corpus reads raw MDX (ticket 12 section 2), strips mechanics itself, and
 * emits one generated item spec into both the mirror file and `llms-full.txt`.
 * The `## Props` body is a line-oriented definition list, not a table, because
 * the MCP server's regular expression keys on the literal `## Props` heading.
 *
 * The separator between the definition-list fields is an em dash, which ticket
 * 12 fixes as format. It is written as an escape so the source stays free of the
 * typographic dash the repository bans in reader-facing copy.
 */
import type { ExtractedInterface } from './extractor.js'

const FIELD_SEPARATOR = ' \u2014 '
const NO_DEFAULT = '\u2014'

export interface DocMeta {
  title?: string
  description?: string
}

export interface ParsedMdx {
  data: DocMeta
  body: string
}

/** Parse `---`-delimited `key: value` frontmatter (the fumadocs default schema). */
export function parseMdx(raw: string): ParsedMdx {
  const normalized = raw.replace(/\r\n/g, '\n')
  if (!normalized.startsWith('---\n')) return { data: {}, body: normalized }
  const close = normalized.indexOf('\n---', 4)
  if (close === -1) return { data: {}, body: normalized }
  const front = normalized.slice(4, close)
  const data: DocMeta = {}
  for (const line of front.split('\n')) {
    const match = /^(\w+):\s*(.*)$/.exec(line)
    if (!match) continue
    const value = (match[2] ?? '')
      .replace(/^['"]|['"]$/g, '')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
    if (match[1] === 'title' || match[1] === 'description') data[match[1]] = value
  }
  return { data, body: normalized.slice(close + 4).replace(/^\n+/, '') }
}

/** A fenced code block; the trailing newline of the source is normalised away. */
export function fence(code: string, language: string): string {
  return `\`\`\`${language}\n${code.replace(/\r\n/g, '\n').replace(/\n$/, '')}\n\`\`\``
}

/**
 * Strip MDX machinery: top-level import statements and JSX comment markers.
 * Fence-aware: a fenced import line is content (the page's own snippet), an
 * MDX top-level import is machinery.
 */
export function stripMdxMechanics(body: string): string {
  const kept: string[] = []
  let inFence = false
  for (const line of body.replace(/\r\n/g, '\n').split('\n')) {
    if (/^\s*```/.test(line)) inFence = !inFence
    if (!inFence && /^\s*import\b/.test(line)) continue
    if (!inFence && /^\s*\{\/\*[\s\S]*\*\/\}\s*$/.test(line)) continue
    kept.push(line)
  }
  return kept
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\s+$/, '')
}

/**
 * Drop one `## <heading>` section from a body, up to the next H2 heading. The
 * `## Usage` section is dropped from the prose body because the import fence
 * and the demo replace it in the fixed spec shape.
 */
export function stripSection(body: string, heading: string): string {
  const lines = body.replace(/\r\n/g, '\n').split('\n')
  const target = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`)
  const kept: string[] = []
  let skipping = false
  for (const line of lines) {
    if (target.test(line)) {
      skipping = true
      continue
    }
    if (skipping && /^##\s+/.test(line)) skipping = false
    if (!skipping) kept.push(line)
  }
  return kept
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\s+$/, '')
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** The demo section: the title line, then the verbatim source in a `tsx` fence. */
export function renderDemoSection(title: string, code: string): string {
  return `**${title}**\n\n${fence(code, 'tsx')}`
}

/**
 * The `## Props` definition-list line, the fixed shape the MCP server parses:
 * a bold-backtick prop name, its type in backticks, middle-dot separated
 * `optional` or `required`, the default in backticks or an em dash, then a
 * prose description.
 */
export function renderPropLine(prop: ExtractedInterface['props'][number]): string {
  const requirement = prop.required ? 'required' : 'optional'
  const defaultValue = prop.defaultValue ? `\`${prop.defaultValue}\`` : NO_DEFAULT
  const description = prop.description ? `${FIELD_SEPARATOR}${prop.description}` : ''
  return `**\`${prop.name}\`** \`${prop.typeText}\` · ${requirement} · default: ${defaultValue}${description}`
}

export interface ParsedPropLine {
  name: string
  typeText: string
  required: boolean
  defaultValue?: string
  description?: string
}

/** Parse one definition-list line back into its four fields (the round-trip). */
export function parsePropLine(line: string): ParsedPropLine | null {
  const match =
    /^\*\*`([^`]+)`\*\* `([^`]+)` · (required|optional) · default: (?:`([^`]*)`|\u2014)(?:\s+\u2014\s+(.*))?$/.exec(
      line,
    )
  if (!match) return null
  return {
    name: match[1] ?? '',
    typeText: match[2] ?? '',
    required: match[3] === 'required',
    ...(match[4] !== undefined ? { defaultValue: match[4] } : {}),
    ...(match[5] !== undefined ? { description: match[5] } : {}),
  }
}

/**
 * The aggregated definition-list body for an item's exports, one entry per
 * line, de-duplicated by prop name across compound parts, with no blank lines.
 */
export function renderPropsBody(interfaces: readonly ExtractedInterface[]): string {
  const seen = new Set<string>()
  const lines: string[] = []
  for (const iface of interfaces) {
    for (const prop of iface.props) {
      if (seen.has(prop.name)) continue
      seen.add(prop.name)
      lines.push(renderPropLine(prop))
    }
  }
  return lines.join('\n')
}

/**
 * The literal `## Props` section. When the item declares no own props, the
 * documented seam line is emitted instead of an empty list.
 */
export function renderPropsSection(
  interfaces: readonly ExtractedInterface[],
  seam: string,
): string {
  const body = renderPropsBody(interfaces)
  return `## Props\n\n${body || seam}`
}

export interface CompositionField {
  key: string
  value: string
  description: string
}

/** The `## Composition` section for a Block or a Page. */
export function renderCompositionSection(fields: readonly CompositionField[]): string {
  const lines = fields.map(
    (field) => `**\`${field.key}\`** \`${field.value}\`${FIELD_SEPARATOR}${field.description}`,
  )
  return `## Composition\n\n${lines.join('\n')}`
}

export interface CrossReference {
  heading: 'Blocks' | 'Pages'
  links: ReadonlyArray<{ name: string; href: string }>
}

/** The `## Blocks` / `## Pages` cross-references, emitted last. */
export function renderCrossReferences(references: readonly CrossReference[]): string {
  return references
    .filter((reference) => reference.links.length > 0)
    .map(
      (reference) =>
        `## ${reference.heading}\n\n${reference.links
          .map((link) => `- [${link.name}](${link.href})`)
          .join('\n')}`,
    )
    .join('\n\n')
}

/**
 * The first line of the JSDoc block immediately preceding the default export,
 * used as the demo's title. Falls back to a stable generated title.
 */
export function demoTitle(source: string, fallback: string): string {
  const exportIndex = source.search(/export\s+default/)
  const before = source.slice(0, exportIndex >= 0 ? exportIndex : source.length)
  const blocks = [...before.matchAll(/\/\*\*([\s\S]*?)\*\//g)]
  const block = blocks.at(-1)
  if (block) {
    const first = (block[1] ?? '')
      .split('\n')
      .map((line) => line.replace(/^\s*\*?\s?/, '').trim())
      .find(Boolean)
    if (first) return first
  }
  return fallback
}

/** Join the fixed per-item sections with the stable blank-line separator. */
export function assembleDoc(sections: readonly (string | undefined)[]): string {
  const joined = sections
    .filter((section): section is string => Boolean(section && section.trim()))
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+$/, '')
  return joined ? `${joined}\n` : ''
}
