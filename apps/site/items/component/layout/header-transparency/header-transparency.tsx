import { HeaderTransparency } from '@nanisoft/prism-ui/components/header-transparency'

/**
 * The state, with nothing to write: this component renders nothing and exists
 * only for the two attributes it flips, so the demo is a caption saying so.
 */
export default function HeaderTransparencyDemo() {
  return (
    <div className="bg-card rounded-xl border p-10">
      <p className="text-muted-foreground max-w-168 text-lg text-pretty">
        This component renders nothing. It writes `data-header="transparent"` on the
        document and `data-scrolled` on the page bar as the reader scrolls, and the
        package stylesheet does the rest. Scroll this page to see the bar above turn
        translucent.
      </p>
      <HeaderTransparency />
    </div>
  )
}
