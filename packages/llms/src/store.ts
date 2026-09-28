/**
 * The `PrismDocsStore` contract: the one type the MCP server validates at
 * runtime, and the one runtime guard that produces it.
 *
 * Ticket 12 section 7 makes this file the canonical home. The store is a
 * build-time projection of the catalogue, the authored pages and the token
 * cascade; the MCP server imports both the type and `parsePrismDocsStore` and
 * never redeclares either.
 *
 * `kind` is ticket 09's closed union. The JSON arrives as `unknown`, the guard
 * narrows it structurally, and `kind` is validated through a local list that is
 * tied to the catalogue's type with `satisfies` plus a type-equality assertion.
 * A widened `kind: string` is rejected at runtime and at compile time, which is
 * the bug the old package recorded.
 */
import type { CatalogKind, ComponentCategory } from '@nanisoft/prism-ui/catalog'

/* -------------------------------------------------------------------------- */
/* Closed vocabularies                                                        */
/* -------------------------------------------------------------------------- */

// The runtime list is a projection of the catalogue's type, tied to it at
// compile time so the two cannot drift.
export const STORE_KINDS = ['component', 'block', 'page'] as const satisfies
  readonly CatalogKind[]
type _KindsMatch = CatalogKind extends (typeof STORE_KINDS)[number]
  ? (typeof STORE_KINDS)[number] extends CatalogKind
    ? true
    : never
  : never
const _kindsAssert: _KindsMatch = true
void _kindsAssert

export const STORE_CATEGORIES = [
  'Call to action',
  'Forms and inputs',
  'Feedback',
  'Layout',
  'Data display',
  'Typography',
  'Miscellaneous',
] as const satisfies readonly ComponentCategory[]
type _CategoriesMatch = ComponentCategory extends (typeof STORE_CATEGORIES)[number]
  ? (typeof STORE_CATEGORIES)[number] extends ComponentCategory
    ? true
    : never
  : never
const _categoriesAssert: _CategoriesMatch = true
void _categoriesAssert

export const STORE_STATUSES = ['stable', 'deprecated'] as const

/**
 * The content Sections, in the reading order the site publishes them, and the
 * same order `llms.txt` groups them in.
 *
 * These are the Section *directories*, so the list is the walk the corpus builder
 * takes and the set of directories the site's gate checks. The three catalogue
 * Sections are not here: an Item is a catalogue entry with a `kind`, and its page
 * is emitted from the Catalogue rather than walked out of the content tree, so
 * adding `components` to this list would make the walk look for a directory that
 * is not one.
 *
 * **A Section's route is its directory, and the two were renames.** `docs` is
 * `overview` and `foundations` is `foundation`, which is the rule that a prose
 * Section is one body of knowledge and takes a singular route while a catalogue
 * Section is a collection of many Items and takes a plural one. An agent holding
 * a cached `llms.txt` from before the move still resolves every URL it names,
 * because the site Worker redirects each of these routes permanently, and the
 * corpus is rebuilt per release and points at the new ones. Nothing here is
 * aliased: a page's `section` is the directory it is filed in, which is what
 * `get_page` matches on, and a `Record<StoreSection, string>` over a list that
 * had to be edited in the same commit as the rename is a second list that can be
 * half done.
 */
export const STORE_SECTIONS = ['overview', 'foundation', 'content', 'changelogs'] as const

/**
 * The label each content Section is read under, in every artifact that groups
 * pages by Section.
 *
 * `Record<StoreSection, string>` rather than a separate list, because a Section
 * added to `STORE_SECTIONS` with no label is a compile error here rather than a
 * Section that `llms.txt`, `list_pages` and the Corpus each spell their own way.
 * The keys are the Section directories themselves, so the label cannot be filed
 * under a Section that does not exist.
 *
 * The label is the Section's name rather than its directory, which is the whole
 * point of the pair: the directory is what the tree is called, and the name is
 * what a reader and an agent are told. `llms.txt` groups under these headings and
 * `list_pages` counts them, so a Section renamed without its label renamed here
 * would be advertised under two names in two artifacts.
 */
