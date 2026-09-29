'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  NavigationMenu,
  NavigationMenuBackdrop,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@nanisoft/prism-ui/components/navigation-menu'

/**
 * A header of link groups, with the current page marked.
 *
 * The keepMounted switch is here so the cost of the closed group is visible: with
 * it off, a reader with JavaScript off and a crawler see the triggers and nothing
 * else, which is usually right and is a real trade.
 */
export default function NavigationMenuDemo() {
  const [keepMounted, setKeepMounted] = useState(false)
  const [current, setCurrent] = useState('/products/alpha')

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <NavigationMenu label="Primary">
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent {...(keepMounted ? { keepMounted: true } : null)}>
              <NavigationMenuLink
                href="/products/alpha"
                active={current === '/products/alpha'}
              >
                Alpha
              </NavigationMenuLink>
              <NavigationMenuLink
                href="/products/beta"
                active={current === '/products/beta'}
              >
                Beta
              </NavigationMenuLink>
              <NavigationMenuLink
                href="/products/gamma"
                active={current === '/products/gamma'}
              >
                Gamma
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem value="docs">
            <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
            <NavigationMenuContent {...(keepMounted ? { keepMounted: true } : null)}>
              <NavigationMenuLink
                href="/docs/foundation"
                active={current === '/docs/foundation'}
              >
                Foundation
              </NavigationMenuLink>
              <NavigationMenuLink
                href="/docs/components"
                active={current === '/docs/components'}
              >
                Components
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem value="company">
            <NavigationMenuTrigger>Company</NavigationMenuTrigger>
            <NavigationMenuContent {...(keepMounted ? { keepMounted: true } : null)}>
              <NavigationMenuLink href="/company/about">About</NavigationMenuLink>
              <NavigationMenuLink href="/company/careers">Careers</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>

        <NavigationMenuPortal>
          <NavigationMenuBackdrop />
          <NavigationMenuPositioner>
            <NavigationMenuPopup>
              <NavigationMenuViewport />
            </NavigationMenuPopup>
          </NavigationMenuPositioner>
        </NavigationMenuPortal>
      </NavigationMenu>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => setKeepMounted((on) => !on)}>
          {keepMounted ? 'Unmount closed groups' : 'Keep closed groups mounted'}
        </Button>
        <span className="text-muted-foreground text-sm">Now on {current}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">
          Pretend the reader moved to:
        </span>
        {['/products/alpha', '/products/beta', '/docs/foundation'].map((path) => (
          <Button key={path} variant="ghost" size="sm" onClick={() => setCurrent(path)}>
            {path}
          </Button>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">
        The current page is marked with aria-current rather than a colour, so it
        survives a theme change and a reader who cannot distinguish the fill.
      </p>
    </div>
  )
}
