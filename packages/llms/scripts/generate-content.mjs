/**
 * Generate one owned documentation page for every prism-ui catalog item and
 * wire the first co-located example. Hand-authored files are never rewritten.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildCatalog } from '@nanisoft/prism-ui/catalog';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..');
const CONTENT_ROOT = path.resolve(REPO_ROOT, 'apps', 'site', 'content');
const MARKER = '{/* prism:generated-owned v2 */}';
const LEGACY_MARKER = '{/* prism:generated-stub v1 */}';
const LAYERS = ['components', 'blocks', 'pages'];

const CATEGORY_TITLES = {
  actions: 'Actions',
  forms: 'Forms',
  navigation: 'Navigation',
  overlays: 'Overlays',
  'data-display': 'Data display',
  feedback: 'Feedback',
  foundations: 'Foundations',
  layout: 'Layout',
  composition: 'Compositions',
};

const CATEGORY_ORDER = ['actions', 'forms', 'navigation', 'overlays', 'data-display', 'feedback', 'foundations', 'layout', 'composition'];

function stubMdx(entry, demoId) {
  const importFrom = entry.layer === 'components'
    ? `@nanisoft/prism-ui/components/${entry.id}`
    : `@nanisoft/prism-ui/${entry.layer}/${entry.id}`;
  const noun = entry.layer === 'components' ? 'component' : entry.layer === 'blocks' ? 'block' : 'page';
  const lines = [
    '---',
    `title: ${JSON.stringify(entry.name)}`,
    `description: ${JSON.stringify(entry.description)}`,
    '---',
    MARKER,
    '',
    '```ts',
    `import { ${entry.name} } from '${importFrom}';`,
    '```',
    '',
    `${entry.name} is a Prism-owned ${noun}. Its behavior, public props, and Spectral Refraction recipe ship together from \`@nanisoft/prism-ui\`.`,
    '',
    '- Import only from `@nanisoft/prism-ui`.',
    '- Keep the component inside `PrismProvider` when it uses an overlay, popup, or nested theme scope.',
    '- Use `className` for layout composition; visual state stays in the Prism recipe and CSS variables.',
  ];
  if (demoId) lines.push('', `<ComponentDemo id="${demoId}" title="${entry.name}" />`);
  return `${lines.join('\n')}\n`;
}

async function firstDemoId(contentRoot, layer, itemId) {
  const demosDir = path.join(contentRoot, layer, itemId, 'demos');
  if (!existsSync(demosDir)) return undefined;
  const first = (await readdir(demosDir)).filter((file) => file.endsWith('.tsx')).sort()[0];
  return first?.replace(/\.tsx$/, '');
}

function sectionMeta(catalog, layer) {
  const entries = catalog.filter((entry) => entry.layer === layer);
  const pages = [];
  const meta = { title: layer === 'components' ? 'Components' : layer === 'blocks' ? 'Blocks' : 'Pages' };
  for (const category of CATEGORY_ORDER) {
    const group = entries.filter((entry) => entry.category === category);
    if (group.length === 0) continue;
    const separator = `---${CATEGORY_TITLES[category]}---`;
    pages.push(separator);
    meta[separator] = CATEGORY_TITLES[category];
    for (const entry of group) pages.push(entry.id);
  }
  meta.pages = pages;
  return meta;
}

async function readText(file) {
  try {
    return (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');
  } catch {
    return undefined;
  }
}

async function generatedPage(file) {
  const text = await readText(file);
  return text !== undefined && (text.includes(MARKER) || text.includes(LEGACY_MARKER));
}

export async function generateContent(contentRoot) {
  const catalog = buildCatalog();
  const summary = { written: [], removed: [] };

  for (const layer of LAYERS) {
    const layerDir = path.join(contentRoot, layer);
    await mkdir(layerDir, { recursive: true });

    for (const entry of catalog.filter((item) => item.layer === layer)) {
      const itemDir = path.join(layerDir, entry.id);
      const file = path.join(itemDir, 'index.mdx');
      if (existsSync(file) && !(await generatedPage(file))) continue;
      await mkdir(itemDir, { recursive: true });
      await writeFile(file, stubMdx(entry, await firstDemoId(contentRoot, layer, entry.id)));
      summary.written.push(`${layer}/${entry.id}/index.mdx`);
    }

    for (const id of await readdir(layerDir)) {
      if (catalog.some((entry) => entry.layer === layer && entry.id === id)) continue;
      const itemDir = path.join(layerDir, id);
      const file = path.join(itemDir, 'index.mdx');
      if (!existsSync(file) || !(await generatedPage(file))) continue;
      await rm(itemDir, { recursive: true, force: true });
      summary.removed.push(`${layer}/${id}`);
    }

    await writeFile(path.join(layerDir, 'meta.json'), `${JSON.stringify(sectionMeta(catalog, layer), null, 2)}\n`);
  }

  return summary;
}

export async function main(argv) {
  const contentIndex = argv.indexOf('--content');
  const contentRoot = contentIndex === -1 ? CONTENT_ROOT : path.resolve(argv[contentIndex + 1]);
  const summary = await generateContent(contentRoot);
  console.log(`prism-llms: owned pages ${summary.written.length} written, ${summary.removed.length} removed → ${path.relative(process.cwd(), contentRoot) || '.'}`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await main(process.argv.slice(2));
}
