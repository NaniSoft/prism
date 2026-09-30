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

**These baselines were re-cut wholesale**, because the landing page was
recomposed, the header row was re-spaced, the documentation rail moved onto the
`sidebar` token family and the catalogue index went from a grid of cards to a
list of rows. Every one of those is an intended change to every route, so a
per-route diff review had nothing to separate the intended from the accidental.
The two lanes that can catch an accidental one, `display.spec.ts` and
`header-fit.spec.ts`, are green, and `check-utility-cascade.mjs` is green on the
rebuilt stylesheet.

## The 768 project is committed like every other width

All seven routes are screenshotted at 768 in both Modes, and those fourteen
baselines are committed, because the header fits at 768 now.

They were not committed before, and why is worth keeping, because neither lane
that watches this width could see the defect on its own. The header's horizontal
navigation was on screen from `md` up, `md` is 768, and the row carries the
wordmark, the Section links, the search entry and the two theme controls.
Measured, that content needed 1085 pixels of viewport at its old spacing, so at
768 the document scrolled sideways, the wordmark folded onto two lines and the
mode toggle sat off screen. Every route measured the same, the landing page
included, so it was the header and not any one page.

The row now switches at `lg` (1024), the same threshold the documentation sidebar
switches at, and `MobileMenu` carries every Section from `sm` up. So at 768 the
document no longer scrolls sideways and no control is off screen, and the change
is a no-op at 390, 1024 and 1440.

## Nine Sections, and the row that has to hold them

The Section manifest has grown since the row was measured: **Patterns** and
**Live** joined Overview, Foundation, Content, Components, Blocks, Pages and
Changelogs, so the row carries nine links rather than seven. Nothing about the
layout changed when they arrived, and the consequence is that the row stopped
fitting at the threshold it switches at. Measured at 1024 with the old spacing,
its minimum content width was 1081 pixels against a 1024 pixel viewport: the
document scrolled 33 pixels sideways and the mode toggle sat off the right edge,
on every route, in both Modes.

**Three changes, measured, and none of them moves a label, an order or a
destination:**

| | before | after |
| --- | --- | --- |
| Section link padding | `px-3` (16px) | `px-2` (8px) |
| Gap between Section links | `gap-1` (4px) | `0` |
| The row's own gap | `gap-4` (16px) | `gap-2` (8px) |
| The word beside the search icon | present, `sm:inline` | gone |

The nine labels measure 687 pixels in total after the first two changes, the
wordmark folds to two lines and is 49 pixels wide, the three controls are 218,
and the row's own gutters are 72. That is about 1026 against 1024 at the exact
threshold, so the search trigger also lost its word: an icon with the
`aria-label="Search documentation"` it already carried, in a square pill the same
shape and size as the two controls beside it. `SearchEntry` records why that
trade was taken and what was rejected instead.

**The wordmark has since been shortened to "Prism", which returned about 50
pixels to the row at every width** because one short word does not wrap where
two did. That is a happy accident of the change rather than a reason for it: the
wordmark read "Design System" until it was renamed, which is the name of the
category the package is in rather than the name of the thing, and it is now the
same `SITE_NAME` constant the page title, the share card, the structured data and
the sitemap are built from. `layout.tsx` records it. The numbers above are the
worst case for the row and were measured before the rename, so they still hold.

**The wordmark is left elastic on purpose.** It is the one element in the row
that can yield, and it takes two lines rather than pushing the document sideways.
`whitespace-nowrap` on it would move the overflow rather than remove it, which is
the harm this lane exists to catch, so it is left wrappable.

**What watches it.** `header-fit.spec.ts` sweeps 390, 640, 768, 1024 and 1440 in
both Modes on the landing page and on a documentation route, and asserts that the
document never scrolls sideways, that every header control is inside the
viewport, and that the affordance on screen is the one that width is designed for.
It also opens the disclosure at 640 and at 768 and asserts it carries every
Section **by comparing the rendered links against `TOP_NAV` rather than against a
count**. It asserted `7`, and the manifest had already moved to nine, so the
assertion had been describing a roster the site stopped publishing and would have
failed the next time anyone ran the lane.

`display.spec.ts` answers which affordance is on screen at a project's width and
cannot answer whether the row fits: the row computed `display: flex` at 768 while
it was 1013 pixels wide, and that assertion passed the whole time. Its
header-label lane was rewritten for the same reason: it counted two `sm:inline`
labels, and there is one now.

## Running locally

```sh
pnpm --filter @nanisoft/site build
pnpm --filter @nanisoft/site exec playwright install chromium
pnpm --filter @nanisoft/site run visual
```

Regenerate a baseline after an intended change with
`pnpm --filter @nanisoft/site run visual -- --update-snapshots`, then review the
PNG diff before committing it.

**Use `--update-snapshots=all` when a change is smaller than the tolerance, and
know that it happened.** Playwright writes a snapshot only where the comparison
*failed*, so a change the tolerance declares matching is not re-cut, and the
committed baseline keeps the old pixels while the lane reports green. That is not
hypothetical: renaming the wordmark from "Design System" to "Prism" rewrote about
700 pixels of a 1440x2900 full-page shot, which is 0.02% against a
`maxDiffPixelRatio` of 0.01, so `--update-snapshots` left all forty-nine baselines
untouched and the run reported 114 passing. `--update-snapshots=all` re-cuts
unconditionally and is the right flag for a change you already know is intended
and too small for the comparison to see.

The general form, because it is what makes this lane's promotion rule worth
anything: **this lane cannot see a change to the header, on any route, at any
width.** Every screenshot is `fullPage`, so a 56 pixel band is a rounding error
against a page three thousand pixels tall. `display.spec.ts` and
`header-fit.spec.ts` are the lanes that hold the header, and they read computed
values and measurements rather than pixels for exactly that reason. Read them as
the header's gate and this one as the body's.

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
