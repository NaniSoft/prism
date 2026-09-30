import type { ReactNode } from 'react'

import { CodeBlock, type CodeBlockProps } from '../../components/ui/code-block'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The half of the props every sample carries, whichever arm of the name union it
 * is in.
 *
 * Declared apart from the union so the two arms below are two arms rather than
 * two copies of the same six fields, and so a field added here is added once.
 */
type CodeSample01Figure = {
  /**
   * What the sample is called.
   *
   * Required, and the reason is the difference between a sample and a snippet. A
   * snippet is a piece of code with a sentence around it; a sample is something a
   * document refers to, names in its own table of contents, and sends a reader to
   * from another page. A sample with no title is a code block the reader cannot
   * refer to, so there is nothing to put in the contents, nothing to link to, and
   * nothing for the rest of the document to say when it needs the same code again.
   */
  title: ReactNode
  /**
   * The sentence under the title, about what this particular code shows.
   *
   * A node, and the reason it is a node rather than a string is that it is often
   * not prose: it is a link to the page that explains the whole idea, a list of
   * three things to notice in it, or a `<p>` a caller wrote in their own Markdown
   * pipeline. The Block draws it in the heading's own description slot, so it
   * inherits that type size rather than bringing a second one.
   */
  description?: ReactNode
  /**
   * The source, exactly as it is in the file.
   *
   * A string and not a `ReactNode`, for `CodeBlock`'s reason and not this Block's:
   * the claim a code sample makes is that what a reader copies is what the caller
   * holds, and a node would be markup between the two.
   */
  code: string
  /**
   * The language, in whatever form the caller's own documentation uses it. Drawn
   * in the code surface's own header.
   */
  language?: string
  /** The file the snippet is from, drawn in the code surface's own header. */
  filename?: string
  /**
   * Draws a number against each line, in the gutter beside the code and not in
   * the copied text.
   */
  lineNumbers?: boolean
  /**
   * How the sample is placed: a section of its own, or a band inside a section
   * the caller already owns.
   *
   * @defaultValue 'section'
   */
  layout?: 'section' | 'inline'
  /** Heading level for the sample's title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * A short label above the title, in the position every other Block puts one.
   *
   * Present because this Block composes `SectionHeading` and every Block that
   * composes it takes one, not because a code sample needs an eyebrow more than a
   * feature grid does. An earlier version of this omitted it and the Demo passed
   * one anyway, which is the ordinary way an inconsistency between a Block and
   * the family it joined gets found.
   */
  eyebrow?: ReactNode
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The props a CodeSample01 takes.
 *
 * **The name is a union and not `label?: string`, and the reason is
 * `CodeBlockProps`'s, inherited rather than re-invented.** `code-block` already
 * draws that rule: a figure with no accessible name and a control beside it is a
 * button that acts on something a reader cannot identify, so the name is required
 * in the arm that takes `actions` and optional in the arm that does not, and the
 * type makes the second case impossible to reach by accident. This Block holds the
 * same union and forwards it, because a Block that flattened it would be a Block
 * that could hand `code-block` an unnamed figure with a copy control on it, and the
 * only thing it would have added is a way to do that.
 *
 * **A sample with no `title` is a snippet, and the difference is why this is a
 * Block at all.** A snippet is a piece of code inside a sentence, and `CodeBlock`
 * is the right thing for it. A sample is a titled thing in a document: a name, a
 * sentence saying what the code shows, and the controls that act on it. That band
 * appears forty times in one documentation site, and each of those forty is
 * currently hand-written in four repositories, which is four copies of a heading
 * above a code surface and four places to forget the gutter.
 */
export type CodeSample01Props = CodeSample01Figure &
  (
    | {
        /**
         * The figure's accessible name, and the only name the snippet has. A path,
         * a command, the thing the snippet shows.
         */
        label: string
        /**
         * The caller's own controls for this sample, drawn in the code surface's
         * header.
         *
         * A slot and not a copy button, and the reason is `code-block`'s and this
         * package's: this package ships no word a consumer cannot localise, and a
         * copy control is the clearest case of one. Whatever the caller puts here
         * keeps its own accessible name, its own focus order and its own state, and
         * the name of that control is the caller's and not Prism's.
         */
        actions?: ReactNode
      }
    | {
        /**
         * The figure's accessible name. Optional here, and only here, because a
         * sample with no control beside it is identified by the title above it.
         */
        label?: string
        /** A sample with no control beside it has no slot to fill. */
        actions?: never
      }
  )

/**
 * The accessible name a figure with controls beside it has to have, or the refusal.
 *
 * Reached only by a caller who got the type wrong, and the reason it is still here
 * rather than a cast is that a cast would be the library quietly making a claim
 * about a caller's code. The message names the prop and says what the name is for.
 */
function named(name: string | undefined): string {
  if (name === undefined) {
    throw new Error(
      'CodeSample01: the sample passed an actions slot with no label, so the code surface would be a figure with ' +
        'no accessible name and the control beside it would act on something a reader cannot identify. Pass the ' +
        'path, the command, or the thing the snippet shows.',
    )
  }
  return name
}

/**
 * A titled code sample: a name, a sentence about what the code shows, the code in
 * `CodeBlock`, and the caller's own controls in its header.
 *
 * **This is a Block and `code-block` is a Component, and the difference is the
 * band around the surface rather than the surface.** `code-block` owns the tinted
 * mono surface, the header for the machine words, the gutter and the line count. It
 * owns no title, no sentence about what the code is for, and no place to put the
 * controls, and those three are what a document puts on either side of a snippet.
 * So the Item here is the section that holds all of them: a name, a sentence, a
 * surface, and a header with the caller's control on it. The argument for shipping
 * it is a count. One documentation site has forty of these bands, and before this
 * Item each of the forty was hand-written, which means forty copies of a heading
 * above a code surface, forty places to forget the gutter on the one sample where
 * a line number matters, and forty places where a copy control's accessible name
 * was written in whatever language the author was in that week. Composing
 * `CodeBlock` rather than re-deriving the surface is the other half of it: the
 * surface is where the copy has to be clean, where the gutter has to stay out of
 * the clipboard, and where the header is a header and not an empty strip, and
 * re-deriving it here would have been a second implementation of a decision this
 * package has already made once and would have to defend twice.
 *
 * **`layout` is a prop because a documentation page and an application page need
 * different things from the same band.** A page that owns its own sections composes
 * a Page, and a Page is a composition of Blocks: a Page that has four samples in
 * it and no section rhythm between them is a Page whose samples float. So `section`
 * draws a `Section` and a Page composes four of these and gets four bands of
 * vertical rhythm for free. An application page that wants a sample inside a panel
 * it already draws passes `inline`, which is the same heading and the same surface
 * with no container and no rhythm of its own, and `className` is where a caller
 * puts the space. The alternative was two Items, and a Component and a Block that
 * differ only in whether they render a `Section` are one Item with a prop: the
 * heading, the surface and the controls are identical in both, and splitting them
 * would have given the corpus two entries describing one arrangement twice.
 *
 * **The title is required and it is the heading of the section, at
 * `headingLevel`.** A sample with no title is a snippet, and a snippet is
 * `CodeBlock`: a piece of code with a sentence around it. What makes a sample a
 * sample is that the document can refer to it, and a thing the document cannot
 * name is a thing the contents cannot list, another page cannot link to, and a
 * reader cannot be told to go and look at. So the title is required, it is the
 * heading, and the level is a prop so a sample composed inside a Page that already
 * has a heading for the same content takes one level deeper.
 *
 * **The name union is `code-block`'s, forwarded whole, and the run refuses a
 * mismatch the type should have caught.** A sample with a control beside it and no
 * accessible name is a control acting on something a reader cannot identify, and
 * the diagnostic says so rather than rendering one. It is unreachable from
 * TypeScript and that is exactly why it is written: a caller arriving from
 * JavaScript, from a spread of an object typed as `Record<string, unknown>`, or
 * from a type they widened themselves gets the same answer as a caller who made a
 * mistake in TypeScript, and the answer names the prop.
 *
 * **Nothing here is a code highlighter, and that refusal is inherited rather than
 * re-decided.** `CodeBlock` argues it at length: a highlighter is a second answer
 * to what a token means, in its own vocabulary, published as a theme and styled
 * with class names that have to be reconciled against six packs and two modes. A
 * caller who has decided they want highlighting wraps this Block's `code` in their
 * own, and the two places to do it are the `actions` slot and the `code` string
 * itself. The cost of the refusal is a wall of one colour, and the mitigation is
 * the table of contents the gutter and the filename are: a reader looking for a
 * name scans the left edge and the header rather than hunting for a hue.
 *
 * It is a server Component: no hook, no state and no client code. The caller's
 * `actions` may be a client Component, in which case that control is the only
 * client code in the band, and it is the caller's.
 */
export function CodeSample01(props: CodeSample01Props) {
  const {
    title,
    description,
    code,
    language,
    filename,
    lineNumbers,
    layout = 'section',
    headingLevel = 'h2',
    eyebrow,
    className,
  } = props

  // The union forwarded whole rather than flattened, so `code-block` is the one
  // place in this package that decides what a figure with a control beside it has
  // to carry. The two arms are spelled out because a Block that restated the rule
  // as `label?: string` would be a second place to get it wrong.
  const figure: CodeBlockProps =
    props.actions === undefined
      ? { code, language, filename, lineNumbers, label: props.label }
      : { code, language, filename, lineNumbers, label: named(props.label), actions: props.actions }

  const sample = (
    <div data-slot="code-sample-01" data-layout={layout} className={cn('flex flex-col gap-6', className)}>
      <SectionHeading as={headingLevel} align="left" eyebrow={eyebrow} title={title} description={description} />
      <CodeBlock {...figure} />
    </div>
  )

  // The inline form is the same band with no container and no rhythm of its own, so
  // a caller can hold a sample inside a panel or a Page section they already draw
  // without this Block adding a second container inside the first.
  if (layout === 'inline') return sample

  return <Section>{sample}</Section>
}

export default CodeSample01
