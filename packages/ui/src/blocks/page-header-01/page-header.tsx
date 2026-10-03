import { Fragment, type ReactNode } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb'
import { CtaLink } from '../../components/ui/cta-link'
import { Separator } from '../../components/ui/separator'
import { Heading, Text, type HeadingElement } from '../../components/ui/typography'

export type PageHeaderCrumb = {
  label: ReactNode
  /** Renders a native anchor. Omit on the current, final step. */
  href?: string
}

/**
 * One action in a page header's action row that names a destination.
 *
 * One of the two arms of `PageHeaderAction`, and named rather than left as an inline
 * member of the union so a caller assembling a row from its own data can say which
 * arm it is building. `href` is required and that is the whole of the arm.
 */
export type PageHeaderLinkAction = {
  /** The words on the control. Every string a page header renders is the caller's. */
  label: string
  /**
   * Where the action goes. Rendered as a native anchor's `href`.
   *
   * **Required rather than optional, and this Block is where the omission was
   * worst.** The action type had no `href` member at all, so every declared action
   * rendered a bare `<Button>`: focusable, announced as a button, and activating to
   * nothing. A page header is the top of a screen, so those were the first controls
   * a reader met on every page of a consumer's product and the first ones they
   * reached by Tab.
   */
  href: string
  /** Opens the destination in a new browsing context, with the matching `rel`. */
  newTab?: boolean
  /**
   * Which weight this action draws at, when the caller does not say.
   *
   * Defaults to `default` for the first action in the row and `outline` for the
   * rest. A slot carries its own weight, so it does not take one from here.
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /**
   * Which size this action draws at, when the caller does not say. `default` here
   * means the Component's own, which is `default`.
   */
  size?: 'default' | 'sm' | 'lg'
  /**
   * Forbidden, so that an action cannot be both a destination and a caller's own
   * control. The two are rendered by different code on different elements, and a
   * value carrying both would have to pick one silently.
   */
  slot?: never
}

/**
 * One action in a page header's action row that is the caller's own control.
 *
 * **This is the arm that replaced a rendered button, and the reason it is a slot
 * rather than an `onClick` is that a Block cannot receive one.** This is a server
 * Component, so a handler is not a prop it can be given, and every declared action
 * used to render a bare `<Button>`. A page header is the one place on a screen where
 * a dead control is worst, because a reader arriving at a new page looks at the top
 * of it first.
 *
 * What belongs here is what a header actually carries: a control that opens a menu,
 * a router's own `Link` for a client-side transition, a share sheet. What does not
 * belong here is a plain anchor; that is the other arm.
 */
export type PageHeaderSlotAction = {
  /**
   * The caller's own control, placed in the row where this action sits.
   *
   * The whole control, including its own label, its own weight and any icon. The
   * Block draws no frame around it and adds no class to it, because a class it adds
   * is a style the caller cannot see and cannot remove, and this package has no
   * override path.
   */
  slot: ReactNode
  /**
   * Forbidden on this arm, and for a reason rather than by tidiness: the Block
   * renders `slot` and nothing else, so a `label` beside it would be a word no
   * reader ever sees and a caller would reasonably believe had been rendered.
   */
  label?: never
  /** Forbidden: an anchor belongs on the other arm, where Prism renders it. */
  href?: never
  /** Forbidden with `href`, for the same reason. */
  newTab?: never
  /**
   * Forbidden, because the Block cannot style a node it does not render. A weight
   * accepted here and dropped would be the one prop in this Block that a reader of
   * the type could believe was in effect when it is not.
   */
  variant?: never
  /** Forbidden, for the same reason. */
  size?: never
}

