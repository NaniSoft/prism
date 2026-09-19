// Generated API tables (ticket 12 §2): the extractor's two-consumer contract —
// the site reads prism-ui's built declarations through prism-llms' extractor
// exactly like the generator does. Runs against the real built dist
// (turbo's test task dependsOn ^build).

import { describe, expect, it } from 'vitest';

import { itemPropsInterfaces } from '../lib/item-props.js';

describe('itemPropsInterfaces', () => {
  it('extracts the wrapped component surface', () => {
    const [entry] = itemPropsInterfaces('components/display-title');
    expect(entry).toBeDefined();
    expect(entry!.typeName).toBe('DisplayTitleProps');
    expect(entry!.extendsType).toBe('TitleProps');
    expect(entry!.props.map((prop) => prop.name)).toEqual(['width']);
    expect(entry!.props[0]!.required).toBe(false);
  });

  it('extracts prism blocks and pages', () => {
    for (const itemKey of ['blocks/component-demo', 'blocks/page-header', 'pages/docs-shell', 'pages/blog-layout']) {
      expect(itemPropsInterfaces(itemKey).length).toBeGreaterThan(0);
    }
  });

  it('extracts nothing for pass-throughs — the antd seam', () => {
    expect(itemPropsInterfaces('components/button')).toEqual([]);
  });

  it('tolerates unknown items and malformed keys', () => {
    expect(itemPropsInterfaces('components/does-not-exist')).toEqual([]);
    expect(itemPropsInterfaces('docs')).toEqual([]);
    expect(itemPropsInterfaces('')).toEqual([]);
  });
});
