/**
 * The gate kit, run as processes, against fixtures built to make it red.
 *
 * The programme's recurring failure was a check that could not fail, or that
 * could pass having examined nothing. So every gate here is driven twice: once
 * against a fixture that violates its law, and once against a fixture that
 * satisfies it. The first run asserts the exit code, the tag on the finding, and
 * the law's own words in the output; the second asserts the exit code and that the
 * coverage line reports what it read. A gate that has never been red is not
 * evidence of anything, and a gate that is always red is a gate nobody runs.
 *
 * The tests spawn the real CLI rather than importing the gates, for the reason
 * `scripts/__tests__/gates.test.mjs` gives for the repository's own gates: a test
 * that imports a helper proves the helper, not the program a consumer runs. The
 * CLI is what a consumer's `package.json` names.
 *
 * Run: node --test "packages/ui/gates/__tests__/*.test.mjs"
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

const KIT = path.resolve(import.meta.dirname, '..')
const CLI = path.join(KIT, 'cli.mjs')
const REPO = path.resolve(KIT, '..', '..', '..')

/**
 * The design system these fixtures are measured against: this repository's own
 * packages, and nothing outside it.
 *
 * It used to be a sibling checkout at `../landing-page`, reached through that
 * consumer's `node_modules`. That had two faults and one of them was invisible.
 *
 * **It failed in CI, every run, for as long as it was there.** The sibling does
 * not exist on a runner, so the junction dangled, `require('@nanisoft/prism-ui/
 * package.json')` could not resolve, and eight tests in this file went red. The
 * suite was green locally and red in CI, which is the shape of a check that only
 * works on the machine that wrote it, and it is the third time this programme has
 * found one. The local green was not luck either: it was the sibling's presence.
 *
 * **And where it did resolve, it resolved the wrong version.** The sibling had
 * `@nanisoft/prism-ui` 0.8.0 installed from npm while this repository was
 * building 0.9.0, so every fixture asserting against "the real emitted
 * stylesheet" was reading 0.8.0's and calling it real. A fixture that wants the
 * design system under test must be handed the design system under test, and the
 * only one of those is the tree this test runs from.
 *
 * There is a third reason the workspace is the right answer, which is that
 * `packages/ui` is itself `@nanisoft/prism-ui`, so a symlink to it satisfies the
 * package-name lookup the gate performs without any workspace declaration at all.
 * pnpm's isolated layout does not link workspace packages into a root
 * `node_modules`, so there is no shorter path that works.
 */
const SYSTEM = {
  'prism-ui': path.join(REPO, 'packages', 'ui'),
  'prism-tokens': path.join(REPO, 'packages', 'tokens'),
}

/**
 * A consumer tree with a manifest that pins the design system exactly, and no
 * token package of its own. The kit resolves the token package through the
 * component package, so a fixture that declared one would be asserting the thing
 * the pin gate forbids.
 */
function consumer({ manifest = {}, files = {}, workspace = "minimumReleaseAgeExclude:\n  - '@nanisoft/prism-ui@0.8.0'\n" } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'prism-consumer-'))
  writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(
      {
        name: 'fixture',
        private: true,
        dependencies: { '@nanisoft/prism-ui': '0.8.0' },
        ...manifest,
      },
      null,
      2,
    ),
  )
  writeFileSync(path.join(root, 'pnpm-workspace.yaml'), workspace)
  writeFileSync(path.join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n\nimporters:\n\n  .:\n    dependencies:\n      x:\n        specifier: 1.0.0\n        version: 1.0.0\n\nsnapshots:\n')
  for (const [name, body] of Object.entries(files)) {
    const full = path.join(root, name)
    mkdirSync(path.dirname(full), { recursive: true })
    writeFileSync(full, body)
  }
  return root
}

function run(root, config, args = []) {
  writeFileSync(path.join(root, 'prism-gates.json'), JSON.stringify(config, null, 2))
  return spawnSync(process.execPath, [CLI, ...args], { cwd: root, encoding: 'utf8' })
}

