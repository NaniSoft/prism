---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 06, 07, 18
---

# Quality gates and test strategy

## Question

This repository has real gates and no tests. `pnpm build` runs a dash gate, then
the registry sync and validate, then the docs build, whose prebuild runs the
token build and the contrast check. That is a good instinct and a thin
implementation: three of the packages have no test suite, and the published
packages will be consumed by products the author will not see failing.

Settle:

1. **What each package must prove.** For the token package, the component
   package, the corpus package and the MCP package, name the checks that must
   pass before a publish. Distinguish checks that fail the build from checks
   that only report, and say why each is on its side of that line. The existing
   contrast gate's own reasoning is worth preserving: borders and inputs are
   reported and not failed, because a subtle border is a deliberate choice and
   WCAG 1.4.11 only requires contrast where a boundary is the sole means of
   identifying a control.
2. **The token gates.** Keep the contrast gate, the read-back check that throws
   on `: undefined`, the per-theme key-set comparison against the base theme,
   and the twenty-step spacing coincidence check. Decide whether the spacing
   check survives or is replaced by a real binding, and add whatever the newly
   bound motion and typography tokens need. Decide what happens when a new pack
   is added and a required pair is simply forgotten.
3. **A test framework and a floor.** Whether Vitest is adopted, where tests
   live, and the minimum per package. The old repository used Vitest with
   Testing Library and had forty passing tests in the MCP package alone,
   including real protocol round-trips. State a floor as a number, per package,
   not as "good coverage".
4. **What a component test asserts.** The old repository's rule was to test
   user-facing behaviour rather than implementation details, and to avoid
   prefixing test names with "should". Given the accessibility claim is central
   to this system, decide what a component's test suite must cover beyond
   rendering: keyboard operation, focus management, roles and names, and the
   coarse-pointer target floor that the local button already implements.
5. **A11y as a gate.** Whether an automated accessibility check runs in the
   build or in CI, which tool, and whether it fails. A component library whose
   selling point is accessibility cannot ship an untested accessibility claim,
   and an automated check catches perhaps a third of real defects, so state
   what it covers and what it does not.
6. **The registry integrity gate.** The local `validate-registry.mjs` exists
   for a named failure mode: an item referencing a renamed file leaves the docs
   site rendering while the install 404s. Under a library-only distribution
   model the install command is gone but the failure mode is not, because the
   published package's file list has the same problem. Decide whether the
   validator is kept, what it validates now, and what the equivalent
   published-package check is. Two specifics arrived with the monorepo decision:
   the registry artifacts now live inside the component package, so the
   validator's home moves with them; and `components.json` declares
   `"style": "base-nova"`, an identifier nobody on this effort has verified.
   Establish what the shadcn CLI does with that value before any gate depends
   on it, because a gate built on an unverified identifier is worse than no
   gate.
7. **The dash gate.** `scripts/check-dashes.mjs` fails the build on an em or en
   dash in reader-facing copy and reports but does not fail the same characters
   in code comments. Decide whether it survives into the published system, what
   its coverage list is, and whether the documentation pages it will now need to
   scan are inside it. Note the local file's own recorded gap: root
   documentation including `README.md` and `DESIGN.md` is in neither list.
8. **The client-boundary analyzer.** `apps/docs/scripts/analyze-blocks.mjs`
   measures line count, non-comment line count and whether a block crosses a
   client boundary, and it exists because the shadcn registry schema has no
   field for one. Decide whether measuring client JavaScript per item stays a
   practice, and where the measurement is published if it is. The old
   repository's first catalog was measured at zero client components, which is
   a claim worth keeping verifiable.
9. **Build determinism.** Whether a build-twice byte comparison runs, given the
   corpus package's artifacts are meant to be diffable in review.
10. **What a green build proves, stated honestly.** Name what the gates do not
    cover. A gate list that implies more assurance than it delivers is worse
    than a short one, and the local `DESIGN.md` already models the right
    register by listing its own known open items.
11. **Visual regression.** The map's fog records it deferred until the library
    carried UI worth snapshotting; ticket 10 now settles that the site renders
    live component demos. Decide whether a visual regression mechanism is
    adopted in this effort, which one, on what trigger, and whether it fails
    the build or only reports. If it stays deferred, say so explicitly and
    record where the decision returns.

