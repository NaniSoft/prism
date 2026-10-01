'use client'

import { useEffect, useState } from 'react'

import { Kbd } from './kbd'
import { cn } from '../../lib/utils'

/**
 * The four concrete modifier keys a chord can name.
 *
 * Closed on purpose. `mod` is deliberately not a member: it is not a key, it is a
 * name for whichever of these two the host uses for its command chord, and
 * collapsing it into the set is what would let a caller write a label for it and
 * have that label be wrong on half the platforms.
 */
export type PlatformModifierKeyName = 'alt' | 'ctrl' | 'meta' | 'shift'

/**
 * What a chord may ask for, which is the four keys plus `mod`.
 *
 * `mod` is the one that cannot be resolved by reading a string. It is the modifier
 * a product writes in its own documentation as "the command key", and it is `meta`
 * on a machine running macOS and `ctrl` everywhere else. A caller who has to branch
 * on the platform to label it has been handed a detector, and a detector in four
 * consumer repositories is four detectors that will disagree.
 */
export type PlatformModifier = PlatformModifierKeyName | 'mod'

/** A keyboard chord: the key, and which modifiers it travels with. */
export interface PlatformChord {
  /**
   * The non-modifier key of the chord.
   *
   * The caller's own string, printed as given apart from a single character, which is
   * drawn in upper case. Every convention for writing a shortcut writes a letter in
   * upper case, so `⌘k` reads as a typo to every reader who meets it, and Prism
   * resolves that one case rather than leaving it to four call sites. Any longer key
   * is left exactly as passed, because the capitalisation of a word such as the name
   * of a function key is the product's own choice and not a fact about a keyboard.
   *
   * A caller reading this off a `KeyboardEvent` should pass the event's own `key`
   * member, upper-cased, because that string is what the platform reports rather
   * than what a product writes.
   */
  key: string
  /**
   * The modifiers the chord travels with, in any order.
   *
   * Optional and empty by default, because most chords have none, and a required
   * empty array on every call site is noise about the common case. The Component
   * draws them in one canonical order whatever order they arrive in, because a
   * shortcut whose modifiers change position between two menus is a shortcut a
   * reader has to read twice.
   */
  modifiers?: readonly PlatformModifier[]
}

/** The props the Platform modifier key accepts. */
export interface PlatformModifierKeyProps {
  /** The chord to draw. */
  chord: PlatformChord
  /**
   * The name of each of the four modifier keys, in the reader's own words or in the
   * glyphs their platform uses.
   *
   * Required and complete rather than partial, and this is the whole reason the
   * Component is not a `Kbd` with a different string. A glyph has no English name:
   * the command key is a symbol on one platform and two letters on another, and the
   * letters are localised like any other word. So Prism holds no glyph and no word
   * at all here, and a product that ships in German writes four German words, a
   * product that ships only on macOS writes four symbols, and a product that ships
   * on both writes the symbol for the Mac and the word for everywhere else. The
   * cost of a complete record is that a caller who shows one shortcut still writes
   * four names; that is cheaper than the alternative, which is four call sites that
   * each remember to localise one of them.
   */
  labels: Record<PlatformModifierKeyName, string>
  /** Layout only. */
  className?: string
}

/**
 * Where a modifier sits in the printed chord.
 *
 * One order for every platform rather than one per platform, because the two
 * conventions agree: a Windows chord reads Ctrl, Alt, Shift, Win and a macOS chord
 * reads the same four in the same sequence. Branching the order on the host would
 * buy nothing and would make the Component's output depend on a second runtime fact
 * for no reader-visible gain.
 *
 * `mod` sits where `ctrl` sits because that is what it is on a host that is not an
 * Apple one, and the two share a rank so a chord carrying both prints them in the
 * order the caller supplied them, which is the only order that can be right when the
 * caller asked for a chord that is arguably two spellings of one key.
 */
const MODIFIER_ORDER: Record<PlatformModifier, number> = {
  mod: 0,
  ctrl: 0,
  alt: 1,
  shift: 2,
  meta: 3,
}

/** The platforms whose command key is `meta`. */
const APPLE = /mac|iphone|ipad|ipod/i

/**
 * Whether the host machine uses `meta` for its command chord.
 *
 * A detector rather than a string comparison on `navigator.platform` alone, because
 * that member is deprecated and a consumer cannot fix it from here: the
 * `userAgentData` hint is preferred where a browser publishes it and the older
 * member is the fallback, and both are read rather than parsed by this package
 * beyond the one question this Component asks.
 */
function hostUsesMeta(): boolean {
  if (typeof navigator === 'undefined') return false
  const hinted = (navigator as Navigator & { userAgentData?: { platform?: string } })
    .userAgentData
  const platform = hinted?.platform ?? navigator.platform ?? ''
  return APPLE.test(platform)
}

