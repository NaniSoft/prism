/**
 * The one props extractor.
 *
 * It reads `@nanisoft/prism-ui`'s emitted declarations, never its TypeScript
 * source, and it is deliberately compiler-API-free: a small structural scanner
 * for the declaration shapes this repository emits. Ticket 12 section 2 fixes
 * the seam at the emitted `.d.ts`, so a compiler bump cannot break the corpus.
 *
 * The shapes it understands:
 * - a named props type (`export type XProps = { ... }` or
 *   `export interface XProps extends Y { ... }`), referenced by a function;
 * - an inline props object on the function parameter;
 * - `ComponentProps<'tag'>`, recorded as an inherited base rather than
 *   expanded, so a native-backed component reports its element;
 * - `VariantProps<typeof recipe>`, expanded from the emitted `cva` declaration
 *   into the recipe's `variant` and `size` rows.
 *
 * One extractor, two renderers: the corpus's `## Props` definition list and the
 * site's API reference table. There is no second extraction.
 */

export interface ExtractedProp {
  readonly name: string
  /** Type text as written, whitespace-normalised, comments stripped. */
  readonly typeText: string
  /** Leading JSDoc text (the prop description). */
  readonly description?: string
  readonly required: boolean
  /** `@defaultValue` tag text, when present. */
  readonly defaultValue?: string
}

export interface ExtractedInterface {
  /** The public export name this interface describes. */
  readonly typeName: string
  /** The inherited base, when the annotation is not wholly Prism-authored. */
  readonly extendsType?: string
  readonly props: readonly ExtractedProp[]
}

interface RawRow {
  name: string
  type: string
  required: boolean
  default: string
  description: string
}

function toProp(row: RawRow): ExtractedProp {
  return {
    name: row.name,
    typeText: row.type.replace(/\s+/g, ' ').trim(),
    required: row.required,
    ...(row.description ? { description: row.description } : {}),
    ...(row.default && row.default !== '-' ? { defaultValue: row.default } : {}),
  }
}

/** Extract every exported `*Props` interface from a declaration, in source order. */
export function extractProps(source: string): ExtractedInterface[] {
  const results: ExtractedInterface[] = []
  const pattern = /export\s+interface\s+(\w+)(?:\s+extends\s+([^{}]+?))?\s*\{/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(source)) !== null) {
    if (!(match[1] ?? '').endsWith('Props')) continue
    const openBrace = pattern.lastIndex - 1
    const found = readBalancedBody(source, openBrace)
    if (found === undefined) continue
    results.push({
      typeName: match[1] ?? '',
      ...(match[2] ? { extendsType: match[2].trim() } : {}),
      props: parseMembers(found.body).map(toProp),
    })
  }
  return results
}

/**
 * Extract the props of the named exports from one declaration file's text.
 * Exports with no declaration are reported with an empty prop list.
 */
export function extractExports(
  source: string,
  exportNames: readonly string[],
): ExtractedInterface[] {
  return exportNames.map((name) => {
    const params = findFunctionParams(source, name)
    if (params === null) return { typeName: name, props: [] }
    const { props, inherited } = resolveAnnotation(annotationOf(params), source)
    return {
      typeName: name,
      ...(inherited.length > 0 ? { extendsType: inherited.join(' & ') } : {}),
      props,
    }
  })
}

/**
 * The `{...}` body of the declaration whose brace sits at `openBrace`, and the
 * index of the brace that closed it.
 *
 * The index is returned as well as the text because `findTypeBodies` has to
 * resume scanning after the body, and re-walking it with a second depth counter
 * is how the two came to disagree. `undefined` for the text means the body never
 * closed, and the caller stops rather than guessing where it ended.
 */
function readBalancedBody(
  source: string,
  openBrace: number,
): { body: string; end: number } | undefined {
  let depth = 0
  let i = openBrace
  while (i < source.length) {
    const ch = source[i]
    if (ch === '/' && source[i + 1] === '*') {
      i = source.indexOf('*/', i + 2)
      if (i === -1) return undefined
      i += 2
      continue
    }
    if (ch === '/' && source[i + 1] === '/') {
      i = source.indexOf('\n', i)
      if (i === -1) return undefined
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(source, i, ch)
      if (i === -1) return undefined
      continue
    }
    if (ch === '{') depth += 1
    if (ch === '}') {
      depth -= 1
      if (depth === 0) return { body: source.slice(openBrace + 1, i), end: i }
    }
    i += 1
  }
  return undefined
}

