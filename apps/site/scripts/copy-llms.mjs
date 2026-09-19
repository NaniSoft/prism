/**
 * Copies prism-llms artifacts into the static export (ticket 16 §3):
 * `llms.txt`, `llms-full.txt`, and the `md/` mirror tree land in `out/` so the
 * Worker's one `.md` prefix rule (`/<section>/<slug>.md` → `/md/<section>/<slug>.md`)
 * resolves against real assets. `data.json` is deliberately NOT copied — the
 * Worker bundles it from the package at build time (ticket 05: deploy is
 * invalidation), keeping it out of the public asset surface.
 */
import { cp, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(SITE_ROOT, '..', '..');
const LLMS_DIST = path.join(REPO_ROOT, 'packages', 'llms', 'dist');
const OUT = path.join(SITE_ROOT, 'out');

async function copy(from, to) {
  await access(from); // throws with a clear stack if the turbo graph was skipped
  await cp(from, to, { recursive: true });
  console.log(`copy-llms: ${path.relative(SITE_ROOT, from)} → ${path.relative(SITE_ROOT, to)}`);
}

await copy(path.join(LLMS_DIST, 'llms.txt'), path.join(OUT, 'llms.txt'));
await copy(path.join(LLMS_DIST, 'llms-full.txt'), path.join(OUT, 'llms-full.txt'));
await copy(path.join(LLMS_DIST, 'md'), path.join(OUT, 'md'));