export const STORE_SECTION_TITLES: Record<StoreSection, string> = {
  overview: 'Overview',
  foundation: 'Foundation',
  content: 'Content',
  changelogs: 'Changelogs',
}
export const STORE_PACKS = ['default', 'blush', 'mint', 'lavender', 'sky', 'peach'] as const
export const STORE_MODES = ['light', 'dark'] as const
export const STORE_SCALE_GROUPS = [
  'motion',
  'typography',
  'spacing',
  'shadow',
  'breakpoint',
  'container',
] as const

export type StoreKind = (typeof STORE_KINDS)[number]
export type StoreStatus = (typeof STORE_STATUSES)[number]
export type StoreSection = (typeof STORE_SECTIONS)[number]
export type PackId = (typeof STORE_PACKS)[number]
export type Mode = (typeof STORE_MODES)[number]
export type PrismScaleGroup = (typeof STORE_SCALE_GROUPS)[number]
/** `'doc'` is a non-item page (a guide, a Foundation, a Content page). */
export type TokenGroup = 'semantic' | PrismScaleGroup

function isCatalogKind(value: unknown): value is CatalogKind {
  return STORE_KINDS.some((kind) => kind === value)
}

function isCategory(value: unknown): value is ComponentCategory {
  return STORE_CATEGORIES.some((category) => category === value)
}

function isStatus(value: unknown): value is StoreStatus {
  return STORE_STATUSES.some((status) => status === value)
}

function isSection(value: unknown): value is StoreSection {
  return STORE_SECTIONS.some((section) => section === value)
}

function isPack(value: unknown): value is PackId {
  return STORE_PACKS.some((pack) => pack === value)
}

function isMode(value: unknown): value is Mode {
  return STORE_MODES.some((mode) => mode === value)
}

/* -------------------------------------------------------------------------- */
/* The store shape                                                            */
/* -------------------------------------------------------------------------- */

export interface PrismDocsExample {
  readonly title: string
  readonly code: string
}

export interface PrismDocsStoreEntry {
  readonly id: string
  readonly slug: string
  readonly kind: CatalogKind
  readonly name: string
  readonly category: ComponentCategory | null
  readonly status: StoreStatus
  readonly description: string
  /** The item's canonical site path, for example `/components/button`. */
  readonly url: string
  /** The canonical path plus `.md`, for example `/components/button.md`. */
  readonly mirror: string
  readonly source: string
  readonly exports: readonly string[]
  /** The public import line ticket 11 section 9 fixes. */
  readonly importLine: string
  /** The full per-item spec, byte-identical to the mirror file. */
  readonly doc: string
  /** The `## Props` section body, for a Component. */
  readonly props?: string
  /** The `## Composition` section body, for a Block or a Page. */
  readonly composition?: string
  /** The verbatim demo plus its title, when a demo exists. */
  readonly example?: PrismDocsExample
  readonly references: {
    readonly blocks: readonly string[]
    readonly pages: readonly string[]
  }
}

export interface PrismDocsPage {
  readonly id: string
  /** The page's path below its Section, without the extension: `tokens/colors`. */
  readonly slug: string
  /** The top-level Section directory the page sits in. */
  readonly section: StoreSection
  readonly title: string
  readonly description: string
  /** The page's canonical site path, for example `/overview/quickstart`. */
  readonly url: string
  readonly markdown: string
  readonly mirror: string
}

/**
 * One version entry of a published package's changelog.
 *
 * `body` is the text under the version's own `## <version>` heading, sliced by
 * the shared changelog rule and never re-levelled: the file is published whole
 * and re-levelling a heading would be another transformation between the
 * package's bytes and the agent's.
 */
export interface PrismChangelogRelease {
  readonly version: string
  readonly body: string
}

