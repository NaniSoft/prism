'use client'

import type { ComponentProps, ReactNode } from 'react'

import { AuthForm01 } from '../../blocks/auth-form-01'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import type { HeadingLevel } from '../../components/ui/section'

export type AuthPageAside = {
  /** The supporting card's title. */
  title: string
  /** One line under the title. */
  description?: string
  /** The card body: product context, a short list or a supporting note. */
  children?: ReactNode
}

export type AuthPageProps = {
  /** The credential form. */
  form: ComponentProps<typeof AuthForm01>
  /**
   * A supporting card beside the form. Omit it for a single centered column.
   */
  aside?: AuthPageAside
  /** A node under the form, such as a legal line or a link to another screen. */
  footer?: ReactNode
  /**
   * Heading level for the two region titles, the form's and the aside's. See
   * `HeadingLevel`.
   *
   * The page draws no heading of its own, so each region names itself and the two
   * are siblings in the outline. They therefore take one level between them
   * rather than each choosing one: two regions that announced themselves at
   * different depths would read as one inside the other, and nothing in the layout
   * says so. Defaults to `h2`, because a page composes under a document that has
   * its own `h1`.
   */
  headingLevel?: HeadingLevel
}

/**
 * A complete authentication screen.
 *
 * It composes `AuthForm01` with `Card`: the form carries the credentials and an
 * optional supporting card sits beside it with product context. The page owns
 * the layout, the centering and the breakpoint only. Every field, label,
 * handler and error is a prop through `form`, and the page fetches nothing and
 * imports no router, so the consumer owns the links and the request.
 *
 * The layout is one centered column when no `aside` is passed, and a two-column
 * split from the large breakpoint up when one is. That keeps the docs preview
 * and a narrow screen on the same, readable path.
 */
export function AuthPage({ form, aside, footer, headingLevel = 'h2' }: AuthPageProps) {
  // The form and the aside are sibling regions, so they announce themselves at the
  // same depth: at different depths one would read as inside the other, and
  // nothing in the layout says so.
  const Title = headingLevel
  return (
    <div className="bg-background text-foreground flex min-h-svh w-full items-center justify-center px-6 py-16">
      <div
        className={
          aside
            ? 'grid w-full max-w-page items-center gap-10 lg:grid-cols-2'
            : 'w-full max-w-measure-narrow'
        }
      >
        {aside ? (
          <Card>
            <CardHeader>
              <CardTitle>
                <Title>{aside.title}</Title>
              </CardTitle>
              {aside.description ? (
                <CardDescription>{aside.description}</CardDescription>
              ) : null}
            </CardHeader>
            {aside.children ? <CardContent>{aside.children}</CardContent> : null}
          </Card>
        ) : null}

        <div className="mx-auto w-full max-w-measure-narrow">
          <AuthForm01 {...form} headingLevel={headingLevel} />
          {footer ? (
            <div className="text-muted-foreground mt-4 text-center text-sm">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
