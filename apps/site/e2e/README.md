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
  44px target floor. All three widths have committed baselines.
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

## The 768 project is committed like every other width

All seven routes are screenshotted at 768 in both Modes, and those fourteen
baselines are committed, because the header fits at 768 now.

They were not committed before, and why is worth keeping, because neither lane
that watches this width could see the defect on its own. The header's horizontal
navigation was on screen from `md` up, `md` is 768, and the row carries the
wordmark, seven Section links, the search entry and the two theme controls.
Measured, that content is 1005 pixels plus two 16 pixel gaps and the 48 pixel
container gutter, so the row needs 1085 pixels of viewport to sit on one line at
its designed size. At 768 it measured 1013 against a `clientWidth` of 768: the
document scrolled 245 pixels sideways, the wordmark folded onto two lines and the
mode toggle sat off screen. Every route measured the same, the landing page
included, so it was the header and not any one page.

The row now switches at `lg` (1024), the same threshold the documentation sidebar
switches at, and `MobileMenu` carries the seven Sections from `sm` up. So at 768
the document no longer scrolls sideways and no control is off screen, and the
change is a no-op at 390, 1024 and 1440.

**The residual, at the bottom of the `lg` band.** Between 1024 and 1085 the row
is up to 61 pixels short of its natural width, and the wordmark is the only
elastic element in it, so it takes two lines there. That is unchanged by the fix:
those widths rendered exactly that way before it, because the row was already on
screen at `md`. Closing the band would take either a threshold the token set does
not author (`xl` and `2xl` are closed in the emitted theme) or a re-spacing of the
row, and the second is a design change rather than a responsive one. So the
numbers are recorded here rather than only in a component comment.

## What watches the header fit

`display.spec.ts` reads the computed display of the navigation row and the mobile
menu once per project, so it answers which affordance is on screen at a project's
width and cannot answer whether the row fits: the row computed `display: flex` at
768 while it was 1013 pixels wide, and that assertion passed the whole time.

`header-fit.spec.ts` reads the measurements instead, sweeping 390, 640, 768, 1024
and 1440 in both Modes on the landing page and on a documentation route. It
asserts three things per width: the document does not scroll sideways, every
control in the header is inside the viewport, and the affordance on screen is the
one that width is designed for. It also opens the disclosure at 640 and at 768 and
asserts it carries all seven Sections, so the row moving to `lg` cannot quietly
cost a route.

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
