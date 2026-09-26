/**
 * First-paint probe generator (ticket 08).
 *
 * Writes three static pages that differ ONLY in how the stored preference
 * (pack=peach, mode=dark) reaches the document:
 *   first-paint-blocking.html  inline head script, runs before paint
 *   first-paint-deferred.html  applied after DOMContentLoaded (React-effect-like)
 *   first-paint-server.html    attributes baked into <html> (build-time / server)
 *
 * Each page samples the resolved background-color on every animation frame and
 * prints the sequence, so "flash" is a measured frame count, not an impression.
 * A static export cannot set a per-user attribute at request time, so the
 * "server" page stands for a build-time default.
 *
 * Run:  node make-first-paint.mjs
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))

const STORED = { pack: 'peach', mode: 'dark' }
const BASE_LIGHT = 'rgb(255, 255, 255)' // base :root --background #ffffff
const PEACH_DARK = 'rgb(27, 23, 21)' // peach dark --background #1b1715

// Sampler runs in <head> before anything can paint. It records the resolved
// background on the first N animation frames, then renders the sequence.
const sampler = `
window.__frames = [];
(function sample() {
  const bg = getComputedStyle(document.documentElement).backgroundColor;
  window.__frames.push(bg);
  if (window.__frames.length < 24) requestAnimationFrame(sample);
  else render();
})();
function render() {
  const f = window.__frames;
  const first = f[0];
  const settled = f[f.length - 1];
  const lightFrames = f.filter((x) => x === ${JSON.stringify(BASE_LIGHT)}).length;
  const out = [
    'first frame: ' + first,
    'last frame:  ' + settled,
    'frames observed: ' + f.length,
    'light frames before settle: ' + lightFrames,
    lightFrames === 0 ? 'RESULT: no flash' : 'RESULT: flash, ' + lightFrames + ' frame(s) at the wrong value',
  ].join('\\n');
  window.__firstPaint = { frames: f, first, settled, lightFrames };
  const el = document.getElementById('result');
  if (el) el.textContent = out;
}
`

const page = ({ title, body, htmlAttrs = '', headExtra = '' }) => `<!doctype html>
<html lang="en"${htmlAttrs}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="candidates/attribute-agnostic.css" />
    <style>
      html { background: var(--background); color: var(--foreground); font: 14px/1.5 system-ui, sans-serif; }
      body { margin: 0; padding: 24px; }
      .box { border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); color: var(--card-foreground); padding: 16px; max-width: 640px; }
      pre { white-space: pre-wrap; }
    </style>
    <script>${sampler}</script>
    ${headExtra}
  </head>
  <body>
    <div class="box">
      <h1>${title}</h1>
      <p>Stored preference: pack=<strong>${STORED.pack}</strong>, mode=<strong>${STORED.mode}</strong>. Base fallback is light (<code>${BASE_LIGHT}</code>); the preferred paint is peach dark (<code>${PEACH_DARK}</code>).</p>
      <pre id="result">sampling…</pre>
    </div>
    ${body}
  </body>
</html>
`

const blocking = `<script>
(function () {
  var stored = { pack: 'peach', mode: 'dark' };
  var root = document.documentElement;
  if (stored.pack !== 'default') root.setAttribute('data-pack', stored.pack);
  if (stored.mode === 'dark') root.classList.add('dark');
})();
</script>`

const deferred = `<script>
window.addEventListener('DOMContentLoaded', function () {
  // Stands for a React effect / post-hydration correction: too late for the
  // first paint, so at least one frame renders the fallback.
  var stored = { pack: 'peach', mode: 'dark' };
  var root = document.documentElement;
  if (stored.pack !== 'default') root.setAttribute('data-pack', stored.pack);
  if (stored.mode === 'dark') root.classList.add('dark');
});
</script>`

await writeFile(
  path.join(HERE, 'first-paint-blocking.html'),
  page({ title: 'First paint — blocking head script', headExtra: blocking }),
  'utf8',
)
await writeFile(
  path.join(HERE, 'first-paint-deferred.html'),
  page({ title: 'First paint — deferred (post-hydration) correction', headExtra: deferred }),
  'utf8',
)
await writeFile(
  path.join(HERE, 'first-paint-server.html'),
  page({
    title: 'First paint — attribute baked at build time (static export stand-in for "server")',
    htmlAttrs: ` data-pack="peach" class="dark"`,
  }),
  'utf8',
)

console.log('wrote first-paint-{blocking,deferred,server}.html')
console.log('expected base-light frame:', BASE_LIGHT, '| expected preferred frame:', PEACH_DARK)
