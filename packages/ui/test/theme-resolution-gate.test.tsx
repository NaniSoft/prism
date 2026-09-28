import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * The theme-resolution gate, run as a process against a staged `dist`.
 *
 * The gate's claim is that the emitted string and `resolveTheme` cannot disagree
 * about a stored value. A claim like that is worth nothing unless the gate can
 * be made to fail, so this suite stages the defect the gate exists for: the
 * per-field validation the old string really had, where a stored
 * `{ mode: 'dark' }` with no pack half-applied in the string and fell through
 * whole in the rule. Everything else in the staged tree is the real emitted
 * file, so a failure can only come from the string and not from the fixture.
 *
 * The staged tree lives under `.turbo/` rather than the OS temp directory
 * because the gate imports `esbuild`, and a copy in a temp directory cannot
 * resolve a bare specifier. The gate resolves its own package root from
 * `import.meta.url`, so a staged copy reads the staged `dist`.
 */
const PKG = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(PKG, 'scripts', 'check-theme-resolution.mjs')
const THEMING = path.join(PKG, 'dist', 'theming', 'index.js')
const FIXTURES = path.join(PKG, '.turbo', 'gate-fixtures')

/**
 * The old string, verbatim in its shape: it validates the pack and the mode
 * independently, so each axis is honoured on its own. This is the divergence the
 * ticket names, reproduced as a build input rather than described in a comment.
 */
const PER_FIELD_SCRIPT_MODULE = `const PACKS = ['default', 'blush', 'mint', 'lavender', 'sky', 'peach']
const MODES = ['light', 'dark']

export function PrismThemeScript({ storageKey = 'prism-theme', defaultPack = 'default', defaultMode = 'light' } = {}) {
  const script =
    '(function(){try{' +
    'var root=document.documentElement;' +
    \`var packs=\${JSON.stringify(PACKS)};\` +
    \`var modes=\${JSON.stringify(MODES)};\` +
    'var stored=null;' +
    \`try{stored=JSON.parse(localStorage.getItem(\${JSON.stringify(storageKey)})||"null");}catch(ignored){}\` +
    'var pack=stored&&packs.indexOf(stored.pack)>-1?stored.pack:(root.getAttribute("data-pack")||' +
    \`\${JSON.stringify(defaultPack)});\` +
    'var mode=stored&&modes.indexOf(stored.mode)>-1?stored.mode:(root.classList.contains("dark")?"dark":' +
    \`\${JSON.stringify(defaultMode)});\` +
    \`if(packs.indexOf(pack)<0){pack=\${JSON.stringify(defaultPack)};}\` +
    'if(pack&&pack!=="default"){root.setAttribute("data-pack",pack);}else{root.removeAttribute("data-pack");}' +
    'root.classList.toggle("dark",mode==="dark");' +
    '}catch(ignored){}})();'

  return { props: { dangerouslySetInnerHTML: { __html: script } } }
}
`

const staged: string[] = []

/** Stage a package holding the real rule and the given `theme-script.js`. */
function run(scriptModule: string, gate = GATE) {
  const dir = path.join(FIXTURES, `theme-resolution-${staged.length}-${process.pid}`)
  staged.push(dir)

  mkdirSync(path.join(dir, 'scripts'), { recursive: true })
  mkdirSync(path.join(dir, 'dist', 'theming'), { recursive: true })
  mkdirSync(path.join(dir, 'dist', 'provider'), { recursive: true })
  copyFileSync(gate, path.join(dir, 'scripts', path.basename(gate)))
  copyFileSync(THEMING, path.join(dir, 'dist', 'theming', 'index.js'))
  writeFileSync(path.join(dir, 'dist', 'provider', 'theme-script.js'), scriptModule, 'utf8')

  return spawnSync(process.execPath, [path.join(dir, 'scripts', path.basename(gate))], {
    cwd: PKG,
    encoding: 'utf8',
  })
}

const real = readFileSync(path.join(PKG, 'dist', 'provider', 'theme-script.js'), 'utf8')

afterEach(() => {
  for (const dir of staged.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('the theme-resolution gate', () => {
  it('passes the real emitted script, and says how much it read', () => {
    const result = run(real)

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/one table, two readers, \d+ row\(s\) over \d+ emission\(s\)/)
    expect(result.stdout).toContain('origins reached: default, document, legacy, stored, unparsed')
    expect(result.stdout).toContain('every fall-through is whole')
  })

  it('fails a string that validates each axis on its own, naming the half-applied row', () => {
    const result = run(PER_FIELD_SCRIPT_MODULE)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('theme-resolution:')
    expect(result.stderr).toContain(
      'a mode with no pack: the script applied mode "dark", the rule resolved "light"',
    )
    expect(result.stderr).toContain('half-applied')
  })

  it('fails a string that leaves the origin attribute unset, so an absent origin reads as an unread one', () => {
    // A resolution correct in every other respect, with the origin write removed.
    const withoutOrigin = real.replace('r.setAttribute(O,G);', '')
    expect(withoutOrigin).not.toBe(real)

    const result = run(withoutOrigin)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('left data-theme-origin unset')
  })

  it('fails a string that writes a value outside the closed set', () => {
    const invented = real.replace('G="unparsed";', 'G="fallback";')
    expect(invented).not.toBe(real)

    const result = run(invented)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('which is outside the closed set')
  })

  it('fails a string that writes on a first resolution, so a visitor who never chose ends the load with a store', () => {
    const alwaysWrites = real.replace(
      'if(G==="legacy"){',
      'if(G!=="nonexistent"){',
    )
    expect(alwaysWrites).not.toBe(real)

    const result = run(alwaysWrites)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('no decision was made, yet the script wrote to storage')
  })

  it('fails a string that stops retiring the key it recovered from, so the clause never expires', () => {
    const keepsTheKey = real.replace('localStorage.removeItem(LK);', '')
    expect(keepsTheKey).not.toBe(real)

    const result = run(keepsTheKey)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('left prism-theme-mode in place, so the clause never expires')
  })

  it('fails a string that reads a retired key the shared rule no longer lists', () => {
    // The fragment is built from the shared list, so the drift is introduced by
    // the string taking its own list. The rule still lists the old key, and the
    // two have stopped agreeing about what the clause reads.
    const drifted = real.replace(
      'LEGACY_MODE_STORAGE_KEYS.map((key) =>',
      "['prism-theme-mode-v2'].map((key) =>",
    )
    expect(drifted).not.toBe(real)

    const result = run(drifted)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('is in LEGACY_MODE_STORAGE_KEYS but the emission for')
    expect(result.stderr).toContain('never reads it')
  })

  it('fails a package whose dist was never built, rather than reading nothing and passing', () => {
    const dir = path.join(FIXTURES, `theme-resolution-empty-${process.pid}`)
    staged.push(dir)
    mkdirSync(path.join(dir, 'scripts'), { recursive: true })
    copyFileSync(GATE, path.join(dir, 'scripts', 'check-theme-resolution.mjs'))

    const result = spawnSync(
      process.execPath,
      [path.join(dir, 'scripts', 'check-theme-resolution.mjs')],
      { cwd: PKG, encoding: 'utf8' },
    )

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('dist is missing')
    expect(result.stderr).toContain('before this gate')
  })
})
