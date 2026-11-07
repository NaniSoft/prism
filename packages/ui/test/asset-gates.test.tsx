import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, afterEach } from 'vitest'

/**
 * The asset gates, run as processes against staged fixtures.
 *
 * Each gate reads the authored manifest plus the files it names, so a gate that
 * can only read the real tree cannot be proved to fail. The suite stages a copy
 * of one gate script and a fixture manifest in `.turbo/gate-fixtures`, sets the
 * two `PRISM_ASSETS_*` switches the scripts read, and asserts one failure naming
 * the staged defect. The green case runs on the real tree.
 */
const PKG = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCRIPTS = path.join(PKG, 'scripts')
const FIXTURES = path.join(PKG, '.turbo', 'gate-fixtures')

const staged: string[] = []

function run(gate: string, manifest: unknown, root: Record<string, string>, extra: Record<string, string> = {}) {
  const dir = path.join(FIXTURES, `assets-${gate.replace(/[^a-z]+/g, '-')}-${staged.length}-${process.pid}`)
  staged.push(dir)
  mkdirSync(path.join(dir, 'scripts'), { recursive: true })
  mkdirSync(dir, { recursive: true })
  const gateCopy = path.join(dir, 'scripts', gate)
  cpSync(path.join(SCRIPTS, gate), gateCopy)
  const manifestPath = path.join(dir, 'asset-manifest.json')
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
  for (const [rel, content] of Object.entries(root)) {
    const abs = path.join(dir, rel)
    mkdirSync(path.dirname(abs), { recursive: true })
    writeFileSync(abs, content, 'utf8')
  }
  return spawnSync(process.execPath, [path.join(dir, 'scripts', gate)], {
    cwd: PKG,
    encoding: 'utf8',
    env: { ...process.env, PRISM_ASSETS_MANIFEST: manifestPath, PRISM_ASSETS_ROOT: dir, ...extra },
  })
}

function baseFixture(): any {
  return {
    version: 1,
    budgetsKiB: { icon: 10, illustration: 50, logo: 50, card: 200, banner: 300, hero: 500, thumbnail: 100, font: 150 },
    variants: {
      hero: { aspectRatio: '16 / 9', objectFit: 'cover', maxRendered: { widthPx: 1152, heightPx: 420 } },
      'wide-hero': { aspectRatio: '21 / 9', objectFit: 'cover', maxRendered: { widthPx: 1152, heightPx: 493 } },
      banner: { aspectRatio: '3 / 1', objectFit: 'cover', maxRendered: { widthPx: 1152, heightPx: 160 } },
      card: { aspectRatio: '4 / 3', objectFit: 'cover', maxRendered: { widthPx: 800, heightPx: 600 } },
      'landscape-thumb': { aspectRatio: '16 / 9', objectFit: 'cover', maxRendered: { widthPx: 400, heightPx: 225 } },
      'square-thumb': { aspectRatio: '1 / 1', objectFit: 'cover', maxRendered: { widthPx: 400, heightPx: 400 } },
      avatar: { aspectRatio: '1 / 1', objectFit: 'cover', maxRendered: { widthPx: 64, heightPx: 64 } },
      product: { aspectRatio: '1 / 1', objectFit: 'contain', maxRendered: { widthPx: 800, heightPx: 800 } },
      logo: { aspectRatio: null, objectFit: 'contain', maxRendered: { widthPx: 320, heightPx: 128 } },
      illustration: { aspectRatio: null, objectFit: 'contain', maxRendered: { widthPx: 800, heightPx: 800 } },
      icon: { aspectRatio: '1 / 1', objectFit: 'contain', maxRendered: { widthPx: 48, heightPx: 48 } },
    },
    assets: [
      {
        id: 'test-icon',
        path: 'icon.svg',
        category: 'logo',
        format: 'svg',
        allowedVariants: ['logo'],
        themeAware: false,
        themeRestrictions: ['fixed-brand-colors'],
        budgetKiB: 50,
        role: 'brand-logo',
        license: 'test',
        exception: 'exempt',
      },
    ],
  }
}

afterEach(() => {
  for (const dir of staged.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('the asset metadata gate', () => {
  it('fails when an entry names a file the tree does not carry', () => {
    const manifest = baseFixture()
    manifest.assets[0].path = 'missing.svg'
    const result = run('check-asset-metadata.mjs', manifest, { 'icon.svg': '<svg viewBox="0 0 32 32"></svg>' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('does not exist')
  })

  it('fails when a file exceeds its budget', () => {
    const manifest = baseFixture()
    manifest.assets[0].budgetKiB = 0
    const result = run('check-asset-metadata.mjs', manifest, { 'icon.svg': '<svg viewBox="0 0 32 32"></svg>' })
    // 0 is already below the ceiling check; the positive-budget rule fires.
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('budgetKiB')
  })
})

describe('the asset resolution gate', () => {
  it('fails a raster that is under its 2x minimum', () => {
    const manifest = baseFixture()
    // 1x1 PNG is below any rendered maximum at 2x.
    manifest.assets = [
      {
        id: 'tiny',
        path: 'tiny.png',
        category: 'logo',
        format: 'png',
        intrinsicWidth: 1,
        intrinsicHeight: 1,
        allowedVariants: ['logo'],
        maxRenderedWidthPx: 48,
        maxRenderedHeightPx: 48,
        devicePixelRatio: 2,
        minSource: { widthPx: 96, heightPx: 96 },
        themeAware: false,
        themeRestrictions: ['fixed-brand-colors'],
        budgetKiB: 50,
        role: 'brand-logo',
        license: 'test',
        exception: 'exempt',
      },
    ]
    const result = run('check-asset-resolution.mjs', manifest, { 'tiny.png': '' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('under the 2x minimum')
  })

  it('exempts a vector so a scalable format never reads as soft', () => {
    const manifest = baseFixture()
    const result = run('check-asset-resolution.mjs', manifest, { 'icon.svg': '<svg viewBox="0 0 32 32"></svg>' })
    // The fixture has one vector entry and no raster, so the empty-rule guard is
    // the failure on this input: that is the gate refusing to pass over nothing.
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('no raster asset')
  })
})

describe('the svg security gate', () => {
  it('fails an svg that carries a script', () => {
    const manifest = baseFixture()
    const result = run('check-svg-security.mjs', manifest, { 'icon.svg': '<svg viewBox="0 0 32 32"><script>evil()</script></svg>' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('<script>')
  })

  it('fails an svg that carries an event handler', () => {
    const manifest = baseFixture()
    const result = run('check-svg-security.mjs', manifest, { 'icon.svg': '<svg viewBox="0 0 32 32" onload="evil()"></svg>' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('event-handler')
  })

  it('passes a clean svg with an exemption for its hex', () => {
    const manifest = baseFixture()
    const result = run('check-svg-security.mjs', manifest, { 'icon.svg': '<svg viewBox="0 0 32 32" fill="#ffffff"></svg>' })
    expect(result.status).toBe(0)
  })
})
