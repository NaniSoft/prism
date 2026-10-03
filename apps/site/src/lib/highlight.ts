import { createHighlighter, type Highlighter, type ThemedToken } from 'shiki'
import type { ThemeRegistrationRaw } from 'shiki'

/**
 * Syntax highlighting for the code panel, and the three inks it is allowed to use.
 *
 * **Prism ships no highlighter and this is the caller's half of that decision.**
 * `CodeBlock` states the reasoning at length: a highlighter arrives with its own
 * answer to what a token means, published as a theme file, styled with class names
 * that then have to be reconciled against six packs and two modes, and the moment
 * one is in the product the token source and the highlight theme are two files
 * that have to be kept in step. So the library ships a code surface and refuses to
 * ship the colouring, and a caller that wants highlighting composes it.
 *
 * **Every colour below is a Prism custom property, so a pack change re-themes the
 * code with the rest of the page for free.** There is no hex in this file and no
 * theme file, which is what keeps the thing Prism was refusing to accept from
 * arriving: there is no second answer to what a keyword is, because there is no
 * second set of values. `var(--brand-ink)` on the page resolves to that pack's own
 * brand step in whichever mode the page is in, and the panel is correct in all
 * twelve pack and mode combinations because it never named a colour.
 *
 * **The three inks are the three that clear 4.5:1 on the ground the panel draws
 * on, and the measurement is why there are three rather than seven.** Read against
 * every emitted `[data-pack]` block in both modes on `muted`: `foreground` at
 * 8.50:1 worst case, `muted-foreground` at 5.77:1 and `brand-ink` at 5.51:1.
 * `primary` measures 1.88:1 and `warning` 1.82:1, which is the whole reason those
 * two are fills, and a syntax highlighter built out of fills is the unreadable one
 * every editor shipped until somebody measured it.
 *
 * So the vocabulary is three roles and two emphases: keywords carry the brand ink
 * at bold weight, literals carry the same ink upright, comments carry the muted ink
 * in italic, and everything else is `foreground` upright. Two hues that clear the
 * threshold, a weight and an italic, carry a reader through a Demo further than
 * seven hues that do not.
 *
 * **The emphases are drawn now, and they were declared for a long time before
 * they were.** The theme above has said `fontStyle: 'italic'` for a comment and
 * `fontStyle: 'bold'` for a keyword since it was written, and `toLine` mapped each
 * token to a text and a colour and dropped the rest, so the italic comments and the
 * bold keywords had never rendered on any of this site's code panels. That is the
 * defect class this repository keeps finding: a comment describing an output the
 * code does not produce. What made it survive is worth recording, because it is not
 * a slip. `fontStyle` was discarded by a mapper that reads a token, and the only
 * test that could have caught it asserted the colours.
 *
 * **THE EMPHASIS IS A BITMASK, NOT A STRING, AND THAT IS THE OTHER HALF.** shiki's
 * `ThemedToken.fontStyle` is typed as its `FontStyle` enum, which is numeric, and
 * with `defaultColor: false` the token carries the number and no `htmlStyle`: the
 * `font-style: italic` and `font-weight: bold` strings only exist inside shiki's
 * own HTML renderer, which this module does not call. The two bits below are that
 * enum's `Italic` and `Bold`, named here because `FontStyle` is a `const enum` in a
 * package this one does not depend on and re-exporting it would mean reaching past
 * the declared dependencies for two integers. They are read exactly the way shiki
 * reads them, in `getTokenStyleObject`, which is the authority for what these bits
 * mean; this file is the site's own reading of the same mask, and the test asserts
 * the outcome against real tokens rather than against these numbers.
 */

/**
 * A TextMate scope list to the role this file draws it in.
 *
 * `as const` is on the object and not on each list because shiki's theme type
 * wants a mutable `string[]` per scope and a readonly tuple is not one. The cast is
 * here rather than at the theme, where it would be a claim about the whole theme's
 * shape rather than about the one field that needs it.
 */
const SCOPES: Record<'comment' | 'keyword' | 'literal', string[]> = {
  comment: ['comment', 'punctuation.definition.comment'],
  keyword: [
    'keyword',
    'storage',
    'storage.type',
    'storage.modifier',
    'keyword.control',
    'variable.language',
  ],
  literal: [
    'string',
    'string.quoted',
    'string.template',
    'constant',
    'constant.numeric',
    'constant.language',
    'support.constant',
  ],
}

/**
 * The shiki theme, expressed in Prism's own tokens.
 *
 * `fg` and `bg` are the two fields shiki requires and neither is a colour here in
 * practice: `fg` is the ink an unclassified token takes, and `bg` is the ground
 * shiki paints behind the text, which the panel paints itself as `muted`, so it is
 * transparent rather than a second answer to what the surface is. `defaultColor:
 * false` at the call site stops shiki wrapping any of these in a dual-theme pair,
 * which is the one thing that would turn a custom property into a literal.
 */
