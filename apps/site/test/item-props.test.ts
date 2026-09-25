// Generated API tables (ticket 12 §2): the extractor's two-consumer contract —
// the site reads prism-ui's built declarations through prism-llms' extractor
// exactly like the generator does. Runs against the real built dist.

import { describe, expect, it } from 'vitest';

import { itemPropsInterfaces } from '../lib/item-props.js';

describe('itemPropsInterfaces', () => {
  it('extracts the public Prism component surface', () => {
    const [entry] = itemPropsInterfaces('components/alert');
    expect(entry).toBeDefined();
    expect(entry!.typeName).toBe('AlertProps');
    expect(entry!.extendsType).toContain('HTMLAttributes');
    expect(entry!.props.map((prop) => prop.name)).toContain('variant');
    expect(entry!.props.find((prop) => prop.name === 'variant')?.typeText).toBe('AlertVariant');
  });

  it('extracts Prism blocks and pages', () => {
    for (const itemKey of ['blocks/component-demo', 'blocks/page-header', 'pages/docs-shell', 'pages/blog-layout']) {
      expect(itemPropsInterfaces(itemKey).length).toBeGreaterThan(0);
    }
  });

  it('returns no interfaces for unknown items and malformed keys', () => {
    expect(itemPropsInterfaces('components/does-not-exist')).toEqual([]);
    expect(itemPropsInterfaces('docs')).toEqual([]);
    expect(itemPropsInterfaces('')).toEqual([]);
  });
});
