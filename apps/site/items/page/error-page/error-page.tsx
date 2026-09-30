'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'

import { ErrorPage } from '@nanisoft/prism-ui/pages/error-page'

/**
 * The failure screen, with the retry the caller wrote.
 *
 * The Demo is a client Component and the page is not, and that split is the whole
 * point of the shape: the retry is a button with a handler, it is written here in
 * the Demo's own client module, and the screen it sits on stays a server component
 * with every link, the code and the reference on the server side of the boundary.
 *
 * It renders at `h3` because the documentation page already owns an `h1`, which is
 * the same reason a block Demo nests its heading.
 */
export default function ErrorPageDemo() {
  const [attempts, setAttempts] = useState(0)

  return (
    <ErrorPage
      headingLevel="h3"
      code="503"
      title="The estate is not answering."
      description={
        attempts === 0
          ? 'Nothing was lost. The request never reached the collectors, so nothing was half written.'
          : `Three attempts so far. If the estate is still not answering, the status page has the detail.`
      }
      retry={
        <Button type="button" onClick={() => setAttempts((count) => count + 1)}>
          Try again
        </Button>
      }
      linksLabel="Where to next"
      links={[
        { label: 'Read the status page', href: '/pages/status-page' },
        { label: 'Back to the overview', href: '/overview' },
      ]}
      reference="REQ-2026-09-30-0417"
      referenceLabel="Request reference"
    >
      <p>
        If the collectors are up and this screen is still here, the request never left this browser. Quote
        the reference above when you tell somebody, because it is the only part of the failure that is
        reproducible.
      </p>
    </ErrorPage>
  )
}
