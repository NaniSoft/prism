// Partitions toDtcg() output into the per-(collection × mode) files the Figma
// importer consumes, plus a manifest — ADR-0002 §2d as amended by the ticket-14
// research (manifest mode order decides the default mode: Light first).
// Run after `tsc` — reads the built dist/index.js.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, '..', 'dist');

const { toDtcg } = await import(pathToFileURL(path.join(dist, 'index.js')).href);

const PACKS = ['blue', 'green'];
const MODES = { Light: 'light', Dark: 'dark' };

/** Collect sorted leaf paths ("color/ink/light") of a DTCG tree. */
function leafPaths(tree, prefix = '') {
  const out = [];
  for (const [key, value] of Object.entries(tree)) {
    const p = prefix ? `${prefix}/${key}` : key;
    if (value && typeof value === 'object' && '$type' in value) out.push(p);
    else out.push(...leafPaths(value, p));
  }
  return out.sort();
}

let failures = 0;
const die = (msg) => {
  console.error(`build-figma: ${msg}`);
  failures += 1;
};

for (const pack of PACKS) {
  const packDir = path.join(dist, 'figma', pack);
  await mkdir(packDir, { recursive: true });

  const docs = Object.fromEntries(Object.entries(MODES).map(([label, mode]) => [label, toDtcg(pack, mode)]));
  const [lightDoc, darkDoc] = [docs.Light, docs.Dark];

  // Per-mode key parity (ADR-0002 §4): the tier trees must match across modes.
  if (JSON.stringify(Object.keys(lightDoc.primitive)) !== JSON.stringify(Object.keys(darkDoc.primitive))) {
    die(`${pack}: primitive key parity fails across modes`);
  }
  const lightPaths = leafPaths(lightDoc.semantic);
  const darkPaths = leafPaths(darkDoc.semantic);
  if (JSON.stringify(lightPaths) !== JSON.stringify(darkPaths)) {
    die(`${pack}: semantic key parity fails across modes`);
  }

  // Tier-name collision guard: no semantic path may equal a primitive path —
  // the importer resolves aliases by name, so a mirror name is ambiguous.
  const primitivePaths = new Set(leafPaths(lightDoc.primitive));
  const collisions = lightPaths.filter((p) => primitivePaths.has(p));
  if (collisions.length > 0) {
    die(`${pack}: tier-name collisions between primitive and semantic trees: ${collisions.join(', ')}`);
  }

  const primitiveFile = `prism.${pack}.primitive.tokens.json`;
  const semanticFiles = {
    Light: `prism.${pack}.semantic.light.tokens.json`,
    Dark: `prism.${pack}.semantic.dark.tokens.json`,
  };

  await writeFile(path.join(packDir, primitiveFile), `${JSON.stringify(lightDoc.primitive, null, 2)}\n`);
  await writeFile(path.join(packDir, semanticFiles.Light), `${JSON.stringify(lightDoc.semantic, null, 2)}\n`);
  await writeFile(path.join(packDir, semanticFiles.Dark), `${JSON.stringify(darkDoc.semantic, null, 2)}\n`);

  const manifest = {
    name: `Prism (${pack[0].toUpperCase()}${pack.slice(1)})`,
    collections: {
      'prism.primitive': { modes: { Default: [primitiveFile] } },
      'prism.semantic': {
        modes: { Light: [semanticFiles.Light], Dark: [semanticFiles.Dark] },
      },
    },
  };
  await writeFile(path.join(packDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`build-figma: dist/figma/${pack}/ (${lightPaths.length} semantic × 2 modes, ${primitivePaths.size} primitives)`);
}

if (failures > 0) process.exit(1);
