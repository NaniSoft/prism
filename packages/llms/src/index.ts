/**
 * prism-llms public surface.
 *
 * The store contract is exported from the root; the extractor sits behind the
 * `./extractor` subpath and is shared with the site's API reference table. The
 * Markdown lane and the demo contract ship so a consumer renders exactly what
 * the generator emits.
 */
export {
  parsePrismDocsStore,
  STORE_CATEGORIES,
  STORE_KINDS,
  STORE_MODES,
  STORE_PACKS,
  STORE_SCALE_GROUPS,
  STORE_SECTIONS,
  STORE_STATUSES,
} from './store.js'
export type {
  Mode,
  PackId,
  PrismDocsExample,
  PrismDocsPage,
  PrismDocsStore,
  PrismDocsStoreEntry,
  PrismScaleGroup,
  PrismScaleToken,
  PrismSemanticToken,
  PrismThemeTokens,
  PrismTokensProjection,
  StoreKind,
  StoreSection,
  StoreStatus,
  TokenGroup,
} from './store.js'

export {
  assembleDoc,
  demoTitle,
  fence,
  parseMdx,
  parsePropLine,
  renderCompositionSection,
  renderCrossReferences,
  renderDemoSection,
  renderPropLine,
  renderPropsBody,
  renderPropsSection,
  stripMdxMechanics,
  stripSection,
} from './markdown.js'
export type {
  CompositionField,
  CrossReference,
  DocMeta,
  ParsedMdx,
  ParsedPropLine,
} from './markdown.js'

export type { ExtractedInterface, ExtractedProp } from './extractor.js'

export {
  scanPrismImports,
  scanPrismImportsWithSource,
  validateDemoSource,
} from './demo-graph.js'
export type { DemoViolation, PrismImport } from './demo-graph.js'
