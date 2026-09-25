'use client';

import { useState, type FormEvent } from 'react';
import { AuthForm } from '@nanisoft/prism-ui/blocks/auth-form';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Button } from '@nanisoft/prism-ui/components/button';
import { Text } from '@nanisoft/prism-ui/components/typography';

export default function AuthFormDemo() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div role="group" aria-label="Synthetic NaniSoft workspace sign-in" style={{ display: 'grid', justifyItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Badge variant="info">Synthetic form preview</Badge>
        <Text variant="secondary">Any valid demonstration values can be used.</Text>
      </div>
      <AuthForm
        mode="sign-in"
        onSubmit={handleSubmit}
        footer={submitted ? (
          <Text role="status"><Badge variant="success">Preview accepted</Badge> No account or data was changed.</Text>
        ) : (
          <Text>New to this workspace? <Button variant="link" href="#create-account">Create an account</Button></Text>
        )}
      />
    </div>
  );
}
