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
 * **The panel is a schematic, and it is honest about being one.** The Block
 * draws its specification into one column and holds the other for evidence, and
 * a specification with no panel is a band at half a page arguing to the void.
 * What fills it is neither a screenshot nor the package running: it is the two
 * applications drawn as wireframe readouts, the figure language the family's
 * editorial figures already speak, with each frame naming the route the action
 * beside it opens. A wireframe makes no claim about pixels a release could rot,
 * and the route chips say what it is a drawing of. The whole figure is
 * `aria-hidden`, because the specification a screen reader reads is the band's
 * content and the panel is the picture of it.
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
      media={
        <div aria-hidden="true" className="grid gap-3 sm:grid-cols-2">
          <div className="bg-background border-border flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center gap-1.5">
              <span className="bg-primary size-2 rounded-full" />
              <span className="text-foreground font-mono text-mono font-semibold">Meridian</span>
              <span className="bg-foreground/20 ms-2 h-1 w-5 rounded-full" />
              <span className="bg-foreground/20 h-1 w-4 rounded-full" />
              <span className="bg-primary ms-auto h-2.5 w-7 rounded-sm" />
            </div>
            <div className="flex flex-col gap-1 py-1">
              <span className="text-foreground text-xs font-semibold tracking-tight">
                Every order, one morning.
              </span>
              <span className="bg-foreground/25 h-1 w-3/4 rounded-full" />
            </div>
            <div className="flex gap-1.5">
              <span className="bg-primary h-4 w-12 rounded-sm" />
              <span className="border-border h-4 w-12 rounded-sm border" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <div className="bg-muted flex flex-col gap-0.5 rounded-sm p-1.5">
                <span className="text-foreground font-mono text-mono font-semibold">1,900</span>
                <span className="bg-foreground/25 h-1 w-8 rounded-full" />
              </div>
              <div className="bg-muted flex flex-col gap-0.5 rounded-sm p-1.5">
                <span className="text-foreground font-mono text-mono font-semibold">4.2M</span>
                <span className="bg-foreground/25 h-1 w-8 rounded-full" />
              </div>
              <div className="bg-muted flex flex-col gap-0.5 rounded-sm p-1.5">
                <span className="text-foreground font-mono text-mono font-semibold">96%</span>
                <span className="bg-foreground/25 h-1 w-8 rounded-full" />
              </div>
            </div>
            <span className="text-muted-foreground mt-auto pt-1 font-mono text-mono uppercase">
              /showcase/landing
            </span>
          </div>

          <div className="bg-background border-border flex gap-2.5 rounded-lg border p-3">
            <div className="bg-muted flex w-7 flex-col items-center gap-1.5 rounded-sm py-2">
              <span className="bg-primary size-2 rounded-full" />
              <span className="bg-primary/40 h-1 w-3.5 rounded-full" />
              <span className="bg-foreground/20 h-1 w-3.5 rounded-full" />
              <span className="bg-foreground/20 h-1 w-3.5 rounded-full" />
              <span className="bg-foreground/20 h-1 w-3.5 rounded-full" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-muted flex flex-col gap-0.5 rounded-sm p-1.5">
                  <span className="text-muted-foreground font-mono text-mono">Revenue</span>
                  <span className="text-foreground font-mono text-xs font-semibold">$48,120</span>
                </div>
                <div className="bg-muted flex flex-col gap-0.5 rounded-sm p-1.5">
                  <span className="text-muted-foreground font-mono text-mono">Orders</span>
                  <span className="text-foreground font-mono text-xs font-semibold">1,204</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {[
                  ['M-10482', 'bg-success'],
                  ['M-10481', 'bg-primary'],
                  ['M-10479', 'bg-warning'],
                ].map(([id, dot]) => (
                  <div key={id} className="border-border flex items-center gap-1.5 border-t pt-1">
                    <span className={`${dot} size-1.5 shrink-0 rounded-full`} />
                    <span className="text-foreground font-mono text-mono">{id}</span>
                    <span className="bg-foreground/20 ms-auto h-1.5 w-8 rounded-full" />
                  </div>
                ))}
              </div>
              <span className="text-muted-foreground mt-auto pt-1 font-mono text-mono uppercase">
                /showcase/admin
              </span>
            </div>
          </div>
        </div>
      }
      mediaLabel="The two applications drawn as schematics: the landing's page and the console's overview table, the routes the actions beside them open"
      actions={[
        { label: 'Open the landing', href: '/showcase/landing' },
        { label: 'Open the console', href: '/showcase/admin', variant: 'outline' },
      ]}
    />
  )
}
