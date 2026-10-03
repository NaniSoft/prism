'use client'

import { useState } from 'react'

import { NativeSelect } from '@nanisoft/prism-ui/components/native-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nanisoft/prism-ui/components/select'
import { Field, FieldDescription, FieldLabel } from '@nanisoft/prism-ui/components/field'
import { Button } from '@nanisoft/prism-ui/components/button'

/**
 * The two selects side by side, because the point of this Component is the
 * difference between them and a reader can only see that by using both.
 *
 * The left one is the platform element: one tab stop, the platform's own keys, a
 * wheel on a phone, and it submits with the form because it is the element the HTML
 * specification says submits. The right one is a custom control whose options can
 * be more than a string, and which needs JavaScript to open at all.
 *
 * The form below is the case the native one is for: a form with no client-side
 * validation and no state, where every field submits. A control that needs
 * JavaScript to open is a control that fails open on a form which has not loaded
 * yet.
 */
const REGIONS = [
  { value: 'eu-west', label: 'Europe, Dublin' },
  { value: 'eu-central', label: 'Europe, Frankfurt' },
  { value: 'us-east', label: 'North America, Virginia' },
  { value: 'ap-southeast', label: 'Asia Pacific, Singapore' },
]

/** One of each, and the submitted value so the reader can see it arrive. */
export default function NativeSelectDemo() {
  const [region, setRegion] = useState('eu-west')
  const [status, setStatus] = useState('active')

  return (
    <div className="grid max-w-page gap-8 sm:grid-cols-2">
      <section className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          The platform element. The wheel, the picker and the form submission all still
          work, and it costs no JavaScript.
        </p>
        <Field>
          <FieldLabel htmlFor="native-region">Region</FieldLabel>
          <NativeSelect
            id="native-region"
            name="region"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            {REGIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
          <FieldDescription>One tab stop, and the platform opens it.</FieldDescription>
        </Field>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          The custom control. Its options can carry a second line, which is the case a
          native option cannot.
        </p>
        <Field>
          <FieldLabel htmlFor="custom-status">Status</FieldLabel>
          <Select value={status} onValueChange={(value) => setStatus(value ?? 'active')}>
            <SelectTrigger id="custom-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">
                <span className="flex flex-col">
                  <span>Active</span>
                  <span className="text-muted-foreground text-xs">Serving requests</span>
                </span>
              </SelectItem>
              <SelectItem value="draining">
                <span className="flex flex-col">
                  <span>Draining</span>
                  <span className="text-muted-foreground text-xs">Finishing in flight work</span>
                </span>
              </SelectItem>
              <SelectItem value="paused">
                <span className="flex flex-col">
                  <span>Paused</span>
                  <span className="text-muted-foreground text-xs">Stopped, keeping state</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            Two lines per option, which an `&lt;option&gt;` cannot hold.
          </FieldDescription>
        </Field>
      </section>

      <form
        className="flex flex-col gap-3 sm:col-span-2"
        onSubmit={(event) => event.preventDefault()}
      >
        <p className="text-muted-foreground text-sm">
          A form that submits without JavaScript. Only the native field is in it,
          because the custom one needs a change handler to submit at all.
        </p>
        <Field className="max-w-96">
          <FieldLabel htmlFor="native-form-region">Default region</FieldLabel>
          <NativeSelect id="native-form-region" name="defaultRegion" defaultValue="eu-west">
            {REGIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Button type="submit" size="sm" variant="outline" className="self-start">
          Submit
        </Button>
      </form>
    </div>
  )
}
