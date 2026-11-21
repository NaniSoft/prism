import { CodeBlock } from '@nanisoft/prism-ui/components/code-block'
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section'

const INSTALL = 'pnpm add @nanisoft/prism-ui'

const USAGE = `import '@nanisoft/prism-ui/styles.css'
import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'

<Hero01
  headingLevel="h1"
  title="Your product, composed."
  description="One import, one stylesheet, no CSS."
  actions={[{ label: 'Start', href: '/start' }]}
/>`

/**
 * The landing's install band: the two commands a consumer actually runs.
 *
 * The page used to describe the install in prose and never show it. A reader
 * deciding whether to adopt a component library wants the command and the import
 * in the first two screens, and a code surface is the one figure that cannot be
 * mistaken for marketing copy.
 *
 * **The two figures do not split the band evenly, because they are not the same
 * size.** A one-line command in a column matched to an eight-line snippet
 * renders as a box that is mostly air, and air around a command does not read as
 * confidence, it reads as a figure that failed to size itself. The install
 * column takes two tracks and the source column takes three, so each surface
 * closes at roughly its own height and the band reads as a command and its
 * consequence instead of as two equal boxes.
 *
 * It is site apparatus: the words are this page's, the surface is `CodeBlock`,
 * and the page owns the two-column arrangement rather than a Block that would
 * only ever be used here. The source figure carries the gutter, because it is
 * source a reader might scroll and count; the command is one line and a gutter
 * of one is noise.
 */
export function InstallBand() {
  return (
    <Section>
      <SectionHeading
        as="h2"
        title="Install once. Compose everything."
        description="One package carries the components, the blocks, the tokens, the stylesheet and the gates. A consumer imports the sheet once and writes no CSS."
        className="mx-auto max-w-measure mb-10"
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="flex min-w-0 flex-col gap-2 lg:col-span-2">
          <span className="text-muted-foreground font-mono text-mono uppercase">install</span>
          <CodeBlock code={INSTALL} language="sh" filename="terminal" />
        </div>
        <div className="flex min-w-0 flex-col gap-2 lg:col-span-3">
          <span className="text-muted-foreground font-mono text-mono uppercase">compose</span>
          <CodeBlock code={USAGE} language="tsx" filename="app/page.tsx" lineNumbers />
        </div>
      </div>
    </Section>
  )
}
