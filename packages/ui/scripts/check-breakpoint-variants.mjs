/**
 * Every responsive variant in a class string names a screen the token package
 * actually emits.
 *
 * **The defect this was written for shipped, and every other gate in this
 * repository passed it.** `DocsShell`'s frame read
 * `lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_13rem]`,
 * and the token build closes `xl` by emitting `--breakpoint-xl: initial` inside
 * the `@theme static` block, so Tailwind compiles no `xl:` selector and no media
 * query for it. The class was therefore dead at every width, and the third track
 * it was supposed to size came from `lg:col-start-3` landing in an IMPLICIT grid
 * track, which is sized `auto`. What a reader saw was a two-column
 * documentation frame from 1024 pixels up with the article column squeezed to
 * roughly 340 pixels at 1024, on the documentation site and in all four consumer
 * repositories, and the comment above the line said the frame was a fixed
 * three-column grid. The class is fixed; this gate is why the next one is caught
 * on the way in.
 *
 * **Nothing else here could see it, and the reason is a direction.** The
 * breakpoint question has two sides and every gate had one. The token side is
 * asserted: `packages/tokens/scripts/check-emitted-contract.mjs` fails unless the
 * emitted set is exactly `{sm, md, lg}` with `xl` and `2xl` closed to `initial`,
 * and `scripts/check-elevation-layout.mjs` fails on a `--breakpoint-` property
 * declared outside the token package. Both are about the VALUE. The authored
 * `breakpoint` group's own `$description` says closing `xl` means an `xl:`
 * utility "cannot silently resolve to a value this repository never authored",
 * which was true of the value and had never been checked of the class, so the
 * sentence described a protection nobody was checking. This gate is the other
 * side: a screen the emitted theme does not have, named by a class.
 *
 * **The screens come from the token SOURCE, never from `dist/`.** Two reads, and
 * both are deliberate. The authored set is
 * `packages/tokens/src/foundation/layout.tokens.json`, read because the token
 * source is this repository's only authority on what a breakpoint is, and read
 * from source because a gate whose subject is the authored scale cannot be
 * answered by a build output a warm cache may have left behind: a stale
 * `theme.css` would pass a class the build no longer emits, and a stale one is
 * exactly what a cache hands you. The closed set is
 * `packages/tokens/build/build.mjs`, read because a screen that is authored AND
 * closed with `initial` is still closed, and reading only the source would pass
 * an `xl:` class on the day somebody added `xl` to the JSON without removing the
 * line below it. The usable set is therefore authored minus closed, both halves
 * are printed on every run, and neither is a list kept beside this script.
 *
 * **What is read is a class string, and comments are not one.** The scan is a
 * text scan and it is deliberately narrow in two directions, each because the
 * obvious widening reports a defect that is not there. It reads STRING LITERALS,
 * not source lines, because a variant name is a class only inside a class: the
 * `size` variant map of `Heading` and of `Price` holds a key `xl`, and reading
 * keys would report a type-scale step as a dead breakpoint. And it skips
 * comments, for the reason this repository states elsewhere about a comment that
 * names a fact: a JSDoc block explaining that `xl` is closed, or quoting the
 * class that was retired, is a record of the retired line and not a class
 * anybody renders. The comment and string handling is a single string-aware pass
 * rather than a mask, so a `//` inside a string (this repository has URLs in
 * `href`s) cannot blank the rest of a line and hide a class written on it.
 *
 * Strings are read wherever they are rather than only at a `className=`, because
 * a class held in a `cva` map or a module constant is as much a class as one
 * written inline, and a gate that only read `className=` would have missed the
 * `xl:` on the line this was written for if it had lived in a variant map. The
 * cost of that is that prose in a thrown `Error` is read as well, and that is why
 * the rule below is a named table rather than "any bare word".
 *
 * **The table is the shapes a screen name can take here, and the limit is
 * stated rather than hidden.** A segment is a screen when it is a bare screen
 * name Tailwind ships (`sm`, `md`, `lg`, `xl`, `2xl`, and the two step names
 * `3xl` and `4xl`, which are a container step in Tailwind's own scale and a
 * breakpoint in nobody's: a class naming one is dead here either way), or when
 * it is a `min-`/`max-` ranged form of one, because the ranged forms exist only
 * for screens and a name this repository made up would arrive as one. Any other
 * bare lowercase segment is not judged, and that is a real limit: an invented
 * screen written as `wide:` is outside this rule, because treating every bare
 * lowercase segment as a screen would report the word `md` in an error message
 * as a dead variant. A screen name Tailwind adds to its default theme later is a
 * one-line change to `TAILWIND_SCREENS`, and a name this repository invents
 * belongs in the token source where the other four are.
 *
 * **Coverage is asserted rather than assumed.** Roots resolve from this file's
 * own location, never `process.cwd()`, so a run from any directory reads the
 * same files. A root that does not resolve fails the run and the message names
 * both causes a reader cannot tell apart. A run that read no file fails, and so
 * does a run that read files and found no responsive variant in any of them,
 * because a tree with no `sm:` in it is a tree this rule cannot see. Every run
 * prints what it read and the screens it compared against.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:breakpoint-variants
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'breakpoint-variants'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The repository root, from this file's own location. Never `process.cwd()`. */
const REPO = path.join(HERE, '..', '..', '..')

