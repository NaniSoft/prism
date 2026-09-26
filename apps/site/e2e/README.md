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
  `/themes` and `/foundations`.
- Baselines are committed under `__screenshots__/`, compared with
  `maxDiffPixelRatio: 0.01`, `reducedMotion: 'reduce'` and animations disabled.

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
