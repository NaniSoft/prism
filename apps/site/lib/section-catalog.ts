// One owned catalog groups every docs index, the site navigation, generated
// content, the LLM corpus, and MCP.

import { buildCatalog, type CatalogCategory, type CatalogLayer } from '@nanisoft/prism-ui/catalog';

import { blocksSource, componentsSource, pagesSource } from './source';

export interface CatalogItem {
  title: string;
  url: string;
  description?: string;
}

export interface CatalogGroup {
  group: string;
  items: CatalogItem[];
}

const GROUP_LABELS: Readonly<Record<CatalogCategory, string>> = {
  actions: 'Actions',
  forms: 'Forms',
  navigation: 'Navigation',
  overlays: 'Overlays',
  'data-display': 'Data display',
  feedback: 'Feedback',
  foundations: 'Foundations',
  layout: 'Layout',
  composition: 'Compositions',
};

const GROUP_ORDER: readonly CatalogCategory[] = [
  'actions', 'forms', 'navigation', 'overlays', 'data-display', 'feedback', 'foundations', 'layout', 'composition',
];

function sourceFor(layer: CatalogLayer) {
  return layer === 'components' ? componentsSource : layer === 'blocks' ? blocksSource : pagesSource;
}

export function catalogGroups(layer: CatalogLayer): CatalogGroup[] {
  const entries = buildCatalog().filter((entry) => entry.layer === layer);
  return GROUP_ORDER.map((category) => ({
    group: GROUP_LABELS[category],
    items: entries
      .filter((entry) => entry.category === category)
      .map((entry) => ({
        title: entry.name,
        url: `/${layer}/${entry.id}`,
        description: sourceFor(layer).getPage([entry.id])?.data.description ?? entry.description,
      })),
  })).filter((group) => group.items.length > 0);
}
