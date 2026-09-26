'use client'

import { AppShell01 } from '@nanisoft/prism-ui/blocks/app-shell-01'

const LINKS = [
  { href: '#dashboard', label: 'Dashboard', current: true },
  { href: '#projects', label: 'Projects', current: false },
  { href: '#team', label: 'Team', current: false },
]

/** The application shell with a rail, a top bar and a mobile navigation sheet. */
export default function AppShell01Demo() {
  return (
    <AppShell01
      navigationLabel="Primary"
      brand={<span className="text-sm font-semibold">Northwind</span>}
      breadcrumbs={[
        { label: 'Dashboard', href: '#dashboard' },
        { label: 'Projects' },
      ]}
      actions={
        <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
          AR
        </span>
      }
      navigation={
        <ul className="flex flex-col gap-1 text-sm">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={
                  link.current
                    ? 'bg-accent text-accent-foreground block rounded-md px-3 py-2 font-medium'
                    : 'text-muted-foreground hover:text-foreground block rounded-md px-3 py-2'
                }
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      }
    >
      <div className="border-border rounded-xl border border-dashed p-6">
        <h3 className="font-semibold">Main content</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          The shell owns the frame; the application owns this region.
        </p>
      </div>
    </AppShell01>
  )
}
