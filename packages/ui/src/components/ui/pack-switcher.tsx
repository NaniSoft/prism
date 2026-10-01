'use client'

import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import type { ComponentProps, ReactNode } from 'react'

import { PackSwatch } from './pack-swatch'
import type { PackId } from '../../theming'
import { cn } from '../../lib/utils'

/**
 * One pack a reader may put the page into.
 *
 * The two facts Prism needs and the one it does not. The id is the machine value
 * and it is a `PackId` rather than a string, so a caller cannot offer a pack the
 * token build never emitted. The name is the words a reader reads beside the
 * mark, and it is the caller's because the word for a pack is the caller's: one
 * product says "Appearance", another says "Brand colour", and neither is Prism's
 * to pick. The description is Prism's least used field and it is the reason a
 * switcher can be a settings row rather than a row of discs.
 */
export type PackSwitcherPack = {
  /**
   * The pack id, taken from the published set in `@nanisoft/prism-ui/theming`.
   *
   * Required, and typed rather than a string so a caller who renames a pack or
   * spells it from memory gets a compile error instead of a button that switches
   * to a pack no emitted rule matches. Nothing is written to the document from
   * here: the id travels to the caller's `onChange` and the caller's handler is
   * what applies it.
   */
  id: PackId
  /**
   * The pack's name, in the words a reader of this product would use.
   *
   * Required, and a `string` because it is written into the `aria-label` of the
   * mark and an accessible name is a string. There is no default and no generated
   * name: the six packs Prism ships have no display name in the token source, so
   * a name here is a word somebody chose, and a Component that supplied one would
   * be shipping a word into a consumer's interface that the consumer cannot find
   * to change.
   */
  name: string
  /**
   * A sentence saying what this pack is, for a row that has room for one.
   *
   * Optional, and it makes the options taller, which is a real cost rather than a
   * free extra: a compact chooser in a site header passes none of these and gets a
   * row of chips, while a settings page passes them all and gets a list a reader
   * can choose from rather than discriminate between. Omitted, the option is the
   * mark and the name and nothing else.
   */
  description?: ReactNode
}

/**
 * The props a `PackSwitcher` takes.
 *
 * The element's own props are forwarded, and three of them are handled here
 * rather than inherited. `children` is removed because the switcher draws its
 * children from `packs` and a caller who passed any would be reaching past the
 * list. `onChange` is removed because the group reports the selected pack's id
 * and the element's own `onChange` is a form event this Component does not
 * forward to anything. `defaultValue` is declared rather than removed, which is
 * the same move `radio-group` makes and the reason is below it.
 */
