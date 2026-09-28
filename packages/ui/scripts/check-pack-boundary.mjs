/**
 * A pack boundary is a promise with two axes, and this gate holds both.
 *
 * A scoped `data-pack` boundary resolves the pack's colour AND the pack's corner
 * radius beneath it, because radius is the only non-colour member of a pack block
 * and the token build emits it the same way. A consumer reading only the colour
 * half produces mismatched corners and calls it correct, so the shape half is
 * stated in DESIGN.md, published in the agent surface, and checked here.
 *
 * Two rules, because they are two different defects:
 *
 *   1. Usage. A boundary on an element that neither pins its own radius nor
 *      carries a radius utility, on a shape that has a radius concept, silently
 *      changes that element's corner radius. The element looks wrong and nothing
 *      says why. This is a text scan over a known property list, which is the
 *      limit of what a text scan can decide: it reads class strings, not a
 *      cascade, so it can say an element is unpinned and cannot say which
 *      declaration wins.
 *
 *   2. The build. A pack gains axes. Today the block is colour plus radius, and
 *      this gate reads the emitted per-pack files and asserts that the set of
 *      non-colour axes a pack carries is the one the source declares, so a second
 *      axis added to the token build without a decision about boundaries fails
 *      here rather than becoming a third silent consequence. This is the "a second
 *      per-pack axis added without the token build noticing" criterion, and it is
 *      the one that stops the pair from drifting apart again: colour is checked by
 *      name, radius is checked by axis, and an axis nobody named is a finding.
 *
 * No report-only mode. Resolve the roots from this script's own location, fail
 * when a root resolves to nothing, and print what the run read, because a gate
 * that scanned nothing is indistinguishable from one that found nothing.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * The walker is local rather than imported from the repository root on purpose.
 *
 * `scripts/lib/walk.mjs` exists and is the shared implementation, but
 * `packages/tokens/scripts/check-determinism.mjs` declined to import it for the
 * same reason this file does: a package script should not reach outside its own
 * package for a file that is not in that package's `files`, because the day
 * someone runs the script from an installed tarball the import is the first
 * thing to break. Two copies of forty lines is a smaller liability than a
 * published script that cannot resolve its own helper.
 *
 * The behaviour is the repository convention: a root that does not resolve is
 * reported rather than absorbed, because a gate that read nothing and found
 * nothing is indistinguishable from a gate that passed.
 */
function walkRoot(root, extensions) {
  const absolute = path.resolve(root)
  let stats
  try {
    stats = statSync(absolute)
  } catch (cause) {
    return { root: absolute, relative: root, files: [], exists: false, error: cause.code }
  }
  if (stats.isFile()) {
    return { root: absolute, relative: root, files: [absolute], exists: true }
  }
  const files = []
  for (const name of readdirSync(absolute)) {
    const child = path.join(absolute, name)
    if (statSync(child).isDirectory()) {
      files.push(...walkRoot(child, extensions).files)
    } else if (!extensions || extensions.test(name)) {
      files.push(child)
    }
  }
  return { root: absolute, relative: root, files, exists: true }
}

const walkRoots = (base, roots, options) => roots.map((root) => walkRoot(path.join(base, root), options?.extensions))

const relativePosix = (base, file) => path.relative(base, file).split(path.sep).join('/')

/** Both causes a reader cannot separate when a root does not resolve. */
function assertRootsResolve(results, { scriptName }) {
  const missing = results.filter((result) => !result.exists)
  if (missing.length === 0) return
  throw new Error(
    `${scriptName}: ${missing.length} of ${results.length} configured roots do not resolve: ` +
      missing.map((result) => `"${result.relative}"`).join(', ') +
      '\n  Two causes, and this run cannot tell them apart:' +
      '\n  (1) the gate was run from the wrong working directory, or the script being run is' +
      '\n      not this repository\'s copy - run it from the repository root, or via `pnpm check`;' +
      '\n  (2) the root does not exist in the repository at all, so the configuration names a' +
      '\n      path that was renamed, moved or never committed.' +
      '\n  A gate that read nothing and reported zero findings is the failure this replaces, so an' +
      '\n  unresolved root fails the run rather than emptying it.',
  )
}