/**
 * One published package's changelog, projected from the generated file the site
 * renders.
 *
 * This is the field the ninth read-only tool answers from, and it exists so that
 * a breaking change in a published package is discoverable by an agent. The
 * reference design system shipped a breaking module-system change that no agent
 * using it could find, because its corpus had no changelog field and no tool
 * could return one.
 *
 * `text` is the generated file verbatim, which is a byte-for-byte copy of the
 * package's own `CHANGELOG.md`. `releases` is the shared rule's reading of those
 * same bytes, and the two cannot disagree because the rule is the only thing
 * that produces either.
 */
export interface PrismChangelog {
  /** The published npm name, which is what an agent asks for. */
  readonly package: string
  /** The route segment the changelog is published at: the unscoped name. */
  readonly slug: string
  /** The site's route for it, and the mirror an agent can fetch instead. */
  readonly route: string
  /** The file's own first heading, which names the package. */
  readonly title: string
  /** Every version the file records, newest first as the generator writes it. */
  readonly versions: readonly string[]
  readonly releases: readonly PrismChangelogRelease[]
  /** The generated file, byte for byte. */
  readonly text: string
}

export interface PrismSemanticToken {
  readonly token: string
  readonly value: string
}
export interface PrismScaleToken {
  readonly token: string
  readonly value: string
  /** The Tailwind binding, when the token has a mirror custom property. */
  readonly binding?: string
}

export interface PrismThemeTokens {
  readonly pack: PackId
  readonly mode: Mode
  readonly semantic: readonly PrismSemanticToken[]
}

export interface PrismTokensProjection {
  readonly packs: readonly PackId[]
  readonly modes: readonly Mode[]
  readonly themes: readonly PrismThemeTokens[]
  readonly scales: Record<PrismScaleGroup, readonly PrismScaleToken[]>
}

export interface PrismDocsStore {
  readonly version: string
  readonly items: readonly PrismDocsStoreEntry[]
  readonly pages: readonly PrismDocsPage[]
  /**
   * One entry per published package that ships a changelog. Required rather than
   * optional: the field is what makes a published breaking change discoverable
   * by an agent, and a store that quietly omitted it would leave the tool that
   * reads it answering for nothing while every other gate stayed green.
   */
  readonly changelogs: readonly PrismChangelog[]
  readonly tokens: PrismTokensProjection
}

/* -------------------------------------------------------------------------- */
/* The narrowing guard                                                        */
/* -------------------------------------------------------------------------- */

