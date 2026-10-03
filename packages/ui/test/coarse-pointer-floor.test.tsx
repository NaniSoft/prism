/**
 * The coarse-pointer floor, asserted as a class contract on every control that took it.
 *
 * **What this file can and cannot prove, said first because it is the whole limit.**
 * jsdom has no CSS engine, so a `pointer-coarse:` utility is a string in a
 * `class` attribute and nothing more: there is no `@media (pointer: coarse)` here, no
 * cascade and no box. So **no assertion below proves a size of 44 pixels.** What each
 * one proves is that the utility that expresses the floor is present on the element
 * the Component renders, which is the shape `button.test.tsx` uses and the shape
 * `DESIGN.md` states the floor is held by. A test that read these class strings and
 * claimed a measured target would be claiming something the lane cannot see.
 *
 * **Why the class and not the rendered box.** The one thing jsdom does model is a
 * rendered element and its attributes, so the assertions query by role and name and
 * read `className` off the element the Component actually produced. That catches a
 * control whose floor was moved onto a wrapper, dropped in a refactor, or put on a
 * sibling, which is the failure mode a string search over the source would miss.
 *
 * **Why a band is asserted differently from a step.** A step is one class on the
 * control. A band is a `::before`, so the class that carries it is a set of
 * `pointer-coarse:before:` utilities and the assertion has to name the pseudo-element
 * prefix, the two dimensions and the centring, because those four together are what
 * makes the band 44 by 44 on the control rather than somewhere near it. A band
 * asserted only on the presence of `pointer-coarse` would pass on a band of the wrong
 * size.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from '../src/components/ui/alert-dialog'
import { Carousel, type CarouselSlide } from '../src/components/ui/carousel'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '../src/components/ui/drawer'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../src/components/ui/dropdown-menu'
import { ImageZoom } from '../src/components/ui/image-zoom'
import { Lightbox } from '../src/components/ui/lightbox'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '../src/components/ui/menubar'
import { NativeSelect } from '../src/components/ui/native-select'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '../src/components/ui/navigation-menu'
import { PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../src/components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '../src/components/ui/popover'
import { Resizable, ResizableHandle, ResizablePanel } from '../src/components/ui/resizable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../src/components/ui/select'
import { Sidebar, SidebarHeader, SidebarToggle } from '../src/components/ui/sidebar'
import { Steps } from '../src/components/ui/steps'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../src/components/ui/tabs'
import { Toggle } from '../src/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '../src/components/ui/toggle-group'

/**
 * One assertion body for every step.
 *
 * `expected` is the exact utility the class must carry. It is spelled per control
 * rather than derived, because the difference between `size-11` and `h-11` is the
 * difference between a square target and a stretched one, and a shared helper that
 * accepted either would not be able to tell a control that had been given the wrong
 * one from a control that had been given the right one.
 */
const expectStep = (control: Element, expected: string) => {
  expect(control.className).toContain('pointer-coarse:')
  expect(control.className).toContain(expected)
}

/** The band, asserted on the four things that make it 44 by 44 and centred. */
const expectBand = (control: Element) => {
  const className = control.className
  expect(className).toContain('pointer-coarse:before:')
  expect(className).toContain('pointer-coarse:before:h-11')
  expect(className).toContain('pointer-coarse:before:w-11')
  expect(className).toContain('pointer-coarse:before:left-1/2')
  expect(className).toContain('pointer-coarse:before:top-1/2')
  expect(className).toContain('pointer-coarse:before:-translate-x-1/2')
  expect(className).toContain('pointer-coarse:before:-translate-y-1/2')
}

describe('a trigger that opens a popup takes the floor as a step', () => {
  it.each([
    {
      name: 'PopoverTrigger',
      render: () =>
        render(
          <Popover>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent>Body</PopoverContent>
          </Popover>,
        ),
      query: () => screen.getByRole('button', { name: 'Open' }),
    },
    {
      name: 'DropdownMenuTrigger',
      render: () =>
        render(
          <DropdownMenu>
            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
            <DropdownMenuContent>Body</DropdownMenuContent>
          </DropdownMenu>,
        ),
      query: () => screen.getByRole('button', { name: 'Open' }),
    },
{
      name: 'NavigationMenuTrigger',
      render: () =>
        render(
          <NavigationMenu label="Primary">
            <NavigationMenuList>
              <NavigationMenuItem value="products">
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="/one">One</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>,
        ),
      query: () => screen.getByRole('button', { name: /Products/ }),
    },
    {
      name: 'MenubarTrigger',
      render: () =>
        render(
          <Menubar label="Nexus">
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>New</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>,
        ),
      // A trigger inside a `Menubar` is a `menuitem` rather than a plain button: the
      // bar is one composite widget and the arrow keys move along it, so the role is
      // the bar's model rather than a generic control's. The floor is on the same
      // element either way.
      query: () => screen.getByRole('menuitem', { name: /File/ }),
    },
  ])('$name grows to 44 tall on a coarse pointer', ({ render: paint, query }) => {
    paint()
    expectStep(query(), 'pointer-coarse:h-11')
  })
})

