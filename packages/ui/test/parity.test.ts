import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildCatalog, catalogEntry, componentCategories } from '../src/catalog.js';

const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

describe('owned catalog', () => {
  const catalog = buildCatalog();

  it('contains all three layers and stable unique ids', () => {
    expect(new Set(catalog.map((entry) => entry.layer))).toEqual(new Set(['components', 'blocks', 'pages']));
    expect(new Set(catalog.map((entry) => entry.id)).size).toBe(catalog.length);
    expect(new Set(catalog.map((entry) => entry.name)).size).toBe(catalog.length);
  });

  it('covers every curated category and every component has a source directory', () => {
    const components = catalog.filter((entry) => entry.layer === 'components');
    expect(new Set(components.map((entry) => entry.category))).toEqual(new Set(componentCategories));
    for (const entry of components) {
      expect(fs.existsSync(path.join(src, 'components', entry.id, 'index.tsx')), entry.name).toBe(true);
    }
  });

  it('keeps implementation dependencies out of the public catalog vocabulary', () => {
    const serialized = JSON.stringify(catalog);
    expect(serialized).not.toContain('antd');
    expect(serialized).not.toContain('@base-ui');
    expect(catalogEntry('Button')?.primitive).toBe('base-ui');
  });

  it('keeps implementation packages out of published declarations', () => {
    const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
    const declarations: string[] = [];
    const walk = (directory: string): void => {
      for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
        const file = path.join(directory, item.name);
        if (item.isDirectory()) walk(file);
        else if (item.name.endsWith('.d.ts')) declarations.push(fs.readFileSync(file, 'utf8'));
      }
    };
    walk(dist);
    expect(declarations.join('\n')).not.toContain('@base-ui/react');
    expect(declarations.join('\n')).not.toContain('from \'antd');
  });

  it('every block and page has a source directory', () => {
    for (const entry of catalog.filter((item) => item.layer !== 'components')) {
      expect(fs.existsSync(path.join(src, entry.layer, entry.id, 'index.tsx')), entry.name).toBe(true);
    }
  });
});