/** The design system a fixture resolves against, so a fixture can be honest about it. */
function pinToRealSystem(root) {
  // A temporary tree cannot resolve `@nanisoft/prism-ui`, so a fixture that needs
  // the real emitted stylesheet is given junctions to this repository's packages.
  // That is the only way a fixture can hold a real token contract rather than a
  // mock of one: a fixture with a hand-written stylesheet would assert that the
  // gate agrees with the fixture.
  //
  // The junction target is the workspace package rather than an installed copy,
  // so the stylesheet the fixture reads is the one this build produced. Reading an
  // installed copy instead means the suite tests whatever npm last served, which
  // is a different question from the one the gate answers, and it is a question
  // whose answer changes on a schedule nobody reading the suite is told about.
  const modules = path.join(root, 'node_modules', '@nanisoft')
  mkdirSync(modules, { recursive: true })
  for (const [name, target] of Object.entries(SYSTEM)) {
    const link = path.join(modules, name)
    if (existsSync(link)) continue
    symlinkSync(target, link, 'junction')
  }
  return root
}

const sheet = (body) => `/* fixture */\n${body}`

/* ------------------------------------------------------------------ the pin */

test('the pin gate fails on a range, because exactness is necessary and not sufficient', () => {
  const root = pinToRealSystem(
    consumer({
      manifest: { dependencies: { '@nanisoft/prism-ui': '^0.8.0' } },
    }),
  )
  const result = run(root, { gates: ['pin'] })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /\[range-pin\]/)
  assert.match(result.stderr, /a range lets this repository move onto a/)
})

test('the pin gate fails on a second declaration of the token version, in the manifest or the workspace', () => {
  const inManifest = pinToRealSystem(
    consumer({
      manifest: { dependencies: { '@nanisoft/prism-tokens': '0.6.0' } },
    }),
  )
  const first = run(inManifest, { gates: ['pin'] })
  assert.equal(first.status, 1)
  assert.match(first.stderr, /\[second-declaration\]/)
  assert.match(first.stderr, /Two repositories holding one number is two facts to keep in step/)

  const inWorkspace = pinToRealSystem(
    consumer({
      workspace:
        "minimumReleaseAgeExclude:\n  - '@nanisoft/prism-ui@0.8.0'\n  - '@nanisoft/prism-tokens@0.6.0'\n",
    }),
  )
  const second = run(inWorkspace, { gates: ['pin'] })
  assert.equal(second.status, 1)
  assert.match(second.stderr, /pnpm-workspace\.yaml:\d+\s+\[second-declaration\]/)
})

test('the pin gate passes on a consumer that pins the one package and declares no second copy', () => {
  const root = pinToRealSystem(consumer())
  const result = run(root, { gates: ['pin'] })

  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.match(result.stdout, /pinned exactly, and @nanisoft\/prism-tokens is declared by @nanisoft\/prism-ui@/)
})

test('the pin gate fails rather than passing when the design system does not resolve', () => {
  const root = consumer()
  const result = run(root, { gates: ['pin'] })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /the pinned design system does not resolve/)
})

/* ------------------------------------------------------------- the old line */

test('the retired-line gate fails on an import, and reads the lockfile as a graph', () => {
  const root = consumer({
    files: { 'app/page.tsx': "import { Button } from 'antd'\n" },
  })
  const result = run(root, { gates: ['retired-line'], 'retired-line': { minFiles: 1 } })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /\[module-imported\]/)
  assert.match(result.stdout, /read as a dependency graph and never text-scanned/)
})

test('the retired-line gate fails when the library is still reachable from the lockfile', () => {
  const root = consumer({
    files: {
      'pnpm-lock.yaml':
        'lockfileVersion: 9.0\n\nimporters:\n\n  .:\n    dependencies:\n      antd:\n        specifier: 5.0.0\n        version: 5.0.0\n\nsnapshots:\n\n  antd@5.0.0: {}\n',
      'README.md': '# fixture\n',
      'app/page.tsx': 'export const page = 1\n',
    },
  })
  const result = run(root, { gates: ['retired-line'], 'retired-line': { minFiles: 1 } })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /\[reachable-package\]/)
})

