'use client'

import { useState } from 'react'
import { XIcon } from 'lucide-react'

import { Label } from '@nanisoft/prism-ui/components/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@nanisoft/prism-ui/components/input-group'

/**
 * Three joined fields side by side: a unit with a clear action, a currency prefix,
 * and a disabled one so the dimming is visible rather than described.
 */
export default function InputGroupDemo() {
  const [weight, setWeight] = useState('72')
  const [price, setPrice] = useState('24.00')
  const [handle, setHandle] = useState('prism')

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="input-group-weight">Parcel weight</Label>
        <InputGroup>
          <InputGroupInput
            id="input-group-weight"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            inputMode="decimal"
          />
          <InputGroupAddon position="suffix">kg</InputGroupAddon>
          <InputGroupButton
            aria-label="Clear the parcel weight"
            onClick={() => setWeight('')}
          >
            <XIcon className="size-4" aria-hidden="true" />
          </InputGroupButton>
        </InputGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="input-group-price">Price</Label>
        <InputGroup>
          <InputGroupAddon position="prefix">GBP</InputGroupAddon>
          <InputGroupInput
            id="input-group-price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            inputMode="decimal"
          />
        </InputGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="input-group-handle" disabled>
          Workspace handle
        </Label>
        <InputGroup>
          <InputGroupAddon position="prefix">prism.app/</InputGroupAddon>
          <InputGroupInput
            id="input-group-handle"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            disabled
          />
        </InputGroup>
      </div>
    </div>
  )
}
