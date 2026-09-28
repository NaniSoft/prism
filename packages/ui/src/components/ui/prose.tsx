import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * The size a run of prose is set at.
 *
 * Two, and closed: `base` is the reading size a document body is set at, and
 * `lg` is the one step up a marketing page's supporting copy uses. A third step
 * would be a decision about the type scale rather than about prose, and the type
 * scale is `Text`'s.
 */
const PROSE_SIZES = {
  base: 'text-base',
  lg: 'text-lg',
} as const

/**
 * The three sizes a run of prose is set at.
 *
 * @defaultValue 'base'
 */
export type ProseSize = keyof typeof PROSE_SIZES

/**
 * The props a Prose takes.
 *
 * The content is `children`, so a Prose never decides what is in it. The prose
 * is authored wherever it is authored - a Markdown pipeline, a CMS, a file of
 * React - and Prism owns the measure, the rhythm and the block treatments, not
 * the words.
 */
export type ProseProps = ComponentProps<'div'> & {
  /**
   * The authored body. Any flow content: paragraphs, lists, headings, tables,
   * code, images. The vertical rhythm and the treatments below apply to whatever
   * is passed, so the caller writes plain elements and Prism styles them.
   */
  children: ReactNode
  /**
   * The reading size. `base` is the document body; `lg` is the one step up a
   * marketing page's supporting copy is set at.
   *
   * @defaultValue 'base'
   */
  size?: ProseSize
  /**
   * Drops the measure so the run fills the space it is given. The measure is the
   * whole point of the component, so this is opt-in and not a prop a caller sets
   * because the width looked wrong: a line longer than the measure is the defect
   * this exists to remove.
   */
  fullWidth?: boolean
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A run of consumer-authored body copy, set at the measure.
 *
 * One job: hold authored prose to the reading measure and to the block rhythm,
 * so a document does not have to restate either. Every NaniSoft site publishes
 * long-form pages, and each one re-derived the same answer: a column that stops
 * growing, paragraphs that are too far apart or too close, and a link that is
 * either an unstyled word or an over-decorated one. This is that answer once.
 *
 * It is a Component rather than a Block because it owns no content at all: there
 * is no string, no number and no data to pass, and what it holds is whatever the
 * caller wrote. A Block is a section with content as props; this is the measure
 * and nothing else.
 *
 * The treatments are child selectors rather than a wrapper per block, so the
 * caller's own elements are the ones styled. That is what keeps the component
 * markup-free: a consumer writing `<p>` and `<h2>` gets the system treatment, and
 * a consumer writing Prism's own `Heading` and `Text` gets exactly the same
 * result, because the two spellings converge on the same element.
 *
 * The measure is the emitted `--container-measure` token, read as
 * `max-w-measure`, and the narrow measure a quotation wants is not offered here:
 * a run set narrower than the reading measure is a caller decision about one
 * element, and `className` is layout only.
 *
 * `text-pretty` is on the root rather than on the paragraphs, because Prism's
 * type rule gives body copy `text-pretty` and putting it here means a caller's
 * own `<p>` inherits it rather than needing a class of its own.
 *
 * It is a server Component: no hook, no context and no client code.
 */
function Prose({ children, size = 'base', fullWidth = false, className, ...props }: ProseProps) {
  return (
    <div
      data-slot="prose"
      data-size={size}
      className={cn(
        'text-pretty flex flex-col gap-4 leading-relaxed',
        fullWidth ? 'max-w-none' : 'max-w-measure',
        PROSE_SIZES[size],
        // The block treatments. Every child is styled by its own tag so a
        // consumer's plain elements read as the system, and the gaps the flex
        // column owns are the rhythm between blocks.
        '[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:underline',
        '[&_blockquote]:border-border [&_blockquote]:text-muted-foreground [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic',
        '[&_code]:bg-muted [&_code]:text-muted-foreground [&_code]:rounded-sm [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs',
        '[&_h1]:text-balance [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight',
        '[&_h2]:text-balance [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight',
        '[&_h3]:text-balance [&_h3]:mt-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight',
        '[&_h4]:text-balance [&_h4]:text-lg [&_h4]:font-semibold',
        '[&_hr]:bg-border [&_hr]:h-px [&_hr]:my-2',
        '[&_img]:rounded-lg',
        '[&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6',
        '[&_p]:leading-relaxed',
        '[&_pre]:bg-muted [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-xs',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_strong]:font-semibold',
        '[&_table]:w-full [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_th]:px-3 [&_th]:py-2 [&_th]:text-left',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Prose }