test('the retired-line gate fails when it read fewer files than its floor', () => {
  const root = consumer({ files: { 'app/page.tsx': 'export const page = 1\n' } })
  const result = run(root, { gates: ['retired-line'], 'retired-line': { minFiles: 400 } })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /this run read \d+ and this gate needs at least 400/)
  assert.match(result.stderr, /indistinguishable from a clean repository/)
})

/* --------------------------------------------------------------- ownership */

test('the ownership gate fails on a bare-element declaration the design system owns', () => {
  const root = pinToRealSystem(
    consumer({
      files: {
        'app/globals.css': sheet(
          ['.site { color: var(--foreground); }', 'body { background: var(--background); }'].join('\n'),
        ),
      },
    }),
  )
  const result = run(root, { gates: ['stylesheet-ownership'], 'stylesheet-ownership': { sheets: ['app/globals.css'], minDeclarations: 1 } })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /\[competes-with-base\]/)
  assert.match(result.stderr, /wins the cascade at any specificity/)
})

test('the ownership gate fails on a focus rule, and says the ring belongs to the component', () => {
  const root = pinToRealSystem(
    consumer({
      files: {
        'app/globals.css': sheet(
          [
            '.site { color: var(--foreground); }',
            '.site { background: var(--background); padding: 1rem; gap: 1rem; }',
            '.site a:focus-visible { outline: 2px solid var(--primary); }',
          ].join('\n'),
        ),
      },
    }),
  )
  const result = run(root, { gates: ['stylesheet-ownership'], 'stylesheet-ownership': { sheets: ['app/globals.css'], minDeclarations: 1 } })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /\[focus-indicator\]/)
  assert.match(result.stderr, /the browser's own/)
})

/* -------------------------------------------------------------- token read */

test('the token-read law is a gate: a var() nothing declares is a finding, not a wrong colour', () => {
  const root = pinToRealSystem(
    consumer({
      files: {
        'app/globals.css': sheet(
          [
            '.site { color: var(--foreground); background: var(--background); padding: 1rem; }',
            '.site :where(a, b) { border-color: var(--color-prism-color-border-layout); }',
          ].join('\n'),
        ),
      },
    }),
  )
  const result = run(root, { gates: ['stylesheet-ownership'], 'stylesheet-ownership': { sheets: ['app/globals.css'], minDeclarations: 1 } })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /\[dead-read\]/)
  assert.match(result.stderr, /it is no declaration at all/)
  assert.match(result.stdout, /token-read: 1 dead read\(s\)/)
})

test('the token-read gate prints every supplied property and its reason on every run', () => {
  const root = pinToRealSystem(
    consumer({
      files: {
        'app/globals.css': sheet(
          [
            '.site { color: var(--foreground); background: var(--background); padding: 1rem; }',
            '.site .card { font-family: var(--font-inter), var(--font-sans); gap: 1rem; }',
          ].join('\n'),
        ),
      },
    }),
  )
  const result = run(root, {
    gates: ['stylesheet-ownership'],
    'stylesheet-ownership': {
      sheets: ['app/globals.css'],
      minDeclarations: 1,
      supplied: { '--font-inter': 'declared by next/font at build time' },
    },
  })

  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.match(result.stdout, /supplied: --font-inter is declared by next\/font at build time/)
})

/* ------------------------------------------------------------ hidden state */

