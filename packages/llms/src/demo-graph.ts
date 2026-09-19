/**
 * The demo contract (ticket 16 check invariant 2, ticket 12 §2): each example
 * is one self-contained `.tsx` — default-exported component, importing only
 * from `@nanisoft/prism-ui/*` and `react`, no relative imports. This module is
 * the contract's single enforcement point: the generator reuses the import
 * scan for `## Blocks` / `## Pages` cross-refs, the check reuses the validator.
 */

export interface DemoViolation {
  readonly file: string;
  readonly reason: string;
}

/** Module specifiers a demo may import. Everything else fails the contract. */
const ALLOWED_IMPORTS = [ /^@nanisoft\/prism-ui(\/[\w.-]+)*$/, /^react$/ ];

/**
 * Validate one demo's source against the self-contained contract. Returns the
 * violations (empty = compliant): non-allowlisted or relative imports, and a
 * missing default export.
 */
export function validateDemoSource(source: string): DemoViolation[] {
  const violations: DemoViolation[] = [];
  const importPattern = /(?:^|\n)\s*import\s+(?:[\w*{},\s]+?\s+from\s+)?["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = importPattern.exec(source)) !== null) {
    const specifier = match[1] ?? '';
    if (ALLOWED_IMPORTS.some((pattern) => pattern.test(specifier))) continue;
    violations.push({
      file: '',
      reason:
        specifier.startsWith('.')
          ? `relative import '${specifier}' — demos must be self-contained`
          : `import from '${specifier}' — demos import only from '@nanisoft/prism-ui/*' and 'react'`,
    });
  }
  if (!/export\s+default/.test(source)) {
    violations.push({ file: '', reason: 'no default export — each demo default-exports its example component' });
  }
  return violations;
}

/**
 * The prism-ui export names a demo imports (for `## Blocks` / `## Pages`
 * cross-refs). Returns catalog names — the pre-alias original — and skips
 * type-only specifiers, which reference supporting types, not items.
 */
export function scanPrismImports(source: string): string[] {
  const names = new Set<string>();
  const importPattern = /(?:^|\n)\s*import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']@nanisoft\/prism-ui[^"']*["']/g;
  let match: RegExpExecArray | null;
  while ((match = importPattern.exec(source)) !== null) {
    for (const raw of (match[1] ?? '').split(',')) {
      const trimmed = raw.trim();
      if (!trimmed || trimmed.startsWith('type ')) continue;
      const name = trimmed.split(/\s+as\s+/)[0]?.trim();
      if (name) names.add(name);
    }
  }
  return [...names].sort();
}
