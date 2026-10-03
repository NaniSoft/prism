import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * The one-stylesheet contract. A consumer imports `@nanisoft/prism-ui/styles.css`
 * once and installs no Tailwind, so the source must pull the framework, the
 * token CSS and the theme bindings, and expose the built file through the
 * package `exports` map.
 */
const PKG = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.join(PKG, '..', '..')
const styles = readFileSync(path.join(PKG, 'src', 'styles.css'), 'utf8')
const manifest = JSON.parse(readFileSync(path.join(PKG, 'package.json'), 'utf8'))
/**
 * The site's own declaration of React, read rather than restated.
 *
 * Three manifests in this repository name one React version and they are one
 * fact: this package's peer range, the range it builds and tests against, and the
 * range the site resolves. Reading the third is what makes the assertion fail when
 * the three drift rather than when a copy of the number goes stale.
 */
const site = JSON.parse(readFileSync(path.join(REPO, 'apps', 'site', 'package.json'), 'utf8'))

describe('the single stylesheet', () => {
  it('imports the framework, the token CSS and the theme bindings', () => {
    expect(styles).toContain("@import 'tailwindcss'")
    expect(styles).toContain("@import '@nanisoft/prism-tokens/dist/light.css'")
    expect(styles).toContain("@import '@nanisoft/prism-tokens/dist/dark.css'")
    expect(styles).toContain("@import '@nanisoft/prism-tokens/dist/theme.css'")
  })

  it('points the base layer at semantic tokens rather than raw values', () => {
    expect(styles).toContain('background-color: var(--background)')
    expect(styles).toContain('color: var(--foreground)')
    expect(styles).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('exposes the built stylesheet through the package exports map', () => {
    expect(manifest.exports['./styles.css']).toBe('./dist/styles.css')
    expect(manifest.files).toContain('dist')
  })
})

/**
 * The React peer range, which is the whole of what a consumer resolves.
 *
 * Every module under `src` imports `react` and none imports `react-dom`, so
 * `react` was already a peer in fact and undeclared in the manifest. What the
 * missing block cost was not a resolution failure but silence: nothing stated
 * which React the package is written for, and a consumer who installed React 18
 * got no warning, because a package that never declares a peer cannot be
 * incompatible with one.
 *
 * `react-dom` is a peer for a reason the source does not show: no module here
 * imports it, and `@base-ui/react` does, for the floating elements the Dialog, the
 * Popover, the Menu and the Tooltip render through. Two places already treat it
 * as the consumer's copy rather than this package's, `check-client-budget.mjs`'s
 * shared runtime and `sync-registry.mjs`'s implicit set, so this is the manifest
 * catching up with two decisions rather than a third one being made.
 */
describe('the React peer range', () => {
  it('names react and react-dom as peers', () => {
    expect(Object.keys(manifest.peerDependencies ?? {}).sort()).toEqual(['react', 'react-dom'])
  })

  it('is the range the package builds and tests against', () => {
    expect(manifest.peerDependencies.react).toBe(manifest.devDependencies.react)
    expect(manifest.peerDependencies['react-dom']).toBe(manifest.devDependencies['react-dom'])
    expect(manifest.devDependencies.react).toBeDefined()
    expect(manifest.devDependencies['react-dom']).toBeDefined()
  })

  it('is the range the reference site resolves', () => {
    expect(manifest.peerDependencies.react).toBe(site.dependencies.react)
    expect(manifest.peerDependencies['react-dom']).toBe(site.dependencies['react-dom'])
  })

  it('is React 19, which is the line this repository writes and tests against', () => {
    expect(manifest.peerDependencies.react).toBe('^19.2.0')
    expect(manifest.peerDependencies['react-dom']).toBe('^19.2.0')
  })

  it('does not also declare them as runtime dependencies', () => {
    // A package that both depends on and peers on one range resolves to its own
    // copy, which is the two-Reacts defect the peer range exists to prevent.
    expect(manifest.dependencies.react).toBeUndefined()
    expect(manifest.dependencies['react-dom']).toBeUndefined()
  })
})

/**
 * The face, in the source.
 *
 * `check-typeface.mjs` holds the emitted artefact against what ships beside it,
 * which is the pair that decides whether a consumer renders Inter at all. These
 * are the two facts the artefact cannot recover on its own: which families the
 * sheet declares an `@font-face` for, and whether the metric-adjusted fallback
 * exists at all. A fallback is four hand-written numbers, so the gate above cannot
 * tell one that was deleted from one that was never written, and the numbers are
 * the only mechanism standing between a reader and a page that jumps when the web
 * font lands.
 */
describe('the face', () => {
  const families = [...styles.matchAll(/@font-face\s*\{([^{}]*)\}/g)].map((match) => ({
    family: /font-family:\s*['"]?([^;'"}]+)/.exec(match[1])?.[1]?.trim(),
    style: /font-style:\s*([\w-]+)/.exec(match[1])?.[1]?.trim() ?? 'normal',
    weight: /font-weight:\s*(\d+)/.exec(match[1])?.[1]?.trim(),
    body: match[1],
  }))

  it('ships a face for every weight the scale renders, and no bold', () => {
    const upright = families
      .filter((face) => face.family === 'Inter' && face.style === 'normal')
      .map((face) => face.weight)
      .sort()
    expect(upright).toEqual(['400', '500', '600'])
    expect(styles).not.toContain('inter-latin-700')
  })

  it('ships one italic, because Prose renders one', () => {
    const italic = families.filter((face) => face.family === 'Inter' && face.style === 'italic')
    expect(italic.map((face) => face.weight)).toEqual(['400'])
  })

  it('ships the metric-adjusted fallback, with all four descriptors on it', () => {
    const fallback = families.find((face) => /local\(/.test(face.body))
    expect(fallback?.family).toBe('Inter Fallback')
    expect(fallback?.body).toContain("local('Arial')")
    for (const descriptor of [
      'size-adjust',
      'ascent-override',
      'descent-override',
      'line-gap-override',
    ]) {
      expect([descriptor, new RegExp(`${descriptor}:`).test(fallback!.body)]).toEqual([
        descriptor,
        true,
      ])
    }
  })

  it('reads every source relative to the emitted stylesheet', () => {
    for (const face of families) {
      const src = /url\(['"]?([^'")]+)/.exec(face.body)?.[1]
      if (src === undefined) continue
      expect([face.family, src.startsWith('/')]).toEqual([face.family, false])
    }
  })
})
