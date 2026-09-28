/**
 * The hidden-state law: a CSS-authored hidden state can dismiss itself, and its
 * exit is not a clock.
 *
 * The defect this replaces is not a bug report; it is a page nobody can read. A
 * sheet carried
 *
 *     .site [data-reveal]        { opacity: 0; transform: translateY(12px); }
 *     .site [data-reveal].is-in  { opacity: 1; transform: none; }
 *
 * and `is-in` was added by an IntersectionObserver in a client effect. That is the
 * only exit. There is no timeout, so there is nothing to wait for and nothing to
 * give up on: a reader with scripting disabled, a reader whose browser has no
 * IntersectionObserver, a reader whose JavaScript failed to parse, and a crawler
 * that never executes any of it all received `opacity: 0` and nothing else. The
 * whole body of the page, below the header, was invisible.
 *
 * Exactly two shapes are allowed. An escapable condition, which is a media query
 * or a `:not()` that the reader's own capability satisfies. Or a script-armed
 * ancestor attribute, where the arming is written by exactly one script and by
 * nothing else, so a reader whose scripting is off never receives it and the
 * hidden state does not exist for them. A reader whose scripting fails midway
 * might, and the `(scripting: none)` block is the guard for that case: it is a
 * statement about capability rather than about health, and it does not care why
 * the script did not finish. The two are complementary and neither is a timeout.
 *
 * **The clock is banned rather than shortened.** A fallback animation's clock
 * starts at first style resolution rather than at scroll, so by the time the
 * class lands there is nothing left to cancel, and a reader on a slow connection
 * looks at a blank page for three seconds of a timer measuring the wrong
 * interval. Cancellability was never the load-bearing property; having an exit
 * that does not depend on a clock was.
 *
 * **A gate that only read the stylesheet would pass a site that renders nothing.**
 * That is why a consumer that ships a hidden state also has a test that renders
 * with scripting off, and this gate's job is to make the stylesheet half true
 * enough for that test to be the only half left. A consumer with no hidden state
 * runs this gate too and passes vacuously, and the run prints the rule count it
 * read so the reader can tell the difference between a vacuous pass and a scan of
 * nothing.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { law } from './laws.mjs'
import { CoverageError, blankComments, cssBlocks, finding, floor, read } from './run.mjs'

/** A declaration that makes an element not painted. */
const HIDES = /^\s*(?:opacity\s*:\s*(?:0|0%)\b|visibility\s*:\s*hidden\b|display\s*:\s*none\b)/

/** A clock. Any of the three is a mechanism with its own failure mode. */
const CLOCK = /(?:^|[;\s])animation(?:-[a-z-]+)?\s*:|@keyframes/

