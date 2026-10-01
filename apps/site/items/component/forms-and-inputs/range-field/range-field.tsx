'use client'

import { useState } from 'react'

import { RangeField, type RangeValue } from '@nanisoft/prism-ui/components/range-field'

/**
 * Two intervals, one in plain numbers and one in money.
 *
 * The second is the one to try with a screen reader. The two thumbs announce their own
 * bounds through `boundLabel`, and the span between them is announced once from the
 * hidden sentence `spanLabel` writes, because neither thumb can report the distance
 * between the pair. Tab reaches both thumbs, and Home and End send whichever one has
 * focus to its end of the track.
 *
 * The first carries `minGap`, which is the guard that stops the thumbs crossing and
 * leaving an interval with a negative span.
 */
export default function RangeFieldDemo() {
  const [retention, setRetention] = useState<RangeValue>([30, 90])
  const [budget, setBudget] = useState<RangeValue>([200, 1200])

  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <RangeField
        label="Retention window, days"
        min={0}
        max={365}
        step={1}
        minGap={7}
        value={retention}
        onValueChange={setRetention}
        boundLabel={(bound, formatted) =>
          bound === 'start' ? `Earliest day, ${formatted}` : `Latest day, ${formatted}`
        }
        spanLabel={(span, formatted) => `Window is ${formatted} days wide.`}
      />

      <RangeField
        label="Monthly budget"
        min={0}
        max={5000}
        step={50}
        value={budget}
        onValueChange={setBudget}
        format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
        locale="de-DE"
        boundLabel={(bound, formatted) =>
          bound === 'start' ? `From ${formatted}` : `Up to ${formatted}`
        }
        spanLabel={(span, formatted) => `Range is ${formatted} wide.`}
      />

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        The retention window is currently{' '}
        <span className="text-foreground">
          {retention[0]} to {retention[1]} days
        </span>
        , a span of{' '}
        <span className="text-foreground">{retention[1] - retention[0]}</span> days. Both figures
        come from one formatter, so the number on screen and the number announced are
        the same string.
      </p>
    </div>
  )
}
