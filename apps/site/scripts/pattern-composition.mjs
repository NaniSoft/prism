/**
 * A Pattern declares the Items it composes, and the declaration is checked.
 *
 * **Why Patterns are documents and not Items.** A Block is code: a consumer imports
 * it and passes it content. A Pattern is the knowledge of *which* Items to arrange
 * and *why*, and it is a document, because that knowledge outlives any one
 * arrangement and belongs to whoever is building rather than to whoever shipped a
 * component. So a Pattern gets a prose Section beside Overview, Foundation and
 * Content, no npm subpath, no registry item, no corpus entry, and no change to
 * `CATALOG_KINDS`. What it does get is a law, and the law is the declaration: a
 * Pattern that names an Item which does not exist is a document telling a reader
 * to compose something that cannot be installed.
 *
 * That failure is quiet. Nothing about a prose page is type-checked, so a Pattern
 * naming `DataTable` after that Item is renamed reads perfectly, builds perfectly,
 * and hands a consumer a recipe that cannot be followed. The site already has this
 * class of gate for its other joins, and this is the same shape: a declaration in a
 * document, compared against the one list of what exists.
 *
 * **The declaration is frontmatter, and that is a deliberate choice.** It is
 * metadata about the document rather than prose inside it, it is visible where a
 * reader looks for a Pattern's shape, and it is parseable without a YAML dependency,
 * which this repository does not have. The subset read here is `title`,
 * `description` and `composes`, and a key it does not understand is left alone
 * rather than guessed at, so a future key cannot be silently misread as a
 * declaration.
 *
 * The findings come back as data rather than as console output, because the site's
 * other joins do the same and because a gate whose logic cannot be called from a
 * test is a gate nobody can prove fires.
 */

/**
 * @typedef {object} CatalogueItem
 * @property {string} name
 * @property {string} kind
 *
 * @typedef {object} PatternDoc
 * @property {string} file      the path relative to the content root
 * @property {string} title
 * @property {string} [description]
 * @property {string[]} composes the Item names this Pattern declares
 *
 * @typedef {object} PatternFinding
 * @property {string} file
 * @property {string} message
 */

/** The frontmatter keys this gate reads. A Pattern may carry others. */
const READ_KEYS = new Set(['title', 'description', 'composes'])

/**
 * Split an `.mdx` document into its frontmatter block and its body.
 *
 * A document with no leading `---` has no frontmatter, and that is reported as
 * empty rather than as an error here: whether a Pattern *must* declare something
 * is a separate question, and answering it in the parser would make one function
 * decide two things.
 *
 * @param {string} source
 * @returns {{ frontmatter: string, body: string }}
 */
export function splitFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
  if (!match) return { frontmatter: '', body: source }
  return { frontmatter: match[1] ?? '', body: source.slice(match[0].length) }
}

/**
 * Read the frontmatter keys this gate understands.
 *
 * `composes` is a YAML block sequence, which is the only non-scalar form read here:
 *
 *     composes:
 *       - Card
 *       - Button
 *
 * It also accepts the inline flow form, `[Card, Button]`, because both are ordinary
 * YAML and a hand-edited document reaches for either.
 *
 * @param {string} frontmatter
 * @returns {{ title?: string, description?: string, composes?: string[] }}
 */
