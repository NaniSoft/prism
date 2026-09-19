/**
 * The site's `generate` task (ticket 21). Two duties, both codegen, both
 * deterministic:
 *
 * 1. Stub MDX + section `meta.json` — delegated to prism-llms'
 *    `generate-content.mjs`, the single implementation (ticket 20's handoff:
 *    the site invokes it, it does not reimplement it).
 * 2. The demos registry (`lib/generated/demos.ts`) for the app-level Demo
 *    component — generated from the same co-located `demos/*.tsx` files the
 *    generator reads.
 *
 * `pnpm build` runs this before `next build`; the outputs are build-time
 * artifacts and stay out of version control.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateContent } from '../../../packages/llms/scripts/generate-content.mjs';
import { generateDemosRegistry } from './lib/generate-demos.mjs';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_ROOT = path.join(SITE_ROOT, 'content');
const DEMOS_OUT = path.join(SITE_ROOT, 'lib', 'generated', 'demos.ts');

const summary = await generateContent(CONTENT_ROOT);
console.log(
  `generate: stubs ${summary.written.length} written, ${summary.removed.length} removed → ${path.relative(SITE_ROOT, CONTENT_ROOT)}`,
);

const count = await generateDemosRegistry(CONTENT_ROOT, DEMOS_OUT);
console.log(`generate: ${count} demos registered → ${path.relative(SITE_ROOT, DEMOS_OUT)}`);