function skipString(source: string, start: number, quote: string): number {
  let i = start + 1
  while (i < source.length) {
    const ch = source[i]
    if (ch === '\\') {
      i += 2
      continue
    }
    if (ch === quote) return i + 1
    i += 1
  }
  return -1
}

/**
 * Every object body a named type's declaration holds, in source order.
 *
 * A union is published whole or not at all. The single-body form this replaces
 * took the FIRST match and the first balanced body, so it published one body and
 * dropped every other by declaration order. For an emitted declaration shaped
 * `Common & ({ A } | { B })` it published neither arm at all, only the shared
 * part, so the API table described a type the declaration does not describe: the
 * `bare` arm of a union was invisible to every reader and every agent. A
 * type-level truth the extractor drops becomes a documentation-level lie, so the
 * scan walks every balanced body inside the declaration's own extent instead.
 *
 * The depth and angle tracking is load-bearing rather than defensive. A member
 * semicolon sits at depth 1, so a scan that stopped on the first `;` would end
 * the declaration at `variant?: 'icon';` and never reach the second arm, which
 * is the defect this function exists to remove. Angle brackets are tracked
 * because a generic argument can carry its own braces.
 *
 * **A body is consumed once and skipped, not re-walked.** `readBalancedBody`
 * returns a body's text, and the scan used to leave `i` on the opening brace and
 * walk the body a second time with its own depth counter. The second walk counts
 * every `{` the balanced read had already accounted for, so the two disagreed and
 * `depth` could not be trusted to reach 0 at the brace that closed the body. The
 * scan therefore depended on finding a terminator it was no longer counting
 * correctly, and the caller concatenates the emitted JavaScript of the same
 * module beside the declaration, so a scan that ran long published every object
 * literal in that implementation as another arm of the type. Advancing `i` to the
 * brace `readBalancedBody` reported removes the second walk rather than trying to
 * correct for it, and one walk cannot disagree with itself.
 *
 * The honest limit on that claim: a declaration whose body closes and is followed
 * immediately by a terminator terminated the scan correctly even before this
 * change, which is why every Page in the package was published correctly and only
 * the first Page with a two-line barrel was not. The defect was a miscount, not a
 * missing terminator, and a miscount is only visible where a miscount is.
 */
