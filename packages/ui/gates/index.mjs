/**
 * The gate kit's registry: which law is which program, and which version of this
 * kit a consumer is running.
 *
 * The registry exists so that "the laws" is a list rather than a folder. A gate
 * that is not in `GATES` is a program nobody runs, and a law with no gate is a
 * sentence, which is the thing this kit was written to remove. `check-gate-kit.mjs`
 * asserts the two are the same set in both directions, and the assertion runs in
 * this repository's own `check`, so the registry cannot rot without the build
 * failing.
 *
 * `GATE_KIT_VERSION` is the version of the *contract*, not of the package. A
 * consumer names it in its configuration so that a consumer's own gate chain can
 * say which generation of the law it is holding itself to, and so that a law
 * rewritten in a later release is visible as a version the consumer has not moved
 * to rather than as a silent change of wording underneath it.
 */
import { LAW_IDS, law } from './laws.mjs'

/** The contract generation. Bump it when a law's wording or its gate's surface changes. */
export const GATE_KIT_VERSION = 1

/** Every gate, keyed by the id a consumer names. The value is the module's `run`. */
export const GATES = {
  'retired-line': () => import('./retired-line.mjs'),
  'stylesheet-ownership': () => import('./stylesheet-ownership.mjs'),
  links: () => import('./links.mjs'),
  'pack-boundary': () => import('./pack-boundary.mjs'),
  'hidden-state': () => import('./hidden-state.mjs'),
  'runtime-token-read': () => import('./runtime-token-read.mjs'),
  pin: () => import('./pin.mjs'),
}

/**
 * Which gate holds which law, in both directions.
 *
 * The token-read law is held by the stylesheet-ownership gate because it reads the
 * same sheet with the same parser and the same reference; splitting it would mean
 * parsing a stylesheet twice to assert one property of it, and the two runs could
 * disagree about what a declaration is. It is a separate law because its failure is
 * a different failure: an unlayered declaration that wins the cascade is not the
 * same defect as a read that erases itself.
 */
export const GATE_LAWS = {
  'retired-line': ['retired-line'],
  'stylesheet-ownership': ['stylesheet-ownership', 'token-read'],
  links: ['links'],
  'pack-boundary': ['pack-boundary'],
  'hidden-state': ['hidden-state'],
  'runtime-token-read': ['runtime-token-read'],
  pin: ['pin'],
}

/** The gate ids, in the order a report prints them. */
export const GATE_IDS = Object.keys(GATES)

/** One gate by id, loaded. A throw naming the ones that exist, because a misspell must not pass. */
export async function gate(id) {
  const load = GATES[id]
  if (!load) {
    throw new Error(`prism-gates: unknown gate "${id}". The kit ships: ${GATE_IDS.join(', ')}.`)
  }
  const module = await load()
  if (typeof module.run !== 'function') {
    throw new Error(`prism-gates: the gate "${id}" exports no run(), so it cannot be run rather than skipped.`)
  }
  return module
}

/**
 * Every law the kit enforces, resolved, so a consumer can print them without
 * knowing which program holds which.
 */
export function laws() {
  return LAW_IDS.map(law)
}

/** The laws a named gate holds. */
export function lawsOf(gateId) {
  return (GATE_LAWS[gateId] ?? []).map(law)
}
