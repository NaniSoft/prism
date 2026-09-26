/**
 * The three rules every tool description carries.
 *
 * Ticket 13 requires each description to state the import rule and the surface
 * rule, so a client that reads only `tools/list` learns the contract without a
 * round-trip. The no-invention rule is repeated by `get_theme_doc`.
 */
export const IMPORT_RULE =
  'Import from `@nanisoft/prism-ui/components/<slug>`, `./blocks/<slug>` or `./pages/<slug>`. Base UI and internal paths are never a consumer import.'

export const SURFACE_RULE =
  'Prism answers its complete owned surface; Base UI and native elements are internal implementation details.'

export const NO_INVENTION_RULE =
  'Motion and typography are named by token, never by a millisecond or a `cubic-bezier` literal.'

/** Compose a tool description: the intro, then the two standing rules. */
export function describe(intro: string): string {
  return `${intro}\n\nImport rule: ${IMPORT_RULE}\n\nSurface rule: ${SURFACE_RULE}`
}
