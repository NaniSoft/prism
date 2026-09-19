/**
 * The one props extractor (tickets 12/16): reads prism-ui's built `.d.ts`
 * surface — TSDoc preserved — and returns the Prism-added props. Homed here
 * and exported (`@nanisoft/prism-llms/extractor`) for the site's API tables;
 * one extractor, two consumers. Runs after `^build`, so it reads declarations,
 * never TS source.
 *
 * Deliberately compiler-API-free: TypeScript 7 (this repo's compiler) no
 * longer ships the JS compiler API, and ADR-0003 already accepts cosmetic
 * fidelity risk on gnarly unions. This is a small structural scanner for the
 * declaration shape prism-ui emits — `export interface XProps [extends Y]`
 * with JSDoc-carried descriptions. Pass-through re-exports never match, and
 * that absence IS the Extends seam (ADR-0004): no extracted props means the
 * item is "antd X, unchanged".
 */

export interface ExtractedProp {
  readonly name: string;
  /** Type text as written, whitespace-normalised, comments stripped. */
  readonly typeText: string;
  /** Leading JSDoc text (the prop description). */
  readonly description?: string;
  readonly required: boolean;
  /** `@defaultValue` tag text, when present. */
  readonly defaultValue?: string;
}

export interface ExtractedInterface {
  readonly typeName: string;
  /** The type this interface extends, when declared (e.g. `TitleProps`). */
  readonly extendsType?: string;
  readonly props: readonly ExtractedProp[];
}

/**
 * Extract every exported `*Props` interface from a `.d.ts` source, in source
 * order. Returns an empty array for re-export-only files (pass-throughs).
 */
export function extractProps(source: string): ExtractedInterface[] {
  const results: ExtractedInterface[] = [];
  const interfacePattern = /export\s+interface\s+(\w+)(?:\s+extends\s+([\w.]+))?\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = interfacePattern.exec(source)) !== null) {
    if (!(match[1] ?? '').endsWith('Props')) continue; // supporting types (DocsNavEntry, BlogFrontmatter) are not props
    const openBrace = interfacePattern.lastIndex - 1;
    const body = readBalancedBody(source, openBrace);
    if (body === undefined) continue; // unbalanced — skip rather than guess
    results.push({
      typeName: match[1] ?? '',
      extendsType: match[2],
      props: parseProps(body),
    });
  }
  return results;
}

/** The `{…}` body of the declaration whose brace sits at `openBrace`, or undefined when unbalanced. */
function readBalancedBody(source: string, openBrace: number): string | undefined {
  let depth = 0;
  let i = openBrace;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '/' && source[i + 1] === '*') {
      i = source.indexOf('*/', i + 2);
      if (i === -1) return undefined;
      i += 2;
      continue;
    }
    if (ch === '/' && source[i + 1] === '/') {
      i = source.indexOf('\n', i);
      if (i === -1) return undefined;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(source, i, ch);
      if (i === -1) return undefined;
      continue;
    }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(openBrace + 1, i);
    }
    i += 1;
  }
  return undefined;
}

function skipString(source: string, start: number, quote: string): number {
  let i = start + 1;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '\\') {
      i += 2;
      continue;
    }
    if (ch === quote) return i + 1;
    i += 1;
  }
  return -1;
}

