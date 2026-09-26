import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/card'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'

export type Stat = {
  label: string
  value: string
  /** Percentage change. Positive reads as growth, negative as decline. */
  delta?: number
  /** Period the delta compares against, e.g. "vs last month". */
  hint?: string
}

export type Stats01Props = {
  eyebrow?: string
  title?: string
  stats: Stat[]
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
}

function Delta({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="text-muted-foreground flex items-center gap-1 text-xs">
        <Minus className="size-3" />
        0%
      </span>
    )
  }
  const up = value > 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={
        up
          ? 'text-success flex items-center gap-1 text-xs'
          : 'text-destructive flex items-center gap-1 text-xs'
      }
    >
      <Icon className="size-3" />
      {Math.abs(value)}%
    </span>
  )
}

/**
 * A KPI row. Every number is a prop.
 *
 * This block used to carry a hardcoded set reading "128 blocks shipped" and "9.4k
 * weekly installs". Those were invented figures about a library nobody installs
 * yet, and because they lived in the component rather than at the call site, a
 * consumer who installed the block shipped fabricated metrics into their own
 * dashboard. A stat block with invented stats in it is worse than no stat block.
 */
export function Stats01({ eyebrow, title, stats, headingLevel = 'h2' }: Stats01Props) {
  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          eyebrow={eyebrow}
          title={title}
          align="left"
          className="mb-10"
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-2 py-5">
            <CardContent className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm">{stat.label}</span>
              <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
              {stat.delta === undefined && !stat.hint ? null : (
                <div className="flex items-center gap-2">
                  {stat.delta === undefined ? null : <Delta value={stat.delta} />}
                  {stat.hint ? (
                    <span className="text-muted-foreground text-xs">{stat.hint}</span>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  )
}

export default Stats01
