/**
 * Two laws about one sheet: what it may not own, and what it may not read.
 *
 * **Ownership.** Prism's base rules sit in `@layer base` and a consumer's sheet
 * is unlayered, so an unlayered declaration outranks a layered one at any
 * specificity regardless of import order, and a consumer that imported its sheet
 * first would have exactly the same outcome. The layer is not the cause of these
 * failures; it is the reason they were invisible, because nobody can tell from a
 * screenshot that the site won.
 *
 * A site declaration **competes** when it can match the same element, for a
 * property the design system's base declares, with shorthands expanded. Two looser
 * definitions were tried and rejected: "any declaration of a property the base
 * declares anywhere" is 1,478 rows across this family and says that every
 * declaration in CSS touches something a reset already sets; "any declaration of a
 * property the base declares" is 98 rows of which 55 match no element on the
 * current line. The list below is the narrow one, and it needs no cascade to
 * decide: an unlayered bare-element declaration for a property the base declares
 * **is** the defect, whatever the cascade then does with it.
 *
 * A focus rule is a finding whatever it declares. The design system draws its
 * ring on the component as a `box-shadow`, so a site `outline` does not compete
 * with it; it draws a second band over the real one, and on anything that is not
 * a Prism Component it is the only thing standing between a keyboard reader and
 * no indicator at all.
 *
 * **The token read.** A custom property that resolves to nothing does not paint a
 * wrong colour. The declaration it appears in is invalid at computed-value time,
 * so a shorthand erases itself and a longhand reverts to its initial value: a page
 * ground reverts to transparent, an inherited ink reverts to the browser default,
 * and a hairline reverts to `border-style: none`, which is a box with no edge
 * rather than a box with a wrong-coloured one. Ninety-eight of the 219 dead reads
 * in the four repositories were shorthands. The reference is the design system's
 * emitted stylesheet, read through its own export map, so a renamed token is a
 * finding rather than a silent erasure.
 *
 * **The runtime form is the same law.** A read in JavaScript with a hard-coded
 * fallback is a read that cannot fail, which is why the original clause was
 * written about canvas: the pack is a runtime attribute on an ancestor, a canvas
 * reads a computed style from one element, and a scoped boundary hands it the
 * pack's light values on a dark page. The shipped form of that law is the gate
 * that forbids the client read, and a repository that has no client code has
 * nothing left to check.
 *
 * Coverage: the declared sheets must resolve and must hold at least as many
 * declarations as the site declares as its floor. A floor on *findings* would fail
 * a correct sheet, and a floor on nothing would pass an unread one, so the floor
 * is on declarations read.
 */
import { law } from './laws.mjs'
import {
  CoverageError,
  blankComments,
  cssBlocks,
  declaredProperties,
  designSystem,
  finding,
  floor,
  read,
} from './run.mjs'

/** The properties the design system's own base layer declares, so a bare-element rule competes. */
const COMPETING_PROPERTIES = [
  'background',
  'background-color',
  'color',
  'font-family',
  'outline',
  'outline-style',
  'border-color',
]

/** Any focus selector. The design system owns the indicator; a consumer drawing one is a second one. */
const FOCUS_SELECTOR = /:focus(-visible)?\b/

