'use client'

import { useState } from 'react'

import { Field, FieldLabel } from '@nanisoft/prism-ui/components/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@nanisoft/prism-ui/components/select'

/** A labelled Select with a grouped option list and a controlled value. */
export default function SelectDemo() {
  const [role, setRole] = useState('editor')

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <Field>
        <FieldLabel htmlFor="select-role">Role</FieldLabel>
        <Select
          value={role}
          onValueChange={(value) => setRole(value ?? '')}
          items={{ viewer: 'Viewer', editor: 'Editor', admin: 'Admin' }}
        >
          <SelectTrigger id="select-role" className="w-full">
            <SelectValue placeholder="Choose a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Team roles</SelectLabel>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="select-region">Region</FieldLabel>
        <Select
          defaultValue="eu-west"
          items={{
            'eu-west': 'Europe West',
            'us-east': 'US East',
            'ap-south': 'Asia South',
          }}
        >
          <SelectTrigger id="select-region" className="w-full">
            <SelectValue placeholder="Choose a region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="eu-west">Europe West</SelectItem>
            <SelectItem value="us-east">US East</SelectItem>
            <SelectItem value="ap-south" disabled>
              Asia South (paused)
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}
