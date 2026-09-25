'use client';

import type { FormEvent } from 'react';
import { Button } from '@nanisoft/prism-ui/components/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@nanisoft/prism-ui/components/field';
import { Input } from '@nanisoft/prism-ui/components/input';
import { Text } from '@nanisoft/prism-ui/components/typography';

export default function FieldDemo() {
  const preventSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

  return (
    <div role="group" aria-label="Synthetic release metadata" style={{ display: 'grid', width: 'min(100%, 420px)', gap: 12 }}>
      <Text variant="tertiary">Synthetic release metadata</Text>
      <form style={{ display: 'grid', gap: 16 }} onSubmit={preventSubmit}>
        <Field>
          <FieldLabel>Release name</FieldLabel>
          <Input name="release" placeholder="Prism catalog 0.x" required />
          <FieldDescription>Names this synthetic workstream in project navigation.</FieldDescription>
          <FieldError match="valueMissing">Enter a release name.</FieldError>
        </Field>
        <Button variant="primary" type="submit">Create release draft</Button>
      </form>
    </div>
  );
}