/** A run that read no file is a pass having read nothing, and fails. */
function assertFilesRead(results, { scriptName, extensions }) {
  const total = results.reduce((sum, result) => sum + result.files.length, 0)
  if (total > 0) return
  throw new Error(
    `${scriptName}: every configured root resolved but together they hold nothing readable` +
      `${extensions ? ` for ${extensions}` : ''}. A gate that read no file cannot have found nothing.` +
      '\n  Either the roots are correct and the tree is empty, or the extension filter matches nothing here.' +
      '\n  Run from the repository root, and run the build first if the roots point at build output.',
  )
}

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.join(HERE, '..', '..', '..')
const PKG = path.join(REPO, 'packages', 'ui')
const NAME = 'pack-boundary'

/** The runtime attribute that names a pack, from the token build's own export. */
const PACK_ATTR = 'data-pack'

/** The one attribute that lets an element pin its own corner radius. */
const RADIUS_ATTR = 'style'

/**
 * The radius utilities, split by whether the pack moves them.
 *
 * Read from the emitted `@theme` bindings rather than listed, so a renamed or
 * re-derived utility is a change here rather than a silent hole. The split is the
 * load-bearing part and it is derived, not declared: a binding that references
 * `var(--radius)` is computed from the pack's radius and therefore MOVES when a
 * boundary lands above it, and a binding that does not is fixed.
 *
 * This is the part the ticket's own wording understates. "An element carrying no
 * radius utility" is safe, and so is a fully-rounded one, but an element carrying
 * `rounded-xl` is neither: `--radius-xl` is `calc(var(--radius) * 1.4)`, so the
 * card is pinned to a STEP and the step is pack-relative. A row of such cards,
 * one per pack, shows five corner radii. Treating "carries a radius utility" as
 * the safe case would have let exactly the defect through, and it is the reason
 * the rule reads the binding rather than the class name.
 */
function radiusUtilities(themeCss) {
  const all = new Set()
  const packRelative = new Set()
  for (const match of themeCss.matchAll(/^\s*--radius-([a-z0-9-]+):\s*([^;]+);/gm)) {
    const [, name, binding] = match
    all.add(name)
    if (binding.includes('var(--radius)')) packRelative.add(name)
  }
  return { all, packRelative }
}

/** The utility that means "fully rounded", which is the safe place for a boundary. */
const FULLY_ROUNDED = 'full'

/**
 * Elements that have no radius concept, so a boundary on one moves nothing.
 *
 * A key on the closed list rather than a pattern, so a new shape is a decision to
 * take rather than a regex to widen. `rect` is deliberately NOT here: a scalable
 * vector rectangle's corner attribute is a CSS property and does follow the
 * boundary. What blocks it is that no utility exists for it, which the DESIGN.md
 * correction now says instead of the wrong reason.
 */
const NO_RADIUS_CONCEPT = new Set(['path', 'line', 'polyline', 'polygon', 'circle', 'ellipse'])