function findTypeBodies(source: string, name: string): string[] {
  const pattern = new RegExp(`(?:export\\s+)?(?:type|interface)\\s+${name}\\b`)
  const match = pattern.exec(source)
  if (!match) return []

  const bodies: string[] = []
  let depth = 0
  let angle = 0
  let quote: string | null = null
  let i = match.index + match[0].length

  for (; i < source.length; i += 1) {
    const ch = source[i]

    if (quote !== null) {
      if (ch === quote && source[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      continue
    }
    if (ch === '{') {
      const found = readBalancedBody(source, i)
      if (found === undefined) return bodies
      bodies.push(found.body)
      // Resume AFTER the brace that closed the body. The re-walk this replaces
      // counted every `{` in the body a second time and only the closing `}`
      // once, so `depth` never returned to 0 and the scan never terminated.
      i = found.end
      continue
    }
    if (ch === '(') depth += 1
    else if (ch === ')') depth -= 1
    else if (ch === '<') angle += 1
    else if (ch === '>') angle = Math.max(0, angle - 1)
    // The declaration ends at the first terminator that closes nothing it
    // opened, so the next declaration's braces cannot be collected as arms.
    else if ((ch === ';' || ch === '\n') && depth <= 0 && angle === 0) return bodies
  }

  return bodies
}

function findFunctionParams(source: string, name: string): string | null {
  const pattern = new RegExp(`declare\\s+function\\s+${name}\\s*\\(`)
  const match = pattern.exec(source)
  if (!match) return null
  const start = match.index + match[0].length
  let depth = 1
  let quote: string | null = null
  let i = start
  for (; i < source.length; i += 1) {
    const ch = source[i]
    if (quote) {
      if (ch === quote && source[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch
    else if (ch === '(') depth += 1
    else if (ch === ')') {
      depth -= 1
      if (depth === 0) break
    }
  }
  return source.slice(start, i)
}

function annotationOf(params: string): string | null {
  let depth = 0
  let angle = 0
  let quote: string | null = null
  for (let i = 0; i < params.length; i += 1) {
    const ch = params[i]
    if (quote) {
      if (ch === quote && params[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch
    else if (ch === '(' || ch === '{' || ch === '[') depth += 1
    else if (ch === ')' || ch === '}' || ch === ']') depth -= 1
    else if (ch === '<') angle += 1
    else if (ch === '>') angle = Math.max(0, angle - 1)
    else if (ch === ':' && depth === 0 && angle === 0) return params.slice(i + 1).trim()
  }
  return null
}

function variantRows(source: string, recipeName: string): RawRow[] {
  const pattern = new RegExp(
    `declare const ${recipeName}\\s*:\\s*\\(props\\?:\\s*\\(\\{([\\s\\S]*?)\\}\\s*&`,
  )
  const match = pattern.exec(source)
  return match ? parseMembers(match[1] ?? '') : []
}

function resolveAnnotation(
  annotation: string | null,
  source: string,
): { props: ExtractedProp[]; inherited: string[] } {
  if (!annotation) return { props: [], inherited: [] }

  const named = /^[A-Za-z_$][\w$]*$/.test(annotation) ? findTypeBodies(source, annotation) : []
  if (named.length > 0) {
    // Every arm, in declaration order, so a union reaches the table whole
    // rather than as whichever arm happened to be written first.
    return { props: named.flatMap((body) => parseMembers(body)).map(toProp), inherited: [] }
  }

  if (annotation.startsWith('{')) {
    const found = readBalancedBody(annotation, 0)
    if (found !== undefined) return { props: parseMembers(found.body).map(toProp), inherited: [] }
  }

  const props: ExtractedProp[] = []
  const inherited: string[] = []

  const recipe = /VariantProps<typeof (\w+)>/.exec(annotation)
  if (recipe) props.push(...variantRows(source, recipe[1] ?? '').map(toProp))

  const componentProps = /ComponentProps<'([^']+)'>/.exec(annotation)
  if (componentProps) inherited.push(`React.ComponentProps<'${componentProps[1]}'>`)

  if (props.length === 0 && inherited.length === 0) {
    inherited.push(annotation.replace(/\s+/g, ' ').slice(0, 200))
  }

  return { props, inherited }
}

function splitTopLevel(body: string): string[] {
  const parts: string[] = []
  let depth = 0
  let angle = 0
  let quote: string | null = null
  let current = ''
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i]
    if (!quote && ch === '/' && body[i + 1] === '*') {
      const end = body.indexOf('*/', i + 2)
      const stop = end < 0 ? body.length : end + 2
      current += body.slice(i, stop)
      i = stop - 1
      continue
    }
    if (!quote && ch === '/' && body[i + 1] === '/') {
      const end = body.indexOf('\n', i + 2)
      const stop = end < 0 ? body.length : end
      current += body.slice(i, stop)
      i = stop - 1
      continue
    }
    if (quote) {
      current += ch
      if (ch === quote && body[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      current += ch
      continue
    }
    if (ch === '(' || ch === '{' || ch === '[') depth += 1
    else if (ch === ')' || ch === '}' || ch === ']') depth -= 1
    else if (ch === '<') angle += 1
    else if (ch === '>') angle = Math.max(0, angle - 1)

    if (ch === ';' && depth <= 0 && angle === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim()) parts.push(current)
  return parts
}

function parseJsdoc(text: string): { description: string; defaultValue: string } {
  const match = /\/\*\*([\s\S]*?)\*\//.exec(text)
  if (!match) return { description: '', defaultValue: '' }
  let content = match[1] ?? ''
  let defaultValue = ''
  const tag = /@defaultValue\s+([^\s*]+)/.exec(content)
  if (tag) {
    defaultValue = tag[1] ?? ''
    content = content.replace(tag[0], ' ')
  }
  const description = content
    .split('\n')
    .map((line) => line.replace(/^\s*\*?\s?/, '').trim())
    .filter((line) => line && !line.startsWith('@'))
    .join(' ')
    .trim()
  return { description, defaultValue }
}

function parseMembers(body: string): RawRow[] {
  const rows: RawRow[] = []
  for (const part of splitTopLevel(body)) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const comment = /\/\*\*([\s\S]*?)\*\//.exec(trimmed)
    const rest = comment ? trimmed.slice(comment.index + comment[0].length) : trimmed
    const { description, defaultValue } = parseJsdoc(trimmed)
    const member = /^([A-Za-z_$][\w$]*)\s*(\?)?\s*:\s*([\s\S]+)$/.exec(rest.trim())
    if (!member) continue
    rows.push({
      name: member[1] ?? '',
      type: (member[3] ?? '').replace(/;\s*$/, '').trim(),
      required: !member[2],
      default: defaultValue || '-',
      description,
    })
  }
  return rows
}
