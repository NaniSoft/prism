/**
 * The code panel: a highlighted reading of an Item's Demo, with the verbatim
 * source one control away in the showcase's bar above it.
 *
 * **The gutter is outside the `<pre>` and the copy does not carry it.** That is
 * `CodeBlock`'s own arrangement, adopted here rather than reinvented, and the
 * reason is worth restating because it is the difference between a snippet that
 * pastes into a file that compiles and one that pastes a column of numbers down
 * its left edge. The copy control lives one level up and is handed the raw source
 * rather than this file's reading of it, so the bytes on the clipboard are the
 * file's bytes.
 *
 * **Every token is drawn from an inline `style`, and the emphasis rides on the same
 * declaration as the ink.** `highlight.ts` states why the colour has to be one: a
 * pack change re-themes the panel with the rest of the page, and the panel is
 * correct in all twelve pack and mode combinations because it never named a
 * colour. The slant and the weight could have been utilities, and were not, for a
 * reason that is about having one answer rather than about the cascade: `italic`
 * and `font-bold` are static, so the theme would have been stated in two files,
 * and the exported HTML would carry a bare `class` on a token whose emphasis
 * nothing in the document says. Drawn here, the token's whole appearance is one
 * attribute a reader of the export can read without the stylesheet, and the theme
 * stays the only place that says what a keyword is.
 *
 * **The italic in a code panel is a synthesized oblique, and that is the honest
 * answer rather than a defect.** The panel is set in `--font-mono`, which names no
 * face this repository ships: it is a stack of the reader's own monospaced faces
 * over `ui-monospace`. The one real italic face Prism ships is Inter at weight
 * 400, which is there for `Prose`'s `blockquote`, and a source listing set in Inter
 * would be a different artefact from every code host on the web. So a comment here
 * is drawn oblique by the browser, and a keyword at bold weight is the closest face
 * the reader's machine has. Every editor and every documentation site does exactly
 * this, the alternative being to ship an italic monospaced face to solve a problem
 * no reader has reported. Contrast is untouched: `font-style` and `font-weight`
 * carry no luminance of their own, and the two inks this panel uses are measured
 * in `highlight.ts` against the ground it paints on.
 */
import type { HighlightedLine } from '@/lib/highlight'

export function CodePanel({
  filename,
  lines,
}: {
  /** The file name, drawn in the header beside the language. */
  filename: string
  /** The highlighted reading of the Demo's source, one entry per line. */
  lines: HighlightedLine[]
}) {
  /*
   * The count the gutter draws and the lines the body draws are derived from the
   * same array in the same pass, which is what stops a gutter claiming a line the
   * body does not have. A line with no tokens is a real blank line and keeps its
   * number, so a twenty-line snippet does not lose the gap the author left.
   */
  const count = lines.length

  return (
    /*
     * No header of its own, and that is a change from the earlier version.
     *
     * The showcase's bar already carries the filename's two siblings: a view pair
     * and a copy control over the same bytes this figure would copy. A second
     * `Copy` button inside the panel put two controls, twelve pixels apart, doing
     * the identical thing, and a reader with a phone-sized screen saw the pair
     * stacked and had no way to tell that either one hands over the file.
     *
     * `filename` therefore stays a prop, because the filename is still the thing
     * that says what this is, and it is drawn beside the language in the corner.
     */
    <div className="bg-muted border-border flex w-full flex-col overflow-hidden rounded-lg border">
      <div className="border-border text-muted-foreground flex items-center justify-between gap-3 border-b px-3 py-1.5 text-xs">
        {/*
          The filename and the language, in the mono face and beside each other.
          Both are machine notation rather than prose, and setting one in the sans
          would make the header read as a sentence with a control hanging off the
          end of it.
        */}
        <span className="flex min-w-0 items-center gap-2 font-mono">
          <span className="text-foreground truncate">{filename}</span>
          <span>tsx</span>
        </span>
        <span className="shrink-0 font-mono">
          {count} {count === 1 ? 'line' : 'lines'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max">
          {/*
            The gutter, hidden from assistive technology and outside the `<pre>`.
            A reader who has navigated to a snippet is reading source, and hearing
            the ordinal of every line before it is a list of numbers in front of the
            thing they asked for. It is also what the copy deliberately leaves out.
          */}
          <div
            aria-hidden="true"
            className="text-muted-foreground border-border w-9 shrink-0 border-r py-3 pr-2 text-right font-mono text-xs leading-relaxed tabular-nums select-none"
          >
            {Array.from({ length: count }, (_, index) => (
              <span key={index} className="block">
                {index + 1}
              </span>
            ))}
          </div>

          {/*
            The code, verbatim in its text content and coloured span by span. The
            row scrolls as one unit with the gutter beside it, so the two parallel
            renderings stay in step for as long as the lines do not wrap, which is
            the honest arrangement for source: source is read by the line and not
            reflowed to the viewport.
          */}
          <pre className="text-foreground min-w-0 flex-1 px-3 py-3 font-mono text-xs leading-relaxed">
            <code>
              {lines.map((line, index) => (
                <span key={index} className="block">
                  {line.tokens.map((token, position) => (
                    <span
                      key={position}
                      style={{
                        color: token.colour,
                        fontStyle: token.italic ? 'italic' : undefined,
                        fontWeight: token.bold ? 'bold' : undefined,
                      }}
                    >
                      {token.text}
                    </span>
                  ))}
                </span>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  )
}