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
const styles = readFileSync(path.join(PKG, 'src', 'styles.css'), 'utf8')
const manifest = JSON.parse(readFileSync(path.join(PKG, 'package.json'), 'utf8'))

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
