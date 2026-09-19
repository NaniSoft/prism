/**
 * The corpus contract (ADR-0004 §5): the single backing store every MCP tool
 * reads. `@nanisoft/prism-llms` emits its projection into this shape at build
 * time (`dist/data.json`) and validates against it type-only; this package is
 * the canonical home because it is the consumer — the tools make exactly one
 * assumption about the corpus, and it is this interface.
 */

/** One catalog item — a component, block, or page from prism-ui. */
export interface PrismDocsItem {
  /** The prism-ui export name, e.g. `Button`, `PageHeader`, `DocsShell`. */
  readonly name: string;
  readonly kind: 'component' | 'block' | 'page';
  /** The one-liner that becomes the llms.txt bullet and the search hit. */
  readonly description: string;
  /** Full per-item Markdown: usage rules, Prism props, example. */
  readonly doc: string;
  /** The extracted Prism-added props section — absent for pass-throughs. */
  readonly props?: string;
  /** Documented examples; `code` is the verbatim `demos/<slug>.tsx` source. */
  readonly examples?: ReadonlyArray<{
    readonly slug: string;
    readonly title?: string;
    readonly code: string;
  }>;
  /**
   * The antd surface this item passes through unchanged (`Button`), absent for
   * wrappers and prism-original items — a wrapper's base rides its doc's
   * `> Extends:` note.
   */
  readonly antdBase?: string;
}

/** One docs page (guides only — blog is lane-only, excluded from the store). */
export interface PrismDocsPage {
  /** Site pathname, e.g. `/docs/theming`. */
  readonly url: string;
  readonly title: string;
  readonly description?: string;
  readonly markdown: string;
}

/** One theme atom per pack × mode (`blue-light`, …), as Markdown. */
export interface PrismDocsTheme {
  readonly slug: string;
  readonly markdown: string;
}

export interface PrismDocsStore {
  /** The resolved prism-ui version — echoed by `list_items` for mismatch detection. */
  readonly prismVersion: string;
  /** `https://prism.nanisoft.com`, interpolated at build. */
  readonly baseUrl: string;
  readonly items: ReadonlyArray<PrismDocsItem>;
  readonly pages: ReadonlyArray<PrismDocsPage>;
  readonly themes: ReadonlyArray<PrismDocsTheme>;
}

/**
 * Validate an unknown value (typically the parsed `dist/data.json`) against
 * the store contract and return it typed. A JSON import type-widens `kind` to
 * `string`, so only a runtime guard validates the literals — prism-llms'
 * check gate runs this over its emit, and the server factory runs it over its
 * bundled corpus at the door.
 */
export function parsePrismDocsStore(value: unknown): PrismDocsStore {
  const fail = (path: string, expected: string): never => {
    throw new TypeError(`PrismDocsStore: ${path} must be ${expected}`);
  };
  const str = (path: string, v: unknown): string => (typeof v === 'string' ? v : fail(path, 'a string'));
  const arr = (path: string, v: unknown): readonly unknown[] => (Array.isArray(v) ? v : fail(path, 'an array'));

  if (typeof value !== 'object' || value === null) fail('store', 'an object');
  const store = value as Record<string, unknown>;

  const items = arr('items', store.items).map((entry, index) => {
    if (typeof entry !== 'object' || entry === null) fail(`items[${index}]`, 'an object');
    const item = entry as Record<string, unknown>;
    const rawKind = str(`items[${index}].kind`, item.kind);
    const kind: PrismDocsItem['kind'] =
      rawKind === 'component' || rawKind === 'block' || rawKind === 'page' ? rawKind : fail(`items[${index}].kind`, "one of 'component' | 'block' | 'page'");
    const examples = item.examples === undefined
      ? undefined
      : arr(`items[${index}].examples`, item.examples).map((example, exampleIndex) => {
          if (typeof example !== 'object' || example === null) fail(`items[${index}].examples[${exampleIndex}]`, 'an object');
          const demo = example as Record<string, unknown>;
          return {
            slug: str(`items[${index}].examples[${exampleIndex}].slug`, demo.slug),
            ...(demo.title !== undefined ? { title: str(`items[${index}].examples[${exampleIndex}].title`, demo.title) } : {}),
            code: str(`items[${index}].examples[${exampleIndex}].code`, demo.code),
          };
        });
    return {
      name: str(`items[${index}].name`, item.name),
      kind,
      description: str(`items[${index}].description`, item.description),
      doc: str(`items[${index}].doc`, item.doc),
      ...(item.props !== undefined ? { props: str(`items[${index}].props`, item.props) } : {}),
      ...(examples !== undefined ? { examples } : {}),
      ...(item.antdBase !== undefined ? { antdBase: str(`items[${index}].antdBase`, item.antdBase) } : {}),
    };
  });

  const pages = arr('pages', store.pages).map((entry, index) => {
    if (typeof entry !== 'object' || entry === null) fail(`pages[${index}]`, 'an object');
    const page = entry as Record<string, unknown>;
    return {
      url: str(`pages[${index}].url`, page.url),
      title: str(`pages[${index}].title`, page.title),
      ...(page.description !== undefined ? { description: str(`pages[${index}].description`, page.description) } : {}),
      markdown: str(`pages[${index}].markdown`, page.markdown),
    };
  });

  const themes = arr('themes', store.themes).map((entry, index) => {
    if (typeof entry !== 'object' || entry === null) fail(`themes[${index}]`, 'an object');
    const theme = entry as Record<string, unknown>;
    return {
      slug: str(`themes[${index}].slug`, theme.slug),
      markdown: str(`themes[${index}].markdown`, theme.markdown),
    };
  });

  return {
    prismVersion: str('prismVersion', store.prismVersion),
    baseUrl: str('baseUrl', store.baseUrl),
    items,
    pages,
    themes,
  };
}
