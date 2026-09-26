/**
 * The tool argument schemas, one zod object per tool.
 *
 * Every field carries a `.describe(...)` so a client that reads `tools/list`
 * sees what to pass. The cross-field rule (`category` is Component-only) is a
 * `.refine` on `list_items`, so the protocol answers it as an `isError` result
 * rather than the handler throwing.
 */
import { z } from 'zod'

import { COMPONENT_CATEGORIES, ITEM_KINDS, MODES, PACKS, SEARCH_KINDS, TOKEN_GROUPS } from './vocab.js'

const kindField = z
  .enum(ITEM_KINDS)
  .optional()
  .describe('One catalogue kind: component, block or page. Omit to search every kind.')

const nameField = z
  .string()
  .min(1)
  .describe('The item name (for example `Button`) or its slug (for example `button`), case-insensitive.')

export const listItemsSchema = z
  .object({
    kind: kindField,
    category: z
      .enum(COMPONENT_CATEGORIES)
      .optional()
      .describe('One Component category, for example `Forms and inputs`. Only valid for kind `component`.'),
  })
  .refine((args) => !(args.category && args.kind && args.kind !== 'component'), {
    message: '`category` is a Component-only field; it is not valid for a block or a page.',
    path: ['category'],
  })

export const getItemDocSchema = z.object({
  name: nameField,
  kind: kindField,
})

export const getItemPropsSchema = z.object({
  name: nameField,
  kind: kindField,
})

export const getItemSourceSchema = z.object({
  name: nameField,
  kind: kindField,
})

export const getThemeDocSchema = z.object({
  pack: z
    .enum(PACKS)
    .optional()
    .describe('The palette id. Defaults to `default`.'),
  mode: z
    .enum(MODES)
    .optional()
    .describe('The mode axis. Defaults to `light`.'),
  group: z
    .enum(TOKEN_GROUPS)
    .optional()
    .describe(
      'One token group: `semantic` for the resolved pack-by-mode set, or a bound scale (motion, typography, spacing, shadow, breakpoint, container). Omit for the semantic set.',
    ),
})

export const listPagesSchema = z.object({})

export const getPageSchema = z.object({
  url: z
    .string()
    .min(1)
    .describe('A non-item page URL or mirror, for example `/docs/quickstart` or `/docs/quickstart.md`.'),
})

export const searchDocsSchema = z.object({
  query: z.string().min(1).describe('The substring to match against names, descriptions and page bodies.'),
  kind: z
    .enum(SEARCH_KINDS)
    .optional()
    .describe('Restrict hits to one kind; `doc` means a non-item page. Omit to search the whole corpus.'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe('Maximum hits to return. Defaults to 5, maximum 10.'),
})
