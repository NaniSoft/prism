/**
 * The pin law: the design system is a version, and the token package is not
 * this repository's dependency.
 *
 * The contract these four repositories coordinated through had a version line,
 * and it drifted. One site spent a release on a different component line from
 * its three siblings and nothing failed, because the gate that read the pin only
 * asked whether the pin was exact, which it was. Exactness was necessary and not
 * sufficient, and a rule that checks the easy half and calls itself the rule is
 * the failure this gate exists to end.
 *
 * So three things are asserted, and the third is the one this law is actually
 * about:
 *
 *   1. the component package is pinned to an exact version;
 *   2. the token package is not declared in any dependency block;
 *   3. the token package's name appears nowhere in the workspace configuration.
 *
 * (2) and (3) are the same fact held twice in the four repositories, in a
 * manifest and in a `minimumReleaseAgeExclude` list, and both copies were
 * invisible to each other. The component package declares the token package at
 * an exact version, so the consumer cannot be handed a mismatched pair and a
 * second declaration of that number is a second fact to keep in step with a
 * release. The token version is the component package's business. It reaches
 * this repository because the component package requires it, not because this
 * repository named it.
 *
 * Coverage is asserted: both files must resolve and the design system must
 * actually load, so a run that read a manifest with nothing in it fails rather
 * than reports a repository with no pin.
 */
import { law } from './laws.mjs'
import { CoverageError, PACKAGE, TOKEN_PACKAGE, designSystem, finding, floor, read, requireRoot } from './run.mjs'

/** The blocks a manifest can declare a dependency in. `overrides` is where a line gets pinned back. */
const DEPENDENCY_BLOCKS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'overrides',
  'resolutions',
  'pnpm.overrides',
  'pnpm.resolutions',
]

const at = (object, dotted) =>
  dotted.split('.').reduce((value, key) => (value == null ? undefined : value[key]), object)

/** An exact version, and nothing else. A range is not a version anybody chose. */
const EXACT = /^\d+\.\d+\.\d+$/

export function run({ root, config }) {
  const l = law('pin')
  const manifestPath = config.manifest ?? 'package.json'
  const workspacePath = config.workspace ?? 'pnpm-workspace.yaml'
  const findings = []
  const notes = []

  requireRoot(root, manifestPath)
  const manifest = JSON.parse(read(root, manifestPath))

  const pin = manifest.dependencies?.[PACKAGE] ?? manifest.devDependencies?.[PACKAGE]
  if (typeof pin !== 'string' || !EXACT.test(pin)) {
    findings.push(
      finding(
        manifestPath,
        'range-pin',
        `${PACKAGE} is pinned as ${JSON.stringify(pin ?? null)}, and a range lets this repository move onto a\n` +
          '      design-system line nobody chose for it.',
      ),
    )
  }

  for (const block of DEPENDENCY_BLOCKS) {
    const declared = at(manifest, block)
    if (!declared || typeof declared !== 'object') continue
    for (const name of Object.keys(declared)) {
      if (name !== TOKEN_PACKAGE) continue
      findings.push(
        finding(
          manifestPath,
          'second-declaration',
          `\`${block}\` declares ${TOKEN_PACKAGE}, and ${PACKAGE} declares it at an exact version itself.\n` +
            `      Two repositories holding one number is two facts to keep in step, and this is the one that\n` +
            `      already drifted once: the token package's version is the component package's decision.`,
        ),
      )
    }
  }

  const workspace = read(root, workspacePath)
  if (workspace === null) {
    throw new CoverageError(
      `${workspacePath} does not resolve, so the second copy of the token version cannot be read at\n` +
        '  all. A workspace configuration that does not exist is the cleanest version of this defect.',
    )
  }
  workspace.split('\n').forEach((line, index) => {
    if (!line.includes(TOKEN_PACKAGE)) return
    findings.push(
      finding(
        `${workspacePath}:${index + 1}`,
        'second-declaration',
        'the token package\'s name is in the workspace configuration. A release-age exclusion is a\n' +
          '      second declaration of the version the component package already declares, and it is the\n' +
          '      copy nothing else can see.',
      ),
    )
  })

  // Coverage: the installed design system has to load, because a pin nobody can
  // resolve is a pin that states an intention.
  const installed = designSystem(root)
  floor('the design system resolved to a version', installed.version ? 1 : 0, 1)

  notes.push(
    `${l.id}: ${PACKAGE}@${pin ?? 'unpinned'} is pinned exactly, and ${TOKEN_PACKAGE} is declared by` +
      ` ${PACKAGE}@${installed.version} rather than by this repository.`,
  )
  notes.push(
    `${l.id}: read ${manifestPath} and ${workspacePath}; ${DEPENDENCY_BLOCKS.length} dependency blocks and both`,
  )
  notes.push(
    `${l.id}: the installed package is read through its own export map, so a renamed subpath is an error`,
  )
  notes.push(`${l.id}: here rather than a run that reports every property in this repository as undeclared.`)

  return { law: l, findings, notes }
}