test('the runtime token read law is a gate, and it names the replacement rather than only the fault', () => {
  const root = consumer({
    files: {
      'app/page.tsx': "import { readToken } from './read'\n",
      'app/read.ts':
        "const canvas = document.createElement('canvas')\n" +
        "const ink = getComputedStyle(document.documentElement).getPropertyValue('--foreground')\n" +
        'export const paint = () => canvas.getContext(\'2d\').fillStyle = ink\n',
      'app/layout.tsx': 'export const Layout = () => null\n',
      'lib/site.ts': 'export const ground = "sky"\n',
      'components/mark.tsx': 'export const Mark = () => null\n',
    },
  })
  const result = run(root, { gates: ['runtime-token-read'], 'runtime-token-read': { minFiles: 1 } })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /\[runtime-token-read\]/)
  assert.match(result.stderr, /A canvas reads it once and paints/)
  assert.match(result.stderr, /a read that cannot fail hides its own failure/)
  // A repository with a client boundary is not a failure; only the read is.
  assert.doesNotMatch(result.stderr, /client boundary/)
})

test('the runtime token read gate passes on a repository with no read, and counts its client modules', () => {
  const root = consumer({
    files: {
      'app/page.tsx': "export const Page = () => <main>readable</main>\n",
      'app/layout.tsx': "import { Mark } from '../components/mark'\nexport const Layout = () => <Mark />\n",
      'lib/site.ts': 'export const ground = "sky"\n',
      'components/mark.tsx': "'use client'\nexport const Mark = () => <span />\n",
    },
  })
  const result = run(root, { gates: ['runtime-token-read'], 'runtime-token-read': { minFiles: 1 } })

  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.match(result.stdout, /1 module\(s\) carry a client directive/)
  assert.match(result.stdout, /Whether this repository has a client boundary at\s+all is its own business/)
})

test('the runtime token read gate fails when its roots do not resolve, rather than passing over nothing', () => {
  const root = consumer({ files: { 'app/page.tsx': 'export const Page = () => null\n' } })
  const result = run(root, { gates: ['runtime-token-read'], 'runtime-token-read': { sourceRoots: ['app', 'nowhere'] } })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /declared source roots do not resolve/)
})

test('the hidden-state gate fails on an arming attribute with no writer and with no withdrawal', () => {
  const rules = Array.from({ length: 30 }, (_, i) => `.site .r${i} { color: var(--foreground); }`).join('\n')
  const sheetWith = (extra) =>
    consumer({
      files: {
        'app/globals.css': sheet(
          `${rules}\n.site [data-reveal] { opacity: 0; }\n.site [data-reveal].is-in { opacity: 1; }\n@media (scripting: none) { .site [data-reveal] { opacity: 1; } }\n${extra}`,
        ),
        'components/reveal.tsx': "'use client'\nexport const Reveal = () => null\n",
      },
    })

  const unwritten = sheetWith('')
  const first = run(unwritten, { gates: ['hidden-state'], 'hidden-state': { sheets: ['app/globals.css'], minRules: 5 } })
  assert.equal(first.status, 1)
  assert.match(first.stderr, /\[unwritten\]/)
  assert.match(first.stderr, /no module writes `data-reveal-armed`/)
  assert.match(first.stderr, /hides with nothing to\s+arm it hides for everyone/)

  // A module that only *names* the attribute in a comment is not a writer, and
  // counting names would read a gate's own subject's documentation as a defect.
  const namedOnly = sheetWith('')
  writeFileSync(
    path.join(namedOnly, 'components/reveal.tsx'),
    "'use client'\n" +
      '// this module explains the mechanism, so it names the attribute without writing it\n' +
      'export const Reveal = () => null\n',
  )
  const second = run(namedOnly, { gates: ['hidden-state'], 'hidden-state': { sheets: ['app/globals.css'], minRules: 5 } })
  assert.doesNotMatch(second.stderr, /\[second-writer\]/)
  assert.match(second.stdout, /Counted by the call, not by the name/)

  // Written and never withdrawn is the reader whose scripting started and stopped.
  const noWithdrawal = sheetWith('')
  writeFileSync(
    path.join(noWithdrawal, 'components/reveal.tsx'),
    "'use client'\ndocument.documentElement.setAttribute('data-reveal-armed', '')\nexport const Reveal = () => null\n",
  )
  const third = run(noWithdrawal, { gates: ['hidden-state'], 'hidden-state': { sheets: ['app/globals.css'], minRules: 5 } })
  assert.equal(third.status, 1)
  assert.match(third.stderr, /\[no-withdrawal\]/)
})

