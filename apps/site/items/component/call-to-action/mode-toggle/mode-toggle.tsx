'use client'

import { ModeToggle } from '@nanisoft/prism-ui/components/mode-toggle'
import { PrismProvider } from '@nanisoft/prism-ui/provider'

/**
 * The control, at both sizes, inside the provider it needs.
 *
 * The provider is here because the control writes the theme rather than reading
 * it, and writing the theme means writing the two document attributes, which is
 * the provider's job and not a Component's. It is the only Component in the
 * library with that dependency, and the Demo is the place a reader can see what
 * it costs: without the provider around it, the hook throws.
 *
 * Note what the Demo does not do: it does not set `data-pack` or `dark` itself.
 * The provider writes both, and the page's mode is whatever the reader last chose
 * rather than whatever this Demo decided when it rendered.
 */
export default function ModeToggleDemo() {
  return (
    <PrismProvider>
      <div className="flex max-w-measure-wide flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <ModeToggle label="Switch to dark mode" />
          <ModeToggle label="Switch to dark mode" size="sm" />
          <span className="text-muted-foreground text-sm">
            Press either one. The icon is the mode you are about to get, so the
            picture and the name never disagree.
          </span>
        </div>
      </div>
    </PrismProvider>
  )
}