Read `scripts/check-dashes.mjs`, `scripts/clean.mjs`,
`scripts/dev-cache-guard.mjs`, `packages/tokens/scripts/check-contrast.mjs`,
`packages/tokens/build/build.mjs`, `packages/registry/scripts/` in full, and
`apps/docs/scripts/analyze-blocks.mjs`. Consult `tdd` for the test floor and
`web-perf` if performance gates are considered.

## Answer

All eleven are settled. Ticket 10's four gates are absorbed at the end; one item
on ticket 10's list (the registry-artifact assertion) is folded into Q6 rather
than restated, because it is the same failure mode the registry validator
already owns. One rule decides every fail/report split below, and the file keeps
it in the open:

> A check fails when its failure would let a consumer-facing claim be false or a
> consumer's install break. A number whose threshold is a judgement, or a
> measurement that informs a human decision, reports and is published.

The gates are new, so a green build proves the gates ran, not that the system is
free of the defects Q10 lists.

### 1. What each package must prove

The pipeline is ticket 16's and is not re-decided: `ci.yml` runs
`pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm check` through
the `gates` composite, then `node scripts/verify-tarballs.mjs --mode=verify`.
`publish.yml` re-runs `gates`, then `--mode=prepublish`, publishes, then
`--mode=postpublish`. `publint` stays `prepublishOnly` on all four packages. So
"before a publish" is the root `check` task (which itself `dependsOn` `build`),
the `test` task, and the release floor.

| Package | Fails the build | Reports only |
| --- | --- | --- |
| `prism-tokens` | contrast gate; `emitted-contract.test.mjs`; the `: undefined` read-back; the per-theme key-set guard; the descriptor-radius plus ramp-pair guard; `check-motion.mjs`; `check-elevation-layout.mjs`; the build-twice determinism check | the two advisory contrast pairs (border/input); descriptor `$description` prose |
| `prism-ui` | `check-surface.mjs`; `sync-registry` idempotence plus `validate-registry.mjs` (registry **and** published file list); `shadcn registry:build` plus the `public/r` isolation assertion; the component suites; the axe suite; the JSDoc-present check; `buildCatalog()` integrity; both grep gates over `src` | per-item client-JavaScript measurement; the demo `client` flag |
| `prism-llms` | corpus drift; build-twice determinism; per-item `.md`-mirror and store coverage; the store type round-trip; documented-output-list equals emitted set | corpus freshness/build stamp |
| `prism-mcp-server` | the protocol round-trip suite; tool registry equals corpus/catalogue; the bundled `data.json` hash matches `packages/llms/dist` | corpus freshness |
| `@nanisoft/site` (private) | dash gate; search gzip budget; `run_worker_first` equals `MD_SECTIONS`; registry artifacts absent from `out/` | visual regression; per-item client measurement |

Why each side:

- **Contrast fails; the two advisory pairs report.** The existing reasoning is
  preserved verbatim: borders and inputs are a deliberate aesthetic choice, and
  WCAG 1.4.11 only requires 3:1 where a boundary is the sole means of
  identifying a control. Focus rings stay required because an unfindable focus
  indicator is a real defect.
- **The registry validator fails** because its named failure mode (a renamed
  file renders on the site while the install 404s) becomes, under npm-only
  distribution, a module in `exports` with no emitted file. That is a
  consumer-breaking lie, not a measurement.
- **Protocol round-trips, the surface scan, and catalogue integrity fail**
  because a published API that does not match its promise breaks downstream
  silently.
- **Client bytes, freshness and advisory contrast report** because their
  thresholds are judgement calls. "Zero client JavaScript" is a goal, not a
  correctness invariant, and a build date is information.
- **`publint` and `verify-tarballs.mjs` fail at the point they run.** The
  verifier's `--mode=verify` is a PR and push gate; `--mode=prepublish` /
  `--mode=postpublish` fail the publish. Packing is cheap enough to run on every
  PR and the check is otherwise meaningless.

### 2. The token gates

- **Contrast gate: keep.** `packages/tokens/scripts/check-contrast.mjs` reads
  the manifest, applies the shared `PAIRS` table to all six sources across both
  modes, and keeps 14 required + 2 advisory. No motion, typography or spacing
  pair is added: they are not colour pairs, and adding them would be a category
  error.
