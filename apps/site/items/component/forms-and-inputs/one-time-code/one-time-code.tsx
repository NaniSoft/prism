'use client'

import { useState } from 'react'

import { Label } from '@nanisoft/prism-ui/components/label'
import { OneTimeCode } from '@nanisoft/prism-ui/components/one-time-code'

/**
 * Two codes side by side: a numeric one that reports what it refused, and an
 * alphanumeric recovery code that folds case and is drawn in groups.
 */
export default function OneTimeCodeDemo() {
  const [code, setCode] = useState('')
  const [complete, setComplete] = useState<string | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  const [recovery, setRecovery] = useState('')

  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <div className="flex flex-col items-start gap-3">
        <Label htmlFor="one-time-code-verify">Verification code</Label>
        <OneTimeCode
          id="one-time-code-verify"
          label="Verification code"
          length={6}
          characters="numeric"
          name="code"
          value={code}
          onValueChange={(next) => {
            setCode(next)
            setComplete(null)
          }}
          segmentLabel={(index) => `Digit ${index + 1} of 6`}
          grouping={{ after: [2], separator: ' ' }}
          onComplete={setComplete}
          onInvalid={setRefused}
        />
        <p className="text-muted-foreground text-sm">
          {complete === null
            ? 'Paste the whole code into the first box and it fills them all.'
            : `Complete: ${complete}`}
        </p>
        {refused === null ? null : (
          <p role="status" className="text-destructive text-sm">
            We could not use {refused}.
          </p>
        )}
      </div>

      <div className="flex flex-col items-start gap-3">
        <Label htmlFor="one-time-code-recovery">Recovery code</Label>
        <OneTimeCode
          id="one-time-code-recovery"
          label="Recovery code"
          length={8}
          characters="alphanumeric"
          value={recovery}
          onValueChange={setRecovery}
          segmentLabel={(index) => `Character ${index + 1} of 8`}
          grouping={{ after: [3], separator: '-' }}
          normalize={(next) => next.toLowerCase()}
        />
        <p className="text-muted-foreground text-sm">
          Case is folded as it is entered, so a code read aloud in capitals still
          matches the one your service stored in lower case.
        </p>
      </div>
    </div>
  )
}
