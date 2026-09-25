// packages/ui/scripts/generateAntdExports.mjs
// Codegen for prism-ui antd pass-through components and icons
// Outputs src/generated/antd-components.ts and src/generated/icons.ts
// Also creates src/components/<antd-id>/index.ts proxy modules

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const GENERATED = path.join(SRC, 'generated');
const COMPONENTS = path.join(SRC, 'components');

// Wrapped component names (from registry) - these should NOT be generated
const wrappedComponentNames = new Set([
  'Typography.Title', // DisplayTitle
]);

// Non-component exports to exclude from generation
const nonComponentExports = new Set([
  'ConfigProvider', // antd ConfigProvider - has its own special handling
  'App', // antd App component
  'theme', // antd theme
  'message', // antd message
  'notification', // antd notification
  'version', // antd version
  // Static sub-components
  'Typography.Text',
  'Form.Item',
  'Table.Column',
]);

// Parse antd/es/index.d.ts to get all exported component names and types
function parseAntdIndexDts() {
  const indexDtsPath = path.join(ROOT, 'node_modules', 'antd', 'es', 'index.d.ts');
  const content = fs.readFileSync(indexDtsPath, 'utf8');

  const componentExports = new Map(); // name -> { type: string, source: string }
  const typeExports = new Set(); // All type export names (Props/Ref/Change/Mode/Color/Gradient)
  const typeSources = new Map(); // type name -> source path in antd/es

  // Parse value exports: export { default as Affix } from './affix';
  const valuePattern = /export\s*\{\s*default\s+as\s+([^}]+?)\s*\}\s+from\s+['"]([^'"]+)['"];?/g;
  let match;

  while ((match = valuePattern.exec(content)) !== null) {
    const exportName = match[1].trim();
    const sourcePath = match[2];

    if (!nonComponentExports.has(exportName) && !wrappedComponentNames.has(exportName)) {
      componentExports.set(exportName, {
        type: exportName,
        source: sourcePath,
      });
    }
  }

  // Parse type exports: export type { AffixProps, AffixRef } from './affix';
  const typePattern = /export\s+type\s*\{([^}]+?)\}\s+from\s+['"]([^'"]+)['"];?/g;
  let typeMatch;

  while ((typeMatch = typePattern.exec(content)) !== null) {
    const typeNames = typeMatch[1].split(',').map((n) => n.trim()).filter(Boolean);

    for (const typeName of typeNames) {
      // Only keep type names that are component props/ref types
      if (/^.*Props$|^.*Ref$|^.*Change$|^.*Mode$|^.*Color$|^.*Gradient$/.test(typeName)) {
        typeExports.add(typeName);
        typeSources.set(typeName, typeMatch[2]);
      }
    }
  }

  return { componentExports, typeExports, typeSources };
}

// Parse antd/es/index.js to get all exported component names (for parity check)
function parseAntdIndexJs() {
  const indexJsPath = path.join(ROOT, 'node_modules', 'antd', 'es', 'index.js');
  const content = fs.readFileSync(indexJsPath, 'utf8');

  const componentExports = new Set();
  const componentPattern = /export\s*\{\s*default\s+as\s+([^}]+?)\s*\}\s+from\s+['"]([^'"]+)['"];?/g;
  let match;

  while ((match = componentPattern.exec(content)) !== null) {
    componentExports.add(match[1].trim());
  }

  return componentExports;
}

// Convert antd component name to kebab-case for directory name
function kebabCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

// antd's root barrel is a runtime module, not a type-only surface. Keep the
// generated pass-throughs pointed at the component modules themselves so a
// consumer that imports one Prism component does not pull every antd export
// into its client graph. The paths come from antd/es/index.d.ts rather than
// being reconstructed by name, which keeps unusual ids (for example
// `date-picker`) correct.
function antdComponentPath(source) {
  const componentPath = source.replace(/^\.\/?/, '').replace(/\.js$/, '');
  const hasDirectoryEntry = fs.existsSync(path.join(ROOT, 'node_modules', 'antd', 'es', componentPath, 'index.d.ts'));
  return `antd/es/${componentPath}${hasDirectoryEntry ? '/index.js' : '.js'}`;
}