- **Read-back `: undefined` guard: keep.** It lives in `build.mjs` and must be
  extended to the new `dist/dtcg/**` tree (ticket 06 §1).
- **Per-theme key-set comparison: keep.** The base theme's `tokens.light.json`
  keys are the reference.
- **The twenty-step spacing coincidence check: delete, not keep.**
  `build.mjs:439-488` compares the authored scale against Tailwind's own
  `theme.css`. Ticket 06 binds spacing for real, so the check is replaced by
  `packages/tokens/test/emitted-contract.test.mjs` (ticket 06 §4), which reads
  only the DTCG source and the emitted files: completeness per bound group, each
  emitted value equals the authored value, `spacing.1 === --spacing` and the
  twenty steps equal `--spacing x key`, and no declaration exists that the
  source did not author. The replacement is strictly stronger, because it no
  longer reads a dependency's private file.
- **Ticket 18's groups join the same test:** every authored
  `shadow.*`/`breakpoint.*`/`container.*` token has its declaration and value;
  the shadow set is exactly `{xs, sm, md}`; the breakpoint set is exactly
  `{sm, md, lg}` with `--breakpoint-xl: initial` and `--breakpoint-2xl: initial`
  present; the container set is exactly `{page, measure, measure-narrow}`.
- **The new-`-foreground` pair rule: fail.** A new root-level `$type: color`
  token whose name ends in `-foreground` must be the first element of a `PAIRS`
  entry, or the build fails. A new semantic colour cannot ship unchecked.
- **New motion and typography coverage.** The emitted-contract test asserts the
  authored names and values of `--font-*`, `--font-weight-*`, `--text-*` (and
  its `--text-*--line-height`), `--leading-*`, `--tracking-*`, `--duration-*`,
  `--ease-*`, and the `--transition-duration-*` mirror the `duration-*` utility
  actually reads; a closed set of exactly `{fast, base, slow} = {80, 160, 280}`
  and exactly `{out, in-out}`; and a **zero-overshoot assertion** that every
  authored `cubicBezier` has every control-point `y` in `[0, 1]` (this is what
  forbids the deleted `emphasized` curve from returning). `check-motion.mjs`
  (ticket 06) is the grep half of the same doctrine.
- **A new pack cannot forget a required pair.** Every pack is expanded by
  `expandTheme` from one intent-to-step mapping, so it cannot omit a semantic
  key, and `build.mjs`'s key-set guard would fail first if it did. The
  `PAIRS` table is shared and complete, so the pair rule covers a new
  `-foreground` automatically. **One concrete fix is required to make that true
  rather than aspirational:** `check-contrast.mjs` currently does
  `if (!f?.startsWith('#') || !b?.startsWith('#')) continue`, which silently
  skips an absent or malformed required pair. Change it so a **required** pair
  whose either token is missing or not a hex colour is an error, not a `continue`
  (advisory pairs may still skip). Then the three guards compose: the key-set
  guard catches an omitted key, the pair rule catches an unpaired
  `-foreground`, and the contrast gate catches a malformed value.

### 3. A test framework and a floor

**Vitest is adopted**, with a root `vitest.workspace.ts` and one project per
package. `environment: 'jsdom'` and `@testing-library/react` +
`@testing-library/user-event` + `@testing-library/jest-dom` for `prism-ui`;
`environment: 'node'` for `prism-tokens`, `prism-llms` and `prism-mcp-server`.
Tests live in `packages/<pkg>/test/**` (ticket 06 already names
`packages/tokens/test/emitted-contract.test.mjs`); component suites live beside
their component as `src/components/ui/<name>.test.tsx`. The root `test` task is
a turbo passthrough; CI's `gates` action already calls `pnpm test`.

Floors, as numbers, not "good coverage":

- `prism-tokens`: **8** in `test/emitted-contract.test.mjs` (completeness, value
  equality, spacing table, no extras, shadows, breakpoint closure, containers,
  easing/duration safety).
- `prism-ui`: **one suite per exported Component** (not per block or page — a
  Block and a Page are compositions and get one smoke test each in the shared
  interaction suite), **plus four shared suites**: `interaction.test.tsx`,
  `a11y.test.tsx`, `provider.test.tsx`, `styles.test.tsx`. With ticket 19's v1
  roster this is a floor of **8 suites and 24 assertions**, and the formula
  scales with the roster.