describe('an alert dialog\'s three controls take the floor as a step', () => {
  const paint = () =>
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete the run?</AlertDialogTitle>
          <AlertDialogDescription>A run cannot be recovered.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction>Delete it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )

  it('on the trigger', () => {
    paint()
    expectStep(screen.getByRole('button', { name: 'Delete' }), 'pointer-coarse:h-11')
  })

  it('and on the pair in the footer, which only render once the dialog is open', () => {
    // `AlertDialog` is uncontrolled here and closed, so the trigger is what is on the
    // page. The footer is asserted through a second render with the dialog open rather
    // than through a click, because the assertion is about a class and a click would
    // add a focus-trap and a portal to what is being measured.
    const { unmount } = render(
      <AlertDialog open>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete the run?</AlertDialogTitle>
          <AlertDialogDescription>A run cannot be recovered.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction>Delete it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    // Both are asserted because they are different elements drawing different
    // surfaces, and a footer of one 44 control and one 36 is a footer a finger finds
    // unevenly spaced.
    expectStep(screen.getByRole('button', { name: 'Keep it' }), 'pointer-coarse:h-11')
    expectStep(screen.getByRole('button', { name: 'Delete it' }), 'pointer-coarse:h-11')
    unmount()
  })
})

/** Two slides, because `Carousel` omits the controls when there is only one. */
const SLIDES: CarouselSlide[] = [
  { id: 'one', children: <p>First</p>, label: 'First slide' },
  { id: 'two', children: <p>Second</p>, label: 'Second slide' },
]

describe('an icon control at the end of a row takes the floor as a square step', () => {
  it('on both of the carousel controls', () => {
    render(
      <Carousel
        slides={SLIDES}
        label="Spend by month"
        position={(index, total) => `Slide ${index} of ${total}`}
      />,
    )
    // The controls are absent rather than disabled when there is one slide, so two
    // slides is the smallest state in which there is anything to measure.
    // The default labels rather than `Previous` and `Next`, because a name this
    // Component invents is a word a consumer cannot translate and the props exist for
    // exactly that reason.
    expectStep(screen.getByRole('button', { name: 'Previous slide' }), 'pointer-coarse:size-11')
    expectStep(screen.getByRole('button', { name: 'Next slide' }), 'pointer-coarse:size-11')
  })

  it('on both of the image zoom controls', () => {
    render(
      <ImageZoom
        src="/one.png"
        alt="One"
        label="A plate"
        scale={(value) => `${value} percent`}
        zoomInLabel="Magnify the diagram"
        zoomOutLabel="Reduce the diagram"
        resetLabel="Fit the diagram to its frame"
      />,
    )
    // Both are asserted rather than only the one that is enabled, because at the
    // default magnification the reduce control is disabled and a disabled control is
    // still a control a reader aims at before it greys out.
    expectStep(screen.getByRole('button', { name: 'Magnify the diagram' }), 'pointer-coarse:size-11')
    expectStep(screen.getByRole('button', { name: 'Reduce the diagram' }), 'pointer-coarse:size-11')
  })
})

describe('Lightbox takes the floor on all four of its controls', () => {
  it.each([
    { name: 'the zoom toggle', label: 'Zoom' },
    { name: 'the previous control', label: 'Previous image' },
    { name: 'the next control', label: 'Next image' },
    { name: 'the close control', label: 'Close' },
  ])('$name is 44 by 44 on a coarse pointer', ({ label }) => {
    render(
      <Lightbox
        open
        onOpenChange={() => undefined}
        src="/one.png"
        alt="One"
        zoomLabel="Zoom"
        previousLabel="Previous image"
        nextLabel="Next image"
        closeLabel="Close"
        thumbnails={[
          { src: '/one.png', alt: 'One' },
          { src: '/two.png', alt: 'Two' },
        ]}
        index={0}
        onIndexChange={() => undefined}
      />,
    )
    expectStep(screen.getByRole('button', { name: label }), 'pointer-coarse:size-11')
  })
})

