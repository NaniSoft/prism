'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@nanisoft/prism-ui/components/tooltip'

/** Tooltips on a text trigger and on an icon-only control. */
export default function TooltipDemo() {
  return (
    <div className="flex flex-wrap items-center gap-8 text-sm">
      <Tooltip>
        <TooltipTrigger className="underline decoration-dotted underline-offset-4">
          Beta feature
        </TooltipTrigger>
        <TooltipContent>Not covered by the uptime target.</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger aria-label="Copy link" className="font-medium">
          Copy link
        </TooltipTrigger>
        <TooltipContent side="bottom">Copies the current page URL.</TooltipContent>
      </Tooltip>
    </div>
  )
}
