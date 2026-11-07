import { ArrowRight } from 'lucide-react'

import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01'
import { Badge } from '@nanisoft/prism-ui/components/badge'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Label } from '@nanisoft/prism-ui/components/label'
import { Sparkline } from '@nanisoft/prism-ui/components/sparkline'
import { Switch } from '@nanisoft/prism-ui/components/switch'

import { PrismLogo } from '@/components/logo'

/**
 * The landing hero's instrument: a small page composed from the package.
 *
 * This replaced a bar chart of catalogue counts. A chart of how many Components
 * exist answers a question nobody arrived with; a composed panel answers the one
 * they did, which is what the system looks like when a consumer uses it. Every
 * element below is the published package, rendered on this page, so the figure
 * cannot drift from the library the way a screenshot would.
 *
 * It is a server Component. The uncontrolled `Switch` is the only stateful node,
 * and it is a Prism client component rather than a boundary in this repository.
 * The sparkline reads the same category counts the copy states, so the figure and
 * the sentence cannot disagree.
 */
export function SpecimenBoard({ values }: { values: readonly number[] }) {
  return (
    <InstrumentPanel01
      label="a page, composed"
      state="live"
      stateLabel="live"
      caption="A small page assembled from the published Prism components, with the import that puts it there."
      footnote="Every element is the published package, rendered on this page. The chart is the catalogue's own counts, not a picture of them."
      actions={<PrismLogo size={22} className="text-muted-foreground block" />}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary">composed</Badge>
          <Button size="sm">
            Read the quickstart
            <ArrowRight className="size-3.5" aria-hidden />
          </Button>
        </div>

        <div className="border-border bg-background flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground font-mono text-mono">blocks/hero-01</span>
            <span className="text-base font-semibold tracking-tight">
              Components your product composes.
            </span>
            <span className="text-muted-foreground text-pretty text-xs">
              A heading, a sentence, an action and a figure, from one import.
            </span>
          </div>

          <Sparkline
            label="Components by category, counted from the build"
            values={values}
            width={420}
            height={48}
          />

          <Label className="flex items-center justify-between gap-6 text-xs">
            Live figures
            <Switch defaultChecked />
          </Label>
        </div>

        <div className="border-border bg-muted text-muted-foreground overflow-x-auto rounded-lg border px-3 py-2">
          <code className="font-mono text-mono whitespace-nowrap">
            {`import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'`}
          </code>
        </div>
      </div>
    </InstrumentPanel01>
  )
}
