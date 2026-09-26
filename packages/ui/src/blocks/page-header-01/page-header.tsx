import { Fragment, type ReactNode } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import { Heading, Text, type HeadingElement } from '../../components/ui/typography'

export type PageHeaderCrumb = {
  label: ReactNode
  /** Renders a native anchor. Omit on the current, final step. */
  href?: string
}

export type PageHeaderAction = {
  label: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

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
   * Declarative actions rendered as Prism Buttons. Use `actionsSlot` for a
   * control that needs its own behaviour, such as a router link or a menu.
   */
  actions?: PageHeaderAction[]
  /** A slot for consumer-provided controls on the action row. */
  actionsSlot?: ReactNode
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
 * It places a breadcrumb trail and a row of actions above the title, then a
 * rule below the header. The trail is passed in as props and renders native
 * anchors, so the consumer owns navigation and can substitute their own
 * router by passing `actionsSlot` and breadcrumb labels. Every string and
 * every step is a prop; the block ships none of its own.
 */
export function PageHeader01({
  breadcrumbs,
  title,
  description,
  actions = [],
  actionsSlot,
  headingLevel = 'h2',
}: PageHeader01Props) {
  const hasTrail = Boolean(breadcrumbs?.length)
  const hasActions = actions.length > 0 || Boolean(actionsSlot)

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
              {actionsSlot}
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant ?? (index === 0 ? 'default' : 'outline')}
                  size={action.size}
                >
                  {action.label}
                </Button>
              ))}
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