- `prism-llms`: **10** (drift, determinism, mirror coverage, store round-trip,
  output list, one per generated lane).
- `prism-mcp-server`: **20**, including **three real protocol round-trips over
  an in-memory transport** (`@modelcontextprotocol/sdk`'s `InMemoryTransport`
  and `Client`: list items, get item, search docs) and **one round-trip through
  the Worker handler**. The old package had forty; twenty is a conservative
  floor that still proves the transport.

Total published floor: **42 + one per Component**.

### 4. What a component test asserts

A component test asserts user-facing behaviour through the public interface
only. Per component:

- **Rendering and content** by role and accessible name (`getByRole('button',
  { name: /save/i })`), never by class name or `data-slot`.
- **Keyboard operation:** reach it with `Tab`, activate with `Enter`/`Space`,
  `Escape` closes a disclosure, arrow keys move within a composite.
- **Focus management:** opening a disclosure moves focus into it and closing
  returns focus to the trigger; the focus ring is present under
  `:focus-visible`.
- **Roles and names:** correct implicit/explicit role, an accessible name on
  every control, `aria-current` on the current nav item, `aria-invalid` where
  declared.
- **The coarse-pointer 44px floor.** jsdom cannot evaluate `@media (pointer:
  coarse)`, so it is asserted in two places: a **class-contract test** that the
  control's utility string contains `pointer-coarse:` together with
  `min-h-11`/`min-w-11`, and a **real browser check** in the report-only
  Playwright job with a coarse-pointer project (Q11). Saying "the 44px floor is
  unit-tested" would be false; the test names on the honest side of that line.

Rules that hold for every suite: names read as specifications with no `should`
prefix ("button activates with the Enter key"); no implementation-detail
assertions (no `data-slot`, no call counts, no private functions, no assertions
on class names beyond the one coarse-pointer contract); one logical assertion
per test (the `tdd` guidance).

### 5. A11y as a gate

**Two automated checks, and they fail.**

1. **`test/a11y.test.tsx`** runs `axe-core` (via `vitest-axe`) over the rendered
   output of every Component and fails on any violation axe can see in jsdom.
   This runs inside `pnpm test`, so it gates every PR and every publish.
2. **Playwright + `@axe-core/playwright`** runs over the site's rendered demos
   in the report-only visual job (Q11), which is a real browser and therefore
   the only place the `color-contrast` rule can run. On promotion (Q11) this
   becomes a failing gate too.

**What it covers, stated so the claim is not overstated:** axe catches roughly
**one third** of real accessibility defects. It reliably catches missing
accessible names, invalid ARIA, broken roles, duplicate ids, missing form
labels, and (in a real browser) text contrast. It does **not** catch tab order,
keyboard traps, focus-visible visibility, screen-reader announcement quality,
reduced-motion handling, the semantics of a composite widget in operation, or
contrast of composited/alpha/backdrop/gradient layers. Q4's keyboard and focus
assertions and the token contrast gate cover parts of that list; the rest is
named in Q10 as not covered. The site's accessibility claim is therefore gated
by axe **plus** the keyboard/focus suite **plus** the token contrast gate, and
is still not a proof of accessibility.

### 6. Registry integrity

**Keep the validator, move its home, and widen what it checks.** It lives at
`packages/ui/scripts/validate-registry.mjs`, beside `registry.json`,
`components.json` and `sync-registry.mjs`. It is wired into the `ui` package's
`build`/`check`, not a separate private package (ticket 05 already moved it).

What it validates now:

1. `registry.json` against the filesystem and the shadcn item schema, unchanged
   (unique names, required `title`/`description`/`type`, item/file field
   allowlists, every `path` on disk).
2. **The published file list.** Every registry item's file must map to a real
   emitted artifact and to a package `exports` entry: a `registry:component`
   item for `button` must correspond to `./components/button` in `exports` and
   to an emitted `dist/components/button.js` and `.d.ts`. This is the
   library-only equivalent of the old "renamed file leaves the site rendering
   while the install 404s": here a renamed file leaves the catalogue entry
   pointing at a module the package no longer publishes. It reuses ticket 05's
   emitted-declaration seam (the corpus already reads `dist/**.d.ts`).
