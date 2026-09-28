import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * The boot-budget gate, run as a process against a staged `dist`.
 *
 * A ceiling derived from the thing it measures cannot fail, so this suite exists
 * to prove the derivation has teeth. Two defects are staged, one for each term
 * of the arithmetic: an emission whose non-migration part has grown past its
 * pinned base, and an emission whose clause fragment is no longer in it, which
 * would make the subtraction quietly wrong rather than wrong loudly.
 *
 * The staged tree lives under `.turbo/` because the gate imports `esbuild`, and
 * a copy in the OS temp directory cannot resolve a bare specifier.
 */
const PKG = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(PKG, 'scripts', 'check-boot-budget.mjs')
const SCRIPT_MODULE = path.join(PKG, 'dist', 'provider', 'theme-script.js')
const FIXTURES = path.join(PKG, '.turbo', 'gate-fixtures')

type Stage = {
  /** Bytes of comment to put in front of the real emission. */
  pad?: number
  /** A different `THEME_MIGRATION_READ` for the string to carry. */
  read?: string
  /** Copy the real read fragment into the emission a second time. */
  twice?: boolean
  /** Remove the real retire fragment from the emission. */
  dropRetire?: boolean
}

/**
 * A stage that wraps the real emitted module: the retire fragment is re-exported
 * unchanged and the emission is the real one, so the gate's arithmetic is
 * exercised against real numbers and only the stated defect differs.
 *
 * The import specifier is resolved relative to the staged file, because the
 * staged file is the one esbuild reads and a specifier relative to anything else
 * makes the module import itself.
 */
function stage(dir: string, { pad = 0, read, twice = false, dropRetire = false }: Stage) {
  const from = path.join(dir, 'dist', 'provider')
  const specifier = path.relative(from, SCRIPT_MODULE).split(path.sep).join('/')
  // No wrapper at all when nothing is padded, so the green case measures the
  // real emission byte for byte rather than a fixture's idea of it.
  const padding = pad > 0 ? `'/*' + 'x'.repeat(${pad}) + '*/' +` : `'' +`
  return `import {
  PrismThemeScript as real,
  THEME_MIGRATION_READ as REAL_READ,
  THEME_MIGRATION_RETIRE as REAL_RETIRE,
} from '${specifier}'

export const THEME_MIGRATION_RETIRE = REAL_RETIRE
export const THEME_MIGRATION_READ = ${read ?? 'REAL_READ'}

export function PrismThemeScript(props) {
  const inner = real(props).props.dangerouslySetInnerHTML.__html
  let out = ${padding} inner
  if (${twice}) out += REAL_READ
  if (${dropRetire}) out = out.replace(REAL_RETIRE, '')
  return { props: { dangerouslySetInnerHTML: { __html: out } } }
}
`
}

const staged: string[] = []

function run(options: Stage = {}) {
  const dir = path.join(FIXTURES, `boot-budget-${staged.length}-${process.pid}`)
  staged.push(dir)

  mkdirSync(path.join(dir, 'scripts'), { recursive: true })
  mkdirSync(path.join(dir, 'dist', 'provider'), { recursive: true })
  copyFileSync(GATE, path.join(dir, 'scripts', 'check-boot-budget.mjs'))
  writeFileSync(path.join(dir, 'dist', 'provider', 'theme-script.js'), stage(dir, options), 'utf8')

  return spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-boot-budget.mjs')], {
    cwd: PKG,
    encoding: 'utf8',
  })
}

afterEach(() => {
  for (const dir of staged.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('the boot-budget gate', () => {
  it('passes the real emission and prints the arithmetic rather than a bare number', () => {
    const result = run()

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/measured emission:\s+\d+ B/)
    expect(result.stdout).toMatch(/migration clause:\s+\d+ B/)
    expect(result.stdout).toMatch(/non-migration part:\s+\d+ B/)
    expect(result.stdout).toMatch(/pinned base:\s+820 B/)
    expect(result.stdout).toMatch(/non-migration drift:\s+\+?0 B against the pinned base/)
    expect(result.stdout).toMatch(/ceiling:\s+\d+ B\s+\(pinned base \+ 2 x clause\)/)
  })

  it('fails an emission whose non-migration part outgrew the pinned base, naming both', () => {
    // 400 bytes of comment is more than one 229 B migration generation, and the
    // only allowance this string has.
    const result = run({ pad: 400 })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('over the')
    expect(result.stderr).toContain('ceiling by')
    expect(result.stderr).toContain('against a 820 B base')
  })

  it('absorbs a growth of less than one migration generation, whatever it is spent on', () => {
    // 100 B is well inside the 229 B allowance and fits. The allowance is a
    // number of bytes, not a reservation: the string may grow by one generation's
    // worth and the gate cannot tell whether the growth was a migration. Pinning
    // that is the point, and a reader should not have to infer it.
    const result = run({ pad: 100 })

    expect(result.status).toBe(0)
    // 104 rather than 100: the padding is a comment, and its four delimiters
    // are bytes too, which is the point of pricing a real string.
    expect(result.stdout).toMatch(/non-migration drift:\s+\+104 B against the pinned base/)
  })

  it('fails when the retire fragment left the string, so the subtraction would be quietly wrong', () => {
    const result = run({ dropRetire: true })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('THEME_MIGRATION_RETIRE appears 0 time(s) in the emitted script, not once')
  })

  it('fails when the read fragment is not the one the string carries, rather than charging the wrong price', () => {
    const result = run({ read: "'try{/* the clause left the source */}catch(e){}'" })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('THEME_MIGRATION_READ appears 0 time(s)')
  })

  it('fails when a fragment is copied into the string twice, so the clause is not subtracted twice either', () => {
    const result = run({ twice: true })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('THEME_MIGRATION_READ appears 2 time(s)')
  })

  it('fails a package whose dist was never built, rather than measuring nothing and passing', () => {
    const dir = path.join(FIXTURES, `boot-budget-empty-${process.pid}`)
    staged.push(dir)
    mkdirSync(path.join(dir, 'scripts'), { recursive: true })
    copyFileSync(GATE, path.join(dir, 'scripts', 'check-boot-budget.mjs'))

    const result = spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-boot-budget.mjs')], {
      cwd: PKG,
      encoding: 'utf8',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('dist/provider/theme-script.js is missing')
  })
})
