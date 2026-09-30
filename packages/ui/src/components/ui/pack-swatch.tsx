import type { ComponentProps, ReactNode } from 'react'

import type { PackId } from '../../theming'

import { cn } from '../../lib/utils'

/**
 * The three sizes a swatch is drawn at.
 *
 * A swatch sits in a list of packs or in a row of them, and the three are the
 * sizes a list of six needs: beside a name in a settings row, on its own in a
 * pack chooser, and as the whole of a preview card. Sized through `className`
 * instead, a swatch would be a size the layout owns, and `className` is layout
 * only on every Component in this package.
 */
const SIZES = {
  sm: { frame: 'size-6' },
  md: { frame: 'size-8' },
  lg: { frame: 'size-12' },
} as const

/** The props a `PackSwatch` takes. */
export type PackSwatchProps = Omit<ComponentProps<'span'>, 'children'> & {
  /**
   * The pack the swatch previews.
   *
   * Carried on the element as a `data-pack` boundary, which is the whole
   * mechanism: the attribute re-points the pack's tokens for this element and its
   * subtree, so the swatch wears the pack it is showing rather than the pack the
   * page happens to be in. A swatch that took its colours from a prop instead
   * would need the pack's ramp values as props, and those are generated per pack
   * by the token build, so a Component cannot hold them and a consumer cannot
   * pass them.
   */
  pack: PackId
  /**
   * The swatch's accessible name, which is the pack's own name.
   *
   * Required, and it is a `string` rather than a node because the swatch is a
   * picture and a picture's name is a string. The swatch carries no text of its
   * own, so without this a screen reader meets an element that looks like a
   * figure and says nothing, and a row of six of them is six unidentified marks.
   */
  label: string
  /**
   * Whether the swatch draws the pack's dark mode beside the mode the page is in.
   *
   * On by default, because a pack is two axes and a swatch that shows one of them
   * is half the answer. A pack's light and dark values are not the same palette
   * with the brightness turned down: the dark mode re-points a dozen roles, and a
   * reader choosing a pack has to see both or they are choosing on the evidence of
   * one. Turn it off for a swatch that is a dot beside a name in a list where the
   * mode is already the page's, and pay for it: a reader then has to leave the row
   * to see what the other mode looks like.
   *
   * **What the flag can and cannot do is worth stating, because the name suggests
   * more than the contract allows.** The swatch always draws two halves: the one
   * the page is already in, and the dark mode, which the second half forces with
   * its own `dark` class. A boundary wears its ancestor's mode, so the first half
   * is dark on a page the reader has put in dark mode, and the two halves are then
   * the same. There is no flag that fixes that, and the reason is in the contract:
   * the token build publishes `[data-pack="<id>"]` for light and
   * `[data-pack="<id>"].dark, .dark [data-pack="<id>"]` for dark, and there is no
   * selector that forces light from inside a dark subtree. The alternative, reading
   * the two modes' compiled values out of the token package and painting them as
   * inline colours, is a Component holding resolved values, which stops moving
   * when a pack changes and is the exact defect the vector-ink gate exists to stop.
   * So a swatch shows what the cascade can express and says which half is which.
   *
   * @defaultValue true
   */
  showModes?: boolean
  /**
   * The drawn size of the swatch. @defaultValue 'md'
   */
  size?: keyof typeof SIZES
  /** A node after the sample, for a caller showing a name or a control beside it. */
  children?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A small preview of one pack, drawn on a surface that carries that pack's own
 * boundary.
 *
 * **The radius follows the pack, and that is not a bug in the sample.** DESIGN.md's
 * Theme Switching section says it in one rule: a `data-pack` boundary moves the
 * corner radius beneath it, because radius is the only non-colour member of a
 * pack block and the token build emits it the same way it emits colour. So
 * `--radius` resolves from the nearest ancestor carrying `data-pack` and the
 * whole scale from `--radius-sm` through `--radius-4xl` is derived from it by
 * multiplication, and the five packs range from 0.5rem to 1rem. A swatch that
 * showed only the colour would be a swatch that lied by omission: it would look
 * like a pack whose corners do not move, and a reader comparing a pack in a
 * chooser against a surface drawn in that pack would find two different shapes.
 * The swatch is therefore fully rounded, which is the one placement the boundary
 * law allows and the one place where a pack's radius is visible as itself: a disc
 * at the page's radius and a disc at the pack's radius are the same disc until
 * you put six of them in a row.
 *
 * **The boundary sits on a fully rounded element because that is what the law
 * permits, and the other two placements would each have been worse.** A boundary
 * belongs on a fully rounded element, on an element carrying no radius utility, or
 * on a shape with no radius concept, and on nothing else. A `rounded-lg` swatch
 * would be pinned to a scale step, and every step from `sm` to `4xl` is computed
 * from `--radius` by multiplication, so a `rounded-lg` carrying a pack boundary
 * is a card whose corners change with its colour: six swatches in a row, one per
 * pack, and five different corner radii. An element with no radius utility would
 * be square, which is a swatch that shows the pack's colour and hides the pack's
 * shape, which is the omission above. So the sample is a disc, and `rounded-full`
 * is a value no pack can move.
 *
 * **The sample is three semantic utilities and a rule, and it is a miniature of a
 * real surface rather than a colour chip.** A `bg-primary` band over a `bg-muted`
 * one, separated by a `border-border` hairline, is the smallest arrangement that
 * shows all three things a pack changes: the brand fill, the surface everything
 * else sits on, and the boundary between them. A single flat disc of `primary`
 * would show one of the three and would look identical across packs whose brands
 * are close, which is exactly the comparison a pack chooser exists to let a reader
 * make.
 *
 * **The two halves are the mode the page is in and the dark mode, and the second
 * one forces its own `dark` class.** The token build publishes the compound form
 * `[data-pack="<id>"].dark` and the descendant form `.dark [data-pack="<id>"]`, and
 * this is the second one: the dark half is a descendant of the boundary and
 * carries the mode class itself, so the same `data-pack` resolves both halves and
 * the dark one is dark whatever the page is doing. The class is on the half rather
 * than on the root because a root-level `dark` would put both halves in one mode,
 * and a swatch that claims to show two modes while showing one is a swatch lying
 * about the only thing it is for.
 *
 * **On a page the reader has put in dark mode, the two halves are the same, and
 * this Component does not pretend otherwise.** A boundary wears its ancestor's
 * mode: that is the rule DESIGN.md states, and the reason a server can render one
 * at all is that a server cannot know the reader's mode and therefore must not
 * guess. So the first half is whatever the page already is, and the token build
 * publishes no selector that forces light from inside a dark subtree, so there is
 * no arrangement of class names that makes a dark page show a light swatch. The
 * alternative is to read the two modes' compiled values out of the token package
 * and paint them as inline colours, and that is refused for a reason the gates
 * already hold rather than a preference: a resolved value does not move when a
 * pack changes, which is the whole of what `check-vector-ink.mjs` is for. The
 * consequence is written down rather than hidden, because a reader looking at six
 * swatches on a dark page will notice, and a Component that cannot answer "why are
 * these all the same" is a Component whose author has to.
 *
 * **`default` omits the attribute rather than setting it to `default`, and that is
 * the token build's own spelling of the base pack.** `default` is expressed by
 * the absence of `data-pack`, so a swatch for the neutral pack renders a
 * `data-pack="default"` and the browser matches no emitted rule against it: the
 * boundary would be present and inert, and every token beneath it would resolve
 * from whatever ancestor happened to carry a real pack. On a page wearing a pack
 * that is the worst of the two states, because a swatch claiming the neutral base
 * palette would be drawn in the page's palette and would be a swatch that is
 * confidently wrong. So the attribute is omitted, exactly as `ProductMark`
 * omits it for the same reason, and the base pack resolves from the page, which
 * is what a reader wearing no pack is wearing.
 *
 * **The swatch is a preview and not a control, and a caller who wants a control
 * wants `product-switcher.tsx`.** It renders no button, takes no click, holds no
 * state, and carries no `aria-pressed`: it is a `role="img"` with a name, which
 * is the honest role for a picture whose content is decorative and whose meaning
 * is its caption. A row of six of these is a legend, and making a legend's
 * entries into controls means the reader has to discover that the little discs
 * are clickable, that the current one is somewhere else on the page, and that
 * clicking one changes the page rather than the picture. `ProductSwitcher` is the
 * Component for that: it moves between a set of named things, marks the current
 * one with `aria-current`, and each member is a real link. The cost of this
 * decision is that a caller who wants a pack chooser has to build the chooser
 * around six images rather than getting one, and that is stated here because it
 * is the request this Component will most often get and the answer to it is
 * upstream, in a Component that owns the switching.
 */
function PackSwatch({
  pack,
  label,
  showModes = true,
  size = 'md',
  children,
  className,
  ...props
}: PackSwatchProps) {
  const drawn = SIZES[size]
  // `default` is the absence of a pack id, spelled the way the token build
  // spells it, so the base pack resolves from the page rather than from an
  // attribute that matches no emitted rule.
  const boundary = pack === 'default' ? undefined : pack

  return (
    <span
      data-slot="pack-swatch"
      data-pack={boundary}
      role="img"
      aria-label={label}
      className={cn(
        'border-border bg-background inline-flex shrink-0 overflow-hidden rounded-full border',
        drawn.frame,
        className,
      )}
      {...props}
    >
      {/*
       * The two halves, and the `dark` class is on the second one rather than on
       * the root. That placement is the mechanism: a `dark` class on the root
       * would put both halves in one mode, so the dark half has to be the element
       * that carries it and the other half has to be its sibling rather than its
       * child. The boundary stays on the parent, which is what lets one `data-pack`
       * resolve both.
       *
       * `inherited` and `dark` rather than `light` and `dark`, because the first
       * half is only light on a light page. A test can therefore tell which half
       * is which without reading the CSS, and a reader of the markup is not told
       * a mode the page has already decided.
       *
       * Each half is the same miniature: a `primary` band over a `muted` one,
       * because those are the two surfaces a reader meets first and the pair is
       * what makes two packs comparable. The hairline between the halves is the
       * third of the three tones, drawn with `border-border` so it moves with the
       * pack like everything else in here.
       */}
      <span
        data-slot="pack-swatch-mode"
        data-swatch-mode="inherited"
        className="border-border flex min-w-0 flex-1 flex-col overflow-hidden border-e last:border-e-0"
      >
        <span data-slot="pack-swatch-accent" className="bg-primary flex-1" />
        <span data-slot="pack-swatch-surface" className="bg-muted flex-1" />
      </span>

      {showModes ? (
        <span
          data-slot="pack-swatch-mode"
          data-swatch-mode="dark"
          className="border-border flex min-w-0 flex-1 flex-col overflow-hidden dark"
        >
          <span data-slot="pack-swatch-accent" className="bg-primary flex-1" />
          <span data-slot="pack-swatch-surface" className="bg-muted flex-1" />
        </span>
      ) : null}

      {children}
    </span>
  )
}

export { PackSwatch }
