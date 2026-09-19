/**
 * Copies src/styles.css into dist/ — the `./styles.css` export target. tsc
 * only emits JS/declarations, so the stylesheet needs this one copy step (the
 * site build is the first consumer; before this the export dangled).
 */
import { copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
copyFileSync(path.join(pkg, 'src', 'styles.css'), path.join(pkg, 'dist', 'styles.css'));
console.log('prism-ui: styles.css → dist/');
