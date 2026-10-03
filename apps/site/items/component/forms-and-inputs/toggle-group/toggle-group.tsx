'use client'

import { useState } from 'react'

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@nanisoft/prism-ui/components/toggle-group'
import { Button } from '@nanisoft/prism-ui/components/button'

/**
 * Both modes side by side, because the modes are the same shape and a different
 * control, and that is only visible when a reader is given both.
 *
 * The left one is a range: one answer, and pressing the answer again clears it. The
 * right one is a set of overlays: any number, and arrowing past a member must not
 * turn it on. Both look like three buttons in a row. One is a radiogroup and one
 * is a toolbar, and the difference is invisible until the roles are read.
 */
const RANGES = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

const OVERLAYS = [
  { value: 'grid', label: 'Grid' },
  { value: 'axes', label: 'Axes' },
  { value: 'labels', label: 'Labels' },
  { value: 'bounds', label: 'Bounds' },
]

/** A single-selection group and a multiple-selection group, both live. */
export default function ToggleGroupDemo() {
  const [range, setRange] = useState<readonly string[]>(['week'])
  const [overlays, setOverlays] = useState<readonly string[]>(['grid'])
  const [vertical, setVertical] = useState(false)

  return (
    <div className="flex max-w-page flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          One answer. A radiogroup: the arrow keys move and choose.
        </p>
        <ToggleGroup
          value={range}
          onValueChange={setRange}
          aria-label="Date range"
          orientation={vertical ? 'vertical' : 'horizontal'}
        >
          {RANGES.map((range_) => (
            <ToggleGroupItem key={range_.value} value={range_.value}>
              {range_.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-muted-foreground text-sm tabular-nums">
          {range.length === 0 ? 'No range' : `Showing ${range[0]}`}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          Any number. A toolbar: the arrow keys move focus and do not press.
        </p>
        <ToggleGroup
          selectionMode="multiple"
          value={overlays}
          onValueChange={setOverlays}
          aria-label="Chart overlays"
        >
          {OVERLAYS.map((overlay) => (
            <ToggleGroupItem key={overlay.value} value={overlay.value}>
              {overlay.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-muted-foreground text-sm tabular-nums">
          {overlays.length === 0
            ? 'Nothing overlaid'
            : `${overlays.length} overlay${overlays.length === 1 ? '' : 's'} on`}
        </p>
      </section>

      <Button
        size="sm"
        variant="outline"
        onClick={() => setVertical((value) => !value)}
        className="self-start"
      >
        {vertical ? 'Lay the range out horizontally' : 'Lay the range out vertically'}
      </Button>
    </div>
  )
}