// Known-props-to-skip: props types that don't have corresponding value exports
const BAD_PROPS_TYPES = new Set([
  'GridProps',    // in d.ts but Grid is default export from './grid'
  'SliderProps',  // in d.ts but Slider is default export from './slider'
]);

// Remove stale generated proxy directories (type-only exports, renamed components)
function cleanStaleDirectories(componentExportsMap) {
  const proxyDir = path.join(COMPONENTS);
  if (!fs.existsSync(proxyDir)) return;

  const validDirs = new Set(['display-title']);
  for (const [componentName] of componentExportsMap) {
    validDirs.add(kebabCase(componentName));
  }

  const entries = fs.readdirSync(proxyDir);
  for (const entry of entries) {
    if (entry === 'index.ts') continue;
    if (!validDirs.has(entry)) {
      fs.rmSync(path.join(proxyDir, entry), { recursive: true, force: true });
    }
  }
}

// Generate per-component proxy modules
function generateComponentProxies(componentExportsMap, typeExports, typeSources) {
  const proxyDir = path.join(COMPONENTS);
  fs.mkdirSync(proxyDir, { recursive: true });

  const generatedFiles = [];

  for (const [componentName, { source }] of componentExportsMap) {
    // Skip if this is a wrapped component
    if (wrappedComponentNames.has(componentName)) {
      continue;
    }

    const proxyPath = path.join(proxyDir, kebabCase(componentName), 'index.ts');
    fs.mkdirSync(path.dirname(proxyPath), { recursive: true });

    const propsType = `${componentName}Props`;
    const hasPropsType = typeExports.has(propsType) && !BAD_PROPS_TYPES.has(propsType);
    const valuePath = antdComponentPath(source);
    const typePath = antdComponentPath(typeSources.get(propsType) ?? source);

    const content =
      `// GENERATED by scripts/generateAntdExports.mjs - DO NOT EDIT MANUALLY\n` +
      `export { default as ${componentName} } from '${valuePath}';\n` +
      (hasPropsType ? `export type { ${propsType} } from '${typePath}';\n` : '');

    fs.writeFileSync(proxyPath, content, 'utf8');
    generatedFiles.push(proxyPath);
  }

  return generatedFiles;
}

// Generate aggregate antd-components barrel
function generateAntdComponentsBarrel(componentExportsMap, typeExports, typeSources) {
  const outputPath = path.join(GENERATED, 'antd-components.ts');
  fs.mkdirSync(GENERATED, { recursive: true });

  const lines = [];
  for (const [name, { source }] of componentExportsMap) {
    const propsType = `${name}Props`;
    const hasPropsType = typeExports.has(propsType) && !BAD_PROPS_TYPES.has(propsType);
    const valuePath = antdComponentPath(source);
    const typePath = antdComponentPath(typeSources.get(propsType) ?? source);
    lines.push(`export { default as ${name} } from '${valuePath}';`);
    if (hasPropsType) {
      lines.push(`export type { ${propsType} } from '${typePath}';`);
    }
  }

  const content =
    `// GENERATED by scripts/generateAntdExports.mjs - DO NOT EDIT MANUALLY\n` +
    lines.join('\n') +
    '\n';

  fs.writeFileSync(outputPath, content, 'utf8');
  return outputPath;
}

