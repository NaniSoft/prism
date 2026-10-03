/**
 * Motion is by token, or the build fails.
 *
 * `AGENTS.md` states the law in one line: name `duration-fast`, `duration-base` or
 * `duration-slow` and `ease-out` or `ease-in-out`; never a millisecond value, never
 * a `cubic-bezier(...)` literal, and never a keyframe. `DESIGN.md` names the gate
 * that holds it under Token Contract and describes what it measures. Neither named
 * one existed. There were twenty-eight `check-*.mjs` gates in this repository and
 * none of them was a motion gate, so the constitution described a law as enforced
 * by a gate that was never written: a component could have written
 * `transition-[color,400ms]` or `cubic-bezier(0.4,0,0.2,1)` and every gate in the
 * chain would have been green. `docs/quality-gates.md` records that shape as the
 * defect class it exists to correct, which is why it is named there rather than
 * quietly fixed.
 *
 * WHAT IT MEASURES, ON WHAT SURFACE
 *
 * Component source: the five authored trees whose source reaches a reader's screen
 * or an agent's answer. `packages/ui/src`, `apps/site/src` and `apps/site/items` are
 * the three trees `check-pack-boundary.mjs` reads for the other repository-wide law
 * over the same population, and `packages/llms/src` and `packages/mcp-server/src`
 * are here because a rule string an agent reads is an answer a consumer acts on.
 * Four rules, matching `DESIGN.md`:
 *
 *   1. `curve-literal`      `cubic-bezier(` with its argument list.
 *   2. `arbitrary-motion`   `duration-[...]`, `ease-[...]`, `animate-[...]`.
 *   3. `value-in-style`     a millisecond or second value next to a motion property.
 *   4. `guarded-motion`     a `motion-safe:` or `motion-reduce:` variant on a motion
 *                           utility, which is a per-call-site reduced-motion guard.
 *
 * Rule 2 includes `animate-[...]`, which `DESIGN.md` does not name and which is here
 * for the reason `backdrop-01` records in its own comment: the rejected shape is
 * `animate-[prism-travel_7.2s_linear_infinite]`, which is a duration AND an easing
 * inside one bracket form, so a rule that banned only `duration-[` and `ease-[` would
 * be passed through by rewriting the same defect in a different utility.
 *
 * Rule 4 is the second half of the reduced-motion policy and it is here rather than
 * in a document because `styles.css` states the policy in one unlayered rule that
 * covers everything, and a guard at a call site is either inert or a second place to
 * retune it. A `motion-safe:` variant ADDS a rule inside `prefers-reduced-motion:
 * no-preference`; it never removes one, so a class string carrying both a
 * transition utility and its guarded twin ran the transition at every setting, and
 * three of the three guards this package shipped were that shape. `RangeField`'s was
 * the one that was doing nothing at all.
 *
 * AND THE FIFTH THING, WHICH IS NOT A PATTERN
 *
 * The policy itself is checked, because a rule enforced on component source cannot
 * enforce the stylesheet's half. `packages/ui/src/styles.css` ends with one
 * unlayered `prefers-reduced-motion` rule, and this gate reads `.css` files for
 * exactly that reason: a block narrowed back to a list of the seven ambient classes
 * is a block that has stopped covering the spinner's loop and the timeline's pulse,
 * and nothing in the shipped surface would say so. `reduced-motion-block` is a
 * check over that one file rather than a pattern over five roots, so it fires when
 * the file is in the population and stays quiet in a staged tree that has no
 * stylesheet in it.
 *
 * WHAT IS DELIBERATELY NOT READ, AND WHY
 *
 * `packages/tokens/**` is the foundation tier and owns the values. The literal curve
 * is in `packages/tokens/src/foundation/base.tokens.json` and the writer is
 * `packages/tokens/build/serialize.mjs`, and that is the arrangement: a duration is a
 * value and values live in the token source.
 *
 * `packages/ui/gates/**`, `scripts/**` and every package's `scripts/**` are not read,
 * and this is a scope decision rather than an omission of files. A gate's rule table
 * spells out the pattern it bans, and the consumer gate kit exists to restate laws as
 * failure messages in a consumer's own repository; `packages/ui/gates/__tests__` holds
 * a hidden-state fixture that writes `animation: rise 1ms linear 3s forwards` on
 * purpose. Reading those trees would mean either a permanent exclusion list or a gate
 * that reports its own table, and `AGENTS.md` already says where a law belongs: in the
 * place that enforces it.
 *
 * `apps/site/src/generated/**` is written by `generate-demos.mjs` from the Demos in
 * `apps/site/items`, which ARE read. Reading the generated copy would report a Demo's
 * text twice and would report it at a path nobody edits.
 *
 * WHY THE ANSWER IS NOT A LINE REGEX
 *
 * This repository has already been bitten by a gate that fired on the wrong thing, so
 * the narrowness is in the reading and each part of it is a decision rather than a
 * refinement:
 *
 *   - COMMENTS ARE BLANKED. Every `\d+ms` in `packages/ui/src` today is inside a JSDoc
 *     block that quotes the value while explaining why it is banned: `drawer.tsx` on
 *     280ms, `toast.tsx` on 0.01ms, `backdrop-01` on the rejected `animate-[...]`. A
 *     comment that names a fact is a record, and a line-based rule would have failed
 *     the build on day one over seven records.
 *   - A STRING IS NOT A COMMENT. `check-breakpoint-variants.mjs` already settled where
 *     this line falls for classes: a variant name is a class whenever it is inside a
 *     string, because a class held in a `cva` map or a module constant is as much a
 *     class as one written inline. So `const rejected = 'animate-[prism-travel_7.2s]'`
 *     is a finding here, and moving that same sentence into a comment makes it a
 *     record. The two are different statements and the gate treats them differently on
 *     purpose.
 *   - `cubic-bezier` IS MATCHED WITH ITS ARGUMENT LIST, not as a word. The rule string
 *     `packages/mcp-server/src/rules.ts` serves to an agent reads "never by a
 *     millisecond or a `cubic-bezier` literal", with no parentheses, and it must keep
 *     reading correctly.
 *   - A MILLISECOND IS JUDGED ONLY NEXT TO A MOTION PROPERTY, and that property is a
 *     CLOSED table printed on every run. `'511ms'` in a Demo's data and `'1200ms'` in
 *     the `durationLabel` contract are a caller stating a reading in their own
 *     register, and both are in the tree today. The rule needs a shape that can only
 *     be a style, so it names one.
 *   - A REGEX LITERAL IS SKIPPED, and the reason is the comment scan rather than the
 *     rules. `/['"]/` carries a quote; without skipping it, that quote opens a string
 *     that runs until the next quote in the file, and any COMMENT inside the span
 *     stops being blanked, which turns a record into a finding. The discriminator
 *     looks back past whitespace to the last non-space character, because in `a / b`
 *     the `/` follows a space and a lead class containing `\s` blanks real arithmetic.
 *     The residual is stated rather than hidden and is a regex with no operator and
 *     no keyword before it.
 *
 * COVERAGE IS ASSERTED, NOT ASSUMED
 *
 * Roots resolve from this file's own location, never `process.cwd()`. A root that
 * resolves to nothing fails the run naming both causes a reader cannot tell apart; a
 * run that read no file fails; and a run that read files and found no authored motion
 * name in any of them fails too, because a tree that carries no `duration-fast` is a
 * tree this rule cannot see and reporting that as a clean run is the failure this
 * replaces. Every run prints what it read, what it excluded, and the table it judged.
 *
 * Run: node scripts/check-motion.mjs [--repo=<dir>]
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  assertFilesRead,
  assertRootsResolve,
  coverageOf,
  relativePosix,
  walkRoots,
} from './lib/walk.mjs'

const NAME = 'check-motion'
const HERE = path.dirname(fileURLToPath(import.meta.url))

function repoArgument(args) {
  const flag = args.find((argument) => argument.startsWith('--repo='))
  return flag ? flag.slice('--repo='.length) : null
}

/** The repository under test. `--repo=` wins; otherwise this file's own parent. */
const REPO_ROOT = path.resolve(repoArgument(process.argv.slice(2)) ?? path.join(HERE, '..'))

