/**
 * The prism-llms generator (ticket 16's Answer is the spec; map ticket 20).
 *
 * One build, one `dist/`, three lanes:
 * - `data.json`      — the PrismDocsStore projection (MCP lane)
 * - `llms.txt` + `llms-full.txt` — the agent reference corpus (blog excluded)
 * - `md/`            — the mirror tree serving all five sections per-page
 *
 * File-is-truth per artifact: prose from docs MDX, props from prism-ui's built
 * `.d.ts` via the extractor, example code verbatim from `demos/*.tsx`,
 * `antdBase` from the generated catalog, themes from prism-tokens. Emit is
 * deterministic and byte-stable (sorted, stable order, CRLF normalised);
 * `dist/` is never committed.
 *
 * Usage: node scripts/build.mjs [--out <dir>]  (default `dist/`)
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildCatalog } from '@nanisoft/prism-ui/wrapped-registry';
import { passThroughs } from '@nanisoft/prism-ui/generated/pass-throughs';
import { getPrismTheme, prismBrandPacks } from '@nanisoft/prism-tokens';

import { parseMdx, renderComponentDemos, renderPropsSection, renderTable, stripMdxMechanics, fence } from '../dist/index.js';
import { extractProps } from '../dist/extractor.js';
import { scanPrismImports } from '../dist/demo-graph.js';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..');
const UI_ROOT = path.resolve(REPO_ROOT, 'packages', 'ui');
const CONTENT_ROOT = path.resolve(REPO_ROOT, 'apps', 'site', 'content');

const BASE_URL = 'https://prism.nanisoft.com';
// Derived from the registered packs — a new pack in prism-tokens ships theme
// atoms with no edit here.
const PACKS = Object.keys(prismBrandPacks);
const MODES = ['light', 'dark'];
/** Store kind per catalog layer, in emit order. */
const LAYERS = [
  { layer: 'components', kind: 'component' },
  { layer: 'blocks', kind: 'block' },
  { layer: 'pages', kind: 'page' },
];