/** The authored screens, and the closes the build adds on top of them. */
const LAYOUT_TOKENS = path.join(REPO, 'packages', 'tokens', 'src', 'foundation', 'layout.tokens.json')
const TOKEN_BUILD = path.join(REPO, 'packages', 'tokens', 'build', 'build.mjs')

/** Where a class string is authored. Both trees ship in the stylesheet. */
const ROOTS = ['packages/ui/src', 'apps/site/src']
const EXT = /\.(tsx?|jsx?)$/

/**
 * The screen names this gate can judge, which is Tailwind's screen namespace as
 * it ships plus the two step names Tailwind uses elsewhere in its scale.
 * `3xl` and `4xl` are container steps there and are not breakpoints, but a class
 * that names one compiles to nothing here in the same way, and they are the
 * names a person copies out of a scale. A screen name Tailwind adds to its
 * default theme later is a one-line change here; a name this repository invents
 * belongs in `layout.tokens.json` with the other four.
 */
const TAILWIND_SCREENS = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']

/**
 * The walker is local rather than imported, for the reason
 * `check-item-docs.mjs` states in full: `scripts/` is not in this package's
 * `files`, so a shared module would ship in no tarball and fail to resolve for
 * anyone who ran the gate from an installed copy.
 *
 * Symbolic links are not followed. A linked directory is reported as a file, so a
 * link cycle cannot make the walk run forever.
 */
function walkRoot(absolute, relative) {
  let stats
  try {
    stats = statSync(absolute)
  } catch (cause) {
    return { root: absolute, relative, files: [], exists: false, error: cause.code }
  }
  if (stats.isFile()) return { root: absolute, relative, files: [absolute], exists: true }
  const files = []
  for (const name of readdirSync(absolute)) {
    const child = path.join(absolute, name)
    if (statSync(child).isDirectory()) {
      const nested = walkRoot(child, relative)
      if (!nested.exists) return nested
      files.push(...nested.files)
    } else if (EXT.test(name)) {
      files.push(child)
    }
  }
  return { root: absolute, relative, files, exists: true }
}

const walkRoots = () => ROOTS.map((root) => walkRoot(path.join(REPO, root), root))

function assertRootsResolve(results) {
  const missing = results.filter((result) => !result.exists)
  if (missing.length === 0) return
  const listed = missing.map((result) => `"${result.relative}"`).join(', ')
  const plural = missing.length === 1 ? 'root does not resolve' : 'roots do not resolve'
  throw new Error(
    `${NAME}: ${missing.length} of ${results.length} configured ${plural}: ${listed}\n` +
      '  Two causes, and this run cannot tell them apart:\n' +
      '  (1) the gate was run from the wrong working directory, or the script being run is not this\n' +
      `      repository's copy - run it as \`node packages/ui/scripts/${NAME}.mjs\`, or via \`pnpm check\`;\n` +
      '  (2) the root does not exist in the repository at all, so the configuration names a\n' +
      '      path that was renamed, moved or never committed.\n' +
      '  A gate that read nothing and reported zero findings is the failure this replaces, so an\n' +
      '  unresolved root fails the run rather than emptying it.',
  )
}