/** Parse property signatures out of an interface body. Non-signature members (methods, indexers) are skipped. */
function parseProps(body: string): ExtractedProp[] {
  const props: ExtractedProp[] = [];
  let i = 0;
  let pendingDocs: { description?: string; defaultValue?: string } | undefined;
  while (i < body.length) {
    const trivia = skipTrivia(body, i);
    i = trivia.next;
    pendingDocs = trivia.jsDoc ?? pendingDocs;
    if (i >= body.length) break;

    const nameMatch = /^([\w$]+)(\?)?\s*:/.exec(body.slice(i));
    if (!nameMatch) {
      // Not a property signature (call/construct/index signature, stray token) —
      // skip to the next statement boundary at depth 0.
      const boundary = nextTopLevelBoundary(body, i);
      if (boundary === -1) break;
      pendingDocs = undefined;
      i = boundary;
      continue;
    }

    const typeStart = i + nameMatch[0].length;
    const typeEnd = nextTopLevelBoundary(body, typeStart);
    const rawType = typeEnd === -1 ? body.slice(typeStart) : body.slice(typeStart, typeEnd);
    props.push({
      name: nameMatch[1] ?? '',
      typeText: normalizeType(rawType),
      description: pendingDocs?.description,
      defaultValue: pendingDocs?.defaultValue,
      required: !nameMatch[2],
    });
    pendingDocs = undefined;
    if (typeEnd === -1) break;
    i = typeEnd + 1;
  }
  return props;
}

/**
 * Advance past whitespace/comments. `/**` comments are captured as JSDoc
 * (description + `@defaultValue`), merged across consecutive blocks.
 */
function skipTrivia(
  source: string,
  start: number,
): { next: number; jsDoc?: { description?: string; defaultValue?: string } | undefined } {
  let i = start;
  let jsDoc: { description?: string; defaultValue?: string } | undefined;
  while (i < source.length) {
    const ch = source[i] ?? '';
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === '/' && source[i + 1] === '*' && source[i + 2] === '*') {
      const close = source.indexOf('*/', i + 3);
      if (close === -1) return { next: source.length };
      // Consecutive JSDoc blocks merge — a description and a @defaultValue may
      // live in separate blocks (tsc emits one, hand-written d.ts may not).
      const parsed = readJsDoc(source.slice(i + 3, close));
      if (parsed) {
        jsDoc = {
          description: jsDoc?.description ?? parsed.description,
          defaultValue: jsDoc?.defaultValue ?? parsed.defaultValue,
        };
      }
      i = close + 2;
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2);
      if (close === -1) return { next: source.length };
      i = close + 2;
      continue;
    }
    if (ch === '/' && source[i + 1] === '/') {
      const close = source.indexOf('\n', i);
      if (close === -1) return { next: source.length };
      i = close;
      continue;
    }
    return { next: i, jsDoc };
  }
  return { next: i, jsDoc };
}

function readJsDoc(text: string): { description?: string; defaultValue?: string } | undefined {
  const lines = text
    .split('\n')
    .map((line) => line.replace(/^\s*\*/, '').trim());
  const description: string[] = [];
  let defaultValue: string | undefined;
  for (const line of lines) {
    if (!line) {
      if (description.length > 0) description.push('');
      continue;
    }
    const tag = /^@(\w+)\s*(.*)$/.exec(line);
    if (tag) {
      if (tag[1] === 'defaultValue') defaultValue = tag[2] || undefined;
      continue; // other tags (@example, @internal, …) stay out of the docs
    }
    description.push(line);
  }
  const joined = description.join(' ').trim();
  if (!joined && !defaultValue) return undefined;
  return { description: joined || undefined, defaultValue };
}

/** Index of the next `;` or `,` at bracket depth 0 (starting at `from`), or -1. */
function nextTopLevelBoundary(source: string, from: number): number {
  let depth = 0;
  let i = from;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '/' && source[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2);
      if (close === -1) return -1;
      i = close + 2;
      continue;
    }
    if (ch === '/' && source[i + 1] === '/') {
      const close = source.indexOf('\n', i);
      if (close === -1) return -1;
      i = close;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(source, i, ch);
      if (i === -1) return -1;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{' || ch === '<') depth += 1;
    if (ch === ')' || ch === ']' || ch === '}' || ch === '>') depth -= 1;
    if (depth === 0 && (ch === ';' || ch === ',')) return i;
    i += 1;
  }
  return -1;
}

/** Collapse comments and newlines to single spaces — readable, verbatim type text. */
function normalizeType(raw: string): string {
  return raw
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
