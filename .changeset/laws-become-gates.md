---
'@nanisoft/prism-ui': minor
---

Ship the consumer gate kit, so a cross-repository law reaches a consumer in one release

The four repositories that consume this package coordinated through a prose
contract mirrored in four files. It could not be enforced, because prose cannot
fail, and it had already drifted: two sites that mattered held three
implementations of one rule and one of the three rules was false.

The laws are now the failure messages of gates in this package, and a consumer's
repository holds only its own data.

```sh
pnpm exec prism-gates                 # every gate prism-gates.json names
pnpm exec prism-gates --gate=links    # one gate
pnpm exec prism-gates --json          # machine-readable, for a test
```

Configure it with a `prism-gates.json` at your repository root. A consumer holds
its stylesheets, its pack map, its coverage floors, the destinations its own
corpus gets wrong, and the custom properties its own build supplies. It does not
hold the wording of a rule, because a wording held in four places is four rules
that will disagree.

The gates are `pin` (the design system is an exact version, and the token package
is this package's dependency rather than yours), `retired-line`, `stylesheet-ownership`
with `token-read`, `links`, `pack-boundary`, `hidden-state` and `runtime-token-read`.

**This release adds the `gates` export subtree and a `prism-gates` binary, and
adds `gates` to `files`.** It also means a consumer no longer needs to declare
`@nanisoft/prism-tokens`: resolve it through this package, which requires it at an
exact version, and the pair cannot be mismatched. Removing the token package from
a consumer's `package.json` and from its `pnpm-workspace.yaml` is part of the
adoption; the `pin` gate fails on either.

The kit is outside `dist/` on purpose. It is a build-time program for another
repository and must never enter a consumer's module graph or its bundle.
