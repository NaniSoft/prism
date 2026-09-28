/**
 * The kit's shared machinery, and the one place a consumer's design system is
 * resolved.
 *
 * Three things live here because all six gates need them and a consumer must
 * only write them once:
 *
 *   1. **Resolution of the design system.** A gate reads the token contract and
 *      the emitted base rules, and it reads them *through the component
 *      package's own dependency*, not through the consumer's. That is the whole
 *      reason a consumer no longer declares `@nanisoft/prism-tokens`: the file
 *      belongs to the package that owns it, and the package that owns it is the
 *      one the consumer pinned exactly. A second declaration of the token
 *      version in a consumer is a second fact to keep in step with a release.
 *   2. **The CSS scanner**, shared by the ownership, token-read, hidden-state
 *      and pack-boundary gates, so four gates cannot disagree about what a
 *      declaration is. Comments are blanked rather than removed, so a finding
 *      names the line a reader has to edit.
 *   3. **The report shape**, so every gate says what it read, names every
 *      exclusion, and fails when it read less than its floor.
 *
 * A gate that can read nothing must fail. `floor()` is that: it is called by
 * every gate on the number it is about to be judged on, and it throws rather
 * than warning, because a run that scanned an empty export directory and
 * reported zero findings is indistinguishable from a clean repository.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

/** The component package's name. The one package a consumer of the kit pins. */
export const PACKAGE = '@nanisoft/prism-ui'

/** The token package's name, and the fact that it is the component package's dependency. */
export const TOKEN_PACKAGE = '@nanisoft/prism-tokens'

/**
 * A gate read less than it needed to read.
 *
 * Its own class rather than a generic `Error`, so the report can name it as a
 * coverage failure instead of a crash: the difference matters, because a crash
 * reads as "the gate is broken" and a coverage failure reads as "the gate saw
 * nothing", and only the second is true.
 */
export class CoverageError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CoverageError'
  }
}

/**
 * Fail the run when `actual` is below `floor`.
 *
 * `what` is the unit, because "read 0" is meaningless and "read 0 routes" is a
 * diagnosis. The message says what a reader has to do, which is the whole
 * reason this is a function and not a number in each gate.
 */
export function floor(what, actual, minimum) {
  if (actual >= minimum) return actual
  throw new CoverageError(
    `${what} ${actual} and this gate needs at least ${minimum}. A gate that read nothing reports\n` +
      `  zero findings, and a zero-finding report is indistinguishable from a clean repository.`,
  )
}

/* ------------------------------------------------------------------ reading */

/** Directories no gate ever reads. Printed on every run, because an exclusion is arguable. */
export const SKIP_DIRECTORIES = [
  '.git',
  '.next',
  '.source',
  '.wrangler',
  'coverage',
  'node_modules',
  'out',
]

/**
 * Every file under `root`, as forward-slashed relative paths, depth first and
 * sorted, with `skip` pruned rather than filtered afterwards.
 *
 * Sorted because a gate's output order is a reader's reading order and a
 * filesystem's order is not one.
 */
export function walk(root, { skip = SKIP_DIRECTORIES, extensions = null } = {}) {
  const pruned = new Set(skip)
  const found = []
  const visit = (dir) => {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (pruned.has(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) visit(full)
      else if (extensions === null || extensions.some((pattern) => pattern.test(entry.name))) {
        found.push(path.relative(root, full).split(path.sep).join('/'))
      }
    }
  }
  visit(root)
  return found
}

/** Read a file under `root`, or return null when it is absent. */
export function read(root, relative) {
  try {
    return readFileSync(path.join(root, relative), 'utf8')
  } catch {
    return null
  }
}

/** Read a JSON file under `root`, or return null when it is absent or malformed. */
export function readJson(root, relative) {
  const text = read(root, relative)
  if (text === null) return null
  try {
    return JSON.parse(text)
  } catch (cause) {
    throw new Error(`${relative} is not valid JSON: ${cause.message}`)
  }
}

/** Fail the run when a declared root does not resolve, naming the file. */
export function requireRoot(root, relative) {
  const full = path.join(root, relative)
  if (!existsSync(full) || !statSync(full).isFile()) {
    throw new CoverageError(
      `${relative} does not resolve, so this gate cannot read what it was pointed at. ` +
        `A renamed file empties a run and an emptied run reports a clean repository.`,
    )
  }
  return full
}

/* ------------------------------------------------- the design system, resolved */

/**
 * The consumer's installed design system, reached through its own export map.
 *
 * Everything a gate knows about tokens comes from here, so a gate never has to
 * be told where the token package is and a consumer never has to declare it.
 * `createRequire` is seeded with the *component* package's `package.json`, which
 * is itself a published export, so the token package is resolved as a dependency
 * of the thing that owns it rather than as a top-level lookup in the consumer.
 */
