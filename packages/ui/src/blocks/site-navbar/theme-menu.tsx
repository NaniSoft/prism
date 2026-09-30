'use client'

import { ChevronDown } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { usePrismTheme } from '../../provider/provider'
import { PACKS, type PackId } from '../../theming'

/** One pack the menu offers, and the word a reader reads for it. */
export type ThemePack = {
  /** The pack identifier, which is a token rather than a string. */
  id: PackId
  /** The pack's own name. */
  name: string
}

/** The props the theme menu takes. */
export type ThemeMenuProps = {
  /** The packs to choose between. Defaults to every published pack. */
  packs?: readonly ThemePack[]
  /** The accessible name of the menu, and of the word on its trigger. */
  label: string
}

/**
 * The name a pack is offered under when the caller names none.
 *
 * Capitalising the identifier is enough rather than a table, because the pack
 * vocabulary is closed and every id in it is the lowercased form of its own name.
 * The alternative is a lookup that could fall through for a pack added after this
 * line was written, and a fallthrough here is a menu item with no readable name.
 */
function nameOf(pack: PackId): string {
  return pack.charAt(0).toUpperCase() + pack.slice(1)
}

/**
 * The pack chooser, as a menu.
 *
 * **The swatch is a pack boundary rather than a literal colour, and that is the
 * whole of how this component avoids a runtime token read.** The obvious
 * implementation reads each pack's compiled `--primary` and paints it as an inline
 * style, which is what Prism's own documentation site did. A token resolved at
 * runtime does not follow the cascade, so the dot holding a pack's colour is right
 * in one mode and stale in the other, and it is the exact defect the
 * `runtime-token-read` law names: the disagreement is between what is painted and
 * what the cascade says, and only a program that reads the read can see it.
 *
 * `data-pack` on a span carrying `bg-primary` resolves through the cascade, holds
 * every pack at once, and ships no client code. The boundary is safe on this shape
 * and only this shape: a pack repoints its own corner radius as well as its colour,
 * so a boundary on anything that is not fully rounded would quietly restyle that
 * element's corners. A disc is fully rounded, so the radius axis is a no-op here.
 *
 * **It is a radio group rather than a list of commands.** One pack is active at a
 * time out of a known set, which is what a radio group is for, and it is what
 * gives the menu its announced state: a reader who opens the chooser hears which
 * of the packs is in use, where a list of commands would announce six buttons and
 * leave them to work out which one took effect.
 *
 * **The trigger shows the active pack's name, and drops it below `sm`.** Six
 * options side by side need about 380 pixels, which is why this is a menu at all
 * rather than a row of pills, and the name on the trigger is the one place the
 * choice stays visible once the menu is closed. It is hidden rather than shortened
 * below `sm` because a truncated pack name is a word that names nothing.
 */
export function ThemeMenu({ packs, label }: ThemeMenuProps) {
  const { pack, setPack } = usePrismTheme()
  const options = packs ?? PACKS.map((id) => ({ id, name: nameOf(id) }))
  const active = options.find((option) => option.id === pack) ?? options[0]

  if (!active) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="site-navbar-theme-trigger"
        aria-label={`${label}: ${active.name}`}
        className="border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground h-11 shrink-0 gap-2 rounded-full border pr-2.5 pl-3"
      >
        <span
          data-pack={active.id}
          aria-hidden
          className="border-border/60 bg-primary size-3.5 rounded-full border"
        />
        <span className="hidden sm:inline">{active.name}</span>
        <ChevronDown aria-hidden className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-52">
        {/*
          The label is inside the radio group rather than beside it, because Base
          UI's group label is a part of the group: rendered directly in the menu it
          throws, having no group to name. A radio group is a group, so this is
          where the heading belongs, and it is also what makes the heading describe
          the choices below it rather than the menu around them.
        */}
        <DropdownMenuRadioGroup value={active.id} onValueChange={(value) => setPack(value as PackId)}>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.id} value={option.id} closeOnClick>
              <span
                data-pack={option.id}
                aria-hidden
                className="border-border/60 bg-primary size-3.5 shrink-0 rounded-full border"
              />
              <span className="flex-1">{option.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