const THEME: ThemeRegistrationRaw = {
  name: 'prism',
  type: 'dark',
  fg: 'var(--foreground)',
  bg: 'transparent',
  colors: { 'editor.background': 'transparent', 'editor.foreground': 'var(--foreground)' },
  settings: [
    { settings: { foreground: 'var(--foreground)' } },
    { scope: SCOPES.keyword, settings: { foreground: 'var(--brand-ink)', fontStyle: 'bold' } },
    { scope: SCOPES.literal, settings: { foreground: 'var(--brand-ink)' } },
    {
      scope: SCOPES.comment,
      settings: { foreground: 'var(--muted-foreground)', fontStyle: 'italic' },
    },
    {
      scope: ['entity.name.tag', 'support.class.component'],
      settings: { foreground: 'var(--foreground)' },
    },
    { scope: ['punctuation', 'meta.brace'], settings: { foreground: 'var(--muted-foreground)' } },
  ],
}

/** The grammar every Demo is authored in. */
const DEMO_LANGUAGE = 'tsx'

/**
 * shiki's `FontStyle` bitmask, the two bits this theme sets.
 *
 * Declared rather than imported. `FontStyle` is a `const enum` in
 * `@shikijs/vscode-textmate`, which is a transitive dependency rather than one
 * this package declares, and `shiki` does not re-export it; naming two integers
 * that shiki's own renderer decodes the same way is the cheaper of the two
 * answers. `Underline` (4) and `Strikethrough` (8) are in the enum and are not
 * here, because no scope in the theme above sets either and this is not a
 * highlighter that forwards what it does not use.
 */
const ITALIC = 1
const BOLD = 2

/**
 * One token, as the panel's markup needs it.
 *
 * The slant and the weight are two fields rather than one `fontStyle` value,
 * because the theme states them as two and the panel draws them as two CSS
 * properties: carrying shiki's combined mask across the seam would make the
 * panel re-split it to reach the two things it needs, and the split would then
 * live in the drawing rather than beside the reading. Both are absent rather
 * than false when the theme asks for neither, so the panel's inline `style` stays
 * empty for a plain identifier and a reader inspecting the exported HTML can see
 * that this token really is unemphasised.
 */
export type HighlightedToken = {
  /** The token's own text, verbatim. The copy control reads the source, not this. */
  text: string
  /** The Prism custom property this token paints in. */
  colour: string
  /** Whether the theme asks for this token in italic. Comments are. */
  italic?: boolean
  /** Whether the theme asks for this token at the bold weight. Keywords are. */
  bold?: boolean
}

/** One highlighted line, as the panel's markup needs it. */
export type HighlightedLine = {
  /** The tokens on this line, in order. An empty line is an empty array. */
  tokens: HighlightedToken[]
}

/**
 * The one loaded engine, and the promise it is loading behind.
 *
 * **Loading a grammar is the expensive part, so it happens once per process.**
 * `createHighlighter` opens an oniguruma engine and parses the TextMate grammar,
 * which is measured in tens of milliseconds against the sub-millisecond cost of
 * tokenising a twenty-line file. The module-scope promise is what makes the second
 * Item page as cheap as the first, and storing the promise rather than the
 * highlighter is what makes two concurrent renders share one load instead of
 * starting two.
 */
let engine: Promise<Highlighter> | undefined

/**
 * Highlights one Demo's source into the panel's line model.
 *
 * **The copy control takes the raw source and this takes the tokens, from the same
 * string.** A highlighter that could alter what the reader copies would be a lie
 * about what the code is; keeping the two answers separate is what makes the copy
 * byte-for-byte the file and the panel a reading of it.
 *
 * A grammar that fails to load resolves to no lines rather than throwing, because
 * the failure mode of the alternative is a build that stops over a code panel. An
 * empty panel still leaves the source readable through the copy control, so the
 * Item stays usable, and the catch is scoped to this call so a broken grammar
 * cannot take the page render down with it.
 */
export async function highlight(source: string): Promise<HighlightedLine[]> {
  try {
    engine ??= createHighlighter({
      themes: [THEME],
      langs: [DEMO_LANGUAGE],
    })

    const highlighter = await engine
    const { tokens } = highlighter.codeToTokens(source, {
      lang: DEMO_LANGUAGE,
      theme: 'prism',
      defaultColor: false,
    })

    return tokens.map(toLine)
  } catch {
    return []
  }
}

/**
 * One line of TextMate tokens into the panel's own shape.
 *
 * **Three fields in, three out, and the third was the one that was missing.** The
 * colour and the emphasis are both answers the theme already gave, so nothing is
 * decided here: a token is painted in the ink its scope resolved to and slanted or
 * emboldened exactly as far as its scope asked. A role the theme gives a fourth
 * axis would arrive here as a fourth bit in the same mask and this function would
 * need to learn it, which is the honest place for that to happen rather than in
 * the panel, which draws what it is handed.
 */
function toLine(line: ThemedToken[]): HighlightedLine {
  return {
    tokens: line.map((token) => {
      const mask = typeof token.fontStyle === 'number' ? token.fontStyle : 0
      return {
        text: token.content,
        colour: token.color ?? 'var(--foreground)',
        ...((mask & ITALIC) !== 0 ? { italic: true } : {}),
        ...((mask & BOLD) !== 0 ? { bold: true } : {}),
      }
    }),
  }
}