/** The concrete key a requested modifier is on this host. */
function resolve(modifier: PlatformModifier, apple: boolean): PlatformModifierKeyName {
  return modifier === 'mod' ? (apple ? 'meta' : 'ctrl') : modifier
}

/** A single-character key is drawn in upper case; anything else is left as passed. */
function displayKey(key: string): string {
  return key.length === 1 ? key.toUpperCase() : key
}

/**
 * The modifier glyphs of a keyboard chord, resolved for the reader's own platform.
 *
 * **This is behaviour, not a label, and that is why it is a Client Component.** The
 * platform is a fact about the machine and not about the document, so the glyph for
 * a chord cannot be chosen at the call site and passed down as a string: a caller
 * that resolved it would have to read the platform itself, and would have to read it
 * in every one of the surfaces that show a shortcut, which is four repositories
 * holding four copies of a detector that will drift. The consumer hands over a chord
 * as the platform reports it, and this Component owns the one lookup.
 *
 * **And it is not `Kbd` with a different string.** `Kbd` answers one question: draw
 * this key. Its caller already knows which key, and the string it prints is the key.
 * The differences that matter here:
 *
 *  - the glyph is chosen at runtime from the host, not supplied by the caller;
 *  - `labels` is a complete record of the four modifier names rather than the text
 *    of one element, because a command chord is several keys and each of them has a
 *    name the reader's language and platform decide;
 *  - the modifiers are ordered, deduplicated and resolved, so a caller may pass them
 *    in whatever order its data holds and the printed chord is the same chord;
 *  - the frame before the platform is known is drawn deliberately rather than left
 *    to chance, which is the next paragraph and is the cost of being a client
 *    Component at all.
 *
 * **What is drawn before the platform is known, and why.** A server render cannot
 * read `navigator`, and hydration cannot run before the first paint, so the first
 * frame is drawn with the host unknown. Every slot that does not depend on the host
 * is drawn normally: the concrete modifiers, the key, and their order. The one slot
 * that cannot be drawn is `mod`, because choosing between the caller's `meta` label
 * and the caller's `ctrl` label is precisely the question the server cannot answer.
 * **So the `mod` slot renders as an empty `Kbd`: the authored key box, with nothing
 * in it, occupying the space the glyph will take.** Three consequences, stated rather
 * than discovered. The row never shows a glyph that might be wrong, which is the one
 * outcome not available to any other choice here, because guessing means half the
 * readers are told their own keyboard is something else. No reader ever sees a
 * placeholder character such as a question mark, which would be read aloud by a
 * screen reader as part of the shortcut. And the layout does not jump, because the
 * box was always there; on a host whose labels are words rather than symbols the row
 * still widens once by that word's width, since an empty box is the minimum key width
 * and a word is wider, and a consumer whose layout cannot tolerate one frame of that
 * should render the shortcut client-side or hold the width open beside it. Everything
 * else in the chord is correct in that frame, so the shortest case is one empty box
 * next to a correct key.
 *
 * **The host cannot change while the page is open**, so the detector runs once in an
 * effect rather than being subscribed to. A reader does not move a browser from
 * Windows to macOS, and a subscription would be a listener with nothing to report
 * for the life of the document.
 *
 * The whole chord is announced as its glyphs, in order, which is how a shortcut is
 * read in every tool that documents one. A caller whose labels do not survive being
 * read aloud, which is the usual objection to a symbol such as the command glyph,
 * answers it in the place the map already exists: put words in `labels` for that
 * platform.
 */
function PlatformModifierKey({ chord, labels, className }: PlatformModifierKeyProps) {
  // `null` is the third state and it is the load-bearing one: it is the server frame
  // and the hydration frame, and it is distinct from a resolved `false` so the frame
  // can draw a slot as unknown rather than as a host that answered no.
  const [apple, setApple] = useState<boolean | null>(null)

  useEffect(() => {
    setApple(hostUsesMeta())
  }, [])

  const known = apple !== null
  const modifiers = Array.from(new Set(chord.modifiers ?? [])).sort(
    (a, b) => MODIFIER_ORDER[a] - MODIFIER_ORDER[b],
  )

  return (
    <span
      data-slot="platform-modifier-key"
      data-host={known ? (apple === true ? 'apple' : 'other') : 'unknown'}
      className={cn('inline-flex items-center gap-1', className)}
    >
      {modifiers.map((modifier) =>
        modifier === 'mod' && !known ? (
          // The reserved slot: the authored key box with nothing in it, so the row
          // holds its shape and no reader is shown a glyph that may be wrong.
          <Kbd key={modifier} data-resolved="false" />
        ) : (
          <Kbd key={modifier}>{labels[resolve(modifier, apple === true)]}</Kbd>
        ),
      )}
      <Kbd>{displayKey(chord.key)}</Kbd>
    </span>
  )
}

export { PlatformModifierKey }
