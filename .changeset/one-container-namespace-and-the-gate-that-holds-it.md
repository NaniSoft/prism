---
'@nanisoft/prism-tokens': minor
'@nanisoft/prism-ui': minor
---

There is one container namespace, and `max-w-6xl` no longer resolves

**If you wrote `max-w-6xl`, `max-w-2xl`, `max-w-xl`, `max-w-lg`, `max-w-md`,
`max-w-sm` or `max-w-5xl` against this package, that class now produces no rule at
all.** Nothing errors and nothing warns: the element simply loses its cap and lays
out at whatever its parent gives it. Grep your own repository for `max-w-` before
you upgrade. The replacements are in the list below and every one of them resolves.

The reason is the defect this release ends. `@nanisoft/prism-tokens` authors three
container widths and Tailwind ships thirteen of its own, and until now both shipped
in the same stylesheet. Three of Tailwind's were numerically identical to three of
ours: its largest at 72rem beside `--container-page`, its fifth at 42rem beside
`--container-measure`, its fourth at 36rem beside `--container-measure-narrow`.
Nothing rendered differently, so nothing failed and every gate was green. What it
cost was that one width had two names, and the first retune of an authored token
would have moved every surface reaching it by one spelling and left every surface
reaching it by the other exactly where it was. `Section`, `SiteHeader`,
`SiteFooter`, `ChartCard01`, `DocsShell` and `QuickView01` all used the Tailwind
spelling of the page column; `Cta01` and `SectionHeading` used the Tailwind
spellings of the two measures.

The token build now closes the whole namespace, with
`--container-*: initial` ahead of the authored entries rather than a list of the
seven steps that happened to be emitted. A wildcard is the load-bearing word: the
thirteen names it retires are `3xs 2xs xs sm md lg xl 2xl 3xl 4xl 5xl 6xl 7xl`,
and a list would have been a second list to keep in step with a dependency's
default theme, which is the event the line exists to survive. Order matters and is
asserted: Tailwind resolves a theme in source order, and the same declaration
written after the authored entries clears all eight of ours and ships no container
at all.

**What to write instead**

| You wrote | Write | Value |
| --- | --- | --- |
| `max-w-6xl` | `max-w-page` | 72rem |
| `max-w-2xl` | `max-w-measure` | 42rem |
| `max-w-xl` | `max-w-measure-narrow` | 36rem |
| `max-w-md` on a dialog or an alert | `max-w-overlay-dialog` | 28rem |
| `max-w-lg` on a form dialog | `max-w-overlay-form` | 32rem |
| `max-w-xl` on a command palette or a search | `max-w-overlay-palette` | 36rem |
| `max-w-sm` on a side sheet or a drawer | `max-w-overlay-panel` | 24rem |
| `max-w-5xl` on a lightbox | `max-w-overlay-media` | 64rem |

**An overlay's width is a property of the kind of surface it is, not of the page
grid underneath it**, and that is why the five overlay widths are authored rather
than carried on a Tailwind name. A retune of the reading measure must not move a
dialog and a retune of the page column must not move either, so the two families
are named apart inside the one container group. They share a group because
Tailwind 4's `max-w-*` resolves `--spacing-*` and `--container-*` and nothing
else, so a maximum width that is to be a token has to live in one of those two
namespaces or it is a value written in a Component. `overlay-palette` and
`measure-narrow` are both 36rem; that is two measurements that happen to agree and
not one measurement with two names, and the token source says so and the emitted
contract holds it to saying so.

**Nothing is supposed to change where you can see it.** Every migration above
preserves the exact rendered width, so a page that only consumed this stylesheet
looks the same before and after. What changes is the next retune: it now moves one
surface rather than half of them.

**A width that was arithmetic on the spacing base is left alone, deliberately.**
`max-w-96`, `max-w-72`, `max-w-64`, `max-w-32` and `max-w-20` resolve to
`calc(var(--spacing) * N)` and never touched the container namespace at all. They
are how a chart's axis band, a token table's column and a documentation frame are
sized, where nobody took a decision and naming one would invent it. They stay.

**Two gates now hold this down, because the question has two sides.**
`scripts/check-elevation-layout.mjs` reads every `w-*` and `max-w-*` name out of
the class strings and holds it to the container group read out of the token source,
so a width nobody authored is a finding with a file and a line; it reads
`apps/site/items` as well as `apps/site/src` and `packages/ui/src`, because that is
where the documentation Demos live and where the site's own build scans.
`packages/ui/scripts/check-container-namespace.mjs` reads the built stylesheet and
holds the artefact: that the theme block declares exactly the authored containers,
that none of Tailwind's thirteen steps is declared or read, that the close is
written ahead of the entries rather than after them, and that every container width
this package writes is emitted as a utility reading its own variable. It reads the
step list out of the installed `tailwindcss/theme.css` rather than restating it, so
a dependency that adds a step is covered without an edit. Tailwind's extractor
reads this package's comments as well as its code, so a retired class name written
down in a JSDoc block used to emit a utility; there is now a rule about that too.

**The bump is `minor` rather than `major`, and the argument is the version line
rather than the severity.** A class a consumer wrote stops producing a rule with no
error, which is breaking by any ordinary reading, and this entry says so plainly.
`major` in this repository publishes `1.0.0`, and every release to date has been
`minor` on a `0.y.z` line where the `y` is already the breaking-equivalent slot.
Publishing 1.0.0 with this change in it would assert an API stability guarantee
this library has not earned, and it would be the first release in the project's
history to use the bump at all. The break is real and is the subject of this
entry; the number it lands on is the line's decision and the line is pre-1.0.

**One collateral repair on the documentation site, recorded here because it is
why `globals.css` moved.** The site's own build and this package's meet in one
`utilities` layer, and this package emits a bare `.grid-cols-6` as the base of the
`lg:` variant four of its Blocks use. That bare rule landed after the site's
`sm:grid-cols-11`, so every colour ramp on the Foundations page was drawing six
columns at every width above 640 against a comment beside the class saying
eleven. Whether `check-utility-cascade.mjs` saw it depended on which order two
content-hashed CSS chunks sorted in, which this change perturbed and which nothing
about the tree controls. Neither side is wrong, so the site's variant is restated
in the `site-variants` layer that already exists for six other collisions. The
repaired behaviour is on the documentation site only; nothing in this package
changes.
