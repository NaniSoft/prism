'use client';

import { useState, type FormEvent } from 'react';
import { SiteHeader } from '@nanisoft/prism-ui/blocks/site-header';
import { AuthPage } from '@nanisoft/prism-ui/pages/auth-page';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Button } from '@nanisoft/prism-ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@nanisoft/prism-ui/components/card';
import { Heading, Text } from '@nanisoft/prism-ui/components/typography';
import { Separator } from '@nanisoft/prism-ui/components/separator';

const NAV = [
  { label: 'Catalog', url: '#catalog' },
  { label: 'Release guide', url: '#release-guide' },
];

export default function AuthPageDemo() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div role="group" aria-label="Synthetic NaniSoft authentication page" style={{ height: 680, border: '1px solid var(--prism-border)', borderRadius: 4, overflow: 'auto' }}>
      <AuthPage
        landmark="region"
        mode="sign-in"
        onSubmit={handleSubmit}
        header={(
          <SiteHeader
            site="prism"
            nav={NAV}
            cta={<Button href="#catalog" variant="primary" size="sm">View catalog</Button>}
            modeSwitch={false}
            sticky={false}
          />
        )}
        aside={(
          <div style={{ display: 'grid', width: 'min(100%, 440px)', gap: 20 }}>
            <Badge variant="info">Synthetic NaniSoft preview</Badge>
            <Card>
              <CardHeader>
                <CardTitle level={2}>A clear path into the release</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gap: 14 }}>
                  <Heading level={3} size="md">One workspace, three layers</Heading>
                  <Text variant="secondary">Components, blocks, and pages keep the catalog release legible from the first sign-in.</Text>
                  <Separator />
                  <Text variant="tertiary">This page is an application-owned preview. It does not create an account or persist any values.</Text>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        footer={submitted ? (
          <Text role="status"><Badge variant="success">Preview accepted</Badge> No account or data was changed.</Text>
        ) : (
          <Text>New to this workspace? <Button variant="link" href="#create-account">Create an account</Button></Text>
        )}
      />
    </div>
  );
}