export function readDeclaration(frontmatter) {
  /** @type {{ title?: string, description?: string, composes?: string[] }} */
  const out = {}

  // A scalar key: `key: value`, with an optional pair of quotes.
  const scalar = /^([A-Za-z][\w-]*):[ \t]*(.*)$/
  // The start of a block sequence under a key.
  const sequenceStart = /^([A-Za-z][\w-]*):[ \t]*$/
  const listItem = /^[ \t]*-[ \t]*(.*)$/

  const lines = frontmatter.split(/\r?\n/)
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? ''
    const start = sequenceStart.exec(line)
    if (start && READ_KEYS.has(start[1] ?? '')) {
      const key = start[1]
      /** @type {string[]} */
      const items = []
      // Consume the indented items that belong to this key. A blank line ends the
      // sequence; so does a line that is not a list item.
      for (let j = i + 1; j < lines.length; j += 1) {
        const item = listItem.exec(lines[j] ?? '')
        if (!item) {
          if ((lines[j] ?? '').trim() === '') continue
          break
        }
        items.push(unquote(item[1] ?? ''))
      }
      out[key] = items
      i += items.length
      continue
    }

    const match = scalar.exec(line)
    if (!match) continue
    const key = match[1] ?? ''
    if (!READ_KEYS.has(key)) continue
    const value = unquote(match[2] ?? '')
    if (key === 'composes') {
      // The inline flow form, `[Card, Button]`.
      out.composes = value.startsWith('[')
        ? value
            .slice(1, value.lastIndexOf(']'))
            .split(',')
            .map((entry) => unquote(entry.trim()))
            .filter(Boolean)
        : [value]
    } else {
      out[key] = value
    }
  }

  return out
}

/** One layer of matching quotes, because a title may legitimately contain either. */
function unquote(value) {
  const trimmed = value.trim()
  if (trimmed.length < 2) return trimmed
  const first = trimmed[0]
  const last = trimmed[trimmed.length - 1]
  if ((first === '"' || first === "'") && first === last) return trimmed.slice(1, -1)
  return trimmed
}

/**
 * Every Item name a declaration may name, by kind.
 *
 * @param {CatalogueItem[]} catalogue
 */
export function catalogueNames(catalogue) {
  return new Map(catalogue.map((item) => [item.name, item.kind]))
}

/**
 * Check one Pattern against the catalogue.
 *
 * @param {PatternDoc} pattern
 * @param {Map<string, string>} names
 * @returns {PatternFinding[]}
 */
export function checkPattern(pattern, names) {
  /** @type {PatternFinding[]} */
  const findings = []

  if (pattern.composes.length === 0) {
    findings.push({
      file: pattern.file,
      message:
        'a Pattern declares no Items, so it is a document with nothing to check. Add a ' +
        '`composes` list naming the Items it arranges.',
    })
    return findings
  }

  for (const name of pattern.composes) {
    if (names.has(name)) continue
    findings.push({
      file: pattern.file,
      message:
        `\`composes\` names "${name}", which is not in the Catalogue. A Pattern that names ` +
        `an Item nobody can install is a recipe that cannot be followed, and nothing about a ` +
        `prose page is type-checked, so this is the only place it can be caught.`,
    })
  }

  return findings
}

/**
 * Check the whole Section: the declarations, and the Section's own bookkeeping.
 *
 * Three joins, all of which have bitten this site before:
 *
 *  1. Every declared Item exists. That is the law above.
 *  2. Every document in the Section is listed in its `meta.json`. A Pattern nobody
 *     can navigate to is a Pattern nobody finds, and the file existing is not the
 *     same as the page being published.
 *  3. Every entry in `meta.json` has a document. The other direction, because a nav
 *     entry with no page behind it is a 404 that the build happily emits.
 *
 * @param {object} input
 * @param {PatternDoc[]} input.patterns
 * @param {{ section: string, pages: string[] }} input.manifest
 * @param {Map<string, string>} input.names
 * @returns {PatternFinding[]}
 */
export function checkPatterns({ patterns, manifest, names }) {
  /** @type {PatternFinding[]} */
  const findings = []

  for (const pattern of patterns) {
    findings.push(...checkPattern(pattern, names))
  }

  const listed = new Set(manifest.pages)
  const onDisk = new Set(patterns.map((pattern) => pattern.file.replace(/\.mdx$/, '')))

  for (const page of onDisk) {
    if (listed.has(page)) continue
    findings.push({
      file: `${manifest.section}/${page}.mdx`,
      message:
        'is in the Section on disk but not in its `meta.json`, so nothing links to it and ' +
        'the site does not publish it in the order the Section declares.',
    })
  }

  for (const page of listed) {
    if (onDisk.has(page)) continue
    findings.push({
      file: `${manifest.section}/meta.json`,
      message: `lists "${page}", which has no document beside it, so the Section publishes a page that does not exist.`,
    })
  }

  return findings
}
