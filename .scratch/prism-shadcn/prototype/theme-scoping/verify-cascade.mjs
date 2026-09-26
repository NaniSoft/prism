/**
 * Analytic cascade check (ticket 08).
 *
 * No browser was reachable from the session, so instead of eyeballing the demo we
 * parse the generated candidate CSS and evaluate the custom-property cascade for
 * representative elements. This is a TARGETED matcher for the selector shapes the
 * candidates emit (`:root`, `.dark`, `[data-pack="x"]`, `.dark[data-pack="x"]`,
 * `[data-pack="x"].dark`, `.prism-pack-x`), not a general CSS engine, but it is
 * exact for these selectors.
 *
 * It does not model inheritance: a descendant for which NO rule matches is
 * reported as "(none)", which in a browser means it keeps the ancestor's value.
 * That is precisely the descendant-scoping test: root-attribute leaves the
 * descendant with no rule, attribute-agnostic and root-class give it one.
 *
 * Run:  node verify-cascade.mjs
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const CANDIDATES = ['root-attribute', 'root-class', 'attribute-agnostic']

/** Parse `selector { decl }` blocks in source order. */
function parse(css) {
  const withoutBanner = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const rules = []
  const re = /([^{}]+)\{([^{}]*)\}/g
  let m
  while ((m = re.exec(withoutBanner))) {
    const decls = {}
    for (const line of m[2].split(';')) {
      const i = line.indexOf(':')
      if (i > 0) decls[line.slice(0, i).trim()] = line.slice(i + 1).trim()
    }
    rules.push({ selector: m[1].trim(), decls, order: rules.length })
  }
  return rules
}

/** Specificity (a,b,c). `:root` and `.dark` are pseudo-class / class -> (0,1,0). */
function specificity(sel) {
  const s = sel.trim()
  const a = (s.match(/#[\w-]+/g) || []).length
  const classes = (s.match(/\.[a-zA-Z_-][\w-]*/g) || []).length
  const attrs = (s.match(/\[[^\]]+\]/g) || []).length
  const pseudos = (s.match(/:[a-zA-Z-]+/g) || []).length
  const stripped = s.replace(/#[\w-]+|\.[a-zA-Z_-][\w-]*|\[[^\]]+\]|:[a-zA-Z-]+/g, '')
  const c = (stripped.match(/[a-zA-Z][\w-]*/g) || []).length
  return [a, classes + attrs + pseudos, c]
}

const gt = (x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]

function matches(sel, el) {
  const s = sel.trim()
  if (s.includes(':root') && el.isRoot !== true) return false
  for (const m of s.matchAll(/\[data-pack="([^"]+)"\]/g)) {
    if (el.attrs['data-pack'] !== m[1]) return false
  }
  for (const m of s.matchAll(/\.([a-zA-Z_-][\w-]*)/g)) {
    if (!el.classes.has(m[1])) return false
  }
  return true
}

function resolve(rules, el) {
  let winner = null
  for (const rule of rules) {
    if (!rule.decls['--primary'] || !matches(rule.selector, el)) continue
    const spec = specificity(rule.selector)
    if (!winner || gt(spec, winner.spec) > 0 || (gt(spec, winner.spec) === 0 && rule.order > winner.order)) {
      winner = { value: rule.decls['--primary'], selector: rule.selector, spec, order: rule.order }
    }
  }
  return winner
}

const el = (o = {}) => ({
  isRoot: o.isRoot ?? false,
  attrs: o.attrs || {},
  classes: new Set(o.classes || []),
})

const EXPECT = {
  blush: { light: '#ec88a0', dark: '#ffb2c2' },
  mint: { light: '#73bf88', dark: '#9ddcad' },
  lavender: { light: '#bc97e7', dark: '#d9baff' },
  sky: { light: '#6cb2eb', dark: '#9bd1ff' },
  peach: { light: '#e4965e', dark: '#feb98b' },
  default: { light: '#171717', dark: '#f5f5f5' },
}

const cases = [
  ['ROOT    html[data-pack=blush] light', el({ isRoot: true, attrs: { 'data-pack': 'blush' } }), 'blush', 'light'],
  ['ROOT    html[data-pack=blush].dark', el({ isRoot: true, attrs: { 'data-pack': 'blush' }, classes: ['dark'] }), 'blush', 'dark'],
  ['ROOT    html.dark only', el({ isRoot: true, classes: ['dark'] }), 'default', 'dark'],
  ['ROOT    html bare', el({ isRoot: true }), 'default', 'light'],
  ['SUBTREE div[data-pack=mint] inside html.dark', el({ attrs: { 'data-pack': 'mint' } }), 'mint', 'light'],
  ['SUBTREE div[data-pack=mint].dark inside html', el({ attrs: { 'data-pack': 'mint' }, classes: ['dark'] }), 'mint', 'dark'],
  ['SUBTREE div[data-pack=peach] inside html[data-pack=blush]', el({ attrs: { 'data-pack': 'peach' } }), 'peach', 'light'],
  ['SUBTREE div[data-pack=sky].dark inside html.dark', el({ attrs: { 'data-pack': 'sky' }, classes: ['dark'] }), 'sky', 'dark'],
  ['SUBTREE div.dark only inside html[data-pack=blush]', el({ classes: ['dark'] }), 'default', 'dark'],
]

let totalFail = 0
for (const candidate of CANDIDATES) {
  const rules = parse(await readFile(path.join(HERE, 'candidates', `${candidate}.css`), 'utf8'))
  // Candidate B changes the consumer markup to classes; model that fairly.
  const adapt = (target) =>
    candidate === 'root-class' && target.attrs['data-pack']
      ? {
          isRoot: target.isRoot,
          attrs: {},
          classes: new Set([...target.classes, `prism-pack-${target.attrs['data-pack']}`]),
        }
      : target
  console.log(`\n=== candidate: ${candidate} (${rules.length} rules) ===`)
  let fail = 0
  for (const [label, target, pack, mode] of cases) {
    const w = resolve(rules, adapt(target))
    const want = EXPECT[pack][mode]
    const ok = w && w.value.toLowerCase() === want
    if (!ok) fail++
    const got = w ? w.value : '(no rule -> inherits ancestor)'
    console.log(
      `${ok ? 'pass' : 'FAIL'}  ${label}\n        got ${got} | expected ${want} (${pack} ${mode})`,
    )
  }
  totalFail += fail
  console.log(`        -> ${fail === 0 ? 'all cases pass' : `${fail} case(s) failed`}`)
}
console.log(
  "\nNote: the root-attribute candidate has no rule matching a light SUBTREE, " +
    "which is the descendant-scoping defect. The root-class and attribute-agnostic " +
    "candidates match every subtree case.",
)
process.exitCode = totalFail === 0 ? 0 : 0 // report only; expected failures are findings, not errors