/** Read a text file, CRLF-normalised — byte-stable emit across checkouts. */
async function readText(file) {
  try {
    return (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');
  } catch {
    return undefined;
  }
}

async function readJson(file) {
  const text = await readText(file);
  return text === undefined ? undefined : JSON.parse(text);
}

/** List `dir/demos/*.tsx` as `{ slug, title?, code }`, sorted by filename. */
async function collectExamples(itemDir) {
  const demosDir = path.join(itemDir, 'demos');
  if (!existsSync(demosDir)) return { examples: [], titles: new Map() };
  const files = (await readdir(demosDir)).filter((f) => f.endsWith('.tsx')).sort();
  const examples = [];
  const titles = new Map();
  for (const file of files) {
    const slug = file.replace(/\.tsx$/, '');
    const code = await readText(path.join(demosDir, file));
    if (code === undefined) continue;
    examples.push({ slug, code });
  }
  return { examples, titles };
}

/** Example titles declared on the MDX's `<ComponentDemo id title>` elements. */
function collectDemoTitles(mdxBody) {
  const titles = new Map();
  const pattern = /<ComponentDemo\s+([^>]*?)\/>/g;
  let match;
  while ((match = pattern.exec(mdxBody)) !== null) {
    const id = /\bid=["']([^"']+)["']/.exec(match[1] ?? '')?.[1];
    const title = /\btitle=["']([^"']+)["']/.exec(match[1] ?? '')?.[1];
    if (id && title) titles.set(id, title);
  }
  return titles;
}

/** The Prism-added props interfaces from the item's built declarations. */
async function extractItemProps(layer, id) {
  const dtsDir = path.join(UI_ROOT, 'dist', layer, id);
  if (!existsSync(dtsDir)) return [];
  const files = (await readdir(dtsDir)).filter((f) => f.endsWith('.d.ts')).sort();
  const found = [];
  for (const file of files) {
    const source = await readText(path.join(dtsDir, file));
    if (source === undefined) continue;
    for (const iface of extractProps(source)) {
      if (iface.props.length > 0) found.push(iface);
    }
  }
  return found;
}

/** Humanise a slug for fallback titles ('data-entry' → 'Data Entry'). */
function humanize(slug) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Load every content source the corpus draws from. */
async function collectContent(catalog) {
  const content = { guides: new Map(), items: new Map(), blog: new Map() };

  const docsDir = path.join(CONTENT_ROOT, 'docs');
  if (existsSync(docsDir)) {
    for (const file of (await readdir(docsDir)).sort()) {
      if (!file.endsWith('.mdx')) continue;
      content.guides.set(file.replace(/\.mdx$/, ''), await readText(path.join(docsDir, file)));
    }
  }

  for (const { layer } of LAYERS) {
    const layerDir = path.join(CONTENT_ROOT, layer);
    if (!existsSync(layerDir)) continue;
    for (const entry of catalog.filter((e) => e.layer === layer)) {
      const itemDir = path.join(layerDir, entry.id);
      content.items.set(entry.id, {
        entry,
        dir: itemDir,
        mdx: await readText(path.join(itemDir, 'index.mdx')),
      });
    }
  }

  const blogDir = path.join(CONTENT_ROOT, 'blog');
  if (existsSync(blogDir)) {
    for (const dir of (await readdir(blogDir)).sort()) {
      const mdx = await readText(path.join(blogDir, dir, 'index.mdx'));
      if (mdx !== undefined) content.blog.set(dir, mdx);
    }
  }

  return content;
}

/** The theme atom for one pack × mode: snippet, tier tables, antd token lane. */
function renderThemeDoc(pack, mode) {
  const theme = getPrismTheme(pack, mode);
  const modeLabel = mode === 'dark' ? 'beam-dark' : 'light';
  const table = (tokens) =>
    renderTable(['Token', 'Value'], Object.keys(tokens).sort().map((key) => [`\`${key}\``, String(tokens[key])]));

  const snippet = [
    "import { createPrismTheme } from '@nanisoft/prism-tokens';",
    "import { PrismProvider } from '@nanisoft/prism-ui';",
    '',
    `const theme = createPrismTheme({ pack: '${pack}', mode: '${mode}' });`,
    '',
    '// <PrismProvider prismTheme={theme}>…</PrismProvider>',
  ].join('\n');

  return [
    `# Theming — ${humanize(pack)} pack · ${modeLabel} mode`,
    '',
    `> \`createPrismTheme({ pack: '${pack}', mode: '${mode}' })\` returns one frozen \`PrismTheme\`; cssVar key \`${theme.cssVarKey}\`. antd derives everything not listed through its ${mode === 'dark' ? 'dark' : 'default'} algorithm.`,
    '',
    '## Usage',
    '',
    fence(snippet, 'ts'),
    '',
    '## Tier 0 — primitives',
    '',
    table(theme.primitives),
    '',
    '## Tier 1 — semantics',
    '',
    table(theme.semantics),
    '',
    '## antd token lane (seeds + the closed map-token allowlist)',
    '',
    table(theme.antd.token),
    '',
    'Component overrides are shadow-zeroing only (Button/Input shadows → `none`); no `algorithm: true` — a flat patch lets each component inherit the pack’s tinted hairlines (ADR-0002 §2c erratum 3).',
    '',
  ].join('\n');
}

/** Emit one full corpus into `outDir`. Deterministic: same inputs, same bytes. */
export async function emit(outDir) {
  const uiPackage = await readJson(path.join(UI_ROOT, 'package.json'));
  const catalog = buildCatalog(passThroughs);
  const content = await collectContent(catalog);
  const byName = new Map(catalog.map((entry) => [entry.name, entry]));

  const missing = [...content.items.values()].filter((item) => item.mdx === undefined).map((item) => item.entry.id);
  if (missing.length > 0) {
    throw new Error(
      `prism-llms: ${missing.length} catalog item(s) have no doc MDX: ${missing.join(', ')}\n` +
        'Run `pnpm --filter @nanisoft/prism-llms generate-content` (stubs) or author the doc.',
    );
  }

  const written = new Set();
  const writeArtifact = async (rel, text) => {
    const file = path.join(outDir, rel);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, text);
    written.add(rel.split(path.sep).join('/'));
  };

  // --- items (components / blocks / pages) -------------------------------

  const items = [];
  const itemDocs = new Map(); // entry.id → markdown
  for (const { layer, kind } of LAYERS) {
    for (const entry of catalog.filter((e) => e.layer === layer)) {
      const source = content.items.get(entry.id);
      if (source === undefined || source.mdx === undefined) continue; // reported with the missing list below
      const { data, body } = parseMdx(source.mdx);
      if (!data.description) {
        throw new Error(`prism-llms: item '${entry.name}' has no frontmatter description (it becomes the llms.txt bullet)`);
      }

      const { examples, titles } = await collectExamples(source.dir);
      const demoTitles = collectDemoTitles(body);
      for (const [id, title] of demoTitles) titles.set(id, title);

      const readDemo = (id) => examples.find((example) => example.slug === id)?.code;
      const docBody = stripMdxMechanics(renderComponentDemos(body, readDemo));

      // Prism-added props from the built declarations; absence is the Extends seam —
      // pass-throughs never grow a props field (their MDX carries the seam line).
      const extracted = await extractItemProps(layer, entry.id);
      const props = extracted.length > 0 ? renderPropsSection(extracted) : undefined;

      // Cross-refs derived from the demos' prism-ui imports (blocks/pages only).
      const imported = new Set();
      for (const example of examples) {
        for (const name of scanPrismImports(example.code)) {
          const target = byName.get(name);
          if (target && target.id !== entry.id) imported.add(name);
        }
      }
      const crossRefs = [];
      for (const { layer: refLayer } of LAYERS.slice(1)) {
        const names = [...imported].filter((name) => byName.get(name)?.layer === refLayer).sort();
        if (names.length === 0) continue;
        const links = names.map((name) => {
          const target = byName.get(name);
          return `- [${name}](${BASE_URL}/md/${refLayer}/${target.id}.md)`;
        });
        crossRefs.push(`## ${refLayer === 'blocks' ? 'Blocks' : 'Pages'}\n\n${links.join('\n')}`);
      }

      const doc = [`# ${entry.name}\n\n${data.description}`, docBody, props, ...crossRefs]
        .filter(Boolean)
        .join('\n\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s+$/, '\n');

      items.push({
        name: entry.name,
        kind,
        description: data.description,
        doc,
        ...(props ? { props } : {}),
        ...(examples.length > 0
          ? {
              examples: examples.map((example) => ({
                slug: example.slug,
                ...(titles.has(example.slug) ? { title: titles.get(example.slug) } : {}),
                code: example.code,
              })),
            }
          : {}),
        ...(entry.antdBase ? { antdBase: entry.antdBase } : {}),
      });
      itemDocs.set(entry.id, doc);
      await writeArtifact(path.join('md', layer, `${entry.id}.md`), doc);
    }
  }
  items.sort((a, b) => kindRank(a.kind) - kindRank(b.kind) || a.name.localeCompare(b.name));

  // --- guides (docs) + blog ----------------------------------------------

  const pages = [];
  for (const slug of [...content.guides.keys()].sort()) {
    const { data, body } = parseMdx(content.guides.get(slug));
    if (!data.description) throw new Error(`prism-llms: guide '${slug}' has no frontmatter description`);
    const title = data.title ?? humanize(slug);
    const markdown = [`# ${title}\n\n${data.description}`, stripMdxMechanics(body)]
      .filter(Boolean)
      .join('\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+$/, '\n');
    pages.push({ url: `/docs/${slug}`, title, description: data.description, markdown });
    await writeArtifact(path.join('md', 'docs', `${slug}.md`), markdown);
  }
  pages.sort((a, b) => a.url.localeCompare(b.url));

  // Blog: per-page `.md` only — excluded from data.json / llms.txt / llms-full.txt.
  for (const slug of [...content.blog.keys()].sort()) {
    const { data, body } = parseMdx(content.blog.get(slug));
    if (!data.description) throw new Error(`prism-llms: blog post '${slug}' has no frontmatter description`);
    const title = data.title ?? humanize(slug);
    const markdown = [`# ${title}\n\n${data.description}`, stripMdxMechanics(body)]
      .filter(Boolean)
      .join('\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+$/, '\n');
    await writeArtifact(path.join('md', 'blog', `${slug}.md`), markdown);
  }

  // --- themes -------------------------------------------------------------

  const themes = [];
  for (const pack of PACKS) {
    for (const mode of MODES) {
      const slug = `${pack}-${mode}`;
      const markdown = renderThemeDoc(pack, mode);
      themes.push({ slug, markdown });
      await writeArtifact(path.join('md', 'theme', `${slug}.md`), markdown);
    }
  }
  themes.sort((a, b) => a.slug.localeCompare(b.slug));

  // --- the three lanes ----------------------------------------------------

  const store = {
    prismVersion: uiPackage.version,
    baseUrl: BASE_URL,
    items,
    pages,
    themes,
  };
  await writeArtifact('data.json', `${JSON.stringify(store, null, 2)}\n`);

  const bullet = (title, href, description) => `- [${title}](${href}): ${description}`;
  const llmsSections = [];
  if (pages.length > 0) {
    llmsSections.push(
      `## Guides\n\n${pages.map((page) => bullet(page.title, `${BASE_URL}/md/docs/${page.url.slice('/docs/'.length)}.md`, page.description)).join('\n')}`,
    );
  }
  for (const { layer, heading } of [
    { layer: 'components', heading: 'Components' },
    { layer: 'blocks', heading: 'Blocks' },
    { layer: 'pages', heading: 'Pages' },
  ]) {
    const layerItems = items.filter((item) => item.kind === kindOf(layer));
    if (layerItems.length === 0) continue;
    llmsSections.push(
      `## ${heading}\n\n${layerItems
        .map((item) => {
          const entry = catalog.find((e) => e.name === item.name);
          return bullet(item.name, `${BASE_URL}/md/${layer}/${entry.id}.md`, item.description);
        })
        .join('\n')}`,
    );
  }
  llmsSections.push(
    `## Theming\n\n${themes
      .map((theme) => {
        const [pack, mode] = theme.slug.split('-');
        return bullet(
          `${humanize(pack)} pack · ${mode === 'dark' ? 'beam-dark' : 'light'}`,
          `${BASE_URL}/md/theme/${theme.slug}.md`,
          `Theming reference for the ${pack} pack in ${mode} mode — the createPrismTheme snippet, token tiers, and the antd token lane.`,
        );
      })
      .join('\n')}`,
  );

  const tagline =
    "One design language, many expressions — Ant Design v6 components, blocks, and pages under the Prism theme. Apps always import from '@nanisoft/prism-ui', never from antd directly.";
  const llmsTxt = [`# Prism`, '', `> ${tagline}`, '', ...llmsSections.map((s) => `${s}\n`)].join('\n');
  await writeArtifact('llms.txt', llmsTxt);

  const fullBody = [...pages.map((page) => page.markdown), ...items.map((item) => item.doc), ...themes.map((theme) => theme.markdown)].join(
    '\n\n---\n\n',
  );
  const llmsFull = [`# Prism — full reference`, '', `> ${tagline}`, '', '---', '', fullBody, ''].join('\n');
  await writeArtifact('llms-full.txt', llmsFull);

  return { written: [...written].sort(), store };
}

function kindRank(kind) {
  return kind === 'component' ? 0 : kind === 'block' ? 1 : 2;
}

function kindOf(layer) {
  return layer === 'components' ? 'component' : layer === 'blocks' ? 'block' : 'page';
}

export async function main(argv) {
  const outIndex = argv.indexOf('--out');
  const outDir = outIndex !== -1 ? path.resolve(argv[outIndex + 1]) : path.join(PKG_ROOT, 'dist');
  const { written, store } = await emit(outDir);
  console.log(
    `prism-llms: ${written.length} files → ${path.relative(process.cwd(), outDir) || '.'} ` +
      `(${store.items.length} items, ${store.pages.length} guides, ${store.themes.length} themes)`,
  );
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await main(process.argv.slice(2));
}
