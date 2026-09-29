/**
 * One scorer for every surface that searches.
 *
 * The ranking is shared because the *answer* is shared. A command palette and a
 * combobox that each carried their own scorer would agree for a month and then
 * diverge on the case nobody thought about, and a reader would find that a query
 * which floats to the top in one surface sinks in the other. That is the same
 * defect as the catalogue and a second list about the same items, and it is the
 * reason this lives in one module rather than in whichever Component was written
 * first.
 *
 * It lives here rather than in either Component for a second reason: the first
 * version put it in `command-palette` and the combobox imported it from there, so
 * a leaf depended on a composite. That compiles, it typechecks, and it is still
 * wrong, because the next surface to need a scorer has no honest module to import
 * and the tempting answer is to copy the one it can see.
 *
 * This is not an Item. It is not in the catalogue, it has no documentation page and
 * no Demo, and it is not exported from the package, because it is the inside of
 * two Items rather than something a consumer composes.
 */

/**
 * How well a match fits, ordered.
 *
 * The order is the feature rather than a detail. A surface that filters without
 * ranking shows every match in whatever order the items happened to be declared,
 * so the item the reader meant sits below one that merely mentions their query,
 * and they scroll. Ranking by where the match falls puts it first, which is the
 * whole reason a searchable surface beats a menu.
 *
 * `prefix` is separate from `wordStart` because collapsing them means a command
 * whose name *begins* with the query ties with one that has it at the start of a
 * later word, and a reader who typed the start of a name is the reader who meant
 * that name.
 */
export const RANKS = {
  /** The query is the start of the label. */
  prefix: 0,
  /** The query starts a word inside the label. */
  wordStart: 1,
  /** The query appears inside the label. */
  substring: 2,
  /** The query appears only in the keywords. */
  keyword: 3,
  /** No match. */
  none: 4,
} as const

/** One ranked match: where the query fell, and which characters it covered. */
export type Rank = {
  /** How good the match is. Lower is better. */
  rank: number
  /**
   * The character range in the text that matched, absent when nothing matched or
   * when the match was in a keyword rather than in the text.
   *
   * A range rather than a boolean is what lets a surface emphasise the matched
   * characters instead of the whole row.
   */
  range?: readonly [number, number]
}

/**
 * Where the first match of `query` falls in `text`, and how good it is.
 *
 * An empty query is a prefix match covering nothing, which is what makes an
 * untyped surface render every row with nothing emphasised rather than needing a
 * separate branch for the empty case at each call site.
 */
export function locate(text: string, query: string): Rank {
  if (query === '') return { rank: RANKS.prefix, range: [0, 0] }
  const haystack = text.toLowerCase()
  const needle = query.toLowerCase()

  const at = haystack.indexOf(needle)
  if (at === -1) return { rank: RANKS.none }

  // A match at the very start is a prefix match, which is the best possible
  // answer, and it has to be its own tier rather than sharing the word-start one.
  if (at === 0) return { rank: RANKS.prefix, range: [0, needle.length] }

  // Otherwise a whole-word match beats a match inside a word, and the boundary is
  // the character before it. Without this, "se" in "Settings" would outrank
  // "Reset workspace" for a reader who typed "set". The boundary is tested as a
  // class rather than compared to a space, because a space is a string literal
  // and the copy gate is right to ask what a lone space in a Component is for.
  const isWordStart = /[\s\-/]/.test(haystack.at(at - 1) ?? '')
  return {
    rank: isWordStart ? RANKS.wordStart : RANKS.substring,
    range: [at, at + needle.length],
  }
}
