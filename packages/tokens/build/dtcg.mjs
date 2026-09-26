/**
 * One-way DTCG projection (`dist/dtcg/`).
 *
 * A projection of the same source, JSON-only and never imported by the site.
 * `semantic.{light,dark}.tokens.json` preserves aliases as DTCG references so the
 * reference graph survives; the per-pack files are the resolved sets. Both the
 * token build and the Figma sync read this shape, so it must stay deterministic.
 */
import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

async function readJson(file) {
  return JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''))
}

const writeJson = async (file, value) => {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

/** Semantic sets keep their authored DTCG references and gain `$type: color`. */
async function semanticProjection(srcDir, mode) {
  const source = await readJson(path.join(srcDir, 'semantic', `${mode}.tokens.json`))
  const radius = await readJson(path.join(srcDir, 'semantic', 'radius.tokens.json'))

  const out = {}
  if (source.$description) out.$description = source.$description
  for (const [key, token] of Object.entries(source)) {
    if (key.startsWith('$')) continue
    out[key] = {
      $type: 'color',
      $value: token.$value,
      ...(token.$description ? { $description: token.$description } : {}),
    }
  }
  out.radius = radius.radius
  return out
}

/** Per-pack resolved sets: concrete values, `$type: color` plus radius. */
async function themeProjection(distDir, id, mode) {
  const resolved = await readJson(path.join(distDir, 'themes', id, `tokens.${mode}.json`))
  const out = {}
  for (const [key, token] of Object.entries(resolved)) {
    out[key] = {
      $type: key === 'radius' ? 'dimension' : 'color',
      $value: token.value,
      ...(token.description ? { $description: token.description } : {}),
    }
  }
  return out
}

export async function writeDtcg({ distDir, srcDir, foundationTree, manifest }) {
  const root = path.join(distDir, 'dtcg')

  await writeJson(path.join(root, 'foundation.tokens.json'), foundationTree)
  await writeJson(
    path.join(root, 'semantic.light.tokens.json'),
    await semanticProjection(srcDir, 'light'),
  )
  await writeJson(
    path.join(root, 'semantic.dark.tokens.json'),
    await semanticProjection(srcDir, 'dark'),
  )

  const manifestEntries = [
    { id: 'default', name: 'Default', mode: 'light', file: 'semantic.light.tokens.json' },
    { id: 'default', name: 'Default', mode: 'dark', file: 'semantic.dark.tokens.json' },
  ]

  const emitted = [
    'dtcg/foundation.tokens.json',
    'dtcg/semantic.light.tokens.json',
    'dtcg/semantic.dark.tokens.json',
  ]

  for (const entry of manifest) {
    for (const mode of ['light', 'dark']) {
      const file = `themes/${entry.id}/${mode}.tokens.json`
      await writeJson(path.join(root, file), await themeProjection(distDir, entry.id, mode))
      emitted.push(`dtcg/${file}`)
      manifestEntries.push({ id: entry.id, name: entry.name, mode, file })
    }
  }

  await writeJson(path.join(root, 'manifest.json'), manifestEntries)
  emitted.push('dtcg/manifest.json')
  return emitted
}
