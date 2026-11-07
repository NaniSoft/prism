import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { describe, expect, it, afterEach } from 'vitest'

/**
 * The Phase 6 gates, proved against staged defects.
 *
 * Each script reads the tree through an env redirect (`PRISM_TOKENS_ROOT`,
 * `PRISM_CSS_DIST`), so the real tree is never mutated. A gate that cannot be
 * made to fail proves nothing: these cases write one defect, run one child
 * process, and assert the failure names it.
 */
const PKG = path.join(import.meta.dirname, '..')
const SCRIPTS = path.join(PKG, 'scripts')
const FIXTURES = path.join(PKG, '.turbo', 'gate-fixtures')

const staged: string[] = []

function stage(gate: string) {
  const dir = path.join(FIXTURES, `gates-${gate.replace(/[^a-z]+/g, '-')}-${staged.length}-${process.pid}`)
  staged.push(dir)
  mkdirSync(path.join(dir, 'scripts'), { recursive: true })
  cpSync(path.join(SCRIPTS, gate), path.join(dir, 'scripts', gate))
  return dir
}

afterEach(() => {
  for (const dir of staged.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('the token-compliance gate', () => {
  it('fails a file that paints a literal', () => {
    const dir = stage('check-token-compliance.mjs')
    const src = path.join(dir, 'src')
    mkdirSync(path.join(src, 'components', 'ui'), { recursive: true })
    writeFileSync(path.join(src, 'components', 'ui', 'fixture.tsx'), 'export const paint = () => (\n  <div className="bg-[#ff0000]">\n', 'utf8')
    const result = spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-token-compliance.mjs')], {
      cwd: PKG,
      encoding: 'utf8',
      env: { ...process.env, PRISM_TOKENS_ROOT: src },
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('[arbitrary-colour]')
  })

  it('passes over the real tree silently of paint', () => {
    const result = spawnSync(process.execPath, [path.join(SCRIPTS, 'check-token-compliance.mjs')], {
      cwd: PKG,
      encoding: 'utf8',
    })
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('source file(s) read')
  })
})

describe('the stylesheet-budget gate', () => {
  it('fails a sheet over its ceiling', () => {
    const dir = stage('check-stylesheet-budget.mjs')
    const park = path.join(dir, 'styles.css')
    writeFileSync(park, '/*' + 'x'.repeat(170 * 1024) + '*/', 'utf8')
    const result = spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-stylesheet-budget.mjs')], {
      cwd: PKG,
      encoding: 'utf8',
      env: { ...process.env, PRISM_CSS_DIST: park },
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('over the')
  })

  it('passes the emitted sheet', () => {
    const result = spawnSync(process.execPath, [path.join(SCRIPTS, 'check-stylesheet-budget.mjs')], {
      cwd: PKG,
      encoding: 'utf8',
    })
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('fits its ceiling')
  })
})

describe('the asset-integrity gate', () => {
  it('fails a font on disk the manifest does not name', () => {
    const dir = stage('check-asset-integrity.mjs')
    mkdirSync(path.join(dir, 'public', 'fonts'), { recursive: true })
    mkdirSync(path.join(dir, 'src'), { recursive: true })
    writeFileSync(path.join(dir, 'public', 'fonts', 'inter-latin-999.woff2'), 'fake-woff2', 'utf8')
    writeFileSync(path.join(dir, 'src', 'styles.css'), "@font-face { src: url('./fonts/inter-latin-400.woff2'); }\n", 'utf8')
    const manifest = {
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
        { id: 'font-inter-400', path: 'public/fonts/inter-latin-400.woff2', category: 'font', format: 'woff2', allowedVariants: ['icon'], themeAware: false, budgetKiB: 150, role: 'font' },
      ],
    }
    const manifestPath = path.join(dir, 'asset-manifest.json')
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
    writeFileSync(path.join(dir, 'public', 'fonts', 'inter-latin-400.woff2'), 'fake-woff2', 'utf8')
    const result = spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-asset-integrity.mjs')], {
      cwd: PKG,
      encoding: 'utf8',
      env: { ...process.env, PRISM_ASSETS_MANIFEST: manifestPath, PRISM_ASSETS_ROOT: dir },
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('inter-latin-999.woff2')
  })
})