export function run({ root, config }) {
  const l = law('hidden-state')
  const findings = []
  const notes = []
  const sheets = config.sheets ?? ['app/globals.css']
  const minRules = config.minRules ?? 25
  const marker = config.marker ?? 'data-reveal'
  const armed = config.armed ?? 'data-reveal-armed'
  const sourceRoots = config.sourceRoots ?? ['app', 'components', 'lib']

  const missing = sheets.filter((sheet) => read(root, sheet) === null)
  if (missing.length > 0) {
    throw new CoverageError(
      `${missing.length} of ${sheets.length} configured stylesheets do not resolve: ${missing.join(', ')}.\n` +
        '  A gate that read nothing reports a clean sheet, so an unresolved root fails the run.',
    )
  }

  const markerSelector = new RegExp(`\\[${marker}\\b`)
  const armedSelector = new RegExp(`\\[${armed}\\]`)

  let rules = 0
  let declarations = 0
  let hiding = 0

  for (const sheet of sheets) {
    for (const block of cssBlocks(read(root, sheet))) {
      rules += 1
      for (const declaration of block.body.split(';')) {
        if (/^[a-z-]+\s*:/.test(declaration.trim())) declarations += 1
      }
      const selectors = block.selectors.join(', ')

      if (CLOCK.test(block.body)) {
        findings.push(
          finding(
            `${sheet}:${block.line}`,
            'clock',
            `${selectors} carries an animation clock. A fallback animation's clock starts at first style\n` +
              '      resolution rather than at scroll, so by the time the class lands there is nothing left to\n' +
              '      cancel, and a slow connection sees a blank page for a timer that measures the wrong interval.',
          ),
        )
      }

      if (!block.body.split(';').some((declaration) => HIDES.test(declaration))) continue
      if (!markerSelector.test(selectors)) {
        // A rule that hides nothing through the marked selector is not the law's
        // subject. It is still a rule this gate read, and it is still counted.
        continue
      }
      hiding += 1

      if (!armedSelector.test(selectors)) {
        findings.push(
          finding(
            `${sheet}:${block.line}`,
            'unarmed',
            `${selectors} hides content with no armed ancestor. A reader whose scripting is switched off never\n` +
              `      receives \`${armed}\`, so this declaration is the last thing they are shown.`,
          ),
        )
      }
      if (!/\(scripting\s*:\s*none\)/.test(read(root, sheet))) {
        findings.push(
          finding(
            sheet,
            'no-scripting-guard',
            `the sheet hides content and declares no \`(scripting: none)\` guard. A reader whose scripting\n` +
              '      started and stopped would receive the arming attribute and nothing that withdraws it.',
          ),
        )
      }
    }
  }

  floor('rule(s) read', rules, minRules)

  /*
   * A second writer of the arming attribute is a second owner of a state whose exit
   * depends on every path withdrawing it, so the writer is counted.
   *
   * Counted by the WRITE, not by the name. A module that explains the mechanism in a
   * comment names the attribute and writes nothing, and a gate that counted names
   * would read its own subject's documentation as a second writer. The write is
   * matched on a code line with the comments blanked, so a comment that shows the
   * call as an example is a record and a call is a call.
   *
   * The withdrawal is counted separately and separately required: an arming with no
   * withdrawal anywhere is a hidden state whose only exit is the scripting-media
   * query, which does not see the reader whose scripting started and stopped.
   */
  const sources = sourceFiles(root, sourceRoots)
  const writer = new RegExp(`setAttribute\\(\\s*['"\`]${armed}['"\`]`)
  const withdrawer = new RegExp(`removeAttribute\\(\\s*['"\`]${armed}['"\`]`)
  const writers = sources.filter((file) =>
    writer.test(blankComments(readFileSync(file, 'utf8'))),
  )
  const withdrawers = sources.filter((file) =>
    withdrawer.test(blankComments(readFileSync(file, 'utf8'))),
  )
  const clientModules = sources.filter((file) =>
    /^\s*['"]use client['"]/m.test(readFileSync(file, 'utf8')),
  )
  const relative = (file) => path.relative(root, file).split(path.sep).join('/')
  if (writers.length === 0 && hiding > 0) {
    findings.push(
      finding(
        sheets.join(', '),
        'unwritten',
        `a rule hides content through \`[${marker}]\` and no module writes \`${armed}\`. The attribute is the\n` +
          '      whole of the exit for a reader whose scripting works, so a sheet that hides with nothing to\n' +
          '      arm it hides for everyone.',
      ),
    )
  }
  if (writers.length > 1) {
    findings.push(
      finding(
        writers.slice(1).map(relative).join(', '),
        'second-writer',
        `more than one module writes \`${armed}\`, at ${writers.map(relative).join(' and ')}. The attribute has one\n` +
          '      writer, and a second writer is a second owner of a state whose exit depends on every path\n' +
          '      withdrawing it.',
      ),
    )
  }
  if (withdrawers.length === 0 && writers.length > 0) {
    findings.push(
      finding(
        writers.map(relative).join(', '),
        'no-withdrawal',
        `\`${armed}\` is written and never removed, so a reader whose scripting started and then\n` +
          '      stopped has the attribute and no path that takes it away. The (scripting: none) guard\n' +
          "      cannot see them, because their scripting is enabled.",
      ),
    )
  }

  notes.push(
    `${l.id}: ${findings.length} finding(s) across ${sheets.length} sheet(s), ${rules} rule(s) and ${declarations} declaration(s) read; floor ${minRules} rule(s)`,
  )
  notes.push(`${l.id}: sheets read: ${sheets.join(', ')}`)
  notes.push(
    `${l.id}: ${hiding} rule(s) hide content through \`[${marker}]\`; the escape shapes are an escapable condition\n` +
      `      or an armed ancestor \`[${armed}]\` written by exactly one script.`,
  )
  notes.push(
    `${l.id}: ${sources.length} source file(s) read; ${writers.length} write the arming attribute` +
      `${writers.length === 0 ? '' : ` (${writers.map(relative).join(', ')})`} and ${withdrawers.length} withdraw it` +
      `${withdrawers.length === 0 ? '' : ` (${withdrawers.map(relative).join(', ')})`}. Counted by the call, not by the name, so a comment explaining the mechanism is not a writer.`,
  )
  if (hiding === 0) {
    notes.push(
      `${l.id}: this run passed vacuously. No rule in ${sheets.join(', ')} hides content through the marker, so this\n` +
        '      repository has nothing to exit and no runtime to exit it with. That is a real answer rather than a\n' +
        '      scan of nothing: the rule count above says how much was read, and a repository that acquired a\n' +
        '      hidden state would produce a finding here rather than a pass.',
    )
  }
  notes.push(`${l.id}: ${clientModules.length} module(s) carry a client directive.`)
  notes.push(
    `${l.id}: a stylesheet half is not enough. A consumer that ships a hidden state needs a test that renders\n` +
      '      with scripting switched off and asserts the content is present and the arming attribute is absent.',
  )

  return { law: l, findings, notes }
}

/** Every source file the declared roots hold, so a second writer is findable. */
function sourceFiles(root, roots) {
  const found = []
  const skip = new Set(['node_modules', '.next', 'out', '.git', '.wrangler', '.source'])
  const visit = (dir) => {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (skip.has(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory() || statSync(full).isDirectory()) visit(full)
      else if (/\.(tsx?|mjs)$/.test(entry.name)) found.push(full)
    }
  }
  for (const declared of roots) visit(path.join(root, declared))
  return found
}
