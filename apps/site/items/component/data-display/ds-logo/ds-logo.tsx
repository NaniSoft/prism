import { DSLogo } from '@nanisoft/prism-ui/components/ds-logo'

const src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='128'><text x='16' y='80' font-family='sans-serif' font-size='48'>NaniSoft</text></svg>"

/** The lockup at two governed heights. */
export default function DsLogoDemo() {
  return (
    <div className="flex items-center gap-6">
      <DSLogo src={src} alt="NaniSoft" size="md" />
      <DSLogo src={src} alt="NaniSoft" size="lg" />
    </div>
  )
}
