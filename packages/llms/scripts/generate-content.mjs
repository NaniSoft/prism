/**
 * The stub-MDX generator (ticket 12 §1): thin generated pages for every
 * catalog item — import line + `Extends` pointer + antd.dev link, zero
 * hand-written copy, so nothing can drift. antd bump PRs mechanically
 * add/remove stub pages; a stub without demos is honest, not broken.
 *
 * Safety: only files carrying the `prism:generated-stub` marker are ever
 * rewritten or removed — hand-authored docs are never touched.
 *
 * The script lives in prism-llms (the package that owns catalog→corpus
 * coverage and fails the build on gaps); the site's `generate` task re-runs it
 * once its content loaders land (ticket 21).
 *
 * Usage: node scripts/generate-content.mjs [--content <dir>]
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildCatalog } from '@nanisoft/prism-ui/wrapped-registry';
import { passThroughs } from '@nanisoft/prism-ui/generated/pass-throughs';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..');
const CONTENT_ROOT = path.resolve(REPO_ROOT, 'apps', 'site', 'content');

const MARKER = '{/* prism:generated-stub v1 */}';
const LAYERS = ['components', 'blocks', 'pages'];

const CATEGORY_TITLES = {
  general: 'General',
  layout: 'Layout',
  navigation: 'Navigation',
  'data-entry': 'Data Entry',
  'data-display': 'Data Display',
  feedback: 'Feedback',
  prism: 'Prism',
};

/** The antd doc-page slug ('Typography.Title' → 'typography'). */
function antdDocSlug(antdName) {
  return antdName.split('.')[0].replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function stubMdx(entry) {
  const importFrom =
    entry.layer === 'components' ? '@nanisoft/prism-ui/components' : `@nanisoft/prism-ui/${entry.layer}`;
  const lines = [
    '---',
    `title: ${entry.name}`,
  ];

  if (entry.antdBase) {
    // Pass-through — zero Prism-added props; the antd MCP owns inherited surface.
    lines.push(
      `description: antd ${entry.antdBase}, unchanged — a pass-through re-export. Import from '@nanisoft/prism-ui'.`,
    );
    lines.push(
      '---',
      MARKER,
      '',
      '```ts',
      `import { ${entry.name} } from '${importFrom}';`,
      '```',
      '',
      `\`${entry.name}\` is antd's [${entry.antdBase}](https://ant.design/components/${antdDocSlug(entry.antdBase)}), re-exported unchanged.`,
      '',
      `- Extends: antd **${entry.antdBase}** — for inherited props and demos, use the antd MCP (\`antd_info ${entry.antdBase}\`).`,
      "- Always import from '@nanisoft/prism-ui', never from `antd` directly.",
      '',
      '_No additional props beyond the antd base component._',
    );
  } else if (entry.wrapped) {
    // Wrapper — the base rides the registry entry; Prism props come from the extractor.
    lines.push(
      `description: Prism wrapper around antd ${entry.wrapped.antdName} (${entry.wrapped.justification}).`,
    );
    lines.push(
      '---',
      MARKER,
      '',
      '```ts',
      `import { ${entry.name} } from '${importFrom}';`,
      '```',
      '',
      `\`${entry.name}\` is a Prism wrapper around antd **${entry.wrapped.antdName}**.`,
      '',
      `- Extends: antd **${entry.wrapped.antdName}** — for inherited props, use the antd MCP (\`antd_info ${entry.wrapped.antdName}\`).`,
      "- Prism-added props are listed by the prism MCP (`get_item_props { \"name\": \"" + entry.name + "\" }`).",
      '',
      '_Full documentation pending — this stub is honest, not broken._',
    );
  } else {
    // Prism-original block/page.
    const noun = entry.layer === 'blocks' ? 'block' : 'page';
    lines.push(`description: Prism ${noun} — full documentation pending.`);
    lines.push(
      '---',
      MARKER,
      '',
      '```ts',
      `import { ${entry.name} } from '${importFrom}';`,
      '```',
      '',
      `\`${entry.name}\` is a Prism ${noun}. Full documentation is pending — the prism MCP answers API questions in the meantime (\`get_item_props\`, \`get_item_source\`).`,
    );
  }

  return lines.join('\n') + '\n';
}

/** Generated meta.json per section: Prism group first, then antd's six categories (ticket 12 §1). */
function sectionMeta(catalog, layer) {
  const entries = catalog.filter((e) => e.layer === layer);
  const pages = [];
  const meta = { title: layer === 'components' ? 'Components' : layer === 'blocks' ? 'Blocks' : 'Pages' };

  const order = ['prism', 'general', 'layout', 'navigation', 'data-entry', 'data-display', 'feedback'];
  for (const category of order) {
    const group = entries.filter((e) => e.category === category);
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

async function isGeneratedStub(file) {
  const text = await readText(file);
  return text !== undefined && text.includes(MARKER);
}

export async function generateContent(contentRoot) {
  const catalog = buildCatalog(passThroughs);
  const summary = { written: [], removed: [] };

  for (const layer of LAYERS) {
    const layerDir = path.join(contentRoot, layer);
    await mkdir(layerDir, { recursive: true });

    // Add or freshen stubs.
    for (const entry of catalog.filter((e) => e.layer === layer)) {
      const itemDir = path.join(layerDir, entry.id);
      const file = path.join(itemDir, 'index.mdx');
      if (existsSync(file) && !(await isGeneratedStub(file))) continue; // hand-authored — never touched
      await mkdir(itemDir, { recursive: true });
      await writeFile(file, stubMdx(entry));
      summary.written.push(`${layer}/${entry.id}/index.mdx`);
    }

    // Remove stubs whose item left the catalog (antd bump PRs); hand files stay.
    if (existsSync(layerDir)) {
      for (const dir of await readdir(layerDir)) {
        const file = path.join(layerDir, dir, 'index.mdx');
        if (!existsSync(file) || !(await isGeneratedStub(file))) continue;
        if (catalog.some((e) => e.layer === layer && e.id === dir)) continue;
        await rm(file);
        const rest = await readdir(path.join(layerDir, dir));
        if (rest.length === 0) await rm(path.join(layerDir, dir), { recursive: true });
        summary.removed.push(`${layer}/${dir}`);
      }
    }

    await writeFile(path.join(layerDir, 'meta.json'), `${JSON.stringify(sectionMeta(catalog, layer), null, 2)}\n`);
  }

  return summary;
}

export async function main(argv) {
  const contentIndex = argv.indexOf('--content');
  const contentRoot = contentIndex !== -1 ? path.resolve(argv[contentIndex + 1]) : CONTENT_ROOT;
  const summary = await generateContent(contentRoot);
  console.log(
    `prism-llms: stubs ${summary.written.length} written, ${summary.removed.length} removed → ${path.relative(process.cwd(), contentRoot) || '.'}`,
  );
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await main(process.argv.slice(2));
}