test('the hidden-state gate fails on a second writer, naming both writers', () => {
  const rules = Array.from({ length: 30 }, (_, i) => `.site .r${i} { color: var(--foreground); }`).join('\n')
  const root = consumer({
    files: {
      'app/globals.css': sheet(
        `${rules}\n.site [data-reveal] { opacity: 0; }\n@media (scripting: none) { .site [data-reveal] { opacity: 1; } }\n`,
      ),
      'components/reveal.tsx':
        "'use client'\ndocument.documentElement.setAttribute('data-reveal-armed', '')\nexport const Reveal = () => null\n",
      'lib/arm.ts':
        "export const arm = () => document.documentElement.setAttribute('data-reveal-armed', '')\n" +
        "export const disarm = () => document.documentElement.removeAttribute('data-reveal-armed')\n",
    },
  })
  const result = run(root, { gates: ['hidden-state'], 'hidden-state': { sheets: ['app/globals.css'], minRules: 5 } })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /\[second-writer\]/)
  assert.match(result.stderr, /components\/reveal\.tsx and lib\/arm\.ts/)
})

test('the hidden-state gate fails on an unarmed hidden state and on a clock', () => {
  const rules = Array.from({ length: 30 }, (_, i) => `.site .r${i} { color: var(--foreground); }`).join('\n')
  const unarmed = consumer({
    files: { 'app/globals.css': sheet(`${rules}\n.site [data-reveal] { opacity: 0; transform: translateY(12px); }\n`) },
  })
  const first = run(unarmed, { gates: ['hidden-state'], 'hidden-state': { sheets: ['app/globals.css'], minRules: 5 } })
  assert.equal(first.status, 1)
  assert.match(first.stderr, /\[unarmed\]/)
  assert.match(first.stderr, /\[no-scripting-guard\]/)

  const clocked = consumer({
    files: {
      'app/globals.css': sheet(
        `${rules}\n.site [data-reveal] { opacity: 0; }\n.site [data-reveal].is-in { opacity: 1; }\n@media (scripting: none) { .site [data-reveal] { opacity: 1; } }\n.site [data-reveal] { animation: rise 1ms linear 3s forwards; }\n`,
      ),
    },
  })
  const second = run(clocked, { gates: ['hidden-state'], 'hidden-state': { sheets: ['app/globals.css'], minRules: 5 } })
  assert.equal(second.status, 1)
  assert.match(second.stderr, /\[clock\]/)
  assert.match(second.stderr, /the wrong interval/)
})

test('the hidden-state gate passes vacuously on a sheet with no hidden state, and says it read nothing to exit', () => {
  const rules = Array.from({ length: 30 }, (_, i) => `.site .r${i} { color: var(--foreground); }`).join('\n')
  const root = consumer({ files: { 'app/globals.css': sheet(rules) } })
  const result = run(root, { gates: ['hidden-state'], 'hidden-state': { sheets: ['app/globals.css'], minRules: 5 } })

  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.match(result.stdout, /0 rule\(s\) hide content/)
  assert.match(result.stdout, /this run passed vacuously/)
  assert.match(result.stdout, /nothing to exit and no runtime to exit it with/)
  assert.match(result.stdout, /30 rule\(s\).*read/)
})

/* ------------------------------------------------------------------- links */

test('the links gate fails on a destination this site does not emit', () => {
  const root = consumer({
    files: {
      'out/index.html': '<html><body><main><a href="/gone">gone</a></main></body></html>',
    },
  })
  // jsdom is the consumer's dependency, and a fixture has none, so the gate says so
  // rather than reporting a clean export.
  const result = run(root, { gates: ['links'], links: { minRoutes: 1 } })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /jsdom does not resolve/)
})

test('the links gate fails when its floor is not met, which is a pass having read nothing', () => {
  const root = consumer({ files: { 'out/index.html': '<html></html>' } })
  const result = run(root, { gates: ['links'], links: { minRoutes: 6 } })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /jsdom does not resolve|route\(s\) read/)
})

