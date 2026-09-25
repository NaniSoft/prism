/**
 * The prism-llms drift gate (ticket 16 §3): `prism-llms#check`, wired into CI.
 * Build-fresh — `dist/` is never committed — and asserts the seven invariants:
 *
 *  1. every catalog item has doc MDX (stub or full)          — the emit throws on a gap
 *  2. every demo passes the self-contained contract          — this gate is the contract's enforcement point
 *  3. cross-refs resolve (ComponentDemo ids, imported items) — nothing dead
 *  4. every item doc carries a frontmatter description       — it becomes the llms.txt bullet
 *  5. `data.json` validates against `PrismDocsStore`         — runtime guard + tsc, type-only devDep
 *  6. every `llms.txt` link target exists; the `md/` mirror is complete
 *  7. determinism: build twice, byte-compare
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import * as prismUi from '@nanisoft/prism-ui';
import { buildCatalog } from '@nanisoft/prism-ui/catalog';

import { emit } from './build.mjs';
import { scanPrismImports, validateDemoSource } from '../dist/demo-graph.js';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..');
const CONTENT_ROOT = path.resolve(REPO_ROOT, 'apps', 'site', 'content');
const WORK = path.join(PKG_ROOT, '.turbo', 'check');
const LAYERS = ['components', 'blocks', 'pages'];
const BASE_URL = 'https://prism.nanisoft.com';

const failures = [];
const fail = (invariant, message) => failures.push(`[${invariant}] ${message}`);

async function readText(file) {
  try {
    return (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');
  } catch {
    return undefined;
  }
}

/** Relative file list with contents, for the byte-compare. */
async function snapshot(dir) {
  const files = {};
  const walk = async (current, prefix) => {
    for (const entry of (await readdir(current, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(path.join(current, entry.name), rel);
      else files[rel] = await readText(path.join(current, entry.name));
    }
  };
  await walk(dir, '');
  return files;
}

/** All demos in the content tree: [{ file, code, itemLayer?, itemId? }]. */
async function collectDemos() {
  const demos = [];
  for (const layer of [...LAYERS, 'blog']) {
    const layerDir = path.join(CONTENT_ROOT, layer);
    if (!existsSync(layerDir)) continue;
    for (const item of (await readdir(layerDir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!item.isDirectory()) continue;
      const demosDir = path.join(layerDir, item.name, 'demos');
      if (!existsSync(demosDir)) continue;
      for (const file of (await readdir(demosDir)).filter((f) => f.endsWith('.tsx')).sort()) {
        const code = await readText(path.join(demosDir, file));
        if (code !== undefined) demos.push({ file: `${layer}/${item.name}/demos/${file}`, code, layer, item: item.name });
      }
    }
  }
  return demos;
}

/** The store-validation TS project (invariant 5): runtime guard + type assignment. */
async function validateStoreAgainstType(emitDir) {
  const projectDir = path.join(WORK, 'store-validate');
  await mkdir(projectDir, { recursive: true });
  const relData = path.relative(projectDir, path.join(emitDir, 'data.json')).split(path.sep).join('/');
  await writeFile(
    path.join(projectDir, 'validate-store.ts'),
    [
      "import { parsePrismDocsStore } from '@nanisoft/prism-mcp-server';",
      `import raw from '${relData}' with { type: 'json' };`,
      '',
      'export const store = parsePrismDocsStore(raw);',
      '',
    ].join('\n'),
  );
  await writeFile(
    path.join(projectDir, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'es2022',
          module: 'nodenext',
          moduleResolution: 'nodenext',
          strict: true,
          noEmit: true,
          resolveJsonModule: true,
          skipLibCheck: true,
          types: [],
        },
        include: ['validate-store.ts'],
      },
      null,
      2,
    )}\n`,
  );
  const result = spawnSync('pnpm exec tsc -p .turbo/check/store-validate/tsconfig.json', {
    cwd: PKG_ROOT,
    shell: true,
    encoding: 'utf8',
  });
  return { ok: result.status === 0, output: `${result.stdout}${result.stderr}`.trim() };
}

const catalog = buildCatalog();

// --- 1 + 7: build-fresh emits, byte-compare -------------------------------

await rm(WORK, { recursive: true, force: true });
const dirA = path.join(WORK, 'a');
const dirB = path.join(WORK, 'b');
let firstEmit;
try {
  firstEmit = await emit(dirA);
  await emit(dirB);
} catch (error) {
  // Invariant 1 (coverage / missing description) surfaces as an emit failure.
  console.error(`prism-llms#check: emit failed\n${error.message}`);
  process.exit(1);
}

const snapshotA = await snapshot(dirA);
const snapshotB = await snapshot(dirB);
const drift = Object.keys(snapshotA)
  .filter((file) => snapshotA[file] !== snapshotB[file])
  .concat(Object.keys(snapshotB).filter((file) => !(file in snapshotA)));
if (drift.length > 0) fail('determinism', `two builds differ: ${drift.join(', ')}`);

// --- 2: the demo self-contained contract ----------------------------------

for (const demo of await collectDemos()) {
  for (const violation of validateDemoSource(demo.code)) {
    fail('demo-contract', `${demo.file}: ${violation.reason}`);
  }
}

// --- 3: cross-refs resolve -------------------------------------------------

for (const demo of await collectDemos()) {
  for (const name of scanPrismImports(demo.code)) {
    if (!(name in prismUi)) fail('cross-refs', `${demo.file} imports '${name}', which is not a public prism-ui runtime export`);
  }
}
for (const { layer } of [{ layer: 'components' }, { layer: 'blocks' }, { layer: 'pages' }]) {
  const layerDir = path.join(CONTENT_ROOT, layer);
  if (!existsSync(layerDir)) continue;
  for (const item of catalog.filter((e) => e.layer === layer)) {
    const mdx = await readText(path.join(CONTENT_ROOT, layer, item.id, 'index.mdx'));
    if (mdx === undefined) continue; // coverage already failed the emit
    const pattern = /<ComponentDemo\s+([^>]*?)\/>/g;
    let match;
    while ((match = pattern.exec(mdx)) !== null) {
      const id = /\bid=["']([^"']+)["']/.exec(match[1] ?? '')?.[1];
      const target = id ? path.join(CONTENT_ROOT, layer, item.id, 'demos', `${id}.tsx`) : undefined;
      if (!id || !existsSync(target)) {
        fail('cross-refs', `${layer}/${item.id}/index.mdx references example '${id}', which has no demos/${id}.tsx`);
      }
    }
  }
}

// --- 4: frontmatter descriptions ------------------------------------------

for (const item of firstEmit.store.items) {
  if (!item.description || item.description.trim().length === 0) {
    fail('descriptions', `item '${item.name}' has an empty description`);
  }
}

// --- 5: data.json ↔ PrismDocsStore -----------------------------------------

const storeCheck = await validateStoreAgainstType(dirA);
if (!storeCheck.ok) fail('store', `data.json does not satisfy PrismDocsStore:\n${storeCheck.output}`);

// --- 6: llms.txt links + mirror completeness -------------------------------

const llmsTxt = snapshotA['llms.txt'];
if (llmsTxt === undefined) fail('links', 'llms.txt was not emitted');
else {
  const matched = llmsTxt.match(new RegExp(`${BASE_URL.replace(/\./g, '\\.')}\\/md\\/[\\w./-]+\\.md`, 'g'));
  const links = [...new Set(matched === null ? [] : matched)];
  for (const link of links) {
    const rel = link.slice(BASE_URL.length + 1);
    if (snapshotA[rel] === undefined) fail('links', `llms.txt links ${link}, which was not emitted`);
  }
}
for (const item of firstEmit.store.items) {
  const entry = catalog.find((e) => e.name === item.name);
  const rel = `md/${entry.layer}/${entry.id}.md`;
  if (snapshotA[rel] === undefined) fail('links', `item '${item.name}' has no mirror file ${rel}`);
}
for (const page of firstEmit.store.pages) {
  const rel = `md/docs/${page.url.slice('/docs/'.length)}.md`;
  if (snapshotA[rel] === undefined) fail('links', `guide '${page.url}' has no mirror file ${rel}`);
}
for (const theme of firstEmit.store.themes) {
  const rel = `md/theme/${theme.slug}.md`;
  if (snapshotA[rel] === undefined) fail('links', `theme '${theme.slug}' has no mirror file ${rel}`);
}
const blogDir = path.join(CONTENT_ROOT, 'blog');
if (existsSync(blogDir)) {
  for (const slug of (await readdir(blogDir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)) {
    const rel = `md/blog/${slug}.md`;
    if (snapshotA[rel] === undefined) fail('links', `blog post '${slug}' has no mirror file ${rel}`);
  }
}

// --- verdict ----------------------------------------------------------------

if (failures.length > 0) {
  console.error(`prism-llms#check: ${failures.length} failure(s)\n\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(
  `prism-llms#check: 7 invariants green — ${firstEmit.store.items.length} items, ` +
    `${firstEmit.store.pages.length} guides, ${firstEmit.store.themes.length} themes, ${Object.keys(snapshotA).length} files`,
);
