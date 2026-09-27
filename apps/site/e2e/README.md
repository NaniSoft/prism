# Visual regression

Report-only Playwright screenshots of the built site. The job is
`continue-on-error: true` in `../../.github/workflows/ci.yml`; it uploads the
report and posts one pull request comment, and it does not fail the build.

## Promotion rule

Once the committed baseline has been stable for **two consecutive weeks with no
unexplained diff** (target: ten consecutive merges), remove `continue-on-error`
from the `visual` job and make it required. Any unexplained diff resets the
clock. This is an operational step, not a new decision ticket.

## Coverage

- Viewports 390x844, 768x1024, 1440x900, each in light and dark, plus a
  coarse-pointer project (`hasTouch`) that is the only real browser check of the
  44px target floor.
- Routes: `/`, `/components`, `/components/button`, `/blocks/hero-01`,
  `/foundation`, `/foundation/themes` and `/changelogs`. That is the landing
  page, a catalogue index, one Item of each kind, the Section whose route was
  renamed, the Section the live reader joined, and the Section the restructure
  added. The forty-two Item routes are not sampled individually: their slugs did
  not move, and one Item of each kind carries that coverage.
- Baselines are committed under `__screenshots__/`, compared with
  `maxDiffPixelRatio: 0.01`, `reducedMotion: 'reduce'` and animations disabled.
- A baseline is keyed by its Section's own route segment, so renaming a Section
  renames its images instead of orphaning them. `/foundation` replaced
  `/foundations`; `/foundation/themes` keeps the bare `themes` slug because it is
  a page of the Foundation Section rather than a Section of its own.

## The 768 project runs but has no committed baseline

Every route is still screenshotted at 768, and no baseline is committed for
that width, because the header row does not fit it.

At 768 the horizontal navigation is on screen by design: `SiteNav` is
`hidden items-center gap-1 md:flex`, `md` is 768, and `display.spec.ts` asserts
that it computes to `flex` there. The row then carries the wordmark, seven
Section links, the search entry and the two theme controls, and it computes to
1013 pixels. `document.documentElement.scrollWidth` is 1013 against a
`clientWidth` of 768, so the document scrolls 245 pixels sideways, the wordmark
wraps onto two lines and the mode toggle sits off screen. Every route measures
the same, the landing page included, so the overflow is in the header and not in
any one page.

This is not a long-standing defect. Before the cascade layers landed the
navigation was `display: none` at every width, so the row was never asked to fit
at 768 and every 768 shot was 768 pixels wide; the branch base renders all
forty-two of them pixel-exact. The overflow is what became visible when the
header started rendering, and it belongs with the header.

Committing a 1013 pixel image as the expected look at 768 would make the next
run pass and take the evidence with it, so those shots are left uncut and the job
keeps reporting them. Cut them when the header fits.

`toHaveScreenshot()` writes a baseline that does not exist, in CI as well as
locally, so the fourteen 768 files reappear in the working tree after every run.
A `.gitignore` beside them keeps them out of the commit set.

## Running locally

```sh
pnpm --filter @nanisoft/site build
pnpm --filter @nanisoft/site exec playwright install chromium
pnpm --filter @nanisoft/site run visual
```

Regenerate a baseline after an intended change with
`pnpm --filter @nanisoft/site run visual -- --update-snapshots`, then review the
PNG diff before committing it.

## If the browsers cannot be installed

The config, the spec and the CI job are committed regardless. Until a runner has
the Chromium build, the first `visual` run writes the actual screenshots as new
baselines and reports a mismatch; the job stays report-only, so the build is
unaffected.

## Baseline portability

`snapshotPathTemplate` omits the platform suffix, so one committed set serves
every runner. The current set was generated on Windows. If the ubuntu CI runner
rasterises differently enough to exceed `maxDiffPixelRatio: 0.01`, the report-only
job surfaces it and the canonical set is regenerated on ubuntu with
`--update-snapshots`.
