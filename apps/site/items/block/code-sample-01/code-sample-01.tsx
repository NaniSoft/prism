import { Button } from '@nanisoft/prism-ui/components/button'
import { CodeSample01 } from '@nanisoft/prism-ui/blocks/code-sample-01'

/** A small, complete sample: the import, the component, and the call. */
const INSTALL = `import { PrismProvider } from '@nanisoft/prism-ui/provider'

export default function App({ children }: { children: React.ReactNode }) {
  return <PrismProvider>{children}</PrismProvider>
}
`

/** A second one, short enough that a gutter would be in the way. */
const PACK = `pnpm add @nanisoft/prism-ui @nanisoft/prism-tokens
import '@nanisoft/prism-ui/styles.css'
`

/** Both layouts, and both arms of the name union: one with a control, one without. */
export default function CodeSample01Demo() {
  return (
    <>
      <CodeSample01
        headingLevel="h3"
        eyebrow="Preview"
        title="The one line that has to be in the tree"
        description="The provider carries the pack and mode through context and writes the two document attributes. It is optional, and a page that never changes a pack never needs it."
        language="tsx"
        filename="app/providers.tsx"
        lineNumbers
        code={INSTALL}
        label="app/providers.tsx, the Prism provider"
        actions={<Button size="sm" variant="ghost">Copy</Button>}
      />

      <CodeSample01
        layout="inline"
        headingLevel="h3"
        title="Installed beside one stylesheet"
        description="The same band inside a section the page already owns. No name is passed, because there is no control here for a name to identify."
        code={PACK}
      />
    </>
  )
}
