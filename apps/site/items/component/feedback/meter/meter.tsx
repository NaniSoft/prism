'use client'

import { useState } from 'react'

import { Meter } from '@nanisoft/prism-ui/components/meter'

/**
 * Three meters that are the same Component and three different questions, which
 * is the point of the thresholds. The storage meter has limits worth marking, the
 * latency budget has one alarm rather than a ladder, and the score has neither and
 * stays neutral, because a Component that coloured itself would be claiming that a
 * good score is a green one on the caller's behalf.
 */
const BUDGETS = [
  {
    label: 'Storage used',
    read: (value: number) => `${value} of 100 GB`,
    value: 97,
    max: 100,
    valueText: '97 gigabytes of 100',
    thresholds: [
      { at: 80, tone: 'warning' as const },
      { at: 95, tone: 'destructive' as const },
    ],
  },
  {
    label: 'p95 latency',
    read: (value: number) => `${value} ms of 800 ms`,
    value: 310,
    max: 800,
    valueText: '310 milliseconds of an 800 millisecond budget',
    // One alarm, not a ladder. A latency that is 70 percent of budget is not
    // "warning", it is a latency that has not reached the number anyone agreed to
    // act on, and marking it would train a reader to ignore the mark.
    thresholds: [{ at: 800, tone: 'destructive' as const }],
  },
  {
    label: 'Evaluation score',
    read: (value: number) => `${value} of 100`,
    value: 84,
    max: 100,
    valueText: '84 of 100',
  },
]

/** The meters, with one of them adjustable so the tones are visible rather than described. */
export default function MeterDemo() {
  const [storage, setStorage] = useState(97)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      {BUDGETS.map((budget) =>
        budget.label === 'Storage used' ? (
          <Meter
            key={budget.label}
            value={storage}
            max={budget.max}
            label={budget.label}
            valueText={`${storage} gigabytes of 100`}
            thresholds={budget.thresholds}
          >
            <span>{`${storage} of 100 GB`}</span>
            <span className="tabular-nums">
              <button
                type="button"
                onClick={() => setStorage((v) => Math.max(0, v - 8))}
                className="hover:text-foreground"
              >
                -8
              </button>
            </span>
          </Meter>
        ) : (
          <Meter
            key={budget.label}
            value={budget.value}
            max={budget.max}
            label={budget.label}
            valueText={budget.valueText}
            thresholds={budget.thresholds}
          >
            <span>{budget.read(budget.value)}</span>
          </Meter>
        ),
      )}
    </div>
  )
}