function fail(path: string, detail: string): never {
  throw new Error(`prism-llms: data.json ${path} ${detail}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown, path: string): string {
  if (typeof value !== 'string') fail(path, `is not a string`)
  return value
}

function asOptionalString(value: unknown, path: string): string | undefined {
  if (value === undefined) return undefined
  return asString(value, path)
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) fail(path, `is not an object`)
  return value
}

function asList(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(path, `is not an array`)
  return value
}

function asStringList(value: unknown, path: string): string[] {
  return asList(value, path).map((entry, index) => asString(entry, `${path}[${index}]`))
}

function asKind(value: unknown, path: string): CatalogKind {
  if (!isCatalogKind(value)) {
    fail(path, `= ${JSON.stringify(value)} is not a CatalogKind`)
  }
  return value
}

function parseCategory(value: unknown, path: string): ComponentCategory | null {
  if (value === null) return null
  if (!isCategory(value)) {
    fail(path, `= ${JSON.stringify(value)} is not a ComponentCategory or null`)
  }
  return value
}

function parseStatus(value: unknown, path: string): StoreStatus {
  if (!isStatus(value)) fail(path, `= ${JSON.stringify(value)} is not a status`)
  return value
}

function parseSection(value: unknown, path: string): StoreSection {
  if (!isSection(value)) fail(path, `= ${JSON.stringify(value)} is not a section`)
  return value
}

function parseExample(value: unknown, path: string): PrismDocsExample | undefined {
  if (value === undefined) return undefined
  const record = asRecord(value, path)
  return {
    title: asString(record['title'], `${path}.title`),
    code: asString(record['code'], `${path}.code`),
  }
}

function parseReferences(
  value: unknown,
  path: string,
): { blocks: string[]; pages: string[] } {
  const record = asRecord(value, path)
  return {
    blocks: asStringList(record['blocks'], `${path}.blocks`),
    pages: asStringList(record['pages'], `${path}.pages`),
  }
}

function parseItem(value: unknown, path: string): PrismDocsStoreEntry {
  const record = asRecord(value, path)
  const kind = asKind(record['kind'], `${path}.kind`)
  const props = asOptionalString(record['props'], `${path}.props`)
  const composition = asOptionalString(record['composition'], `${path}.composition`)
  const example = parseExample(record['example'], `${path}.example`)
  return {
    id: asString(record['id'], `${path}.id`),
    slug: asString(record['slug'], `${path}.slug`),
    kind,
    name: asString(record['name'], `${path}.name`),
    category: parseCategory(record['category'], `${path}.category`),
    status: parseStatus(record['status'], `${path}.status`),
    description: asString(record['description'], `${path}.description`),
    url: asString(record['url'], `${path}.url`),
    mirror: asString(record['mirror'], `${path}.mirror`),
    source: asString(record['source'], `${path}.source`),
    exports: asStringList(record['exports'], `${path}.exports`),
    importLine: asString(record['importLine'], `${path}.importLine`),
    doc: asString(record['doc'], `${path}.doc`),
    ...(props !== undefined ? { props } : {}),
    ...(composition !== undefined ? { composition } : {}),
    ...(example !== undefined ? { example } : {}),
    references: parseReferences(record['references'], `${path}.references`),
  }
}

function parsePage(value: unknown, path: string): PrismDocsPage {
  const record = asRecord(value, path)
  return {
    id: asString(record['id'], `${path}.id`),
    slug: asString(record['slug'], `${path}.slug`),
    section: parseSection(record['section'], `${path}.section`),
    title: asString(record['title'], `${path}.title`),
    description: asString(record['description'], `${path}.description`),
    url: asString(record['url'], `${path}.url`),
    markdown: asString(record['markdown'], `${path}.markdown`),
    mirror: asString(record['mirror'], `${path}.mirror`),
  }
}

function parseChangelogRelease(value: unknown, path: string): PrismChangelogRelease {
  const record = asRecord(value, path)
  return {
    version: asString(record['version'], `${path}.version`),
    body: asString(record['body'], `${path}.body`),
  }
}

function parseChangelog(value: unknown, path: string): PrismChangelog {
  const record = asRecord(value, path)
  const releases = asList(record['releases'], `${path}.releases`).map((entry, index) =>
    parseChangelogRelease(entry, `${path}.releases[${index}]`),
  )
  const versions = asStringList(record['versions'], `${path}.versions`)
  // The version list and the entries are two views of one reading, so a store
  // that carried them out of step would answer `get_changelog` with a version
  // the tool cannot hand back. It is checked here rather than at the call site,
  // because the call site is the only place that would not notice.
  const fromReleases = releases.map((release) => release.version)
  if (versions.join('\n') !== fromReleases.join('\n')) {
    fail(
      `${path}.versions`,
      `= ${JSON.stringify(versions)} is not the version list its own entries record, ` +
        `which is ${JSON.stringify(fromReleases)}`,
    )
  }
  return {
    package: asString(record['package'], `${path}.package`),
    slug: asString(record['slug'], `${path}.slug`),
    route: asString(record['route'], `${path}.route`),
    title: asString(record['title'], `${path}.title`),
    versions,
    releases,
    text: asString(record['text'], `${path}.text`),
  }
}

function parseSemantic(value: unknown, path: string): PrismSemanticToken {
  const record = asRecord(value, path)
  return {
    token: asString(record['token'], `${path}.token`),
    value: asString(record['value'], `${path}.value`),
  }
}

function parseScaleToken(value: unknown, path: string): PrismScaleToken {
  const record = asRecord(value, path)
  const binding = asOptionalString(record['binding'], `${path}.binding`)
  return {
    token: asString(record['token'], `${path}.token`),
    value: asString(record['value'], `${path}.value`),
    ...(binding !== undefined ? { binding } : {}),
  }
}

function parseScaleTokens(value: unknown, path: string): PrismScaleToken[] {
  return asList(value, path).map((entry, index) => parseScaleToken(entry, `${path}[${index}]`))
}

function parseTheme(value: unknown, path: string): PrismThemeTokens {
  const record = asRecord(value, path)
  const pack = asString(record['pack'], `${path}.pack`)
  const mode = asString(record['mode'], `${path}.mode`)
  if (!isPack(pack)) fail(`${path}.pack`, `= ${JSON.stringify(pack)} is not a PackId`)
  if (!isMode(mode)) fail(`${path}.mode`, `= ${JSON.stringify(mode)} is not a Mode`)
  return {
    pack,
    mode,
    semantic: asList(record['semantic'], `${path}.semantic`).map((entry, index) =>
      parseSemantic(entry, `${path}.semantic[${index}]`),
    ),
  }
}

function parsePack(value: unknown, path: string): PackId {
  const pack = asString(value, path)
  if (!isPack(pack)) fail(path, `= ${JSON.stringify(pack)} is not a PackId`)
  return pack
}

function parseMode(value: unknown, path: string): Mode {
  const mode = asString(value, path)
  if (!isMode(mode)) fail(path, `= ${JSON.stringify(mode)} is not a Mode`)
  return mode
}

function parseTokens(value: unknown, path: string): PrismTokensProjection {
  const record = asRecord(value, path)
  const scalesRecord = asRecord(record['scales'], `${path}.scales`)
  const scales: Record<PrismScaleGroup, readonly PrismScaleToken[]> = {
    motion: parseScaleTokens(scalesRecord['motion'], `${path}.scales.motion`),
    typography: parseScaleTokens(scalesRecord['typography'], `${path}.scales.typography`),
    spacing: parseScaleTokens(scalesRecord['spacing'], `${path}.scales.spacing`),
    shadow: parseScaleTokens(scalesRecord['shadow'], `${path}.scales.shadow`),
    breakpoint: parseScaleTokens(scalesRecord['breakpoint'], `${path}.scales.breakpoint`),
    container: parseScaleTokens(scalesRecord['container'], `${path}.scales.container`),
  }
  return {
    packs: asList(record['packs'], `${path}.packs`).map((entry, index) =>
      parsePack(entry, `${path}.packs[${index}]`),
    ),
    modes: asList(record['modes'], `${path}.modes`).map((entry, index) =>
      parseMode(entry, `${path}.modes[${index}]`),
    ),
    themes: asList(record['themes'], `${path}.themes`).map((entry, index) =>
      parseTheme(entry, `${path}.themes[${index}]`),
    ),
    scales,
  }
}

/**
 * Narrow an `unknown` JSON payload to a `PrismDocsStore`, or throw with the
 * offending path. This is the only place a `PrismDocsStore` is produced from
 * JSON: nothing is assigned with `as`, and `kind` is never widened to `string`.
 *
 * The order of the fields is the order of the layers that have to have carried
 * the change. `items` before `changelogs`, so a document with a widened `kind`
 * reports the path a reader is more likely to be looking at.
 */
export function parsePrismDocsStore(raw: unknown): PrismDocsStore {
  const root = asRecord(raw, 'root')
  return {
    version: asString(root['version'], 'version'),
    items: asList(root['items'], 'items').map((entry, index) =>
      parseItem(entry, `items[${index}]`),
    ),
    pages: asList(root['pages'], 'pages').map((entry, index) =>
      parsePage(entry, `pages[${index}]`),
    ),
    changelogs: asList(root['changelogs'], 'changelogs').map((entry, index) =>
      parseChangelog(entry, `changelogs[${index}]`),
    ),
    tokens: parseTokens(root['tokens'], 'tokens'),
  }
}
