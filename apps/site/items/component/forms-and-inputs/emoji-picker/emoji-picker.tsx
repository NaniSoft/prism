'use client'

import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nanisoft/prism-ui/components/card'
import { EmojiPicker } from '@nanisoft/prism-ui/components/emoji-picker'

/**
 * A small emoji set, held here rather than in the Component.
 *
 * This is the whole contract in one file. The Component ships no table because a
 * data set is a licensed or a derived asset, it changes in every Unicode release,
 * and what belongs on a rail is the product's own claim about itself. So the
 * Demo, which is a consumer, owns the rows, and twenty-four entries is what a
 * bounded set looks like: several screens, not several minutes.
 *
 * Every entry carries an id that is unique across all three groups, a name, and
 * the keywords a reader would actually type. A glyph with no name is a cell a
 * screen reader announces as "button" and nothing else, because the glyph itself
 * is hidden.
 */
const GROUPS = [
  {
    id: 'reactions',
    name: 'Reactions',
    items: [
      { id: 'thumbs-up', glyph: '\u{1F44D}', name: 'Thumbs up', keywords: ['approve', 'yes', 'like'] },
      { id: 'thumbs-down', glyph: '\u{1F44E}', name: 'Thumbs down', keywords: ['reject', 'no'] },
      { id: 'clap', glyph: '\u{1F44F}', name: 'Clap', keywords: ['applause', 'praise'] },
      { id: 'heart', glyph: '\u{2764}\u{FE0F}', name: 'Heart', keywords: ['love', 'like'] },
      { id: 'party', glyph: '\u{1F389}', name: 'Party popper', keywords: ['celebrate', 'ship'] },
      { id: 'tada', glyph: '\u{1F389}', name: 'Tada', keywords: ['done', 'released'] },
      { id: 'fire', glyph: '\u{1F525}', name: 'Fire', keywords: ['hot', 'burning', 'urgent'] },
      { id: 'rocket', glyph: '\u{1F680}', name: 'Rocket', keywords: ['ship', 'launch', 'deploy'] },
    ],
  },
  {
    id: 'states',
    name: 'Run states',
    items: [
      { id: 'queued', glyph: '\u{23F3}', name: 'Hourglass', keywords: ['waiting', 'queued'] },
      { id: 'running', glyph: '\u{1F504}', name: 'Arrows clockwise', keywords: ['working', 'active'] },
      { id: 'blocked', glyph: '\u{1F6AB}', name: 'Prohibited', keywords: ['stopped', 'denied'] },
      { id: 'failed', glyph: '\u{274C}', name: 'Cross mark', keywords: ['error', 'broken'] },
      { id: 'green', glyph: '\u{2705}', name: 'Check mark button', keywords: ['passed', 'green'] },
    ],
  },
  {
    id: 'signals',
    name: 'Signals',
    items: [
      { id: 'eyes', glyph: '\u{1F440}', name: 'Eyes', keywords: ['look', 'watch', 'review'] },
      { id: 'warning', glyph: '\u{26A0}\u{FE0F}', name: 'Warning', keywords: ['caution', 'alert'] },
      { id: 'bug', glyph: '\u{1F41B}', name: 'Bug', keywords: ['defect', 'issue'] },
      { id: 'memo', glyph: '\u{1F4DD}', name: 'Memo', keywords: ['note', 'write', 'docs'] },
      { id: 'lock', glyph: '\u{1F512}', name: 'Lock', keywords: ['private', 'secret'] },
      { id: 'sparkles', glyph: '\u{2728}', name: 'Sparkles', keywords: ['new', 'magic', 'ai'] },
    ],
  },
]

/**
 * The picker, wired to one piece of state, with the height bound.
 *
 * The height is a `className` and it is the caller's, because the picker is not
 * bounded by Prism: a picker whose height is its content's height is a picker
 * that pushes the rest of the form off the page.
 */
export default function EmojiPickerDemo() {
  const [chosen, setChosen] = useState('rocket')

  return (
    <div className="flex max-w-measure flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle as="h3">Pick a reaction</CardTitle>
          <CardDescription>
            Twenty-four entries in three categories, and every one of them is a row
            in this file. The Component ships no table: a data set is the
            consumer&apos;s, because Unicode adds emoji in every release and what
            belongs on a rail is the product&apos;s own claim about itself.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmojiPicker
            groups={GROUPS}
            value={chosen}
            onValueChange={setChosen}
            searchLabel="Find a reaction"
            searchPlaceholder="Name or keyword"
            clearLabel="Clear the search"
            emptyLabel="No reaction matches that."
            selectLabel={(item) => `${item.name} chosen`}
            className="max-h-80"
          />
        </CardContent>
      </Card>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        Chosen: {chosen}. The identifier is stored rather than the glyph, because
        two entries can carry the same glyph and a selection that cannot tell them
        apart is a selection the reader cannot make.
      </p>

      <p className="text-muted-foreground text-sm">
        Try it with the keyboard. Tab reaches the field and then the grid as one
        stop, the arrows move between cells and do not choose, Enter and Space
        choose, Arrow Down from the field moves into the grid, and Escape empties
        the search. The rail is not drawn while a search is present, because a
        category button that did nothing would be a control that lied.
      </p>
    </div>
  )
}
