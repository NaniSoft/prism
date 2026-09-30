import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/** What every arm of `CodeBlockProps` carries. */
type CodeBlockFigure = {
  /**
   * The source, exactly as it is in the file.
   *
   * A string and not a `ReactNode`, and the reason is that this is a code
   * surface: the whole claim is that what a reader copies is what the caller
   * holds. A `ReactNode` would be a set of elements a caller could mark up, and
   * then the thing on the page and the thing in the clipboard are two different
   * strings, which is the failure a code block is the last place to allow.
   */
  code: string
  /**
   * The language, in whatever form the caller's own documentation uses it.
   *
   * Drawn in the header in the mono face and never read as a claim about what
   * the code means. It is the one word that says what the syntax is, and it is
   * also the one word that cannot be a promise: this Component does not know
   * what `ts` is, so it draws what it was given. `tsx`, `ts`, `typescript` and
   * `TypeScript` are all defensible in different code bases, and the value that
   * is right is the one the caller's own pages already use.
   */
  language?: string
  /**
   * The file the snippet is from, drawn in the header beside the language.
   *
   * Both are in the mono face and both are machine notation: a filename and a
   * language tag are names in a machine's alphabet, not prose, and setting them
   * in the sans face would make the header look like a sentence when the one
   * thing in it that is not a sentence is the caller's actions slot. The
   * filename also replaces the language where a snippet is one file rather than
   * one language, so a caller can pass either and the header stays one item.
   */
  filename?: string
  /**
   * Draws a number against each line. @defaultValue false
   *
   * Off by default because the numbers are the answer to a question only some
   * readers ask, and a reader who is not in a file does not want a gutter
   * pushing the code two characters to the right. The number is a reference, not
   * part of the text: see the note on the gutter.
   */
  lineNumbers?: boolean
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The props the CodeBlock accepts.
 *
 * The name is a union rather than `label?: string` for the reason
 * `DiagramProps` and `PulseGraphProps` state: only a union lets the type system
 * see the exception. A figure whose accessible name is optional is a figure
 * whose name a caller forgets, and here the forgetting has a cost that is easy
 * to name: a copy control beside a figure with no name is a button whose label
 * says "copy" and whose target is unnamed, so a screen reader user is told to
 * copy something and then cannot find out what. So `label` is required in the
 * arm that takes `actions` and optional in the arm that does not, and the type
 * makes the second case impossible to reach by accident. `label?: string` on
 * its own was the shape rejected: it is the same type as the pair above and it
 * states none of it.
 */
export type CodeBlockProps = CodeBlockFigure &
  (
    | {
        /**
         * The accessible name of the figure, and the only name the snippet has.
         *
         * A path, a command, the thing the snippet shows. Required whenever the
         * caller brings a control, because a control that acts on a figure acts
         * on something and the something has to be nameable.
         */
        label: string
        /**
         * The caller's own controls for this figure, in the header.
         *
         * A slot rather than a copy button, and the reason is the copy gate's:
         * this package ships no word a consumer cannot localise, and a copy
         * control is the clearest case of one. A button whose label reads "Copy"
         * in a product that never uses that word is a control the consumer
         * cannot fix without patching the library, and the fix would be a fork
         * rather than a prop. So the surface is drawn, the header has a place for
         * the caller's own button, and the caller names it.
         */
        actions?: ReactNode
      }
    | {
        /**
         * The accessible name of the figure. Optional here, and only here,
         * because a snippet with no control beside it is identified by the
         * sentence around it.
         */
        label?: string
        /** A figure with no control beside it has no slot to fill. */
        actions?: never
      }
  )

/**
 * How many lines the gutter counts, and the text the body draws.
 *
 * One `split` and two consumers, which is the whole point: the numbers and the
 * code are derived from the same string in the same pass, so a gutter cannot
 * claim a line the body does not have. The trailing empty line a file's final
 * newline produces is dropped from the count only. The body still draws the
 * `code` verbatim, because a `<pre>` that has lost its final newline is a
 * snippet that no longer copies correctly, and a count that is one too high is a
 * cosmetic defect by comparison.
 */
function linesOf(code: string): number {
  const lines = code.split('\n')
  return code.endsWith('\n') ? Math.max(1, lines.length - 1) : lines.length
}

/**
 * A snippet of source: a mono surface with a header for the words that say what
 * it is.
 *
 * **Prism ships a code surface and no syntax highlighter, and that is the
 * decision worth defending.** A highlighter is not a presentation detail, it is
 * a dependency that arrives with its own answer to the question "what does this
 * token mean", and it is a second source of truth for exactly the kind of thing
 * this system is built to have one of. Prism's law is that a value is authored
 * once and reaches a consumer through the tokens; a highlighter decides on its
 * own that `const` is a keyword and that a string is a string, and it decides
 * that in a vocabulary of its own, published as a theme file, styled with class
 * names that have to be reconciled against six packs and two modes. The
 * reconciliation is where a highlighter stops being a convenience. The moment
 * one is in the product, the token source and the highlight theme are two files
 * that have to be kept in step, and a pack that moves a step leaves the second
 * one behind, and the result is a code surface in the wrong hue that every
 * colour gate in this repository reports as correct.
 *
 * So nothing here is highlighted, and the cost of that is real and worth naming:
 * a long snippet is a wall of one colour, a reader scanning for a name has no
 * colour to catch it, and Prism gives them the table of contents instead, which
 * is the line numbers and the filename. A caller who has decided they want
 * highlighting composes it themselves, and the two places to do it are named on
 * the props: `actions` takes a control the caller built, and the whole item is a
 * plain figure with a `code` string, so anything a caller wraps around it is
 * theirs. What Prism will not do is hold the highlighting itself, because the
 * day it does there are two answers to what a token means in every product that
 * installs it.
 *
 * **The figure is named by `label`, and the naming is required whenever the
 * caller brings a control.** See the union on `CodeBlockProps`: a copy button
 * beside an unnamed figure is a button that acts on nothing a reader can
 * identify. When the caller brings no control the name is optional, because a
 * snippet inside a sentence is identified by the sentence.
 *
 * **The line numbers are a gutter, not part of the text.** They sit outside the
 * `<pre>`, hidden from assistive technology, and the code inside the `<pre>` is
 * the caller's `code` and nothing else. That is what keeps a copy clean: a copy
 * that carries `1  2  3` down its left edge is a snippet pasted into a file
 * that does not compile, and the alternative, numbers inside the `<pre>`, is
 * exactly that. The cost of the gutter is alignment, because two parallel
 * renderings of the same lines line up only while the lines do not wrap, which
 * is why the body is `whitespace-pre` and scrolls horizontally. A snippet that
 * soft-wrapped would put the numbers a line out of step after the first long
 * line, and horizontal scroll is the honest answer: source is read by the line
 * and not reflowed to the viewport.
 *
 * **It spreads no other prop.** `Kbd` and `Separator` spread a native element's
 * props because there is no other route to them. A `<pre>` is a different case,
 * and the reason is specific: a code surface is the one place in a component
 * library where a caller might reasonably reach for `dangerouslySetInnerHTML`,
 * because highlighting is usually done that way and this file has just argued
 * against highlighting. A spread would hand them the attribute that bypasses
 * every claim on the page in one prop, so the surface is `code`, `language`,
 * `filename`, `lineNumbers`, `actions`, `label` and `className`, and nothing
 * else.
 *
 * **The header is a header, and it is not always there.** It is drawn when
 * there is something to put in it: a filename, a language, or a control. A
 * snippet with no filename, no language and no control is a tinted box of
 * monospace, and an empty strip above it would be a bar of ink saying nothing.
 */
function CodeBlock({
  code,
  language,
  filename,
  lineNumbers = false,
  actions,
  label,
  className,
}: CodeBlockProps) {
  const named = filename !== undefined || language !== undefined || actions !== undefined
  const count = linesOf(code)

  return (
    <figure
      data-slot="code-block"
      data-named={named}
      data-line-numbers={lineNumbers}
      aria-label={label}
      className={cn('bg-muted border-border flex w-full flex-col overflow-hidden rounded-md border', className)}
    >
      {named ? (
        <div
          data-slot="code-block-header"
          className="border-border text-muted-foreground flex items-center justify-between gap-3 border-b px-3 py-1.5 text-xs"
        >
          {/*
           * The two machine words, in the mono face and beside each other. They
           * share a face because they share a kind: a filename and a language tag
           * are both names in an alphabet a machine reads, and setting one in the
           * sans face would have made the header look like a sentence and pushed
           * the caller's own control into looking like a caption on it.
           */}
          <span data-slot="code-block-name" className="flex min-w-0 items-center gap-2 font-mono">
            {filename === undefined ? null : (
              <span data-slot="code-block-filename" className="text-foreground truncate">
                {filename}
              </span>
            )}
            {language === undefined ? null : (
              <span data-slot="code-block-language">{language}</span>
            )}
          </span>
          {/*
           * The caller's controls, and the whole reason this Component has no
           * copy button of its own. The slot is on the right where a header's
           * actions go, and it is a `ReactNode` so that whatever the caller put
           * there keeps its own accessible name, its own focus order and its own
           * state.
           */}
          {actions === undefined ? null : (
            <span data-slot="code-block-actions" className="flex shrink-0 items-center gap-2">
              {actions}
            </span>
          )}
        </div>
      ) : null}

      {/*
       * The body scrolls as one row, and that is what holds the gutter against
       * the code. `min-w-max` stops the row from being squeezed to the
       * container, so a long line makes the container scroll rather than making
       * the numbers drift out of step with it.
       */}
      <div data-slot="code-block-body" className="overflow-x-auto">
        <div className="flex min-w-max">
          {lineNumbers ? (
            <div
              data-slot="code-block-numbers"
              // Hidden from assistive technology on purpose: a reader who has
              // navigated to a snippet is reading the source, and hearing the
              // ordinal of every line before it is a list of numbers in front of
              // the thing they asked for. The gutter is a reference, and it is
              // also what the copy deliberately does not carry.
              aria-hidden="true"
              className="text-muted-foreground border-border w-9 shrink-0 border-r pr-2 text-right font-mono text-xs leading-relaxed tabular-nums select-none"
            >
              {Array.from({ length: count }, (_, index) => (
                <span key={index} data-slot="code-block-number" className="block">
                  {index + 1}
                </span>
              ))}
            </div>
          ) : null}
          {/*
           * The code, verbatim, in a `<pre>` inside a `<code>`. The element pair
           * is what tells a browser the whitespace is significant and what tells
           * assistive technology the content is source rather than prose, which
           * is the reason a block level and an inline element are both here even
           * though a `<code>` alone would render the same.
           */}
          <pre
            data-slot="code-block-pre"
            className="text-foreground min-w-0 flex-1 px-3 py-2 font-mono text-sm leading-relaxed whitespace-pre"
          >
            <code data-slot="code-block-code">{code}</code>
          </pre>
        </div>
      </div>
    </figure>
  )
}

/**
 * An inline run of source: a symbol, a command, a filename, a prop.
 *
 * The inline form of the same idea `CodeBlock` states at length, and the reason
 * it is its own export rather than a size of the block is that the two answer
 * different questions. A `CodeBlock` is something a reader may copy, so it is a
 * figure with a name, a header and a gutter. A `Code` is a word inside a
 * sentence, and the whole treatment is that it is visibly not prose: the mono
 * face is the signal, and the muted surface is what stops a long symbol from
 * reading as a run of emphasised text.
 *
 * Use it for a symbol the reader types (`--strict`), a component or a function
 * name (`ChartFrame`), a file (`dialog.tsx`), a prop (`tone`) or a command. Do
 * not use it for a value that is a number with a unit, for a key the reader
 * presses, which is `Kbd`, or for anything the reader is meant to remember as
 * prose. It renders a native `<code>`, so a screen reader identifies it as
 * source rather than as text to read through, and it spreads a `<code>`'s own
 * props because that is the only route to a title, a `lang` or an `id` on one.
 */
function Code({ className, ...props }: ComponentProps<'code'>) {
  return (
    <code
      data-slot="code"
      className={cn(
        'bg-muted text-foreground rounded-sm px-1 py-0.5 font-mono text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { CodeBlock, Code }
