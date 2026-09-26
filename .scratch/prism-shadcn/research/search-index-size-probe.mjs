// Empirical probe: size of the *static* search asset fumadocs emits via `staticGET`
// for a docs site of ~60 pages, in both 'advanced' (default) and 'simple' modes.
import { createSearchAPI } from 'fumadocs-core/search/server';

const N = Number(process.argv[2] || 60);

// Synthetic but realistic: a design-system page with title, description,
// ~8 headings, ~40 prose blocks, some code. Advanced mode indexes
// page + description + every heading + every content block.
function makeIndexes(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const slug = `components/button-${i}`;
    const url = `/docs/${slug}`;
    const headings = Array.from({ length: 8 }, (_, h) => ({
      id: `section-${h}`,
      content: `Section ${h} of the ${slug} documentation page`,
      url: `${url}#section-${h}`,
    }));
    const contents = Array.from({ length: 40 }, (_, c) => ({
      heading: `section-${c % 8}`,
      content:
        `Paragraph ${c} for ${slug}. ` +
        'A typical design-system documentation paragraph of roughly a hundred and twenty characters in length, ' +
        'describing props, accessibility notes and usage guidance for this component.',
      url: `${url}#section-${c % 8}`,
    }));
    out.push({
      id: url,
      title: `Button ${i}`,
      description: `The Button ${i} component, its variants, props and accessibility guidance.`,
      url,
      breadcrumbs: ['Docs', 'Components', `Button ${i}`],
      structuredData: { headings, contents },
    });
  }
  return out;
}

function bytes(s) {
  return Buffer.byteLength(s, 'utf8');
}
function kb(n) {
  return `${(n / 1024).toFixed(1)} KiB`;
}

const indexes = makeIndexes(N);

// Count the documents advanced mode will emit (mirrors build-doc.ts)
const advancedDocs =
  N * (1 /*page*/ + 1 /*description*/ + indexes[0].structuredData.headings.length + indexes[0].structuredData.contents.length);

for (const mode of ['advanced', 'simple']) {
  const api = createSearchAPI(mode, { indexes });
  const exported = await api.export();
  const json = JSON.stringify(exported);
  // this is literally what `staticGET()` returns: Response.json(await server.export())
  const gz = (await import('node:zlib')).gzipSync(Buffer.from(json)).length;
  console.log(
    [
      `mode=${mode}`,
      `pages=${N}`,
      mode === 'advanced' ? `index-docs=${advancedDocs}` : `index-docs=${N}`,
      `raw=${kb(bytes(json))}`,
      `gzip=${kb(gz)}`,
      `raw-per-page=${(bytes(json) / N).toFixed(0)}B`,
    ].join('  '),
  );
}