/** The five trees whose source reaches a reader's screen or an agent's answer. */
const ROOTS = [
  'packages/ui/src',
  'packages/llms/src',
  'packages/mcp-server/src',
  'apps/site/src',
  'apps/site/items',
]

/**
 * `//` is a line comment in JS and is not one in CSS. Reading a stylesheet as though
 * it were would blank the rest of every line holding a `//` in a URL, so the flag the
 * masker takes is per file type rather than a rule that happens to come out right.
 */
const EXT = /\.(tsx?|jsx?)$|\.css$/

/**
 * Generated, never authored. Written at `pretest` and `prebuild` from the Demos in
 * `apps/site/items`, which this gate reads directly.
 */
const GENERATED = path.join(REPO_ROOT, 'apps', 'site', 'src', 'generated')

const EXCLUSIONS = [
  'packages/tokens/** (the foundation tier owns the values)',
  'packages/ui/gates/**, scripts/** and every package scripts/** (gate rule tables and the consumer kit restate laws as failure messages)',
  `${relativePosix(REPO_ROOT, GENERATED)}/** (written by generate-demos.mjs from apps/site/items, which is read)`,
]

// ------------------------------------------------------------------- reading

/**
 * Blank out comments, keeping every offset.
 *
 * Comments are the whole job, and everything else here exists to keep that job from
 * misfiring. Three details, each because the obvious narrower version is wrong:
 *
 *   - A STRING IS SKIPPED, not blanked, and not because a rule wants quotes read. A
 *     stylesheet or a class string may carry `//` in a URL or `/*` in a glob, and a
 *     scanner that cannot tell a string from code reads the rest of the line as a
 *     comment and stops blanking, which turns a record into a finding.
 *   - A REGEX LITERAL IS SKIPPED for the same reason. `/['"]/` contains a quote, and
 *     without this the quote opens a string that runs until the next quote in the
 *     file; any comment inside that span stops being blanked, and a comment that
 *     quotes a banned value would then be reported as one.
 *   - THE REGEX DISCRIMINATOR LOOKS BACK PAST WHITESPACE to the last non-space
 *     character, and that is the part that is easy to get wrong in both directions. A
 *     lead class containing `\s` blanks real code the moment a Component divides,
 *     because in `a / b` the `/` follows a space; reading the tail after trimming
 *     whitespace instead makes division look like an operand rather than an operator,
 *     which is what it is. Only a `/` after `=`, `(`, `[`, `{`, `,`, `:`, `;` or a
 *     binary operator, or directly after the `return`/`typeof`/`case` keyword, begins
 *     a literal. The residual is stated rather than hidden: a regex written as
 *     `if (x) /['"]/.test(y)`, with no operator before it, is read as a string, and a
 *     comment inside that string stops being blanked. Nothing in the five roots is
 *     written that way.
 *
 * Strings are not blanked, so every rule reads their contents. A `duration-[...]` is
 * a class when it is written inside quotes, and a millisecond is only a style when it
 * sits beside a property name, so no rule is satisfied by the contents alone and no
 * rule is unsatisfied by them. A template literal is one region and its interpolations
 * are not followed, because an interpolation is an expression and what it produces is
 * not knowable from the source, which is the limit `check-breakpoint-variants.mjs`
 * states.
 */