3. Every `exports` key resolves to a file on disk.
4. `components.json` parses (`shadcn registry:build` requires it), and
   `public/r/**` is outside `files` (which is `["dist"]`), outside `dist`, absent
   from the site export and absent from the tarball. This absorbs ticket 10's
   "internal registry JSON never reaches the site export" gate; the tarball half
   is also asserted by `verify-tarballs.mjs`.

**What `"style": "base-nova"` actually does — established, not assumed.**
Verified against the installed `shadcn@3.8.5`:

- `style` is a **required, free-form `z.string()`** in the config schema
  (`rawConfigSchema`): there is no enum and no allowlist, so `base-nova` is
  accepted, and it is **not** a published style the CLI knows about. The
  interactive style list is fetched from the remote styles index and is used
  only for the `init` prompt.
- The CLI branches on `style` in exactly three places, **none of which our
  pipeline runs**: (a) the `shadcn add` file transform
  `if (!config.style?.startsWith('base-')) return` — a `base-` prefix rewrites
  Base UI's `asChild` to a `render` prop; (b) the `shadcn add` remote fetch URL
  `styles/${style ?? 'new-york-v4'}/...`; (c) the icon-library default
  `style === 'new-york' ? 'radix' : 'lucide'`, overridden anyway by our explicit
  `"iconLibrary": "lucide"`.
- `shadcn registry:build` — the only shadcn command the pipeline runs — loads
  and schema-parses `components.json` and then **does not interpret `style`**.

**Decision:** keep the field (the schema requires a string, so the field cannot
simply be dropped) but treat the value as inert, and **let no gate read it**. The
validator asserts only that `components.json` parses, and `shadcn registry:build`
is itself the check that the value is accepted. The value is recorded in the
package's README and `DESIGN.md` as an unverified, schema-satisfying token; the
question reopens only if a `shadcn add` lane is ever introduced, at which point
the value must be verified against the CLI's published styles first.

**Published-package equivalent:** `scripts/verify-tarballs.mjs` already asserts
`dist/` contents and no source leak; the new file-list assertion above is what
makes it cover the registry's promise, not just the package's files.

### 7. The dash gate

**Keep it, and widen its coverage list to the pages it now needs to scan.**
`scripts/check-dashes.mjs` is cheap and catches a typographic tell review misses.

- `ROOTS` grows to `apps/site/src`, `apps/site/content`, `apps/site/items`,
  `packages/ui/src`, `packages/tokens/src`, `packages/tokens/build`,
  `packages/tokens/scripts`, `packages/ui/scripts`, `packages/llms/src`,
  `packages/mcp-server/src`, `scripts`, and the root documentation:
  `README.md`, `DESIGN.md`, `PRODUCT.md`, `CONTEXT.md`, `AGENTS.md`,
  `CONTRIBUTING.md`, `docs/**`.
- `GATED` (a hit fails the build) covers every file whose strings render or ship:
  all of `apps/site/src`; `apps/site/content/**/*.mdx` and
  `apps/site/items/**/*.mdx` (the newly authored documentation pages — this is
  the gap the ticket names); `packages/tokens/src/{themes,semantic,foundation}`
  (their `$description` renders on `/tokens`, `/themes` and the Foundations
  pages); `packages/ui/src/**` (component JSDoc reaches the corpus and block
  source ships verbatim); `packages/llms/src/**` (it emits reader-facing
  Markdown); `packages/mcp-server/src/**` (tool descriptions are read by
  agents); and every root/doc `*.md`/`*.mdx`.
- Code comments in `.ts`/`.tsx`/`.mjs` stay **reported, not failed** — the file's
  own doctrine, kept.
- The gate still cannot see the mangled `???` sequences that `DESIGN.md`
  records. Add a second pattern (`\?\?\?\s`) to the **gated** scan and fail on
  it, so the known defect stops slipping through; report it in comments.

The honest limit: the gate sees characters, not meaning. It proves no em/en dash
in the listed files, nothing more (Q10).

### 8. The client-boundary analyzer

**Measuring client JavaScript per item stays a practice, and the measurement is
published.**

