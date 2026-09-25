// Builds the published stylesheet: the authored Prism recipes from src plus a
// deterministic variable scope for every registered pack and mode.

import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPrismTheme, prismBrandPacks } from '@nanisoft/prism-tokens';

import { bakePrismThemeRules } from '../dist/theming/bake.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(path.join(packageRoot, 'src', 'styles.css'), 'utf8').trimEnd();
const modes = ['light', 'dark'];
const themes = Object.keys(prismBrandPacks)
  .flatMap((pack) => modes.map((mode) => bakePrismThemeRules({ theme: getPrismTheme(pack, mode) })))
  .join('\n\n');

const output = `${source}\n\n/* Generated from @nanisoft/prism-tokens — do not edit. */\n${themes}\n`;
writeFileSync(path.join(packageRoot, 'dist', 'styles.css'), output);
cpSync(path.join(packageRoot, 'assets', 'fonts'), path.join(packageRoot, 'dist', 'fonts'), { recursive: true });
console.log(`prism-ui: styles.css + fonts → dist (${themes.split('.prism-').length - 1} theme scopes)`);
