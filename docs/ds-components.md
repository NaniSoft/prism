# DS layout and media components

The governed media layer is eight components and the layout primitives two
more. Every one of them answers a question a consumer would otherwise answer
in a stylesheet: which ratio, which size, which glyph, which gap.

| Component | Job |
| --- | --- |
| `DSImage` | An image at one governed ratio, fit and maximum, with a fallback swap and lazy loading (client: it must notice a failed source) |
| `DSIcon` | A glyph from the closed registry at one of five sizes, in the ink around it |
| `DSLogo` | A brand logo at one of three heights, contained rather than cropped |
| `DSAvatar` | The governed person image: three sizes, initials when there is no picture |
| `DSIllustration` | An illustration at its own proportions, contained |
| `DSVideo` | A video at one governed ratio, with the browser's own controls |
| `DSMediaCard` | A card whose medium is `DSImage` at the card presentation |
| `DSStack` | A column whose gap is one of four governed steps |
| `DSGrid` | A grid whose counts are one of four and whose gap is one of three, one column at phone width |

## Audit note (Mission §9)

The existing catalogue was audited against the same rules the new layer is
held to: semantic tokens only (`check-variant-ink`, `check-vector-ink`,
`check-focus-indicators`), focus and keyboard (the shared axe and keyboard
suites), responsive variants (`check-breakpoint-variants`), and states
(loading through `Skeleton`/`Spinner`, empty through `EmptyState01`,
error through `Alert`/`FieldError`).

Known debt, stated rather than closed silently:

- `Gallery01` holds a `portrait 3/4` ratio that has no entry in the eleven
  presentations, so its tiles still go through `AspectRatio` numbers. A
  `portrait` presentation arrives upstream as a token when a second consumer
  needs it; until then the number is the governed alternative.
- `Lightbox` and `ImageZoom` keep their own `<img>` elements: each holds a
  required description and its own frame, and `Lightbox`'s thumbnails are
  decorative by design so the button's name is the description. They are the
  capped internal exceptions to the consumer rule "use `DSImage`".
- `VideoPlayer` remains the low-level video surface (`ratio` number, custom
  controls slot); `DSVideo` is the governed answer for a video a consumer
  presents at a publication ratio.
- Enterprise patterns (shell, navigation, dashboard, forms, tables, dialogs,
  drawers, notifications, empty/loading/error) ship today as `AppShell01`,
  `SiteNavbar`/`SiteHeader`, `DashboardPage`, `RecordForm01`, `DataTable01`,
  `Dialog`/`Sheet`/`AlertDialog`, `Drawer`, `Toast`/`Announcement`, and
  `EmptyState01`/`Skeleton`/`Alert` respectively. No new Blocks were needed for
  this phase.

## Consumer use

```tsx
import { DSImage } from '@nanisoft/prism-ui/components/ds-image'
import { DSIcon } from '@nanisoft/prism-ui/components/ds-icon'

<DSImage src="/assets/dashboard.webp" variant="hero" alt="Dashboard revenue by month" />
<DSIcon name="settings" size="lg" label="Settings" />
```

Every string a consumer writes is a prop: `alt`, `label`, `title`,
`description`. A consumer never names a dimension, a ratio number, a fit or a
gap: they are closed vocabularies, so a value outside them is a compile error
or a thrown diagnostic rather than a silent substitution. `className` on every
one of these components is layout only; it is not a width, a height or a fit.
