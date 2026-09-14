/**
 * Bootstrap generator for prism-llms: one dist/ artefact set that later serves npm,
 * the site root, and the MCP server's backing store.
 *
 * Placeholder era: the authoritative generation source (Fumadocs MDX vs prism-ui
 * types, and the CI drift gate) is specified by the prism-llms shape ticket on the
 * Prism map (`.scratch/prism/map.md`, ticket 16) and implemented against it.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const catalog = JSON.parse(
  await readFile(new URL('../src/catalog.json', import.meta.url), 'utf8'),
);

const llmsTxt = [
  `# ${catalog.name}`,
  '',
  `> ${catalog.tagline}`,
  '',
  'Placeholder artefact — generated per-component Markdown lands with the',
  'prism-llms spec (see .scratch/prism/map.md).',
  '',
].join('\n');

await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../dist/data.json', import.meta.url),
  JSON.stringify(catalog, null, 2) + '\n',
);
await writeFile(new URL('../dist/llms.txt', import.meta.url), llmsTxt);

console.log('prism-llms: wrote dist/data.json, dist/llms.txt');