/** `rounded-full`, `rounded-lg`, `rounded-[3px]`: any radius utility on the class list. */
const RADIUS_UTILITY = /(?:^|\s)rounded(?:-([a-z0-9-]+))?(?=[\s"'`\]]|$)/g

/**
 * Why an element's radius does or does not follow a boundary above it.
 *
 * `fixed` means a boundary cannot change it. `pack-relative` means it can, and
 * that is the finding. `unknown` means the gate cannot tell, which is reported
 * rather than assumed safe, because assuming safe is how a text scan becomes a
 * gate that cannot fail.
 */
function radiusExposure(classList, utilities) {
  let exposure = 'fixed'
  const reasons = []

  for (const match of classList.matchAll(RADIUS_UTILITY)) {
    const name = match[1]
    if (name === undefined) {
      // A bare `rounded` is `rounded-sm`, a scale step.
      exposure = 'pack-relative'
      reasons.push('rounded (bare, which is rounded-sm)')
      continue
    }
    if (name === FULLY_ROUNDED || name === 'none') continue
    if (utilities.packRelative.has(name)) {
      exposure = 'pack-relative'
      reasons.push(`rounded-${name}`)
      continue
    }
    if (utilities.all.has(name)) continue
    // An arbitrary value is pinned whatever it is, UNLESS it names the token,
    // in which case it is pack-relative by construction.
    if (name.startsWith('[')) {
      if (name.includes('--radius')) {
        exposure = 'pack-relative'
        reasons.push(`rounded-${name} (names --radius directly)`)
      }
      continue
    }
    exposure = exposure === 'pack-relative' ? exposure : 'unknown'
    reasons.push(`rounded-${name} (not a utility this gate can see in the emitted theme)`)
  }

  return { exposure, reasons }
}

const EXT = /\.(tsx?|jsx?)$/

/** Where a boundary may appear in this repository. */
const ROOTS = ['packages/ui/src', 'apps/site/src', 'apps/site/items']

/** Where the emitted token artefacts the build rule reads live. */
const DIST = [
  'packages/tokens/dist/light.css',
  'packages/tokens/dist/dark.css',
  'packages/tokens/dist/themes.json',
]

// ---------------------------------------------------------------------------
// Rule 2: the build's per-pack axes
// ---------------------------------------------------------------------------

/**
 * Every property a pack block emits, read from one file.
 *
 * Nothing is bucketed here. The caller classifies, because classifying by name
 * prefix is how a new axis gets filed as something it is not: this gate's first
 * version called anything starting with `--radius` a non-colour axis and
 * everything else colour, so a genuinely new `--elevation-step` axis was
 * silently counted as a colour and the rule meant to catch it never saw it. The
 * colour set comes from the token source, which is the authority on what a
 * colour role is, so anything outside it is reported rather than assumed.
 */
function propertiesIn(css) {
  const body = css.slice(css.indexOf('{') + 1)
  return [...body.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((match) => match[1])
}

/** The non-colour axes a pack is declared to carry, from the source. */
function declaredAxes(repo) {
  const themes = JSON.parse(
    readFileSync(path.join(repo, 'packages/tokens/dist/themes.json'), 'utf8'),
  )
  if (!Array.isArray(themes) || themes.length === 0) {
    throw new Error(`${NAME}: dist/themes.json declares no packs, so there is no axis to check`)
  }
  return themes
}

// ---------------------------------------------------------------------------
// Rule 1: usage
// ---------------------------------------------------------------------------

/**
 * Blanks out comments without moving a single line, so a line number in a finding
 * still points at the line a reader has to edit.
 *
 * This is not optional politeness. The first run of this gate reported a live
 * finding on a JSDoc block that documented the very selector being searched for:
 * a text scan that reads prose finds prose, and a prose mention of `data-pack` is
 * a description, not a boundary. `check-dashes.mjs` masks comments for the same
 * reason and for the same reason it keeps the line count intact.
 */
function maskComments(source) {
  const out = source.split('')
  let i = 0
  const blank = (from, to) => {
    for (let k = from; k < to && k < out.length; k += 1) {
      if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '
    }
  }

  while (i < source.length) {
    const next = source.indexOf('/*', i)
    const line = source.indexOf('//', i)
    if (next === -1 && line === -1) break
    // A `//` inside a block comment is not a line comment.
    if (next !== -1 && (line === -1 || next < line)) {
      const close = source.indexOf('*/', next + 2)
      const end = close === -1 ? source.length : close + 2
      blank(next, end)
      i = end
      continue
    }
    // A `//` inside a string is not a comment either. A URL is the case that
    // matters here, since these files import absolute paths.
    if (isInString(source, line)) {
      i = line + 2
      continue
    }
    let end = source.indexOf('\n', line)
    if (end === -1) end = source.length
    blank(line, end)
    i = end
  }
  return out.join('')
}

/** Whether `index` sits inside a single or double quoted string. */
function isInString(source, index) {
  let quote = null
  for (let k = index - 1; k >= 0 && k > index - 4000; k -= 1) {
    const ch = source[k]
    if (ch === '\n') return false
    if (quote === null && (ch === '"' || ch === "'")) quote = ch
    else if (ch === quote) quote = null
  }
  return quote !== null
}

/**
 * Every element in a file that carries the pack attribute, with its class list,
 * its tag and its line.
 *
 * Read from the source text rather than a parse, because the cases that matter
 * are JSX attributes written several ways (`data-pack={x}`, `data-pack="x"`,
 * spread through a helper) and a partial parse would quietly skip exactly the
 * dynamic ones. Comments are masked first, or the gate reports the documentation
 * of a boundary as a boundary.
 */
function boundariesIn(file, raw) {
  const source = maskComments(raw)
  const found = []

  for (const match of source.matchAll(new RegExp(`${PACK_ATTR}\\s*=\\s*(\\{[^{}]*\\}|"[^"]*"|'[^']*')`, 'g'))) {
    // Walk back to the nearest open tag so the finding names an element.
    const before = source.slice(0, match.index)
    let tag = 'unknown'
    let open = -1
    for (let i = before.length - 1; i >= 0; i -= 1) {
      if (before[i] !== '<') continue
      const candidate = /<([A-Za-z][A-Za-z0-9.]*)/.exec(before.slice(i, i + 80))
      if (candidate && (source.indexOf('>', i) === -1 || source.indexOf('>', i) > match.index)) {
        tag = candidate[1]
        open = i
        break
      }
    }
    const line = before.split('\n').length
    // The class list is whatever the same element carries, in the window that
    // follows the tag, which is where JSX puts it.
    const window = source.slice(open === -1 ? match.index : open, (open === -1 ? match.index : open) + 400)
    const classAttr =
      /(?:className|class)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{([^}]*)\})/.exec(window)
    const classList = classAttr
      ? [classAttr[1], classAttr[2], classAttr[3], classAttr[4]].filter(Boolean).join(' ')
      : ''
    found.push({ file, line, tag, classList })
  }
  return found
}

// ---------------------------------------------------------------------------
// The run
// ---------------------------------------------------------------------------

const findings = []
const results = walkRoots(REPO, ROOTS, { extensions: EXT })
try {
  assertRootsResolve(results, { scriptName: NAME })
  assertFilesRead(results, { scriptName: NAME, extensions: EXT })
} catch (failure) {
  console.error(`\n${failure.message}`)
  process.exit(1)
}

const themeCssPath = path.join(REPO, 'packages/tokens/dist/theme.css')
if (!statSync(themeCssPath).isFile()) {
  console.error(
    `\n${NAME}: ${relativePosix(REPO, themeCssPath)} is missing, so the radius utilities this gate needs ` +
      'to recognise are unknown. Run the token build first.',
  )
  process.exit(1)
}
const utilities = radiusUtilities(readFileSync(themeCssPath, 'utf8'))
if (utilities.all.size === 0) {
  console.error(
    `\n${NAME}: the emitted theme declares no --radius-* binding, so every radius utility is unknown to ` +
      'this gate and rule 1 could not fail. That is a pass having read nothing.',
  )
  process.exit(1)
}

// Rule 1.
let boundaries = 0
for (const result of results) {
  for (const full of result.files) {
    for (const boundary of boundariesIn(relativePosix(REPO, full), readFileSync(full, 'utf8'))) {
      boundaries += 1
      const element = boundary.tag.toLowerCase()
      if (NO_RADIUS_CONCEPT.has(element)) continue
      const { exposure, reasons } = radiusExposure(boundary.classList, utilities)
      if (exposure === 'fixed') continue
      findings.push(
        `${boundary.file}:${boundary.line}  [boundary-radius]  a ${PACK_ATTR} boundary sits on a <${boundary.tag}>` +
          ` whose corner radius the pack moves (${reasons.join(', ')})` +
          (boundary.classList ? `\n      class: ${boundary.classList}` : '\n      no className on the element') +
          '\n      A boundary re-points --radius, and a scale step is computed from it, so this element changes shape' +
          ' with its colour. Pin it to a shape the pack cannot move (rounded-full, rounded-none, an arbitrary value' +
          ' that does not name --radius), move the boundary to a fully-rounded ancestor, or use a shape with no' +
          ' radius concept.',
      )
    }
  }
}

// Rule 2.
const packs = declaredAxes(REPO)

/**
 * The colour contract, read from the token source rather than from a name shape.
 *
 * This is the same authority the contrast gate walks, used here for a different
 * question: it is the list of properties that are colour, so everything a pack
 * emits outside it is an axis the boundary law does not yet describe.
 */
const semanticSource = JSON.parse(
  readFileSync(path.join(REPO, 'packages/tokens/src/semantic/light.tokens.json'), 'utf8'),
)
const colourRoles = Object.keys(semanticSource).filter((name) => !name.startsWith('$'))
if (colourRoles.length === 0) {
  console.error(
    `\n${NAME}: the semantic token source declares no colour role, so this gate cannot tell a colour from a ` +
      'new axis and rule 2 could not fail. That is a pass having read nothing.',
  )
  process.exit(1)
}
const isColour = (property) => colourRoles.some((role) => property === `--${role}`)

const baseProperties = propertiesIn(readFileSync(path.join(REPO, DIST[0]), 'utf8'))
const seenAxes = new Map()

for (const pack of packs) {
  const file = path.join(REPO, `packages/tokens/dist/themes/${pack.id}/light.css`)
  if (!existsSync(file)) {
    findings.push(
      `${relativePosix(REPO, file)}  [pack-axis]  pack "${pack.id}" has no emitted light block, so the axes it ` +
        'carries are unknown and the boundary consequence of each is unchecked.',
    )
    continue
  }
  const emitted = propertiesIn(readFileSync(file, 'utf8'))
  for (const property of emitted) {
    // Colour roles are the token source's business, not an axis a boundary moves
    // beyond the palette. Everything else a pack emits IS an axis, and the
    // interesting question is which ones the boundary law has named.
    if (isColour(property)) continue
    if (!seenAxes.has(property)) seenAxes.set(property, [])
    seenAxes.get(property).push(pack.id)
  }
  if (emitted.length !== baseProperties.length) {
    findings.push(
      `${relativePosix(REPO, file)}  [pack-axis]  pack "${pack.id}" emits ${emitted.length} properties against the ` +
        `base pack's ${baseProperties.length}. A pack that gains or loses a property changes what a boundary moves ` +
        'beneath it, and the boundary law names only the axes this gate has read.',
    )
  }
  // The pack's declared radius must be the one the block emits, or the law's
  // "a boundary moves the radius beneath it" is describing a number nothing ships.
  const declared = pack.radius
  const actual = /--radius:\s*([^;]+);/.exec(readFileSync(file, 'utf8'))?.[1]?.trim()
  if (actual !== declared) {
    findings.push(
      `${relativePosix(REPO, file)}  [pack-axis]  pack "${pack.id}" declares radius ${declared} in themes.json and ` +
        `emits ${actual ?? 'nothing'}. The boundary law promises the declared radius moves, so the two must be one ` +
        'number.',
    )
  }
}

/**
 * The per-pack axes the boundary law names today.
 *
 * A shape, not a value, because the law is about the axis and not about which
 * step of it a given pack picked. Anything a pack emits that is neither a colour
 * role nor one of these is a second thing a scoped boundary silently moves, and
 * the law has to say what happens to it before it ships.
 */
const isKnownAxis = (property) => property === '--radius' || property.startsWith('--radius-')

const axisList = [...seenAxes.keys()].sort()

if (axisList.length === 0) {
  findings.push(
    `  [pack-axis]  no pack emits a non-colour axis at all, so this gate's second rule read nothing. Radius is the ` +
      'only such axis today and its absence is a finding, not a pass.',
  )
}

// A new axis is the thing this rule exists to catch, so it is named here.
for (const axis of axisList) {
  if (isKnownAxis(axis)) continue
  findings.push(
    `  [pack-axis]  "${axis}" is a per-pack axis this gate does not know, emitted for: ${seenAxes.get(axis).join(', ')}. ` +
      'A second per-pack axis is not automatically wrong, but it is a second thing a scoped boundary silently moves, ' +
      'and DESIGN.md names only the axes listed here. Add it to the boundary law, or say why a boundary may not move it.',
  )
}

console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${results.length} root(s), ` +
    `${boundaries} boundary/boundaries read`,
)
console.log(
  `${NAME}: per-pack axes this run read, from ${packs.length} pack(s): colour plus ${axisList.join(', ') || 'nothing'}; ` +
    `radius utilities read from the emitted theme: ${[...utilities.all].sort().join(', ')}; ` +
    `pack-relative, so a boundary moves them: ${[...utilities.packRelative].sort().join(', ')}`,
)
console.log(
  `${NAME}: shapes exempt because they have no radius concept: ${[...NO_RADIUS_CONCEPT].sort().join(', ')}`,
)
console.log(
  `${NAME}: a <rect> is NOT exempt. Its corner attribute is a CSS property and does follow a boundary; what blocks ` +
    'it is that no utility exists for it.',
)
console.log(
  `${NAME}: this is a text scan over class strings, not a cascade resolution. It can say an element is unpinned and ` +
    'cannot say which declaration wins.',
)

if (findings.length > 0) {
  for (const finding of findings) console.error(`  ${finding}`)
  console.error(
    `\nA pack boundary is a promise with two axes. A boundary on an unpinned element moves that element's corner ` +
      'radius as well as its colour, and nothing about the rendered result says why.',
  )
  process.exit(1)
}
