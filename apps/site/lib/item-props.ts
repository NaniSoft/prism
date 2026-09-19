// The API-table source (ticket 12 §2): generated from prism-ui's built
// declaration surface via prism-llms' extractor — one extractor, two
// consumers. Runs at prerender (fs is build-time here); pass-through items
// extract nothing, which is exactly the "antd X, unchanged" seam.

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { extractProps, type ExtractedInterface } from '@nanisoft/prism-llms/extractor';

export type { ExtractedInterface, ExtractedProp } from '@nanisoft/prism-llms/extractor';

/**
 * Extract the Prism-added props interfaces for a catalog item.
 * `itemKey` is the flat doc path, e.g. `components/display-title`.
 * Returns an empty array for pass-throughs and unknown items.
 */
export function itemPropsInterfaces(itemKey: string): ExtractedInterface[] {
  const [layer, itemId] = itemKey.split('/');
  if (!layer || !itemId || !(layer === 'components' || layer === 'blocks' || layer === 'pages')) {
    return [];
  }
  const itemDir = path.join(process.cwd(), '..', '..', 'packages', 'ui', 'dist', layer, itemId);
  let files: string[];
  try {
    files = readdirSync(itemDir).filter((file) => file.endsWith('.d.ts') && !file.endsWith('.d.ts.map'));
  } catch {
    return [];
  }
  // tsc emits one .d.ts per module plus a re-export-only index — concatenating
  // the directory gives the extractor the real declarations.
  const source = files
    .sort()
    .map((file) => readFileSync(path.join(itemDir, file), 'utf8'))
    .join('\n');
  return extractProps(source).filter((entry) => entry.props.length > 0);
}