/* ------------------------------------------------------- the configuration */

test('a configuration that names no gates fails rather than reporting a clean run', () => {
  const root = consumer()
  const result = run(root, { gates: [] })

  // 2, not 1. A finding is exit 1 and a configuration that runs nothing is exit 2,
  // because they are different answers and a chain that cannot tell them apart
  // will eventually treat the second as the first.
  assert.equal(result.status, 2)
  assert.match(result.stderr, /names no gates/)
})

test('a missing configuration fails with the shape of the file it wanted', () => {
  const root = consumer()
  const result = spawnSync(process.execPath, [CLI], { cwd: root, encoding: 'utf8' })

  assert.equal(result.status, 2)
  assert.match(result.stderr, /prism-gates\.json does not resolve/)
  assert.match(result.stderr, /The configuration holds this repository's own data only/)
})

test('a gate name that does not exist fails rather than running nothing', () => {
  const root = consumer()
  const result = run(root, { gates: ['retired-lines'] })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /unknown gate "retired-lines"/)
})

/* ------------------------------------------------- one definition, four sites */

test('every law is defined once, in the package, and each has a title, a message and a reason', async () => {
  const { LAWS } = await import(pathToFileURL(path.join(KIT, 'laws.mjs')).href)
  const expected = [
    'retired-line',
    'stylesheet-ownership',
    'token-read',
    'links',
    'pack-boundary',
    'hidden-state',
    'runtime-token-read',
    'pin',
  ]

  assert.deepEqual(Object.keys(LAWS).sort(), [...expected].sort())
  for (const [id, entry] of Object.entries(LAWS)) {
    for (const field of ['title', 'message', 'why']) {
      assert.equal(typeof entry[field], 'string', `${id}.${field} is not a string`)
      assert.ok(entry[field].trim().length > 0, `${id}.${field} is empty, so a red build prints nothing`)
    }
  }
})

/**
 * Has the kit reached the registry yet?
 *
 * These three tests assert an end state that can only exist once a consumer can
 * resolve `@nanisoft/prism-ui/gates` from npm, because a consumer cannot delete a
 * gate program in favour of one it cannot run. That makes the release the
 * precondition, and a test with an unmet precondition is not a test that fails
 * correctly, it is a red build that teaches everyone to ignore the lane.
 *
 * So the state is read from the registry rather than assumed, and the three tests
 * skip with the reason when the kit is not published. A skip that names what
 * unblocks it is visible; a hardcoded skip is not.
 */
