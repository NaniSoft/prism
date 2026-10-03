'use client'

import { useState } from 'react'

import { FilterPanel } from '@nanisoft/prism-ui/components/filter-panel'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Checkbox } from '@nanisoft/prism-ui/components/checkbox'
import { Label } from '@nanisoft/prism-ui/components/label'
import { NativeSelect } from '@nanisoft/prism-ui/components/native-select'
import { Switch } from '@nanisoft/prism-ui/components/switch'
import { Badge } from '@nanisoft/prism-ui/components/badge'

/** The three filters in the panel, as the consumer's own draft. */
const REGIONS = ['eu-west-1', 'eu-central-1', 'us-east-1', 'ap-south-1']

/**
 * The panel, and the two states that are the point of it.
 *
 * The draft below is the consumer's own state and the apply button is the
 * consumer's own handler, which is the whole argument: the panel draws the frame,
 * the summary slot and the footer slot, and everything about when a filter takes
 * effect is decided here rather than inside a layout Component. The applied count
 * only moves when Apply is pressed, and the panel has no opinion about that.
 */
export default function FilterPanelDemo() {
  const [draft, setDraft] = useState<readonly string[]>(['eu-west-1'])
  const [applied, setApplied] = useState<readonly string[]>(['eu-west-1'])
  const [healthyOnly, setHealthyOnly] = useState(false)
  const [healthyOnlyApplied, setHealthyOnlyApplied] = useState(false)

  const summary = `${draft.length} of ${REGIONS.length} regions${
    healthyOnly ? ', healthy only' : ''
  }`

  return (
    <div className="flex max-w-page flex-col gap-4">
      <FilterPanel
        className="w-80"
        title="Collectors"
        summary={summary}
        actions={
          <>
            <Button
              size="sm"
              onClick={() => {
                setApplied(draft)
                setHealthyOnlyApplied(healthyOnly)
              }}
            >
              Apply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft([])
                setHealthyOnly(false)
              }}
            >
              Clear
            </Button>
          </>
        }
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
            Region
          </legend>
          {REGIONS.map((region) => (
            <div key={region} className="flex items-center gap-2">
              <Checkbox
                id={`filter-${region}`}
                checked={draft.includes(region)}
                onCheckedChange={(checked) =>
                  setDraft((current) =>
                    checked === true
                      ? [...current, region]
                      : current.filter((entry) => entry !== region),
                  )
                }
              />
              <Label htmlFor={`filter-${region}`} className="font-normal">
                {region}
              </Label>
            </div>
          ))}
        </fieldset>

        <div className="my-4 flex items-center justify-between gap-4">
          <Label htmlFor="filter-healthy" className="font-normal">
            Healthy only
          </Label>
          <Switch
            id="filter-healthy"
            checked={healthyOnly}
            onCheckedChange={setHealthyOnly}
          />
        </div>

        <NativeSelect aria-label="Sort collectors by">
          <option value="name">Name</option>
          <option value="last">Last seen</option>
        </NativeSelect>
      </FilterPanel>

      <p className="text-muted-foreground text-sm">
        Applied: <Badge variant="secondary">{applied.length}</Badge> regions
        {healthyOnlyApplied ? ', healthy only' : ''}. Change the draft and the
        applied line does not move.
      </p>
    </div>
  )
}
