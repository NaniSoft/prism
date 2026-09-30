'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nanisoft/prism-ui/components/card'
import { Code, CodeBlock } from '@nanisoft/prism-ui/components/code-block'

/**
 * A snippet, with the gutter on.
 *
 * It is Prism's own source for the prop it documents, which is the point: a demo
 * that quotes a real file cannot drift from it, and a reader who copies this and
 * pastes it into a file gets something that compiles.
 */
const SNIPPET = `export type ChartSeries = {
  name: string
  values: number[]
  tone?: ChartColor
}`

/** A command, with no gutter, which is the case that is read rather than referred to. */
const COMMAND = 'pnpm --filter @nanisoft/prism-ui exec tsc --noEmit'

/**
 * The caller's own copy control.
 *
 * It is built here rather than taken from the component package because the
 * package ships none: a copy button needs an accessible name, and a hardcoded
 * one is a word the consumer cannot localise. The label changes with the state
 * and lives in this Demo, which is the site's own content, so the component only
 * has to hold the button.
 */
function CopyControl({ value }: { value: string }) {
  const [done, setDone] = useState(false)

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={done ? 'Copied to the clipboard' : 'Copy this snippet'}
      onClick={() => {
        void navigator.clipboard?.writeText(value)
        setDone(true)
      }}
    >
      {done ? 'Copied' : 'Copy'}
    </Button>
  )
}

export default function CodeBlockDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle as="h3">A snippet with a gutter and a control</CardTitle>
          <CardDescription>
            The header names the file and the language in the mono face, the
            numbers run down the left, and the copy control belongs to the caller
            button under the name the caller gave it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            label="The series type a Chart takes"
            filename="chart.tsx"
            language="tsx"
            lineNumbers
            actions={<CopyControl value={SNIPPET} />}
            code={SNIPPET}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h3">A command, with no gutter and no control</CardTitle>
          <CardDescription>
            A snippet with no filename, no language and no control is a tinted box
            of monospace, so it is not named and the header is not drawn. The
            type makes <code className="font-mono">label</code> optional only in
            this shape.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock code={COMMAND} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h3">Inline, in a sentence</CardTitle>
          <CardDescription>
            <code className="font-mono">Code</code> is the same idea at the size
            of a word, for a symbol a reader types or a name a reader looks up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-measure flex-col gap-3 text-sm">
            <p>
              Pass <Code>--strict</Code> to <Code>tsc</Code> to fail the build on
              an implicit <Code>any</Code>. The flag is on{' '}
              <Code>tsconfig.json</Code> at the repository root, and the component
              that reads it is <Code>ChartFrame</Code>.
            </p>
            <p>
              A surface with no <Code>tone</Code> takes the supporting ink rather
              than one of the five series roles, so a chart whose series are all
              un-named is visibly a shape rather than five things.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">
        Nothing on this page is highlighted. The reason is the one in the
        Overview: a highlighter brings its own vocabulary for what a token means,
        and the day it is in the product there are two files to keep in step and a
        pack that moves a step leaves the second one behind. What you get instead
        is the gutter, which is a table of contents rather than decoration. If you
        want highlighting, compose it around the item or bring your own control
        through <code className="font-mono">actions</code>.
      </p>
    </div>
  )
}
