// Remove the previous declaration output before tsc so deleted components do
// not remain publishable or visible to the docs/API extractor.
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
rmSync(path.join(packageRoot, 'dist'), { recursive: true, force: true });
