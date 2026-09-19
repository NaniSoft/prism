// Headless MDX component mapping (fumadocs-core headless: we own the HTML).
// Prose elements are plain HTML styled by .site-prose; the one custom mapping
// is ComponentDemo → the app-level Demo wire, scoped to the page's item
// (ticket 12: example id = the demos/<slug>.tsx filename, so the full registry
// id is `<section>/<item>/<slug>`).

import type { ComponentType } from 'react';

import { Demo } from '@/components/Demo';

export interface MdxScope {
  /** The registry id prefix for this page, e.g. `components/button`. */
  itemKey: string;
}

type MdxComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

function scopedComponents({ itemKey }: MdxScope): MdxComponentMap {
  return {
    ComponentDemo: function ScopedDemo(props: { id?: string }) {
      const id = props.id ?? 'basic';
      return <Demo id={`${itemKey}/${id}`} />;
    },
  };
}

/** Merge the page scope into a per-page component map. */
export function getMdxComponents(scope: MdxScope, extra?: MdxComponentMap): MdxComponentMap {
  return { ...scopedComponents(scope), ...extra };
}