function mask(source, { lineComments }) {
  const out = source.split('')
  const blank = (from, to) => {
    for (let i = from; i < to && i < source.length; i += 1) {
      if (out[i] !== '\n') out[i] = ' '
    }
  }
  /**
   * Where a `/` may begin a regex literal rather than divide, read against the last
   * NON-SPACE character before it. That is the whole discriminator, and the reason
   * `a / b` is safe: in division the `/` follows an operand, so the tail is an
   * identifier, a digit or a closing bracket, none of which is here. Space is
   * therefore never in the class, and `+`, `-` and `*` are out of it because a
   * postfix `i++ / 2` would otherwise look exactly like `a + /re/`.
   */
  const REGEX_LEAD = /[=([{,;:!&|?%<>~^]$/
  const REGEX_KEYWORD = /\b(?:return|typeof|case|throw|await|yield|in|of|do|else)$/

  let i = 0
  while (i < source.length) {
    const char = source[i]

    if (lineComments && char === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i)
      const stop = end === -1 ? source.length : end
      blank(i, stop)
      i = stop
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2)
      const stop = close === -1 ? source.length : close + 2
      blank(i, stop)
      i = stop
      continue
    }
    if (char === '/') {
      const before = source.slice(0, i).replace(/\s+$/, '')
      if (REGEX_LEAD.test(before) || REGEX_KEYWORD.test(before)) {
        let j = i + 1
        let inClass = false
        while (j < source.length && source[j] !== '\n') {
          if (source[j] === '\\') {
            j += 2
            continue
          }
          if (source[j] === '[') inClass = true
          else if (source[j] === ']') inClass = false
          else if (source[j] === '/' && !inClass) break
          j += 1
        }
        blank(i, j)
        i = j + 1
        continue
      }
    }
    if (char === '"' || char === "'" || char === '`') {
      let j = i + 1
      while (j < source.length) {
        if (source[j] === '\\') {
          j += 2
          continue
        }
        if (source[j] === char) break
        j += 1
      }
      i = j + 1
      continue
    }
    i += 1
  }
  return out.join('')
}

// -------------------------------------------------------------------- rules

/**
 * The motion properties a time value may sit beside, and nothing else.
 *
 * A closed table rather than a pattern, for the reason `check-breakpoint-variants.mjs`
 * gives its own: a rule that treated any property name containing four letters as
 * motion would report the `durationLabel` a live surface hands to a caller, and a
 * gate with a finding rate set by English prose is a gate nobody runs. The camelCase
 * forms are derived rather than written, so a kebab addition cannot be half-added.
 */
const MOTION_PROPERTIES = [
  ...new Set(
    ['transition', 'animation'].flatMap((shorthand) => [
      shorthand,
      `${shorthand}-duration`,
      `${shorthand}-delay`,
      `${shorthand}-timing-function`,
    ]).flatMap((property) => [
      property,
      property.replace(/-(\w)/g, (_, letter) => letter.toUpperCase()),
    ]),
  ),
]

/** A time value: a number and a unit, either the one the tokens use or the other. */
const TIME = String.raw`\b\d*\.?\d+(?:ms|s)\b`

/**
 * A time value in a style position.
 *
 * The property is required, the value is required, and the optional quote is what
 * makes one pattern cover a stylesheet (`transition-duration: 400ms`), an inline
 * style object (`transitionDuration: '400ms'`) and a `style` attribute
 * (`style="animation-duration: 400ms"`). `transition` and `animation` are in the
 * table as the shorthands they are, so `animation: prism-travel 7200ms linear
 * infinite` is caught, which is the arrangement `DESIGN.md` forbids and the reason
 * the keyframes are in the stylesheet rather than in a Component.
 */
const STYLE_VALUE = new RegExp(
  `(?:${MOTION_PROPERTIES.join('|')})\\s*[:=]\\s*['"\`]?[^'";{}\\n]*?${TIME}`,
  'gi',
)

/**
 * A per-call-site reduced-motion guard on a motion utility.
 *
 * The utilities are a closed table for the reason `MOTION_PROPERTIES` is one: the
 * rule has to say which base a variant is guarding, and "any utility" would report
 * a `motion-safe:` on a layout reflow, which is a legitimate use of the variant and
 * has nothing to do with motion. What is left is `transition-*`, `duration-*` and
 * `ease-*`, which are the three the stylesheet's block decides for every element.
 *
 * The variant has to be IMMEDIATELY before the utility, because a compound of two
 * variants is two variants and only the last one applies to the utility: in
 * `hover:motion-safe:transition-transform` the guard is the one that reaches the
 * utility, and in `motion-safe:hover:transition-transform` it is too. Both are
 * reported, which is the point, because a reader has to be able to see that the
 * position is not what makes it work.
 */
const GUARDED_MOTION = /(?:^|[^\w-])(?:motion-safe|motion-reduce):(?:[\w[\]().:/%#,_-]+:)*(?:transition|duration|ease)-/g

const RULES = [
  {
    id: 'curve-literal',
    pattern: /cubic-bezier\s*\(/g,
    message:
      'a `cubic-bezier(` literal — name `ease-out` or `ease-in-out`, or read `var(--ease-out)`',
  },
  {
    id: 'arbitrary-motion',
    pattern: /(?:^|[^\w-])(?:duration|ease|animate)-\[/g,
    message:
      'an arbitrary duration, easing or animation utility — name `duration-fast|base|slow` and `ease-out|in-out`, or one of the six `prism-ambient-*` classes',
  },
  {
    id: 'value-in-style',
    pattern: STYLE_VALUE,
    message:
      'a time value in a style position — the duration and the easing are named tokens, so read `var(--duration-*)` or `var(--ease-*)`',
  },
  {
    id: 'guarded-motion',
    pattern: GUARDED_MOTION,
    message:
      'a per-call-site reduced-motion guard — `packages/ui/src/styles.css` ends with one unlayered `prefers-reduced-motion` rule that stops every transition and every animation, and a `motion-safe:` variant ADDS a rule rather than removing one, so this one is inert beside an unguarded utility and a second answer wherever else it stands',
  },
]


// ---------------------------------------------------- the policy in the sheet

/**
 * The stylesheet that states the reduced-motion policy, and the shape the policy
 * has to have.
 *
 * Two declarations on a selector that names no class, inside the one media
 * condition, outside every layer. The shape is the rule rather than the values:
 * `packages/ui/test/reduced-motion.test.tsx` holds the same four claims against the
 * EMITTED sheet with a cascade comparator, which is the stronger of the two because
 * it reads what the build wrote rather than what a Component meant, and this gate
 * is here because that test cannot run before a build and a gate that needs a build
 * is not a gate.
 *
 * The three ways this was wrong before, and each is what the shape forbids: a
 * selector list of the seven ambient classes, which left two unbounded animations
 * running; a single `animation` declaration, which left every transition running at
 * full duration; and a block written inside `@layer base`, which would lose to
 * `.duration-slow` at equal specificity and ship a policy that does nothing.
 */
const STYLESHEET = 'packages/ui/src/styles.css'
const REDUCE_CONDITION = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g

/**
 * Whether a selector names nothing but the universal selector and pseudo-elements.
 *
 * Stripping the pseudos and the stars and asking whether anything is left is the
 * same question a reader asks of `*, ::before, ::after`, and it is asked of a
 * selector list part by part because a list is a union: a block that named one
 * class alongside `*` would cover everything except that class, which is not what a
 * policy for every element means.
 */
const isUniversal = (selector) =>
  selector
    .split(',')
    .map((part) => part.replace(/::?[-\w]+(?:\([^)]*\))?|\*/g, '').trim())
    .every((part) => part === '')

/**
 * The authored names whose presence proves this run looked at motion at all.
 *
 * Counted across the same masked text the rules read, and reported every run. A gate
 * that found nothing in a tree carrying no motion has not been shown to work, and
 * printing the number makes that visible on the line rather than in a review.
 */
const AUTHORED_MOTION = /\b(?:duration-(?:fast|base|slow)|ease-(?:out|in-out))\b/g

// ------------------------------------------------------------------- running

const findings = []
let filesRead = 0
let skipped = 0
let authoredNames = 0
let guardedMotion = 0
let policyRead = false

const results = walkRoots(REPO_ROOT, ROOTS, { extensions: EXT })

try {
  assertRootsResolve(results, { scriptName: NAME })
  assertFilesRead(results, { extensions: EXT, scriptName: NAME })
} catch (failure) {
  console.error(`\n${failure.message}`)
  process.exit(1)
}

const lineAt = (source, index) => source.slice(0, index).split('\n').length

/**
 * The reduced-motion policy, checked over the stylesheet that states it.
 *
 * **Comments are blanked first, on the same terms as everywhere else in this
 * gate.** The block's own comment above it names `animation` and `transition` and
 * argues for both, so a reader of the raw text would find the two declarations the
 * policy requires in a place where no policy exists.
 *
 * **It reports what it found rather than only what is missing**, because a block
 * narrowed back to a named list is a block that still declares one of the two
 * properties and would pass a rule that only asked whether `animation` is there.
 */
function checkPolicy(source, readable) {
  const conditions = [...readable.matchAll(REDUCE_CONDITION)]
  if (conditions.length === 0) {
    findings.push({
      rule: 'reduced-motion-block',
      file: STYLESHEET,
      line: 0,
      text: '',
      message:
        'no `prefers-reduced-motion: reduce` block at all, so a reader who has asked the platform for less ' +
        'motion gets every transition and every animation this package ships. The policy lives in one ' +
        'unlayered rule at the foot of this file, and it is not optional',
    })
    return
  }
  if (conditions.length > 1) {
    findings.push({
      rule: 'reduced-motion-block',
      file: STYLESHEET,
      line: lineAt(source, conditions[1].index),
      text: '',
      message:
        `${conditions.length} reduced-motion blocks where the policy is one, and each of them is a partial ` +
        'answer to a question the reader asked once',
    })
  }
  const from = conditions[0].index + conditions[0][0].length
  /*
   * TWO braces, and the first one is not the interesting one. `from` is the index
   * just past the condition, so the next `{` opens the MEDIA block and the one after
   * it opens the rule inside it. Reading the selector as everything between them
   * without this would hand the check a single space, and a single space strips to
   * nothing, which is the universal selector: the one assertion in this gate that
   * can pass without having looked at anything. The rule below and the test that
   * proves this gate fires both exist because a check that cannot fail is not a
   * check.
   */
  const mediaOpen = source.indexOf('{', from)
  if (mediaOpen === -1) return
  const open = source.indexOf('{', mediaOpen + 1)
  if (open === -1) return
  let depth = 0
  let close = -1
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1
    else if (source[i] === '}') {
      depth -= 1
      if (depth === 0) {
        close = i
        break
      }
    }
  }
  if (close === -1) return
  const body = readable.slice(open, close)
  const selector = readable.slice(mediaOpen + 1, open)
  const line = lineAt(source, from)

  const universal = isUniversal(selector)
  if (!universal) {
    findings.push({
      rule: 'reduced-motion-block',
      file: STYLESHEET,
      line,
      text: selector.trim(),
      message:
        'the reduced-motion rule names a class or an element, so it covers the motion that has been written ' +
        'down and none that has not. `Spinner`\'s ring and `Timeline`\'s running mark were both outside the ' +
        'list this shape implies, for as long as it was a list',
    })
  }
  if (!/\banimation\s*:\s*none\b/.test(body)) {
    findings.push({
      rule: 'reduced-motion-block',
      file: STYLESHEET,
      line,
      text: selector.trim(),
      message:
        'the reduced-motion rule does not stop animations, so an unbounded loop keeps running for a reader ' +
        'who asked the platform not to animate anything',
    })
  }
  if (!/\btransition\s*:\s*none\b/.test(body)) {
    findings.push({
      rule: 'reduced-motion-block',
      file: STYLESHEET,
      line,
      text: selector.trim(),
      message:
        'the reduced-motion rule does not stop transitions, so every `transition-*` in the package runs at its ' +
        'full duration. A duration cannot be the answer here: one rule that shortened them could not tell a ' +
        'colour that changed from something that moved',
    })
  }
  if (enclosingAtRules(source, from).some((name) => name.startsWith('@layer'))) {
    findings.push({
      rule: 'reduced-motion-block',
      file: STYLESHEET,
      line,
      text: selector.trim(),
      message:
        'the reduced-motion rule sits inside `@layer`, where it is outranked by every utility in ' +
        '`@layer utilities` whatever its selector says. A rule at `*` inside a layer is (0,0,0) and ' +
        '`.duration-slow` is (0,1,0), so the policy would ship and do nothing. Unlayered is the rank it has',
    })
  }
}

/**
 * The at-rules a position in the stylesheet sits inside, outermost first.
 *
 * Braces only, and no string handling, which is a stated limit rather than an
 * oversight: the only quoted text in this stylesheet is a `url()` inside an
 * `@font-face` and a `content-[""]` inside a variant, and neither carries a brace.
 * A scanner that pretended to understand strings would be a scanner with a second
 * parser in it, and this one is asked one question about one file.
 */
function enclosingAtRules(source, target) {
  const stack = []
  let i = 0
  while (i < target) {
    const char = source[i]
    if (char === '{') {
      let start = i - 1
      while (start >= 0 && !'{};'.includes(source[start])) start -= 1
      stack.push(source.slice(start + 1, i).trim())
    } else if (char === '}') {
      stack.pop()
    }
    i += 1
  }
  return stack
}

for (const result of results) {
  for (const file of result.files) {
    if (file === GENERATED || file.startsWith(`${GENERATED}${path.sep}`)) {
      skipped += 1
      continue
    }
    const source = readFileSync(file, 'utf8')
    const lineComments = !file.endsWith('.css')
    const readable = mask(source, { lineComments })
    filesRead += 1
    authoredNames += (readable.match(AUTHORED_MOTION) ?? []).length
    guardedMotion += (readable.match(GUARDED_MOTION) ?? []).length

    const shown = relativePosix(REPO_ROOT, file)
    const lines = source.split('\n')
    for (const rule of RULES) {
      for (const match of readable.matchAll(rule.pattern)) {
        const line = lineAt(source, match.index)
        findings.push({
          rule: rule.id,
          file: shown,
          line,
          text: lines[line - 1]?.trim() ?? '',
          message: rule.message,
        })
      }
    }

    if (shown === STYLESHEET) {
      policyRead = true
      checkPolicy(source, readable)
    }
  }
}

if (authoredNames === 0) {
  findings.push({
    rule: 'coverage',
    file: '',
    line: 0,
    text: '',
    message:
      `no authored motion name was read in ${filesRead} file(s) across ${results.length} root(s), so this ` +
      'run has judged nothing. A tree that carries no `duration-fast` is a tree this rule cannot see, and ' +
      'reporting that as a clean run is the failure this replaces',
  })
}

const coverage = coverageOf(results)

for (const finding of findings) {
  const where = finding.file === '' ? '' : `  ${finding.file}:${finding.line}  `
  console.error(`${where}[${finding.rule}]  ${finding.message}`)
  if (finding.text) console.error(`      ${finding.text}`)
}

console.log(
  `\n${NAME}: ${findings.length} finding(s) in ${filesRead} file(s) read across ${coverage.roots} root(s) ` +
    `(${coverage.unresolved} unresolved), ${authoredNames} authored motion name(s) read, ` +
    `${guardedMotion} per-call-site motion guard(s) read`,
)
console.log(`${NAME}: repository read: ${REPO_ROOT}`)
console.log(
  `${NAME}: a millisecond is judged only beside one of these properties, and nowhere else: ` +
    `${MOTION_PROPERTIES.join(', ')}`,
)
console.log(
  `${NAME}: the reduced-motion policy is one unlayered rule in ${STYLESHEET}, ` +
    (policyRead
      ? 'read and checked on this run: one `@media (prefers-reduced-motion: reduce)` block, a selector that ' +
        'names no class, and both `animation: none` and `transition: none`'
      : 'NOT READ on this run, because that file is not in the population this tree was walked with'),
)
console.log(`${NAME}: not read, by scope rather than by exclusion: ${EXCLUSIONS.join('; ')}`)
console.log(
  `${NAME}: ${skipped} generated file(s) skipped as build output` +
    (skipped > 0 ? ` under ${relativePosix(REPO_ROOT, GENERATED)}` : ''),
)

if (findings.length > 0) {
  console.error(
    '\nMotion is priced by a named token or it is not priced. `DESIGN.md` states the scale: `duration-fast`\n' +
      '  80ms, `duration-base` 160ms, `duration-slow` 280ms, `ease-out` and `ease-in-out`, and the six\n' +
      '  `prism-ambient-*` classes for a cycle. A figure that shows a system running names an `ambient-*`\n' +
      '  token and one of those classes, which resolves the cycle for you. Reduced motion is decided in one\n' +
      '  rule at the foot of `packages/ui/src/styles.css` and not at a call site.',
  )
  process.exit(1)
}

console.log(
  `${NAME}: every duration and easing outside the token package names a token, and no Component re-decides ` +
    'reduced motion for itself.',
)
