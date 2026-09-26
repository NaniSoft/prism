/** The eight tool descriptions, each composed with the two standing rules. */
import { describe } from './rules.js'

export const DESCRIPTIONS = {
  list_items: describe(
    'List every Prism Component, Block and Page in the catalogue, optionally filtered by kind or by Component category. Use this once to learn the roster, then read an item with `get_item_doc` or `get_item_props`.',
  ),
  get_item_doc: describe(
    'Read the assembled documentation for one Prism item: its description, import line, prose, demo pointer and generated API section. Accepts a name or slug and an optional kind to disambiguate.',
  ),
  get_item_props: describe(
    'Read only the generated Props section, or the Composition section for a Block or Page, for the loop that re-queries an API without re-reading the prose. Accepts a name or slug and an optional kind to disambiguate.',
  ),
  get_item_source: describe(
    'Read the verbatim demo source for one Prism item plus its public import line. Returns copyable source only; use `get_item_doc` for the prose and `get_item_props` for the API.',
  ),
  get_theme_doc: describe(
    'Read the Prism token contract: a pack\u2019s resolved semantic values for a mode, or one bound scale (motion, typography, spacing, shadow, breakpoint, container). Read the contract here instead of inventing a duration, a curve or a spacing step.',
  ),
  list_pages: describe(
    'List the non-item Prism documentation pages: the guides, the Foundations pages and the Content pages. Use `get_page` to read one.',
  ),
  get_page: describe(
    'Read one non-item Prism documentation page as Markdown by its URL. Only serves the guides, Foundations and Content lanes; a catalogue item URL is a miss with a pointer to `get_item_doc`.',
  ),
  search_docs: describe(
    'Substring match over item names, descriptions and page bodies. Returns ranked references, each with its kind, the field that matched, and the follow-up call to make. It does not return page or item contents; use `get_item_doc` or `get_page` for the body.',
  ),
} as const

export type ToolName = keyof typeof DESCRIPTIONS

/** The registration order ticket 13 section 9 pins. */
export const TOOL_ORDER = [
  'list_items',
  'get_item_doc',
  'get_item_props',
  'get_item_source',
  'get_theme_doc',
  'list_pages',
  'get_page',
  'search_docs',
] as const satisfies readonly ToolName[]