/** A `color-mix()` that takes a custom property as an operand erases itself rather than repainting. */
const DEAD_OPERAND = /color-mix\([^)]*var\(/g

export function run({ root, config }) {
  const l = law('stylesheet-ownership')
  const readLaw = law('token-read')
  const findings = []
  const notes = []
  const sheets = config.sheets ?? ['app/globals.css']
  const supplied = config.supplied ?? {}
  const minDeclarations = config.minDeclarations ?? 20

  const missing = sheets.filter((sheet) => read(root, sheet) === null)
  if (missing.length > 0) {
    throw new CoverageError(
      `${missing.length} of ${sheets.length} configured stylesheets do not resolve: ${missing.join(', ')}.\n` +
        '  A gate that read nothing reports a clean sheet, so an unresolved root fails the run.',
    )
  }

  const system = designSystem(root)
  const emitted = system.styles()
  const emittedProperties = declaredProperties(emitted)

  let rules = 0
  let declarations = 0
  let competing = 0
  let deadReads = 0

  for (const sheet of sheets) {
    const source = blankComments(read(root, sheet))
    for (const block of cssBlocks(source)) {
      rules += 1
      for (const declaration of block.body.split(';')) {
        if (/^[a-z-]+\s*:/.test(declaration.trim())) declarations += 1
      }
      for (const selector of block.selectors) {
        if (FOCUS_SELECTOR.test(selector)) {
          competing += 1
          findings.push(
            finding(
              `${sheet}:${block.line}`,
              'focus-indicator',
              `${selector} draws a focus indicator in this repository's own sheet. The design system draws its\n` +
                '      ring on the component, and a plain anchor keeps the browser\'s own. A site rule is a second\n' +
                "      band over the first or the suppression of the second, and a shorthand whose colour token\n" +
                '      stops resolving suppresses it rather than failing to draw one.',
            ),
          )
          continue
        }
        // A bare-element selector: `body`, `a`, `*`, `html`. A class in the selector makes
        // the rule this repository's own surface, which is a different question.
        const hasClass = selector.includes('.') || selector.includes('[') || selector.includes(':')
        if (hasClass) continue
        for (const property of COMPETING_PROPERTIES) {
          if (!new RegExp(`(?:^|[;{\\s])${property}\\s*:`, 'm').test(block.body)) continue
          competing += 1
          findings.push(
            finding(
              `${sheet}:${block.line}`,
              'competes-with-base',
              `${selector} declares ${property}, which the design system's own base layer declares. The base is\n` +
                "      layered and this sheet is not, so this rule wins the cascade at any specificity and silently\n" +
                "      replaces the design system's.",
            ),
          )
        }
      }
      const dead = [...block.body.matchAll(DEAD_OPERAND)]
      competing += dead.length
      if (dead.length > 0) {
        findings.push(
          finding(
            `${sheet}:${block.line}`,
            'dead-operand',
            'color-mix() takes a var() as an operand. A custom property that resolves to nothing does not paint a\n' +
              '      wrong colour: a shorthand with one dead operand erases the whole declaration, so the rule stops\n' +
              '      existing.',
          ),
        )
      }
    }
  }

  floor('declarations read', declarations, minDeclarations)

  for (const sheet of sheets) {
    const source = blankComments(read(root, sheet))
    const own = declaredProperties(source)
    for (const match of source.matchAll(/var\((--[a-z0-9-]+)/g)) {
      const property = match[1]
      if (own.has(property) || emittedProperties.has(property) || property in supplied) continue
      deadReads += 1
      const line = source.slice(0, match.index).split('\n').length
      findings.push(
        finding(
          `${sheet}:${line}`,
          'dead-read',
          `var(${property}) names a custom property nothing declares. The declaration is invalid at\n` +
            '      computed-value time, so a shorthand erases itself and a longhand reverts to its initial value.\n' +
            '      This is not a wrong colour; it is no declaration at all.',
        ),
      )
    }
  }

  notes.push(
    `${l.id}: ${sheets.length} sheet(s), ${rules} rule(s) and ${declarations} declaration(s) read, floor ${minDeclarations}`,
  )
  notes.push(`${l.id}: sheets read: ${sheets.join(', ')}`)
  notes.push(
    `${l.id}: ${competing} competing declaration(s); properties the design system's base declares: ${COMPETING_PROPERTIES.join(', ')}`,
  )
  notes.push(
    `${readLaw.id}: ${deadReads} dead read(s). Every var() in this repository's own sheet names a property the\n` +
      `      emitted stylesheet declares (${emittedProperties.size} properties), the sheet itself declares, or one of\n` +
      `      ${Object.keys(supplied).length} the build supplies.`,
  )
  for (const [property, why] of Object.entries(supplied)) notes.push(`${readLaw.id}:   supplied: ${property} is ${why}`)
  notes.push(
    `${l.id}: the reference is ${'`@nanisoft/prism-ui/styles.css`'}, resolved through the installed package's own export map,\n` +
      '      so a renamed subpath is an error here rather than a run that reports every property as undeclared.',
  )
  notes.push(
    `${l.id}: the honest limit, printed on every run: this is a text scan over selectors and declarations, not a\n` +
      '      cascade resolution. It cannot see a class-scoped rule that competes, an inline style prop, a sheet it\n' +
      "      was not pointed at, or a change to the design system's base layer.",
  )

  return { law: l, findings, notes, also: [readLaw] }
}