export interface PackSwitcherProps
  extends Omit<ComponentProps<'div'>, 'onChange' | 'children'> {
  /**
   * There is no uncontrolled form, so the element's own `defaultValue` is not
   * offered either.
   *
   * The underlying group declares it as a narrower type than the element does, so
   * inheriting the element's version is a shape mismatch rather than a missing
   * feature, and a switcher that rendered a pack the reader never chose because a
   * form said so is a switcher that has repainted the page on its own. Pass
   * `activePack`.
   */
  defaultValue?: never
  /**
   * The packs a reader may choose from, in the order a reader should meet them.
   *
   * Required, and there is no default list. Prism ships six packs and could ship
   * their names, and does not, because a name is a word in a consumer's interface
   * rather than a value in the token source: "default" is a pack id whose display
   * name in a product might be "Standard", "Neutral" or "As shipped", and a
   * Component that decided would be wrong in at least two of those. The cost is
   * real and it is paid on every call site: a consumer writes its list once, in
   * its own language, and a consumer that wants to offer four of the six writes
   * four. An empty list renders nothing at all, which is the same answer
   * `ProductSwitcher` gives.
   */
  packs: readonly PackSwitcherPack[]
  /**
   * The pack the page is in, which is the option drawn as selected.
   *
   * Required, because a switcher that does not know where it is cannot mark where
   * it is and would render a row of controls with no current state, which is a
   * control a screen reader announces as an unanswered question.
   *
   * **An `activePack` that is not in `packs` marks nothing, and that is a state
   * rather than a throw.** A site whose own default is a pack it does not offer a
   * choice between is a real thing: it is the neutral base pack in a product that
   * only wants to offer the five pastels, and it is the first load of a page whose
   * stored pack has been retired. Throwing would take down a settings page over a
   * list, and the honest rendering is a switcher with nothing selected, which a
   * reader sees as a chooser they have not answered. The fix is the caller's list,
   * and the Component does not guess which pack to select in place of the answer.
   */
  activePack: PackId
  /**
   * Called with a pack's `id` when the reader selects that pack.
   *
   * Required, and the reason this Component exists is that it does not own what
   * happens next. Applying a pack is a consumer's decision, because the three
   * honest ways to do it are three consumer's decisions: the provider's `setPack`,
   * which writes the two document attributes and persists the choice; a
   * `data-pack` attribute on one subtree, which themes a preview and nothing else;
   * and a value in a URL or a form, which is what a shared link and a checkout
   * both need. A Component that took the provider's hook would own all three by
   * deciding which one it is, and a Component that wrote the attribute itself
   * would be a second writer of the two attributes, which is the race
   * `data-theme-origin` exists to record rather than to have.
   *
   * The cost is stated rather than hidden. Every caller writes the wiring, which
   * for the common case is three lines: a piece of state, a `setPack` from the
   * provider's hook, and this handler. A caller who wants the switcher to persist
   * the choice across a reload has to ask for the provider, and a caller who
   * wants it in a URL has to write a parameter of their own. In exchange the
   * Component is the one shape that works in all three, and the six-pack list
   * arrives as data rather than as a hardcoded row.
   */
  onChange: (pack: PackId) => void
  /**
   * The chooser's own accessible name, drawn as no visible text.
   *
   * Required, and not defaulted, for the reason every accessible name in this
   * package is a prop: a consumer whose product calls them packs, palettes,
   * brand colours or house styles announces the wrong word in every language but
   * the one it was written in. The name is the radio group's name and it is not
   * visible because the option names are the visible words; a caller who wants a
   * visible heading puts one above the switcher and passes the same string, which
   * is a `Field` and a `FieldLabel` rather than a prop here.
   */
  label: string
  /**
   * The drawn size of every mark, so a set shows one size rather than a mix.
   * @defaultValue 'sm'
   */
  swatchSize?: 'sm' | 'md' | 'lg'
  /**
   * Whether each mark draws the pack's dark mode beside the mode the page is in.
   * @defaultValue true
   *
   * `PackSwatch`'s own flag, passed straight through, and the answer is the same
   * one it gives: a pack is two axes and a reader choosing between packs has to
   * see both, because a pack's light and dark values are not one palette with the
   * brightness turned down. Turn it off for a chooser in a header where the row
   * has no vertical room, and pay for it: the reader then has to leave the row to
   * see what the pack looks like in the other mode.
   */
  showModes?: boolean
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A control that changes which pack the page is drawn in, over a list the caller
 * supplies.
 *
 * **It is the answer `PackSwatch` names in its own documentation.** That
 * Component says a caller who wants a pack chooser has to build the chooser
 * around six images rather than getting one, and that the answer is upstream, in a
 * Component that owns the switching. This is that Component, and the reason the
 * gap was worth closing is measured rather than asserted: the mark, the current
 * marking, the keyboard model and the change to the page are four separate things,
 * and a consumer who composes them by hand gets four chances to make a control
 * that looks like it changes the pack and does not.
 *
 * **The set is a radio group, because exactly one of them is always the pack the
 * page is in and choosing either of any two leaves the same state as choosing the
 * other.** That is the definition of a single-choice set, and the alternatives
 * were each worse in a way a reader pays for. A row of toggle buttons takes one
 * tab stop per pack and announces a group of toggles, so a reader who has learned
 * that the arrow keys move inside a radio group has to learn a different model in
 * this row. A list of links moves the page, which is the wrong consequence for a
 * setting: the pack is a preference and a preference that navigates is a
 * preference a reader cannot set on the page they are reading. A `Select` would be
 * right for forty packs and wrong for six, and the count of packs is a fact about
 * the token build rather than about a consumer's product.
 *
 * **The selected option carries `aria-checked` and the fill repeats it.** The
 * order is the one the whole package keeps: the attribute is the fact and the
 * colour is the reminder, so a reader who cannot separate `primary` from
 * `background` and a reader using a screen reader are told the same thing. It is
 * also why the unselected option is a quiet outline rather than a tinted surface,
 * because a row in which five options carry a fill and one carries a stronger fill
 * is a row where the reader is looking for the odd one out.
 *
 * **The mark is `PackSwatch` and the mark is hidden from assistive technology.**
 * The swatch is a picture of a palette whose name is already the option's name,
 * so it is wrapped in `aria-hidden` rather than left to be read: an option
 * announced as "Blush image, Blush, radio button, selected, 1 of 6" says the
 * word twice and the reader has to work out which half is the name. The visible
 * words name the control, the `PackSwatch` shows what the choice looks like, and
 * the two cannot disagree because the mark is generated from the same id as the
 * selection. The cost is that `PackSwatch` requires a `label` this Component
 * passes and no reader ever hears, which is a prop whose purpose is documented
 * where the mark is drawn rather than here.
 *
 * **One pack per press and no transition between packs.** The change is a
 * repaint of every token on the page, which is the consequence the reader asked
 * for, and a cross-fade between the two palettes would be two hundred milliseconds
 * of movement nobody asked for and could not act on. Motion is by token and this
 * Component uses the hover and focus feedback the rest of the package uses, and
 * nothing else.
 *
 * **It carries no directive about where the pack goes, and it is a client
 * Component because the callback is one.** The directive is unconditional for the
 * reason `AddressBook01` gives in full: a surface that attaches a handler belongs
 * in the client graph, and the boundary sits on the module rather than in a leaf so
 * that a consumer composing a server page finds it in one place they can see. The
 * cost is that a consumer who has already resolved the active pack from a stored
 * value and passes a handler that writes to nothing still puts this whole module
 * in their client bundle, where a static row of six images would have shipped no
 * JavaScript at all. That is the price of the Component owning the selection, the
 * marking and the keyboard model rather than leaving three of them to every
 * consumer.
 */
function PackSwitcher({
  packs,
  activePack,
  onChange,
  label,
  swatchSize = 'sm',
  showModes = true,
  className,
  ...props
}: PackSwitcherProps) {
  if (packs.length === 0) return null

  return (
    <RadioGroupPrimitive<string>
      data-slot="pack-switcher"
      aria-label={label}
      value={activePack}
      onValueChange={(next) => {
        /*
         * The cast is total rather than a guess. This Component is the only thing
         * in the tree that set a radio's value, and every value it set was a
         * member's `id`, which is a `PackId`. The compiler cannot see that, so the
         * assertion is written here where the reason is, rather than hidden in a
         * signature a consumer reads.
         */
        onChange(next as PackId)
      }}
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    >
      {packs.map((pack) => (
        <RadioPrimitive.Root
          key={pack.id}
          value={pack.id}
          data-slot="pack-switcher-option"
          className={cn(
            // The selected option states both halves of its surface, which is the
            // Stated Ink Rule and not a preference: an option that set only a fill
            // would inherit whatever ink happened to be behind it, and the token
            // gate measures token pairs rather than what a Component leaves out.
            'border-border bg-background text-foreground hover:bg-muted',
            'data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground',
            // The span Base UI's radio renders, so the row is composed here and the
            // `max-w-full` is what lets the name truncate rather than widen the row.
            'inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border px-2 py-1 text-sm font-medium',
            'transition-colors duration-fast ease-out',
            'outline-none focus-visible:ring-ring focus-visible:ring-[3px]',
          )}
        >
          {/*
           * The mark, hidden from assistive technology because the option's own
           * name is the words beside it. A `PackSwatch` inside a control that is
           * named by its contents would otherwise be read twice, and the swatch's
           * `label` is a required prop of that Component rather than a name this
           * one composes.
           */}
          <span aria-hidden="true" className="flex shrink-0 items-center">
            <PackSwatch
              pack={pack.id}
              label={pack.name}
              showModes={showModes}
              size={swatchSize}
            />
          </span>

          <span data-slot="pack-switcher-option-text" className="flex min-w-0 flex-col">
            {/*
             * The name truncates and the description wraps, which is the asymmetry
             * the two are for: a pack name is one or two words and a truncated one
             * is unreadable, while a description is a sentence that a narrow row
             * should give a second line rather than cut off mid-clause. Both are
             * inside the option's own `max-w-full`, so a long description makes the
             * option taller and not wider, which is the cost `description` names.
             */}
            <span data-slot="pack-switcher-option-name" className="truncate">
              {pack.name}
            </span>
            {pack.description === undefined ||
            pack.description === null ||
            pack.description === false ? null : (
              <span
                data-slot="pack-switcher-option-description"
                className="text-muted-foreground text-pretty text-xs font-normal"
              >
                {pack.description}
              </span>
            )}
          </span>
        </RadioPrimitive.Root>
      ))}
    </RadioGroupPrimitive>
  )
}

export { PackSwitcher }