- `apps/docs/scripts/analyze-blocks.mjs` generalises to a catalogue-driven
  analyzer over Components, Blocks and Pages (not the five blocks only),
  emitting `item-meta.json`, and ticket 10's demo registry
  (`scripts/generate-demos.mjs`) reuses the same `classifyClient` and
  import-walk logic to carry the per-demo `client` flag. One detector, three
  consumers (items, demos, the section-index aggregate).
- The walk is kept as-is: resolve real imports (exports map, then
  `module`/`main`/`index`), never grep a package directory; an unresolved
  specifier sets `verified: false` rather than counting as safe.
- **Published in the docs:** every per-item page states "client JavaScript: 0 B"
  or names the file and signal that forces the boundary; the section index and
  the Foundations/Motion pages carry the aggregate. The old repository's
  "zero client components" claim becomes a per-item published number rather than
  a one-time assertion.
- **Report-only for the number; the claim is gated.** The analyzer reports and
  exits 0 (a moved dependency must not fail a build). Separately,
  `scripts/check-item-claims.mjs` fails if the docs assert "zero client
  JavaScript" while `summary.allServer` is false — a false headline is the thing
  that should fail, not a dependency version bump.

### 9. Build determinism

**Keep the build-twice byte comparison.** It applies to the corpus package's
artifacts (`llms.txt`, `llms-full.txt`, the mirror tree, the store,
`data.json`) and to `packages/tokens/dist` including `dist/dtcg/**`. Run the
build into two temporary output directories and compare every file byte for
byte; any difference fails. Rationale, stated because it is the reason the gate
exists: the corpus artifacts are meant to be diffable in review, and the DTCG
projection is a property of the token source; a non-deterministic artifact makes
both the drift gate and review trust worthless. Ticket 12's question about
whether the comparison is kept is answered yes here.

### 10. What a green build proves

Stated honestly, because the gate list must not imply more assurance than it
delivers:

- **It does not prove the design looks right.** Visual regression is report-only
  (Q11); even when it fails, the build does not.
- **It does not prove accessibility.** Automated checks cover about a third of
  real defects (Q5). Tab order, focus visibility in a real browser,
  screen-reader output, reduced-motion behaviour, and composited/alpha/backdrop
  contrast are not covered.
- **It does not prove real rendered contrast.** The token gate checks listed
  pairs at resolved values; it does not composite alpha, `color-mix`, `/50`
  modifiers, gradients or overlay contexts. The repo's own recorded focus-ring
  episode (gate said 4.5:1, half-alpha composited to 1.96:1) is the proof that
  the gate and a browser can disagree.
- **It does not prove a consumer's integration.** Tailwind collision, a
  consumer's own `@source`, their bundler, SSR/hydration in their Next app, and
  `Prerender`/RSC boundaries are outside every gate here.
- **"Zero client JavaScript" means "no statically detectable client boundary".**
  The analysis is lexical: it can over-approximate, and it cannot see a
  computed `import()`/`require` or a directive assembled at runtime.
- **The motion and semantic-utility gates are textual.** A duration computed in
  JS or a custom property assembled at runtime can slip past a grep.
- **The dash gate covers em/en dashes and the `???` pattern only, in the listed
  files.**
- **The registry validator proves internal consistency, not installability.**
  The tarball verifier proves contents, not runtime compatibility.
- **No byte budget is enforced for `styles.css` or emitted component JS.** The
  client analyzer measures source, not the compiled bytes a consumer downloads;
  a `styles.css` gzip budget is the strongest candidate for a future fail gate
  and is not adopted here.
- **No cross-browser or cross-engine testing.** jsdom is not a browser; the
  visual job is Chromium only.
- **A passing suite proves the assertions passed, not that they were the right
  assertions.** The suite is new.

### 11. Visual regression

**Adopt it now, as a report-only job, on the site's rendered demos, with a
written promotion rule.** It is not deferred: the condition the old map set (the
library carries UI worth snapshotting) is met, and a non-blocking job is not
premature.

- **Tool:** Playwright's `expect(page).toHaveScreenshot()`. A new
  `apps/site/e2e/visual.spec.ts` (or `scripts/visual-regression.mjs` driving
  `playwright test`) runs against the built `out/` served statically.
- **Viewports:** a fixed set — `390x844`, `768x1024`, `1440x900`.
- **Modes:** light and dark for each viewport (`data-pack`/`.dark` driven, the
  ticket 07 axes).