describe('the drawer close control takes the floor as a step', () => {
  it('at 44 by 44, from both of the ways in', () => {
    const { unmount } = render(
      <Drawer open>
        <DrawerContent side="right" closeLabel="Close">
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
    )
    expectStep(screen.getByRole('button', { name: 'Close' }), 'pointer-coarse:size-11')
    unmount()

    // `DrawerClose` and the control `DrawerContent` renders share one string, so the
    // caller's own close control cannot be the one that was left behind at 36.
    render(
      <Drawer open>
        <DrawerContent side="right" closeLabel="Close">
          <DrawerClose aria-label="Dismiss" />
        </DrawerContent>
      </Drawer>,
    )
    expectStep(screen.getByRole('button', { name: 'Dismiss' }), 'pointer-coarse:size-11')
  })
})

describe('PaginationLink takes the floor with min-w-11 beside it', () => {
  it('on a sized link, where the width is content', () => {
    render(
      <PaginationItem>
        <PaginationLink href="/2" size="default">
          2
        </PaginationLink>
      </PaginationItem>,
    )
    const link = screen.getByRole('link', { name: '2' })
    // Both halves, because the height alone would leave a one-digit link 20 pixels
    // wide and a floor paid on one axis is not a floor.
    expectStep(link, 'pointer-coarse:h-11')
    expectStep(link, 'pointer-coarse:min-w-11')
  })

  it('on an icon link, where it is square', () => {
    render(
      <PaginationItem>
        <PaginationLink href="/2" size="icon" aria-label="Page 2" />
      </PaginationItem>,
    )
    expectStep(screen.getByRole('link', { name: 'Page 2' }), 'pointer-coarse:size-11')
  })

  it.each([
    { name: 'PaginationPrevious', Component: PaginationPrevious, label: 'Go to the previous page' },
    { name: 'PaginationNext', Component: PaginationNext, label: 'Go to the next page' },
  ])('$name takes it, because on a phone the word is hidden and the width is the icon', ({ Component, label }) => {
    render(
      <PaginationItem>
        <Component href="/1" />
      </PaginationItem>,
    )
    const link = screen.getByRole('link', { name: label })
    expectStep(link, 'pointer-coarse:h-11')
    expectStep(link, 'pointer-coarse:min-w-11')
  })
})

describe('the sidebar toggle takes the floor as a step', () => {
  it('at 44 by 44', () => {
    render(
      <Sidebar collapsed={false} onCollapsedChange={() => undefined}>
        <SidebarHeader>
          <SidebarToggle collapseLabel="Collapse sidebar" expandLabel="Expand sidebar" />
        </SidebarHeader>
      </Sidebar>,
    )
    expectStep(
      screen.getByRole('button', { name: 'Collapse sidebar' }),
      'pointer-coarse:size-11',
    )
  })

  it('and in the collapsed rail, where it is centred by `mx-auto` in a 64px column', () => {
    render(
      <Sidebar collapsed onCollapsedChange={() => undefined}>
        <SidebarHeader>
          <SidebarToggle collapseLabel="Collapse sidebar" expandLabel="Expand sidebar" />
        </SidebarHeader>
      </Sidebar>,
    )
    // The collapsed case is asserted separately because `Sidebar` draws a different
    // header padding and centres the control in it, and a 44px control in a 64px
    // column is the tightest layout the floor puts this Component in.
    expectStep(
      screen.getByRole('button', { name: 'Expand sidebar' }),
      'pointer-coarse:size-11',
    )
  })
})