/**
 * One action in a page header's action row, as a union of the two things an action
 * in this position can honestly be.
 *
 * **This replaces a single shape with no destination member at all**, which is a
 * worse starting point than the one a hero had: there was no optional `href` to
 * tighten, there was no `href` at all, so `{ label: 'New deployment' }` was the only
 * value the type could express and every value produced a dead button. The union is
 * what gives the caller a second thing to say, and the required `href` on the first
 * arm is what makes the mistake loud rather than silent.
 *
 * **The slot is an arm of the row rather than the sibling prop `actionsSlot` was,
 * and that is the one structural change here.** A sibling slot renders before the
 * row's own actions and cannot say which position it fills, so a caller who wanted
 * a primary menu trigger at the front and a link behind it had to put the link first
 * and accept the order, or pass the trigger in `actions` where it was a dead button.
 * As an arm, position and element are the same value. `actionsSlot` is therefore
 * gone, and a consumer who passed one moves the node it holds into `actions`.
 *
 * It is declared here rather than imported from `hero-01`, following
 * `ProcessFlow01`'s note on the same point: a page header and a hero are different
 * sections making different claims, and a consumer composing one has no reason to
 * take the other's type. `scripts/check-block-controls.mjs` holds the shape itself.
 */
export type PageHeaderAction = PageHeaderLinkAction | PageHeaderSlotAction

export type PageHeader01Props = {
  /**
   * The trail above the title. The final item always renders as the current
   * page, whether or not it carries an `href`.
   */
  breadcrumbs?: PageHeaderCrumb[]
  /** The page title. */
  title: ReactNode
  /** One supporting line under the title. */
  description?: ReactNode
  /**
   * Declarative actions rendered in the header's action row.
   *
   * Every action Prism renders here is a link with a required `href`, so it is a
   * native anchor announced as a link rather than a button announced as a command.
   * A control that cannot be a link takes a `slot`, and the Block places it where
   * this action sits.
   */
  actions?: PageHeaderAction[]
  /**
   * The heading element for the title. Defaults to `h2` because a block is
   * composed; a page whose own document outline this header opens passes
   * `h1`. See `HeadingElement`.
   */
  headingLevel?: HeadingElement
}

/**
 * A page title band.
 *
 * It places a breadcrumb trail and a row of actions above the title, then a rule
 * below the header. The trail is passed in as props and renders native anchors, so
 * the consumer owns navigation and can substitute their own router by passing
 * breadcrumb labels without an `href` on the steps it does not want to link. Every
 * string and every step is a prop; the block ships none of its own.
 *
 * **The action row is links and slots, and never buttons of its own.** It used to
 * declare `actions` as a list of `{ label, variant, size }` with no destination
 * member and render each one as a `Button`, which is a focusable control announced
 * as a button that activates to nothing, at the top of a screen. See
 * `PageHeaderAction`.
 */
export function PageHeader01({
  breadcrumbs,
  title,
  description,
  actions = [],
  headingLevel = 'h2',
}: PageHeader01Props) {
  const hasTrail = Boolean(breadcrumbs?.length)
  const hasActions = actions.length > 0

  return (
    <header className="flex flex-col gap-4">
      {hasTrail || hasActions ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {hasTrail ? (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs?.map((crumb, index) => {
                  const last = index === breadcrumbs.length - 1
                  return (
                    // Positional, for the same reason as the other blocks: the
                    // label is display content and two steps may share one.
                    <Fragment key={index}>
                      {index > 0 ? <BreadcrumbSeparator /> : null}
                      <BreadcrumbItem>
                        {last || !crumb.href ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <span />
          )}

          {hasActions ? (
            <div className="flex items-center gap-2">
              {actions.map((action, index) => {
                // A slot is the caller's own control, placed where it asked to be and
                // otherwise untouched. Keyed positionally for the reason the other
                // keyed lists in this package state: two actions may share a label,
                // and a row keyed on a localised label remounts when the reader
                // changes language.
                if ('slot' in action) {
                  return <Fragment key={index}>{action.slot}</Fragment>
                }

                return (
                  <CtaLink
                    key={index}
                    href={action.href}
                    newTab={action.newTab}
                    variant={action.variant ?? (index === 0 ? 'default' : 'outline')}
                    size={action.size}
                  >
                    {action.label}
                  </CtaLink>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Heading as={headingLevel} size="3xl">
          {title}
        </Heading>
        {description ? (
          <Text size="lg" tone="muted">
            {description}
          </Text>
        ) : null}
      </div>

      <Separator />
    </header>
  )
}

export default PageHeader01
