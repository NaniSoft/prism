/**
 * The demo contract.
 *
 * Each example is one self-contained `.tsx`: a default export that imports only
 * from `@nanisoft/prism-ui/*`, `react` or `lucide-react`, and never from a
 * relative path. `lucide-react` is allowed because the public Block API surfaces
 * its `LucideIcon` type (a demo that composes a Block must pass an icon), so the
 * example a consumer copies has to name the same import.
 *
 * This module is the contract's single enforcement point: the generator reuses
 * the import scan for its composition and cross-references, and the check
 * reuses the validator.
 */

export interface DemoViolation {
  readonly file: string
  readonly reason: string
}

/** Module specifiers a demo may import. Everything else fails the contract. */
const ALLOWED_IMPORTS = [/^@nanisoft\/prism-ui(\/[\w.-]+)*$/, /^react$/, /^lucide-react$/]

/**
 * Validate one demo's source. Returns the violations (empty means compliant):
 * a relative or non-allowlisted import, or a missing default export.
 */
export function validateDemoSource(source: string): DemoViolation[] {
  const violations: DemoViolation[] = []
  const importPattern = /(?:^|\n)\s*import\s+(?:[\w*{},\s]+?\s+from\s+)?["']([^"']+)["']/g
  let match: RegExpExecArray | null
  while ((match = importPattern.exec(source)) !== null) {
    const specifier = match[1] ?? ''
    if (ALLOWED_IMPORTS.some((pattern) => pattern.test(specifier))) continue
    violations.push({
      file: '',
      reason: specifier.startsWith('.')
        ? `relative import '${specifier}': demos must be self-contained`
        : `import from '${specifier}': demos import only from '@nanisoft/prism-ui/*', 'react' and 'lucide-react'`,
    })
  }
  if (!/export\s+default/.test(source)) {
    violations.push({ file: '', reason: 'no default export: each demo default-exports its example' })
  }
  return violations
}

export interface PrismImport {
  readonly specifier: string
  readonly names: readonly string[]
}

/**
 * The prism-ui bindings a demo imports, with their module specifier. Type-only
 * specifiers reference supporting types, not runtime items.
 */
export function scanPrismImportsWithSource(source: string): PrismImport[] {
  const found: PrismImport[] = []
  const importPattern =
    /(?:^|\n)\s*import\s+(type\s+)?\{([^}]*)\}\s+from\s+["'](@nanisoft\/prism-ui[^"']*)["']/g
  let match: RegExpExecArray | null
  while ((match = importPattern.exec(source)) !== null) {
    if (match[1]) continue
    const names: string[] = []
    for (const raw of (match[2] ?? '').split(',')) {
      const trimmed = raw.trim()
      if (!trimmed || trimmed.startsWith('type ')) continue
      const name = trimmed.split(/\s+as\s+/)[0]?.trim()
      if (name) names.push(name)
    }
    found.push({ specifier: match[3] ?? '', names })
  }
  return found
}

/** The prism-ui value export names a demo imports, sorted and de-duplicated. */
export function scanPrismImports(source: string): string[] {
  const names = new Set<string>()
  for (const binding of scanPrismImportsWithSource(source)) {
    for (const name of binding.names) names.add(name)
  }
  return [...names].sort()
}
