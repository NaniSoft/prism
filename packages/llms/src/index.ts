/**
 * prism-llms public surface. The root stays compiler-free (the extractor sits
 * behind `./extractor`); what ships here is the Markdown lane every consumer
 * of the corpus shares — the site's stub/API tooling imports these helpers so
 * it renders exactly what the generator emits.
 */
export {
  parseMdx,
  fence,
  renderComponentDemos,
  stripMdxMechanics,
  renderTable,
  renderPropsSection,
  type DocMeta,
  type ParsedMdx,
} from './markdown.js';
export type { ExtractedInterface, ExtractedProp } from './extractor.js';
export { scanPrismImports, validateDemoSource, type DemoViolation } from './demo-graph.js';
