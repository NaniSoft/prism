import { defineConfig } from 'fumadocs-mdx/config'

/**
 * The site defines its collections with the macro API in `src/lib/source.ts`,
 * because the Macro form is enough here: the Markdown mirror that would have
 * required the config API's `postprocess.includeProcessedMarkdown` is ticket
 * 12's work and does not ship in this phase.
 *
 * A config file is still provided so `createMDX()` has a stable config path to
 * load and watch. It declares no collections; the macro does.
 */
export default defineConfig()
