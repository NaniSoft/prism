# Asset contract: how media is governed in Prism

An image, an icon and a font are the same kind of decision as a colour: if a
consumer draws it, the system has two sources of truth. Every asset in the
package is therefore one of ten categories, carries one of eleven
presentations, and is recorded in the registry with the dimensions and the
budget it was judged against. A consumer never authors an entry; a new reusable
visual requirement arrives upstream, is drawn from approved tokens, and is
registered. When Prism lacks a presentation, the request is made here and
nothing is drawn locally.

The contract is two files. The authored registry is
`packages/ui/src/assets/asset-manifest.json`, the same file the build copies to
`dist/assets/manifest.json` a consumer imports as
`@nanisoft/prism-ui/assets/manifest.json`. The types, the closed vocabulary
and the arithmetic live in `packages/ui/src/assets/index.ts`, exported from
`@nanisoft/prism-ui/assets`. The JSON Schema beside the manifest is the
editor's shape; the gates are the enforcement.

## Presentations

A presentation is a ratio, an object fit and a maximum rendered size. The
ratio is the `--aspect-*` token, the height is the `--media-*` token, and the
width is the fluid column whose maximum is its container (`--container-page`
72rem, `--container-overlay-media` 64rem). `intrinsic` and `asset-defined`
presentations carry no ratio because their size is information the asset
contains, not the system.

| Presentation | Ratio | Fit | Max rendered |
| --- | --- | --- | --- |
| hero | 16 / 9 | cover | 1152 x 420px |
| wide-hero | 21 / 9 | cover | 1152 x 493px |
| banner | 3 / 1 | cover | 1152 x 160px |
| card | 4 / 3 | cover | 800 x 600px |
| landscape-thumb | 16 / 9 | cover | 400 x 225px |
| square-thumb | 1 / 1 | cover | 400 x 400px |
| avatar | 1 / 1 | cover | 64 x 64px |
| product | 1 / 1 | contain | 800 x 800px |
| logo | intrinsic | contain | 320 x 128px |
| illustration | asset-defined | contain | 800 x 800px |
| icon | 1 / 1 | contain | 48 x 48px |

Additional presentations are new `--aspect-*` and `--media-*` tokens drawn
upstream, never a consumer class.

## Budgets and source quality

Budgets are ceilings in KiB, not targets. A complex illustration past its
ceiling ships with a written `exception` on its entry. Quality never bends to
meet a number without being said out loud.

| Asset | Budget | Recommended source |
| --- | --- | --- |
| small icon svg | 10 KiB | vector, 48px canvas at 2x |
| standard svg illustration | 50 KiB | vector |
| card image | 200 KiB | at least 800px on the longer edge |
| banner image | 300 KiB | at least 1440px wide |
| hero image | 500 KiB | 1920 x 1080 or higher (2560 x 1080 wide) |
| thumbnail | 100 KiB | at least 400px on the longer edge |
| font file per weight/subset | 150 KiB | shipped faces are ~23 KiB each |
| logo | 50 KiB | prefer svg, otherwise 2x rendered size |

The minimum source for a raster surface is the maximum rendered size times the
device pixel ratio, on both axes: a 400px surface on a 2x display needs an
800px source. `minimumSourcePx` in the assets module is that arithmetic;
`validateRasterSize` is the runtime half used for externally hosted and
user-uploaded images, where no manifest entry exists and no build gate can run.

Supported formats are woff2 for type, png/svg/ico for shipped package files,
and webp/avif with a raster fallback for content images. Ship responsive
`sources` for a content image and name the format on the entry.

## The registry

Each entry answers, together: `id` (kebab-case), `path` (package-relative;
a fragment after `#` names an export for a component-derived mark),
`category`, `format`, `intrinsicWidth/Height` (measured), `aspectRatio`,
`fileSizeBytes` (measured), `allowedVariants`, `minSource`,
`maxRenderedWidthPx/HeightPx`, `devicePixelRatio`, `themeAware`,
`themeRestrictions`, `budgetKiB`, `role` (ui-icon, brand-logo, decoration,
complex-diagram, content, font), `license`, `alt` and `exception`.

Fonts ship beside their licence. The five family marks are component-derived
logos at `src/components/ui/product-marks.tsx#<Mark>`, theme aware through
their token classes. The Prism favicon family is a fixed-color brand logo with
its exemption written on the entry: a favicon renders in browser chrome, where
the token cascade does not run.

To add an asset: drop the file where its category belongs, add the entry with
the measured size, set its budget to the category ceiling, and run the three
gates. An entry without a file is a finding, a file without an entry is
invisible to every gate, and a size that disagrees with the file is a finding
that names both numbers. These are build failures, not review notes.

## SVG and icon governance

A UI icon, a brand logo, a decorative illustration and a complex diagram are
four roles with four contracts. They are not four names for one rule.

A UI icon paints in `currentColor` or in semantic token classes over a
`viewBox`, carries no `<script>`, no `on*` handler, no external `href`, no
embedded `<style>`, and no painted hex literal. A brand logo may carry fixed
colour only under a written exemption. A decorative illustration is
`aria-hidden` and carries its ratio as information. A complex diagram keeps
its own canvas and describes itself in words rather than through its pixels.

## Gates

Three gates ship with the new subpath and run in the package `check`:

- `check-asset-metadata` (Gate C): every entry names a file that exists, fits
  its budget, and carries the dimensions the manifest records. PNG IHDR and
  SVG viewBox are read from the file, never from the entry.
- `check-asset-resolution` (Gate D): every raster source clears its rendered
  maximum at 2x on both axes, and a recorded `minSource` agrees with that
  arithmetic.
- `check-svg-security` (Gate E): no svg carries executable markup, external
  references, or an unexempted painted literal.

Each gate has positive and negative fixtures in
`packages/ui/test/asset-gates.test.tsx`, and each prints what it read, so a
clean run over an empty tree is a finding rather than a quiet pass.

Distribution isolation is the companion proof, run as
`pnpm test:clean-consumer` and wired into the CI `verify` job: the script
packs the tarballs, scaffolds a Vite CSR app and a Next.js static-export app
outside the repository, installs only the tarballs, and builds both with no
consumer tooling (no Tailwind, PostCSS, Sass, or custom stylesheet). The
consumer builds assert the governed CSS and the shipped faces reach their
bundle; the font URLs stay relative to the emitted stylesheet, so asset URLs
resolve against the package rather than the consumer origin.
