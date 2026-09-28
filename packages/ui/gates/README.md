# `@nanisoft/prism-ui/gates`

The cross-repository laws, as programs, in the package a consumer already pins
exactly.

For four years the five NaniSoft repositories coordinated through a prose
contract mirrored in four files. It drifted into three implementations of one rule
and one of the three rules was false, and it could not be enforced because prose
cannot fail. This subpath is the replacement: every law is the failure message of
a gate, and the gate is here, so a change to a law lands once and reaches every
consumer in one release.

## What a consumer holds, and what the package holds

A consumer's repository holds **data**:

| the consumer declares | because |
| --- | --- |
| its stylesheets | which sheets are its own is a fact about its own pages |
| its pack map | the regions it allows, and why each one exists |
| its region resolver | naming a region means knowing its own DOM |
| its coverage floors | how many rules or routes count as having read something |
| its destinations known to be broken | one site's content defect, with a reason |
| its custom properties the build supplies | one site's build, one site's font |

The package holds **every law**: what the judgements are, what each failure says,
and why each one exists. A consumer that restates any of it has two rules that will
disagree, and the disagreement is invisible until a reader sees the difference.

## Running it

```bash
pnpm exec prism-gates                 # every gate prism-gates.json names
pnpm exec prism-gates --gate=links    # one gate
pnpm exec prism-gates --json          # machine-readable, for a test
```

In a consumer's `package.json`:

```json
{
  "scripts": {
    "check:gates": "prism-gates"
  }
}
```

And in `prism-gates.json`, at the repository root:

```json
{
  "gateKit": 1,
  "gates": ["pin", "retired-line", "stylesheet-ownership", "links", "hidden-state"],
  "stylesheet-ownership": { "sheets": ["app/globals.css"], "minDeclarations": 20 },
  "links": { "outDir": "out", "minRoutes": 30, "minAnchors": 200 },
  "hidden-state": { "sheets": ["app/globals.css"], "minRules": 25 }
}
```

`gateKit` is the generation of the contract the consumer is holding itself to. A
consumer that does not state one gets the package's current generation, and a law
rewritten in a later release is then a version the consumer has not moved to rather
than a silent change of wording underneath it.

## The laws

| id | the law |
| --- | --- |
| `pin` | the design system is an exact version, and the token package is the component package's dependency rather than the consumer's |
| `retired-line` | no trace of the retired component library survives |
| `stylesheet-ownership` | a site stylesheet does not own a surface the design system owns |
| `token-read` | a custom property that nothing declares is not a wrong colour, it is no declaration at all |
| `links` | every internal destination resolves and every fragment names an element that exists |
| `pack-boundary` | a pack boundary lands on a mark, and a declared region set is the whole of what may carry a second pack |
| `hidden-state` | a CSS-authored hidden state is escapable, and its exit is not a clock |

The full text of each, and the failure each one prevents, is in `laws.mjs` and is
printed by the gate that holds it. It is not restated here on purpose: this file is
the one place a reader looks when a build is red, and a second copy of a law in a
second file is a second rule.

## What a gate here cannot do

Stated here rather than left for a reader to discover:

- **It reads text, not a cascade.** The ownership gate sees a selector and a
  declaration. It does not resolve which rule wins.
- **It reads the emitted export, not a browser.** The links and pack-boundary gates
  read `out/`. Run the build first; a gate that read nothing fails rather than
  reporting a clean page.
- **It does not see a runtime.** A `data-pack` attribute set after paint, or a
  token read in client code, is outside every gate in this kit.
- **A stylesheet half is not a rendered half.** A consumer that ships a hidden
  state also needs a test that renders with scripting switched off.

These limits are printed on every run as well, because a gate that appeared to
resolve cascades and did not would be worse than no gate: it would retire the
question.