const PUBLISHED_KIT = await (async () => {
  try {
    const response = await fetch('https://registry.npmjs.org/@nanisoft%2Fprism-ui', {
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) return null
    const body = await response.json()
    const latest = body['dist-tags']?.latest
    if (!latest) return null
    // A published version carries the kit only if its manifest declares the
    // subpath, so that is the question. Reading the manifest rather than the
    // unpacked tree is the point: the manifest is what a consumer's resolver sees,
    // and a tarball that carried the files without declaring them would leave every
    // consumer unable to import the kit and every sweep blocked behind an import
    // error rather than behind a release.
    const manifest = body.versions[latest] ?? null
    const declares = Object.keys(manifest?.exports ?? {}).some((key) => key.includes('gates'))
    return declares ? { version: latest, manifest } : null
  } catch {
    return null
  }
})()

const KIT_NOT_PUBLISHED =
  `the gate kit is not on the registry yet, so a consumer cannot run a gate from it and so ` +
  `cannot delete its own copy; publish a version that carries \`gates/\` and these three run`

/**
 * The three tests below make claims about all four consumer repositories, and they
 * can only be true if all four are on disk beside this one. Reaching npm is the
 * other precondition they check, and it is the wrong one to check alone: a runner
 * has a reachable registry and no siblings, so `PUBLISHED_KIT` is true there, the
 * skip guard passes, and the test then fails with ENOENT on a consumer's
 * `package.json` it was always going to need.
 *
 * **A test that cannot run in the environment it runs in should skip and say why,
 * not fail.** Failing is what made this repository's CI red on every run since at
 * least `0bb5ae5`, through seven commits by two authors, because a red pipeline and
 * an obviously-environmental failure get read as "not my change". The skip below
 * is loud about what it is skipping and why, so the signal survives.
 *
 * `law-reaches-every-consumer.test.mjs` already does exactly this, with the same
 * four names and the same reason. Two files doing one thing two ways is why the
 * suite looked green locally and red on a runner: locally all four siblings exist,
 * so the question never arose.
 *
 * Anyone with the four sites beside this repository, which is anyone doing the
 * cross-repository work, still gets all three assertions.
 */
const CONSUMER_SITES = ['landing-page', 'atlas', 'nexus', 'alphalens']
const CONSUMERS_PRESENT = CONSUMER_SITES.every((site) =>
  existsSync(path.join(REPO, '..', site, 'package.json')),
)
const CONSUMERS_ABSENT = () =>
  `${CONSUMER_SITES.filter((site) => !existsSync(path.join(REPO, '..', site, 'package.json'))).length} ` +
  `consumer checkout(s) are not beside this repository, so a claim about all four cannot be made ` +
  `here; clone them next to this one to run these three`

test('no consumer repository carries a cross-repository contract file any more', (t) => {
  // The prose mirror is what this ticket removed, and the assertion that it stays
  // removed is that the file is not there. A law in four files is four laws.
  if (!PUBLISHED_KIT) return t.skip(KIT_NOT_PUBLISHED)
  if (!CONSUMERS_PRESENT) return t.skip(CONSUMERS_ABSENT())
  for (const site of CONSUMER_SITES) {
    assert.equal(
      existsSync(path.join(REPO, '..', site, 'CONSISTENCY.md')),
      false,
      `${site} still carries a cross-repository contract file`,
    )
  }
})

test('no consumer gate program restates a law, because the kit ships the only copy', (t) => {
  // The measurement behind this ticket: four repositories held the same gate
  // programs, byte-identical or near, and none of them shipped. This asserts the
  // shape of the fix rather than the count: a file in a consumer that implements a
  // law is a second copy of it, whatever its length.
  if (!PUBLISHED_KIT) return t.skip(KIT_NOT_PUBLISHED)
  const owned = [
    'check-antd.mjs',
    'check-links.mjs',
    'check-stylesheet-ownership.mjs',
    'check-pack-map.mjs',
    'check-hidden-state.mjs',
    'check-pin.mjs',
    'check-token-read.mjs',
  ]
  for (const site of CONSUMER_SITES) {
    for (const file of owned) {
      assert.equal(
        existsSync(path.join(REPO, '..', site, 'scripts', file)),
        false,
        `${site}/scripts/${file} still exists, so the law it carried is still in a second repository`,
      )
    }
  }
})

test('no consumer declares the token package, and none names it in its workspace configuration', (t) => {
  if (!PUBLISHED_KIT) return t.skip(KIT_NOT_PUBLISHED)
  if (!CONSUMERS_PRESENT) return t.skip(CONSUMERS_ABSENT())
  for (const site of CONSUMER_SITES) {
    const manifest = JSON.parse(readFileSync(path.join(REPO, '..', site, 'package.json'), 'utf8'))
    const blocks = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies', 'pnpm.overrides', 'resolutions']
    for (const block of blocks) {
      const declared = block.split('.').reduce((value, key) => value?.[key], manifest)
      assert.equal(
        Object.keys(declared ?? {}).includes('@nanisoft/prism-tokens'),
        false,
        `${site} declares @nanisoft/prism-tokens in ${block}, and the component package declares it itself`,
      )
    }
    const workspace = readFileSync(path.join(REPO, '..', site, 'pnpm-workspace.yaml'), 'utf8')
    assert.equal(
      /@nanisoft\/prism-tokens/.test(workspace),
      false,
      `${site} names @nanisoft/prism-tokens in its workspace configuration`,
    )
  }
})
