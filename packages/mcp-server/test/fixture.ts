/**
 * A representative `PrismDocsStore` for the tool tests — one of every shape
 * the corpus can hold: a pass-through re-export (`antdBase`, no props), a
 * Prism wrapper with its own props, a block with two documented examples, a
 * page-kind composition, plus docs pages and the four theme atoms.
 *
 * These are tests' hand-written data, not prism-llms output — the factory only
 * ever reads the shape.
 */

import type { PrismDocsStore } from '../src/store.js';

export const FIXTURE: PrismDocsStore = {
  prismVersion: '1.2.3',
  baseUrl: 'https://prism.nanisoft.com',
  items: [
    {
      name: 'Button',
      kind: 'component',
      description: "antd Button, unchanged — a pass-through re-export. Import from '@nanisoft/prism-ui'.",
      doc: [
        '# Button',
        '',
        "antd Button, unchanged — a pass-through re-export. Import from '@nanisoft/prism-ui'.",
        '',
        '- Extends: antd **Button** — for inherited props and demos, use the antd MCP (`antd_info Button`).',
        '',
        '_No additional props beyond the antd base component._',
      ].join('\n'),
      antdBase: 'Button',
    },
    {
      name: 'DisplayTitle',
      kind: 'component',
      description: 'Prism wrapper that layers Prism type tokens over antd Typography.',
      doc: '# DisplayTitle\n\nA Prism wrapper. MUST set `level` explicitly — never rely on antd defaults.',
      props: [
        '## Props',
        '',
        '| Prop | Type | Default | Description |',
        '| --- | --- | --- | --- |',
        '| `level` | number | — | Heading level. |',
      ].join('\n'),
    },
    {
      name: 'PageHeader',
      kind: 'block',
      description: 'Page-opening block: title, subtitle, breadcrumb, right-aligned actions.',
      doc: '# PageHeader\n\nPrism block. Usage: MUST keep actions right-aligned; SHOULD pass `breadcrumb` on deep pages.',
      props: [
        '## Props',
        '',
        '| Prop | Type | Default | Description |',
        '| --- | --- | --- | --- |',
        '| `title` | string | — | The page title. |',
      ].join('\n'),
      examples: [
        {
          slug: 'basic',
          title: 'Basic',
          code: "import { PageHeader } from '@nanisoft/prism-ui';\n\nexport const Basic = () => <PageHeader title=\"Settings\" />;",
        },
        {
          slug: 'with-actions',
          code: "import { PageHeader } from '@nanisoft/prism-ui';\n\nexport const WithActions = () => <PageHeader title=\"Settings\" actions={<Button>Save</Button>} />;",
        },
      ],
    },
    {
      name: 'StatRow',
      kind: 'block',
      description: 'Row of stat tiles for dashboard summaries.',
      doc: '# StatRow\n\nPrism block. Full documentation pending.',
    },
    {
      name: 'SettingsPage',
      kind: 'page',
      description: 'Full-page settings composition: header, sectioned form, action table.',
      doc: '# SettingsPage\n\nFull-page composition over PageHeader and sectioned forms.',
      examples: [{ slug: 'green-dark', code: "import { SettingsPage } from '@nanisoft/prism-ui';\n\nexport const Demo = () => <SettingsPage />;" }],
    },
  ],
  pages: [
    {
      url: '/docs/theming',
      title: 'Theming',
      description: 'Brand packs and modes; createPrismTheme().',
      markdown: '# Theming\n\nBrand packs and modes; `createPrismTheme({ pack: "green", mode: "dark" })`.',
    },
    {
      url: '/docs/getting-started',
      title: 'Getting started',
      markdown: '# Getting started\n\nInstall the packages from the nanisoft scope.',
    },
  ],
  themes: [
    { slug: 'blue-light', markdown: '# Theming — blue pack · light mode' },
    { slug: 'blue-dark', markdown: '# Theming — blue pack · dark mode' },
    { slug: 'green-light', markdown: '# Theming — green pack · light mode' },
    { slug: 'green-dark', markdown: '# Theming — green pack · dark mode' },
  ],
};