describe('a toggle and its group members take the floor with min-w-11 beside it', () => {
  it('on a Toggle, which is a button with a pressed state', () => {
    render(<Toggle>Bold</Toggle>)
    const control = screen.getByRole('button', { name: 'Bold' })
    expectStep(control, 'pointer-coarse:h-11')
    expectStep(control, 'pointer-coarse:min-w-11')
  })

  it('on a ToggleGroupItem, which is one member of a row', () => {
    render(
      <ToggleGroup aria-label="Font weight">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const control = screen.getByRole('radio', { name: 'A' })
    expectStep(control, 'pointer-coarse:h-11')
    expectStep(control, 'pointer-coarse:min-w-11')
  })
})

describe('a select trigger takes the floor as a step', () => {
  it('on the composed Select', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Plan">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="team">Team</SelectItem>
        </SelectContent>
      </Select>,
    )
    expectStep(screen.getByRole('combobox', { name: 'Plan' }), 'pointer-coarse:h-11')
  })

  it('and on the native select, which draws its own metrics for the same reason', () => {
    render(
      <NativeSelect aria-label="Plan" defaultValue="">
        <option value="">Choose</option>
        <option value="team">Team</option>
      </NativeSelect>,
    )
    // The `<select>` is announced as a combobox and the chevron beside it is
    // `pointer-events-none`, so the accessible target is the control itself.
    expectStep(screen.getByRole('combobox', { name: 'Plan' }), 'pointer-coarse:h-11')
  })
})

describe('Tabs takes the floor on the list and the trigger together', () => {
  it('because the list is h-9 p-1 and a 44 trigger would not fit inside it', () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
      </Tabs>,
    )
    // 52 on the list is the trigger's 44 plus the list's own `p-1` on each side. Both
    // halves are asserted because either alone leaves a control under the floor or a
    // list that clips one.
    expectStep(screen.getByRole('tablist'), 'pointer-coarse:h-13')
    expectStep(screen.getByRole('tab', { name: 'One' }), 'pointer-coarse:h-11')
  })
})

describe('the resizable divider takes the floor as a band and keeps its line', () => {
  const paint = (orientation: 'horizontal' | 'vertical') =>
    render(
      <Resizable label="Editor and preview" orientation={orientation}>
        <ResizablePanel size={40}>Left</ResizablePanel>
        <ResizableHandle label="Resize the split" />
        <ResizablePanel>Right</ResizablePanel>
      </Resizable>,
    )

  it.each([
    { orientation: 'horizontal' as const, drawn: 'w-px' },
    { orientation: 'vertical' as const, drawn: 'h-px' },
  ])('on a $orientation split, without changing the drawn line', ({ orientation, drawn }) => {
    paint(orientation)
    const handle = screen.getByRole('separator', { name: 'Resize the split' })
    expectBand(handle)
    // The half of the assertion that says the drawing did not move. A `w-11` divider
    // would push the right pane off the screen on a phone, because the two panes are
    // given percentages of the group and already fill it.
    expect(handle.className).toContain(drawn)
    expect(handle.className).not.toContain('pointer-coarse:w-11')
    expect(handle.className).not.toContain('pointer-coarse:h-11')
  })

  it('and it still reports the position, because a band is not the element', () => {
    paint('horizontal')
    const handle = screen.getByRole('separator', { name: 'Resize the split' })
    // The band is a pseudo-element, so the element carrying the role, the value and the
    // keyboard model is unchanged, and the drag still reads the group's box. `position`
    // rather than a panel's `size`, because `size` is a pane's share and the divider's
    // default is the middle.
    expect(handle).toHaveAttribute('aria-valuenow', '50')
    expect(handle).toHaveAttribute('tabindex', '0')
  })
})

describe('Steps is not a target and takes no floor', () => {
  /**
   * The negative half, and it is here because a 32px disc in a step rail looks exactly
   * like every other finding in this sweep and is not one.
   *
   * The marker is a `<span>` with no `role`, no `tabIndex` and no handler. It is not
   * focusable, it is not announced as a control, and a press on it falls through to the
   * step's own text. The rail is a reading structure: the `<ol>` carries `aria-label`,
   * the `<li>` carries `aria-current="step"`, and the connecting rule is `aria-hidden`.
   * There is nothing here a finger is asked to hit, so growing the disc would pay the
   * floor on a decoration and push the step's text twelve pixels down the page.
   */
  it('leaves the marker as it is drawn', () => {
    render(
      <Steps
        current={1}
        label="Progress"
        steps={[
          { label: 'First', description: 'One sentence.' },
          { label: 'Second', description: 'One sentence.' },
        ]}
      />,
    )
    const marker = document.querySelector('[data-slot="step-marker"]')
    expect(marker).not.toBeNull()
    expect(marker?.className).toContain('size-8')
    expect(marker?.className).not.toContain('pointer-coarse')
    // It is not a control, and that is the whole reason.
    expect(marker?.getAttribute('role')).toBeNull()
    expect(marker?.getAttribute('tabindex')).toBeNull()
  })
})
