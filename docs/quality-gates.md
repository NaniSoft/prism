# Quality gates

This document records what the gate set asserts, which gates fail and which only
report, and what a green build does not prove. It is the honest companion to
`pnpm check`; the executable truth is the scripts themselves.

## Fail or report

One rule decides every split below: a check fails when its failure would let a
consumer-facing claim be false or a consumer's install break. A number whose
threshold is a judgement, or a measurement that informs a human decision,
reports and is published.

| Package | Fails the build | Reports only |
| --- | --- | --- |
| `prism-tokens` | contrast gate, emitted-contract, the `: undefined` read-back, the per-theme key-set guard, motion, elevation and layout, build-twice determinism | the two advisory contrast pairs (border and input) |
| `prism-ui` | surface scan, registry validator (registry and published file list), the component suites, the axe suite, the JSDoc and catalogue checks, the two source grep gates | per-item client-JavaScript measurement, the demo `client` flag |
| `prism-llms` | corpus drift, build-twice determinism, per-item mirror and store coverage, the store type round-trip, the declared output list | corpus freshness stamp |
| `prism-mcp-server` | the protocol round-trip suite, tool registry equals the corpus, the bundled `data.json` hash | corpus freshness |
| `@nanisoft/site` (private) | dash gate, search gzip budget, `run_worker_first` equals `MD_SECTIONS`, registry artifacts absent from `out/` | visual regression, per-item client measurement |

## The client-JavaScript budget

`packages/ui/scripts/check-client-budget.mjs` bundles each emitted
`dist/components/ui/<name>.js` and its Base UI subtree tree-shaken, minified and
gzipped. React, React DOM, the shared floating engine and the shared class-merge
utility are the runtime every client component already pays for and are excluded
from the measured figure. Per-item sizes are compared to ticket 19's budgets and
reported. The deduplicated all-client bundle is compared to the 90 KB gzip
ceiling and fails.

At the time of writing the measured all-client bundle is **89.7 KB**, within the
ceiling, and the same bundle with the shared runtime included is 105.6 KB. Most
per-item figures exceed ticket 19's estimates because `@base-ui/react@1.8.0`
and `tailwind-merge` are larger than the ticket assumed; those are reported and
do not fail. The gate prints both figures so the number is auditable.

## Accessibility coverage

Two automated checks run. `packages/ui/test/a11y.test.tsx` runs axe-core over
every rendered component in jsdom and fails on violations. The report-only
Playwright job runs `@axe-core/playwright` in a real browser, which is the only
place the `color-contrast` rule can evaluate.

axe catches roughly **one third** of real accessibility defects. It reliably
catches missing accessible names, invalid ARIA, broken roles, duplicate ids and
missing form labels. It does not catch tab order, keyboard traps, focus-visible
visibility, screen-reader announcement quality, reduced-motion handling, the
semantics of a composite widget in operation, or contrast of composited, alpha,
backdrop or gradient layers. The keyboard and focus assertions in the component
suites and the token contrast gate cover parts of that list; the rest is named
below. The site's accessibility claim is therefore gated by axe plus the
keyboard and focus suite plus the token contrast gate, and is still not a proof
of accessibility.

## Visual regression

`apps/site/e2e/visual.spec.ts` runs Playwright's `toHaveScreenshot()` over the
built site at 390, 768 and 1440 pixels, light and dark, on `/`, `/components`,
one component item, one block item, `/themes` and `/foundations`, with committed
baselines and `maxDiffPixelRatio: 0.01`. The job is report-only
(`continue-on-error: true`) and uploads the report as an artifact and one pull
request comment.

Promotion rule: once the baseline has been stable for two consecutive weeks with
no unexplained diff (target: ten consecutive merges), remove
`continue-on-error` and make the job required. Any unexplained diff resets the
clock.

## What a green build does not prove

The gates are new, so a green build proves the gates ran, not that the system is
free of these defects.

- It does not prove the design looks right. Visual regression is report-only;
  even when it fails, the build does not.
- It does not prove accessibility. Automated checks cover about a third of real
  defects, as above.
- It does not prove real rendered contrast. The token gate checks listed pairs
  at resolved values; it does not composite alpha, `color-mix`, `/50` modifiers,
  gradients or overlay contexts. The recorded focus-ring episode (the gate said
  4.5:1, half-alpha composited to 1.96:1) is the proof that the gate and a
  browser can disagree.
- It does not prove a consumer's integration. Tailwind collision, a consumer's
  own `@source`, their bundler, SSR and hydration in their app, and prerender or
  RSC boundaries are outside every gate here.
- "Zero client JavaScript" means "no statically detectable client boundary".
  The analysis is lexical: it can over-approximate, and it cannot see a computed
  `import()` or a `require` assembled at runtime.
- The motion and semantic-utility gates are textual. A duration computed in
  JavaScript or a custom property assembled at runtime can slip past a grep.
- The dash gate covers em and en dashes and the `???` pattern only, in the
  listed files.
- The registry validator proves internal consistency, not installability. The
  tarball verifier proves contents, not runtime compatibility.
- No byte budget is enforced for `styles.css`. The client analyzer measures
  source, not the compiled bytes a consumer downloads; a `styles.css` gzip
  budget is the strongest candidate for a future fail gate and is not adopted.
- There is no cross-browser or cross-engine testing. jsdom is not a browser, and
  the visual job is Chromium only.
- A passing suite proves the assertions passed, not that they were the right
  assertions. The suite is new.
