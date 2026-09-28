'use client'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Input } from '@nanisoft/prism-ui/components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@nanisoft/prism-ui/components/popover'

/** A popover holding a small share form. */
export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger>Share</PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Share this view</p>
            <p className="text-muted-foreground text-sm">
              Anyone with the link can read, not edit.
            </p>
          </div>
          <div className="flex gap-2">
            <Input defaultValue="https://prism.nanisoft.com/themes" readOnly />
            <Button variant="outline">Copy</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