- **Routes:** `/`, `/components`, one component item page, one block item page,
  `/themes` (which also renders all five packs and is the descendant-scoping
  surface), `/foundations`.
- **Baselines** are committed under `apps/site/e2e/__screenshots__/`, with
  `maxDiffPixelRatio: 0.01`.
- **CI:** a `visual` job in `ci.yml` after `verify`, `continue-on-error: true`,
  uploading the diff images as an artifact and posting/updating one PR comment.
  It reports; it does not fail.
- **Determinism controls,** because otherwise a report-only job becomes noise: a
  fixed `ubuntu-latest` runner, the ticket 10 self-hosted Inter (no network
  font), `reducedMotion: 'reduce'` and animations disabled, masked dynamic
  content, and a coarse-pointer project (`hasTouch`) that also makes Q4's 44px
  floor a real browser check.
- **Promotion rule, written down:** once the baseline has been stable for
  **two consecutive weeks with no unexplained diff** (target: 10 consecutive
  merges), remove `continue-on-error` and make the job required. Any unexplained
  diff resets the clock. Promotion is an operational step recorded here, not a
  new decision ticket.
- **If it had been deferred,** the decision would return at the point the site
  has a stable visual baseline and a second contributor; that is recorded so the
  alternative is explicit. It is not the chosen path.

This closes the map's "Visual regression" fog entry; the map's "Not yet
specified" list no longer holds an open visual-regression decision.

### Ticket 10's four gates, absorbed

1. **Search gzip budget — fail.** `apps/site/scripts/check-search-budget.mjs`
   runs in `postbuild`, gzips `out/api/search` with `node:zlib`, and fails above
   **300 KiB gzipped**. It fails rather than reports because a multi-megabyte
   search payload shipping quietly is exactly the failure it exists to force.
2. **Demo `client`-flag measurement — report, published.** The generated demos
   registry carries `{ component, source, client }`, measured by the Q8 analyzer
   and stated on each item page. Report-only; the "zero client" headline is
   gated separately (Q8).
3. **`run_worker_first` globs versus `MD_SECTIONS` — fail.**
   `apps/site/scripts/check-worker-globs.mjs` (or a Vitest test) parses
   `wrangler.jsonc`, derives `/<section>/*.md` from the exported `MD_SECTIONS`,
   and fails if the two sets differ (plus the `/mcp`, `/mcp/*` entries). It
   fails because a mismatch is the silent-404 mechanism the recorded lesson
   warns about.
4. **Registry JSON never reaches the site export — fail.** Asserted in the
   registry validator (Q6) and again in `postbuild`: `packages/ui/registry.json`,
   `packages/ui/components.json` and `packages/ui/public/r/**` are absent from
   `apps/site/out/**`, and absent from every published tarball
   (`verify-tarballs.mjs`). Fails because a leaked internal artifact is a public
   claim about a lane that does not exist.

### Handed to implementation (no new decision ticket)

- **05/07:** move the validator, add the exported-file-list and `components.json`
  checks, add the `public/r` isolation assertion.
- **06/18:** delete `build.mjs:439-488`; add
  `packages/tokens/test/emitted-contract.test.mjs` (ticket 06's rules plus
  ticket 18's groups plus the motion/typography and zero-overshoot assertions);
  add `scripts/check-motion.mjs` and `scripts/check-elevation-layout.mjs`; tighten
  `check-contrast.mjs` so a missing required pair is an error.
- **09/10:** `item-meta.json` and the demo `client` flag; publish both; add
  `scripts/check-item-claims.mjs`, `check-search-budget.mjs`,
  `check-worker-globs.mjs`.
- **11/12:** extend the dash gate's `ROOTS`/`GATED` and add the `???` pattern;
  keep the build-twice comparison in the corpus `check`; add the per-item mirror
  and store-coverage gate.
- **13:** the ≥20-test floor including in-memory and Worker protocol
  round-trips.
- **16:** ensure `gates` runs `pnpm test` (it does) and that the visual job is
  report-only at launch.
- **Docs (14):** record the Q6 `base-nova` finding, the Q10 "what a green build
  proves" list, the Q11 promotion rule, and the dash gate's coverage list.
