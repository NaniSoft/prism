'use client'

import { Slider } from '@nanisoft/prism-ui/components/slider'

/** Sliders for an adjustable value, a stepped value and a disabled one. */
export default function SliderDemo() {
  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Opacity</p>
        <Slider defaultValue={75} aria-label="Opacity" />
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Export size</p>
        <Slider defaultValue={40} aria-label="Export size" min={0} max={100} step={10} />
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm font-medium">Frame rate</p>
        <Slider defaultValue={60} aria-label="Frame rate" disabled />
      </div>
    </div>
  )
}