// Generate icons barrel from @ant-design/icons
function generateIconsBarrel() {
  const outputPath = path.join(GENERATED, 'icons.ts');
  fs.mkdirSync(GENERATED, { recursive: true });

  // Since @ant-design/icons uses `export * from './icons'`, we need to scan the icons directory
  const iconsDir = path.join(ROOT, 'node_modules', '@ant-design', 'icons', 'es', 'icons');
  const iconFiles = fs.readdirSync(iconsDir);

  const iconNames = [];

  // Filter for actual icon component files (not d.ts or js files directly)
  for (const file of iconFiles) {
    // Skip if it's a declaration file or if we've already seen the base name
    if (file.endsWith('.d.ts') || file.endsWith('.js')) {
      // Extract base name without extension and without suffix
      const baseName = file.replace(/\.(d\.ts|js)$/, '');

      // Only include icons that end with Outlined, Filled, or TwoTone (the main variants)
      if (
        baseName.endsWith('Outlined') ||
        baseName.endsWith('Filled') ||
        baseName.endsWith('TwoTone')
      ) {
        // We want to export the suffixed versions (Outlined, Filled, TwoTone)
        // as they are the actual component exports
        iconNames.push(baseName);
      }
    }
  }

  // Remove duplicates and sort
  const uniqueIcons = [...new Set(iconNames)].sort();

  // Re-export each icon from its own static ESM module. The package root's Node
  // import condition wraps CJS, while its browser import adds another barrel;
  // direct icon subpaths avoid both while preserving the one-stop public API.
  // Each subpath resolves to the ESM file for bundlers and the matching
  // declaration for TypeScript.
  const lines = uniqueIcons.map(
    (name) => `export { default as ${name} } from '@ant-design/icons/${name}';`,
  );
  const contentToWrite =
    `// GENERATED by scripts/generateAntdExports.mjs - DO NOT EDIT MANUALLY\n` +
    `${lines.join('\n')}\n`;

  fs.writeFileSync(outputPath, contentToWrite, 'utf8');
  return outputPath;
}

// Generate the pass-through item list (wrapped-registry's buildCatalog input).
// prism-llms' generator and the site's stub generation are the two consumers
// (wrapped-registry header comment); emitting it here keeps the catalog built
// in exactly one place.
function generatePassThroughs(componentNames) {
  const outputPath = path.join(GENERATED, 'pass-throughs.ts');

  const items = [...componentNames]
    .map((name) => ({ name, id: kebabCase(name) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const lines = items.map((item) => `  { name: '${item.name}', id: '${item.id}' },`);
  const contentToWrite =
    `// GENERATED by scripts/generateAntdExports.mjs - DO NOT EDIT MANUALLY\n` +
    `/** Pass-through antd items, as consumed by buildCatalog() in wrapped-registry. */\n` +
    `export const passThroughs = [\n${lines.join('\n')}\n] as const;\n`;

  fs.writeFileSync(outputPath, contentToWrite, 'utf8');
  return outputPath;
}

// Main generation logic
function main() {
  const dtsResult = parseAntdIndexDts();
  const dtsExports = dtsResult.componentExports;
  const typeExports = dtsResult.typeExports;
  const typeSources = dtsResult.typeSources;
  const jsExports = parseAntdIndexJs();

  // All component names from d.ts (value exports only)
  const allComponentNames = [...dtsExports.keys()].filter(
    (name) => !nonComponentExports.has(name) && !wrappedComponentNames.has(name)
  );

  // Clean stale generated directories before generating new ones
  cleanStaleDirectories(dtsExports);

  // Ensure js exports match d.ts exports (for parity)
  const missingInJs = allComponentNames.filter((name) => !jsExports.has(name));
  if (missingInJs.length > 0) {
    console.warn(`[generateAntdExports] ${missingInJs.length} components found in d.ts but not in js:`);
    console.warn(`  ${missingInJs.join(', ')}`);
  }

  // Generate per-component proxy modules
  const proxyFiles = generateComponentProxies(dtsExports, typeExports, typeSources);

  // Generate aggregate barrel
  const antdBarrelPath = generateAntdComponentsBarrel(dtsExports, typeExports, typeSources);

  // Generate icons barrel
  const iconsPath = generateIconsBarrel();

  // Generate pass-through item list
  generatePassThroughs(allComponentNames);

  console.log(`[generateAntdExports] Generated ${proxyFiles.length} proxy modules`);
  console.log(`[generateAntdExports] Generated ${antdBarrelPath}`);
  console.log(`[generateAntdExports] Generated ${iconsPath}`);
  console.log(`[generateAntdExports] Total components: ${allComponentNames.length}`);
}

main();