export function designSystem(root) {
  const fromConsumer = createRequire(path.join(root, 'package.json'))
  let manifestPath
  try {
    manifestPath = fromConsumer.resolve(`${PACKAGE}/package.json`)
  } catch (cause) {
    throw new CoverageError(
      `the pinned design system does not resolve from ${PACKAGE}/package.json (${cause.message}).\n` +
        `  Every judgement about tokens and base rules is a guess without it. Run pnpm install first.`,
    )
  }
  const packageRoot = path.dirname(manifestPath)
  const require = createRequire(manifestPath)
  const version = JSON.parse(readFileSync(manifestPath, 'utf8')).version

  return {
    version,
    packageRoot,
    /** The one emitted stylesheet, which carries the token blocks and the base layer. */
    styles() {
      try {
        return readFileSync(require.resolve(`${PACKAGE}/styles.css`), 'utf8')
      } catch (cause) {
        throw new CoverageError(
          `${PACKAGE}/styles.css does not resolve (${cause.message}), so the token contract and the\n` +
            '  base rules cannot be read and every judgement about them would be a guess.',
        )
      }
    },
    /**
     * The published per-pack block for one pack and mode, as the token package
     * emits it. Resolved through the component package's dependency, which is
     * why a consumer does not declare the token package itself.
     */
    tokenTheme(pack, mode) {
      try {
        const file = require.resolve(`${TOKEN_PACKAGE}/dist/themes/${pack}/${mode}.css`)
        return properties(readFileSync(file, 'utf8'))
      } catch (cause) {
        throw new CoverageError(
          `the token package's ${pack} ${mode} block does not resolve through ${PACKAGE} ` +
            `(${cause.message}).\n  A boundary resolves this file's values in both modes, so without it the\n` +
            '  both-modes check cannot run at all.',
        )
      }
    },
  }
}

/* ------------------------------------------------------------------- the css */

/**
 * Blank comments rather than removing them, so every line number a finding
 * prints is still the line a reader has to edit.
 */
export function blankComments(source) {
  const out = source.split('')
  for (let i = 0; i < out.length; i += 1) {
    if (out[i] === '/' && out[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2)
      const end = close === -1 ? out.length : close + 2
      for (let k = i; k < end; k += 1) if (out[k] !== '\n') out[k] = ' '
      i = end - 1
    } else if (out[i] === '/' && out[i + 1] === '/') {
      let end = source.indexOf('\n', i)
      if (end === -1) end = source.length
      for (let k = i; k < end; k += 1) out[k] = ' '
      i = end - 1
    }
  }
  return out.join('')
}

/**
 * Split a stylesheet into `selector { declarations }`, keeping the line each
 * block starts on. A declaration parser rather than a cascade resolution, and
 * the difference is printed on every run: this cannot see a class-scoped rule
 * that competes, an inline style prop, or a sheet it was not pointed at.
 */
export function cssBlocks(source) {
  const blanked = blankComments(source)
  const blocks = []
  for (const match of blanked.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    blocks.push({
      selectors: splitSelectors(match[1]),
      body: match[2],
      line: blanked.slice(0, match.index).split('\n').length,
    })
  }
  return blocks
}

/**
 * A selector list, split on the commas that separate selectors.
 *
 * Not `split(',')`, because a comma inside `:where(a, b)` or `:is()` separates
 * arguments rather than selectors, and splitting there makes the tail look like a
 * bare-element selector: `.site :where(a, b)` would report `b)` as an unclassed
 * element rule that declares a property the design system owns. A gate that
 * reports a false positive on ordinary modern CSS is a gate that gets switched
 * off, so the parentheses are tracked and the split only happens at depth zero.
 */
export function splitSelectors(text) {
  const parts = []
  let depth = 0
  let current = ''
  for (const character of text) {
    if (character === '(') depth += 1
    else if (character === ')') depth = Math.max(0, depth - 1)
    if (character === ',' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += character
  }
  parts.push(current)
  return parts.map((part) => part.trim()).filter(Boolean)
}

/** The custom properties a declaration list declares, `--name` included. */
export function properties(body) {
  return new Map([...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

/** Every custom property name a stylesheet declares. */
export function declaredProperties(css) {
  return new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]))
}

/**
 * Two colours are the same colour however they are written.
 *
 * A minifier shortens `#ffffff` to `#fff`, and a value read from an emitted
 * sheet compared byte for byte against the contract reports a difference that is
 * not one. Normalising is what lets a gate compare values rather than spellings.
 */
export function sameColour(left, right) {
  const expand = (value) => {
    const hex = /^#([0-9a-f]{3,8})$/i.exec(String(value).trim())
    if (!hex) return String(value).trim().toLowerCase()
    const digits = hex[1]
    return digits.length === 3 || digits.length === 4
      ? `#${[...digits].map((digit) => digit + digit).join('')}`.toLowerCase()
      : `#${digits}`.toLowerCase()
  }
  return expand(left) === expand(right)
}

/* ---------------------------------------------------------------- reporting */

/**
 * One finding, formatted the way every gate formats one, so a reader who has
 * seen one finding has seen every finding.
 *
 * `where` is the file and line a reader has to edit, `tag` is the class of the
 * defect, and `body` is what it is. The law is not repeated per finding: it is
 * printed once at the end, because a message repeated per finding is a message
 * a reader learns to skip.
 */
export function finding(where, tag, body) {
  return `error ${where}  [${tag}]  ${body}`
}

/** A note the run prints, so coverage and exclusions are on every run. */
export function note(text) {
  return text
}
