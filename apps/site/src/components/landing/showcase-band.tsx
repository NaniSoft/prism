import { Showcase01 } from '@nanisoft/prism-ui/blocks/showcase-01'

/**
 * The landing's showcase band: two whole applications, linked, not pictured.
 *
 * The page's law is that every figure is the package running rather than a
 * picture of it, and the two showcase apps are that law at full scale: a
 * fictional store operations product whose marketing site and admin console are
 * separate consumers, each importing the stylesheet this page imports and owning
 * neither a sheet nor a script. A screenshot here would be a second copy of
 * their appearance the next release silently rots, so the band is a
 * specification and the actions are the applications themselves.
 *
 * The facts name the two surfaces by what they hold rather than by counts that
 * would go stale the day either app grows a route.
 */
export function ShowcaseBand() {
  return (
    <Showcase01
      headingLevel="h2"
      eyebrow="The showcase"
      name="Meridian"
      standfirst="One fictional product, two whole applications, composed entirely from this package and published beside this site: the marketing site at /showcase/landing and the admin console at /showcase/admin, each with its own gate chain, its own pack of routes and not one stylesheet or script of its own."
      facts={[
        { label: 'The landing', value: 'Hero, pricing, about and contact, from the marketing Blocks' },
        { label: 'The console', value: 'Overview, orders, products, customers and settings, in the application shell' },
        { label: 'One stylesheet', value: 'Both apps import @nanisoft/prism-ui/styles.css once and own no sheet' },
        { label: 'No scripts', value: 'Neither app registers a client boundary or holds a handler' },
      ]}
      actions={[
        { label: 'Open the landing', href: '/showcase/landing' },
        { label: 'Open the console', href: '/showcase/admin', variant: 'outline' },
      ]}
    />
  )
}
