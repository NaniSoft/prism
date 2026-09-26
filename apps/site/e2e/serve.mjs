/**
 * A tiny static file server for the built site (`out/`).
 *
 * The visual-regression job serves the export rather than starting Next, so the
 * screenshots are of exactly what deploys. Next emits `out/components.html` for
 * `/components` and `out/components/button.html` for `/components/button`, so a
 * request without an extension is resolved to the matching `.html`.
 *
 * Run: node e2e/serve.mjs   (PORT overrides the default 4321)
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'out')
const PORT = Number(process.env.PORT ?? 4321)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

async function resolveFile(urlPath) {
  const candidates = [urlPath, `${urlPath}.html`, path.join(urlPath, 'index.html')]
  for (const candidate of candidates) {
    const file = path.join(ROOT, candidate)
    if (!file.startsWith(ROOT)) continue
    try {
      if ((await stat(file)).isFile()) return file
    } catch {
      // try the next shape
    }
  }
  return null
}

createServer(async (request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
  const file = await resolveFile(urlPath)
  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain' })
    response.end('not found')
    return
  }
  const body = await readFile(file)
  response.writeHead(200, {
    'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
  })
  response.end(body)
}).listen(PORT, '127.0.0.1', () => {
  console.log(`visual server: http://127.0.0.1:${PORT} -> ${ROOT}`)
})
