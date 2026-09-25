/**
 * A representative `PrismDocsStore` for the tool tests — one of every shape
 * the corpus can hold: an internally Base UI-backed component with no authored
 * props table, a native component with public props, a block with two documented
 * examples, another prop-less block, and a page-kind composition, plus docs pages
 * and four representative theme atoms.
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
      primitive: 'base-ui',
      description: "The primary action control for commands, links, and loading states. Import from '@nanisoft/prism-ui'.",
      doc: [
        '# Button',
        '',
        "The primary action control for commands, links, and loading states. Import from '@nanisoft/prism-ui'.",
        '',
        'Use one primary action per region and keep command labels explicit.',
      ].join('\n'),
    },
    {
      name: 'Typography',
      kind: 'component',
      primitive: 'native',
      description: 'Prism text, heading, and refracted display primitives on native elements.',
      doc: '# Typography\n\nUse one semantic level per heading. Prism owns the visual type scale.',
      props: [
        '## Props',
        '',
        '| Prop | Type | Default | Description |',
        '| --- | --- | --- | --- |',
        "| `as` | 'p' | 'p' | The native semantic element. |",
      ].join('\n'),
    },
    {
      name: 'PageHeader',
      kind: 'block',
      primitive: 'native',
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
      name: 'StatCard',
      kind: 'block',
      primitive: 'native',
      description: 'A labelled business signal with context and directional change.',
      doc: '# StatCard\n\nPrism block. Pair every metric with a comparison period and a useful empty state.',
    },
    {
      name: 'SettingsPage',
      kind: 'page',
      primitive: 'native',
      description: 'A complete settings page composed from navigation, settings blocks, and form actions.',
      doc: '# SettingsPage\n\nFull-page composition over SettingsPanel and native form controls.',
      examples: [{ slug: 'profile', code: "import { SettingsPage } from '@nanisoft/prism-ui';\n\nexport const Demo = () => <SettingsPage />;" }],
    },
  ],
  pages: [
    {
      url: '/docs/theming',
      title: 'Theming',
      description: 'Five Spectral Refraction packs, modes, and createPrismTheme().',
      markdown: '# Theming\n\nBrand packs and modes; `createPrismTheme({ pack: "green", mode: "dark" })`.',
    },
    {
      url: '/docs/getting-started',
      title: 'Getting started',
      markdown: '# Getting started\n\nInstall React and Prism, then import components from one package.',
    },
  ],
  themes: [
    { slug: 'blue-light', markdown: '# Theming — blue pack · light mode' },
    { slug: 'blue-dark', markdown: '# Theming — blue pack · beam-dark mode' },
    { slug: 'green-light', markdown: '# Theming — green pack · light mode' },
    { slug: 'green-dark', markdown: '# Theming — green pack · beam-dark mode' },
  ],
};