function assertFilesRead(count) {
  if (count > 0) return
  throw new Error(
    `${NAME}: every configured root resolved and the run read 0 files matching ${EXT}.\n` +
      '  This is not a missing-directory problem: the roots are there and they hold no source,\n' +
      '  or the read was short-circuited before it began.\n' +
      '  Reporting zero findings over zero files is the failure this replaces, so an empty read\n' +
      '  fails the run.',
  )
}

const rel = (file) => path.relative(REPO, file).split(path.sep).join('/')
const lineOf = (source, index) => source.slice(0, index).split('\n').length

/**
 * Every string literal in a source, with the offset of its opening quote, and
 * nothing from inside a comment.
 *
 * One pass, tracking the three states a `tsx` character can be in, because two
 * narrower versions of this are wrong in ways that are hard to see. A pass that
 * masks comments without tracking strings treats the `//` in a URL as the start
 * of a line comment and blanks the class string written after it on the same
 * line. A pass that reads raw lines reads the `xl` key of a `cva` variant map,
 * which is a step on a type scale and not a breakpoint.
 *
 * A template literal is read as one span and its interpolations are not
 * followed: the interpolations are expressions, and what they produce is not
 * knowable from the source, which is the same limit every other text gate here
 * states.
 */
function stringLiterals(source) {
  const found = []
  let i = 0
  while (i < source.length) {
    const ch = source[i]

    if (ch === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i)
      i = end === -1 ? source.length : end
      continue
    }
    if (ch === '/' && source[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2)
      i = close === -1 ? source.length : close + 2
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      let j = i + 1
      while (j < source.length) {
        if (source[j] === '\\') {
          j += 2
          continue
        }
        if (source[j] === ch) break
        j += 1
      }
      found.push({ at: i, value: source.slice(i + 1, j) })
      i = j + 1
      continue
    }
    i += 1
  }
  return found
}

/**
 * The variant segments of one class, split at the colons that separate them.
 *
 * Brackets and parentheses carry colons of their own (`data-[state=open]:`,
 * `supports-[display:grid]:`, `w-[calc(100%-1rem)]`), and splitting on those would
 * read `state=open` and `display` as variants. Depth-aware for that reason.
 */
function segmentsOf(utility) {
  const segments = []
  let depth = 0
  let current = ''
  for (const ch of utility) {
    if (ch === '[' || ch === '(') depth += 1
    else if (ch === ']' || ch === ')') depth -= 1
    if (ch === ':' && depth === 0) {
      segments.push(current)
      current = ''
      continue
    }
    current += ch
  }
  segments.push(current)
  return segments
}

/**
 * The screen a variant segment names, or nothing.
 *
 * Two shapes count. A bare screen name from Tailwind's own namespace, and a
 * `min-`/`max-` ranged form of one, because the ranged forms exist only for
 * screens and a name this repository made up would arrive as one. Anything else
 * is not judged, and the header says why: this function runs over every string
 * in two trees, and a rule that treated any bare lowercase segment as a screen
 * would report the `md` in an error message as a dead variant.
 */
function screenOf(segment) {
  const ranged = /^(min|max)-(.+)$/.exec(segment)
  const name = ranged ? ranged[2] : segment
  if (!/^\d?[a-z]{1,3}$/.test(name)) return null
  if (!ranged && !TAILWIND_SCREENS.includes(name)) return null
  return { name, range: ranged ? ranged[1] : null }
}

/** The screen names the authored token source declares, read from the source. */
function authoredScreens() {
  const group = JSON.parse(readFileSync(LAYOUT_TOKENS, 'utf8')).breakpoint ?? {}
  return Object.keys(group)
    .filter((name) => !name.startsWith('$'))
    .sort()
}

/**
 * The screens the token build closes with `initial`, which are unusable however
 * the source is written. A `--breakpoint-*: initial` in the `@theme static` block
 * is how this repository removes a screen from Tailwind's namespace, so the
 * declaration is the closing and the line above it is the record.
 */
