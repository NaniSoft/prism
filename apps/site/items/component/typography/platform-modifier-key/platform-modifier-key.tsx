import { PlatformModifierKey } from '@nanisoft/prism-ui/components/platform-modifier-key'

/** The glyphs a macOS keyboard uses, which is what most command menus here ship. */
const appleLabels = {
  ctrl: '⌃',
  alt: '⌥',
  meta: '⌘',
  shift: '⇧',
}

/** The words a Windows and Linux keyboard uses, because those are written not drawn. */
const wordLabels = {
  ctrl: 'Ctrl',
  alt: 'Alt',
  meta: 'Win',
  shift: 'Shift',
}

/**
 * One chord resolved two ways from the same map, and one two-key chord.
 *
 * The first two differ only in the `labels` record. Both ask for `mod`, which is the
 * modifier a product writes as "the command key", and the same call site renders a
 * glyph on a Mac and a word on a PC without the page knowing which it is on.
 *
 * The third is the case that proves the order is not the caller's: the modifiers
 * arrive in the reverse of the printed order and come out in the printed order.
 *
 * This Demo is a server Component. It renders no state of its own, and the client
 * JavaScript it pulls in belongs to `PlatformModifierKey`, which is the arrangement
 * a consumer gets when a static page documents its own shortcuts.
 */
export default function PlatformModifierKeyDemo() {
  return (
    <div className="flex max-w-measure-narrow flex-col gap-6 text-sm">
      <p className="flex items-center gap-2">
        Open the command menu
        <PlatformModifierKey chord={{ key: 'k', modifiers: ['mod'] }} labels={appleLabels} />
        <span className="text-muted-foreground">with glyph labels</span>
      </p>

      <p className="flex items-center gap-2">
        Open the command menu
        <PlatformModifierKey chord={{ key: 'k', modifiers: ['mod'] }} labels={wordLabels} />
        <span className="text-muted-foreground">with word labels</span>
      </p>

      <p className="flex items-center gap-2">
        Redraw the graph
        <PlatformModifierKey
          chord={{ key: 'r', modifiers: ['shift', 'meta'] }}
          labels={appleLabels}
        />
        <span className="text-muted-foreground">two modifiers, given the other way round</span>
      </p>

      <p className="text-muted-foreground border-border border-t pt-4">
        The first paint of a server render cannot know the platform, so the `mod` slot
        is drawn as an empty key box rather than as a glyph that might be wrong. The key
        itself, the concrete modifiers and their order are all correct in that frame.
      </p>
    </div>
  )
}
