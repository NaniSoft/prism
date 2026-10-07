import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props a NothingChosen01 takes.
 *
 * Every string is a prop and the Block ships none. There is no sentence, no
 * fallback, no reason value and no label for a control the Block does not
 * render, and the absence is the argument rather than an omission: this is the
 * one state in the system whose words are entirely the caller's, because the
 * next step in it is a click in the pane beside this one and the sentence that
 * describes it is a claim about that reader's product, not about this design
 * system.
 */
export type NothingChosen01Props = {
  /**
   * The words the reader reads: what is in this pane, and what they do next, in
   * the product's own voice. Required, because a pane with a frame and no words
   * is a box a reader has to interpret, and because the Block's whole job is to
   * carry the caller's sentence and nothing else.
   *
   * "Select an invoice" says what is here and what to do. "Nothing here" says
   * something false, and the failure this Block is shaped to prevent starts with
   * a pane that tells a reader there is nothing to read while a list of records
   * sits beside it.
   */
  title: string
  /**
   * The sentence under the words, for the part they cannot fit: what the pane
   * will show, or what the reader should know before they choose. Omit it when
   * the words above are the whole message, which is the ordinary case for a
   * detail pane a reader lands in.
   */
  body?: string
  /**
   * The mark above the words, as a slot.
   *
   * A slot and not a mark this Block picks, for the reason `EmptyState01` takes
   * one: the shape that means "choose something" is a claim about the product's
   * records, and four products calling their records four different things would
   * each be handed an icon that is wrong for the other three. It is drawn in the
   * muted ink and sized by the caller, and it is `aria-hidden` wherever a caller
   * puts it, because the state is carried by the words and a mark a screen
   * reader reads is the same sentence twice.
   */
  icon?: ReactNode
  /**
   * Layout only, exactly as on every Component and Block. Changing a Prism-owned
   * visual property from here is prohibited.
   */
  className?: string
}

/**
 * The resting detail pane: a reader has opened a region that can hold a record
 * and has chosen nothing yet.
 *
 * **This is a statement about a reader's pointer, and that is the whole of why it
 * is a Block beside `EmptyState01` rather than a reason on it.** The reasons that
 * Block takes are answers to one question: what happened to the collection this
 * region would have drawn? Nothing has ever existed in it, the reader's own
 * narrowing emptied it, the reader's own earlier action moved every record out of
 * it, or this reader may not see it. Each is a statement about a set, and the
 * frame those four share is the assertion that follows from them together: there
 * is nothing here to read. Nothing chosen is not that. No collection has been
 * emptied, narrowed or hidden, the records are in the index a few centimetres to
 * the left, and what is missing is the reader's pointer at one of them. A reason
 * here would have to keep that frame honest by claiming there is nothing to read
 * here while a readable region sits next to it, which is the failure this Block
 * exists rather than to commit.
 *
 * **The newest of those four is the one that shows the line most sharply, because
 * a region the reader emptied has the same frame and the opposite neighbourhood.**
 * A bin a reader has just cleared has no readable neighbour, so the shared frame
 * is honest there and the reason belongs on `EmptyState01` beside the other three.
 * This pane has a full index beside it, so the same frame would be a claim the
 * reader can see is false. The difference between the two answers is not which is
 * more correct; it is what each one is a statement about.
 *
 * **What it does not draw is half of what it is.** No action, and
 * `scripts/check-block-controls.mjs` is the reason rather than a coincidence: the
 * next step in this state is a click in the other pane, so a control here would be
 * either a button Prism wires to nothing or a second copy of an affordance the
 * index already draws for the same reader. So there is no control in this source
 * at all, the gate has nothing to catch here, and a reader auditing for the
 * absence finds none. No height floor either, and that one is the composition's
 * business rather than the Block's: a pane in a grid is already as tall as its
 * neighbour, and a `min-h` authored for a page region would be a second answer to
 * a question the split's tracks have already answered. So this Block fills the
 * height it is given and centres itself in it, and a caller who wants a floor
 * writes one in the composition where the pane is placed.
 *
 * **No sentence of its own, no fallback and no frame.** The Block ships no text,
 * and it ships no border, no fill and no minimum size either, for the same reason
 * the words are the caller's: a dashed frame is a claim that the region has
 * nothing in it, and this region has everything in it that the index beside it
 * has. What the caller gives this Block is a region, and the words; the frame
 * around them, if there is one, belongs to whatever drew the pane.
 *
 * **The words are a `<p>` and not a heading, for the reason `EmptyState01` draws
 * its headline as one.** The pane persists and its contents do not: what is in it
 * is replaced by a record the moment the reader chooses. A heading here would put
 * an entry in the document outline that disappears on the first click, and a
 * reader navigating by heading would select "Select an invoice" and land where
 * the entry no longer exists. The pane's own claim belongs to the heading the
 * caller's shell already draws above the split.
 *
 * **Emphasis belongs in the pane's content and not in the index's width.** The
 * instinct when a detail pane is empty is to widen the index and let the pane go,
 * and it is refused: a split whose tracks change ratio when a row is clicked moves
 * the list out from under the hand that clicked it. The tracks hold their ratio at
 * every selection state, so what changes is content, and forty rows beside one
 * sentence is not a competition. A caller who wants the index louder makes the
 * index denser, which is the index's own decision to take.
 *
 * **It is a server Component.** It holds no state, imports no client code and
 * renders no control, so a consumer that passes a client node inside it pays for
 * the node and not for this frame.
 */
export function NothingChosen01({ title, body, icon, className }: NothingChosen01Props) {
  return (
    <div
      data-slot="nothing-chosen"
      className={cn(
        // Centred in the pane it is given rather than floored to a size of its
        // own. `h-full` takes the height the composition already decided and
        // `justify-center` puts the words in the middle of it, so this Block
        // draws no minimum height and no frame: a pane in a grid is as tall as
        // its neighbour, and a floor authored here would be a second answer to
        // a question the split's tracks have already answered.
        'flex h-full flex-col items-center justify-center gap-3 p-8 text-center',
        className,
      )}
    >
      {/*
        The mark, hidden from assistive technology and never sized here. It is a
        slot because the shape that means "choose something" is a claim about the
        caller's records, and it is `aria-hidden` because the state is carried by
        the words and a mark a screen reader reads is the same sentence twice.
      */}
      {icon === undefined ? null : (
        <div data-slot="nothing-chosen-icon" aria-hidden className="text-muted-foreground flex-none">
          {icon}
        </div>
      )}

      {/*
        A `<p>` and not a heading. The pane outlives its contents, so a heading
        here would be an outline entry that vanishes the moment a record is
        chosen, and a reader navigating by heading would follow it to a page
        where it no longer exists.
      */}
      <p data-slot="nothing-chosen-title" className="text-base font-semibold text-balance">
        {title}
      </p>

      {body === undefined ? null : (
        <p
          data-slot="nothing-chosen-body"
          className="text-muted-foreground max-w-measure-narrow text-pretty text-sm"
        >
          {body}
        </p>
      )}
    </div>
  )
}

export default NothingChosen01