function closedScreens() {
  const build = readFileSync(TOKEN_BUILD, 'utf8')
  return [...build.matchAll(/push\('--breakpoint-([\w-]+)',\s*'initial'\)/g)]
    .map((match) => match[1])
    .sort()
}

const findings = []
let files = 0
let literals = 0
let variants = 0

for (const input of [LAYOUT_TOKENS, TOKEN_BUILD]) {
  if (existsSync(input)) continue
  console.error(`error ${NAME}: ${rel(input)} does not exist, so this run has no authority to judge a screen against`)
  process.exit(1)
}

const authored = authoredScreens()
const closed = closedScreens()
if (authored.length === 0) {
  console.error(
    `error ${NAME}: the authored breakpoint group is empty, so every screen would read as undefined and the ` +
      'run would pass for the wrong reason.',
  )
  process.exit(1)
}

// Authored and then closed is still closed: the emitted theme drops the screen
// either way, and the class is dead either way.
const emitted = authored.filter((name) => !closed.includes(name))

const results = walkRoots()
try {
  assertRootsResolve(results)
  assertFilesRead(results.reduce((total, result) => total + result.files.length, 0))
} catch (failure) {
  console.error(`\n${failure.message}`)
  process.exit(1)
}

const screens = emitted.length > 0 ? emitted.join(', ') : 'nothing'

for (const result of results) {
  for (const file of result.files) {
    files += 1
    const source = readFileSync(file, 'utf8')

    for (const literal of stringLiterals(source)) {
      literals += 1
      for (const match of literal.value.matchAll(/\S+/g)) {
        const utility = match[0]
        const at = literal.at + 1 + match.index
        const segments = segmentsOf(utility)

        // The last segment is the utility, not a variant, so a screen is only
        // ever judged where a variant can stand.
        for (const segment of segments.slice(0, -1)) {
          const screen = screenOf(segment)
          if (screen === null) continue
          variants += 1
          if (emitted.includes(screen.name)) continue

          const asWritten = `${screen.range === null ? '' : `${screen.range}-`}${screen.name}`
          const why =
            closed.includes(screen.name)
              ? `the token build closes \`${screen.name}\` with \`--breakpoint-${screen.name}: initial\`, ` +
                'so Tailwind compiles no media query for it and the utility is dead at every width'
              : `neither ${rel(LAYOUT_TOKENS)} nor ${rel(TOKEN_BUILD)} mentions \`${screen.name}\`, ` +
                'so no threshold for it was ever authored and the utility compiles to nothing'

          findings.push(
            `${rel(file)}:${lineOf(source, at)}  \`${utility}\` names the screen \`${asWritten}\`, and ${why}. ` +
              `Screens this repository emits: ${screens}.`,
          )
        }
      }
    }
  }
}

if (variants === 0) {
  findings.push(
    `no responsive variant was read in ${files} file(s) across ${results.length} root(s), so this run has ` +
      'judged nothing. A tree that carries no `sm:` is a tree this rule cannot see, and reporting that as a ' +
      'clean run is the failure this replaces.',
  )
}

console.log(
  `\n${NAME}: ${findings.length} finding(s) in ${files} file(s) read from ${results.length} root(s), ` +
    `${literals} string literal(s) read, ${variants} responsive variant(s) judged`,
)
console.log(
  `${NAME}: screens emitted by the token package, read from ${rel(LAYOUT_TOKENS)}: ` +
    `${authored.join(', ')}; closed with \`initial\` by ${rel(TOKEN_BUILD)}: ${closed.join(', ') || 'none'}; ` +
    `emitted: ${screens}`,
)
console.log(
  `${NAME}: the judgeable screen names are ${TAILWIND_SCREENS.join(', ')} and any \`min-\`/\`max-\` ranged form, ` +
    'so a name invented in another shape is outside this rule rather than judged',
)

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`)
  console.error(
    `\nA screen the emitted theme does not have is a media query nobody compiles, so the class reads as authored\n` +
      '  and renders as nothing. Name a screen the token package emits, or author the screen in the token source\n' +
      '  and emit it.',
  )
  process.exit(1)
}

console.log(`${NAME}: every responsive variant read names a screen the token package emits.`)
