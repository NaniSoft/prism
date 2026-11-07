/**
 * Distribution-isolation proof (Mission Gate J).
 *
 * This packs the publishable tarballs, scaffolds two clean consumers outside
 * the monorepo (a Vite CSR app and a Next.js static-export app), installs the
 * tarballs onto them with real file installs, and builds both. Neither consumer
 * has a Tailwind config, a PostCSS config, a Sass setup, a globals stylesheet
 * or a competing icon/font source: the one stylesheet and the DS* components
 * are the whole styling story, which is the entire claim in
 * `docs/asset-contract.md` and `README.md` — and the claim is proved by
 * building, not by reading a manifest.
 *
 * Precondition: `pnpm build` has emitted `packages/ui/dist` and
 * `packages/tokens/dist`. The script packs what is on disk, exactly like
 * `verify-tarballs.mjs`, so a stale `dist` fails here for the honest reason
 * rather than a scaffold error.
 *
 * Usage:
 *   node scripts/test-clean-consumer.mjs              (vite + next)
 *   node scripts/test-clean-consumer.mjs --consumer=vite
 *   node scripts/test-clean-consumer.mjs --consumer=next
 *   node scripts/test-clean-consumer.mjs --keep       (leave temp dirs)
 */

import { execSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, statSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ROOT = process.cwd()
const CONSUMER = (process.argv.find((a) => a.startsWith('--consumer=')) ?? '--consumer=all').slice('--consumer='.length)
const KEEP = process.argv.includes('--keep')

if (!['vite', 'next', 'all'].includes(CONSUMER)) {
  console.error(`clean-consumer: unknown --consumer ${JSON.stringify(CONSUMER)} (vite|next|all)`)
  process.exit(1)
}

const failures = []
const fail = (message) => failures.push(message)

function run(command, cwd, label) {
  const result = spawnSync(command, { cwd, shell: true, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  if (result.status !== 0) {
    const tail = [result.stdout ?? '', result.stderr ?? ''].join('\n').slice(-4000)
    fail(`${label}: \`${command}\` exited ${result.status}\n${tail}`)
    return false
  }
  console.log(`  ok ${label}`)
  return true
}

function write(file, content) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, content, 'utf8')
}

function assertContains(haystack, needle, label) {
  if (!String(haystack).includes(needle)) fail(`${label}: missing ${JSON.stringify(needle)}`)
}

const uiDist = path.join(ROOT, 'packages', 'ui', 'dist', 'styles.css')
const tokensDist = path.join(ROOT, 'packages', 'tokens', 'dist', 'theme.css')
if (!existsSync(uiDist) || !existsSync(tokensDist)) {
  console.error(`clean-consumer: dist is missing. Run \`pnpm build\` first.`)
  process.exit(1)
}

const scratch = mkdtempSync(path.join(os.tmpdir(), 'prism-clean-'))
const packDir = path.join(scratch, 'pack')
mkdirSync(packDir, { recursive: true })

console.log(`clean-consumer: scratch ${scratch}`)

function pack(pkgDir) {
  execSync(`pnpm pack --pack-destination "${packDir}"`, { cwd: pkgDir, stdio: ['ignore', 'pipe', 'inherit'] })
}

pack(path.join(ROOT, 'packages', 'tokens'))
pack(path.join(ROOT, 'packages', 'ui'))

const tgz = (prefix) => {
  const name = readdirSync(packDir).find((n) => n === prefix)
  if (!name) {
    fail(`pack: ${prefix} was not produced`)
    return null
  }
  return path.join(packDir, name)
}

// find tarballs by package name embedded in filename (pnpm names them <name>-<version>.tgz)
const tokensTgz = readdirSync(packDir).find((n) => n.includes('prism-tokens'))
const uiTgz = readdirSync(packDir).find((n) => n.includes('prism-ui') && !n.includes('prism-tokens'))
if (!tokensTgz || !uiTgz) {
  console.error(`clean-consumer: packed ${readdirSync(packDir).join(', ')}`)
  process.exit(1)
}
const tokensTar = path.join(packDir, tokensTgz)
const uiTar = path.join(packDir, uiTgz)
console.log(`clean-consumer: ${tokensTgz}, ${uiTgz}`)

// The packed manifest must be publishable: no workspace protocol left, peer deps intact.
const uiPkg = JSON.parse(execSync(`tar -xzOf "${uiTar}" package/package.json`, { encoding: 'utf8' }))
if (String(uiPkg.dependencies?.['@nanisoft/prism-tokens']).includes('workspace:')) {
  fail(`packed @nanisoft/prism-ui still references workspace: for prism-tokens`)
}
assertContains(JSON.stringify(uiPkg.peerDependencies), '^19.2.0', 'packed peerDeps')
const uiSideEffects = JSON.stringify(uiPkg.sideEffects ?? '')
assertContains(uiSideEffects, '.css', 'packed sideEffects')
for (const chunk of ['dist/styles.css', 'dist/assets/manifest.json', 'dist/components/ui/ds-image.js', 'dist/components/ui/ds-icon.js']) {
  const listed = execSync(`tar -tzf "${uiTar}"`, { encoding: 'utf8' })
  assertContains(listed, `package/${chunk}`, `tarball lists ${chunk}`)
}

// ── Vite consumer ────────────────────────────────────────────────────────────
if (CONSUMER === 'vite' || CONSUMER === 'all') {
  const app = path.join(scratch, 'vite-app')
  const relUi = path.relative(app, uiTar).split(path.sep).join('/')
  const relTokens = path.relative(app, tokensTar).split(path.sep).join('/')
  write(
    path.join(app, 'package.json'),
    JSON.stringify(
      {
        name: 'prism-clean-vite',
        private: true,
        type: 'module',
        scripts: { build: 'vite build' },
        dependencies: {
          react: '^19.3.0',
          'react-dom': '^19.3.0',
          '@nanisoft/prism-ui': `file:${relUi}`,
          '@nanisoft/prism-tokens': `file:${relTokens}`,
        },
        devDependencies: { vite: '^6.0.0', '@vitejs/plugin-react': '^4.3.0' },
      },
      null,
      2,
    ),
  )
  write(path.join(app, 'vite.config.js'), `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({ plugins: [react()] })\n`)
  write(
    path.join(app, 'index.html'),
    `<!doctype html>\n<html lang="en" data-pack="lavender" class="dark">\n  <head><meta charset="utf-8" /><title>clean vite</title></head>\n  <body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body>\n</html>\n`,
  )
  write(
    path.join(app, 'src', 'App.jsx'),
    `import { Button } from '@nanisoft/prism-ui/components/button'\nimport { DSImage } from '@nanisoft/prism-ui/components/ds-image'\nimport { DSIcon } from '@nanisoft/prism-ui/components/ds-icon'\nimport { DSLogo } from '@nanisoft/prism-ui/components/ds-logo'\nimport { DSAvatar } from '@nanisoft/prism-ui/components/ds-avatar'\nimport { DSIllustration } from '@nanisoft/prism-ui/components/ds-illustration'\nimport { DSVideo } from '@nanisoft/prism-ui/components/ds-video'\nimport { DSMediaCard } from '@nanisoft/prism-ui/components/ds-media-card'\nimport { DSStack } from '@nanisoft/prism-ui/components/ds-stack'\nimport { DSGrid } from '@nanisoft/prism-ui/components/ds-grid'\nimport { PrismProvider } from '@nanisoft/prism-ui/provider'\n\nexport default function App() {\n  return (\n    <PrismProvider defaultPack="lavender" defaultMode="dark">\n      <DSStack gap="md">\n        <div data-pack="mint">\n          <DSGrid columns={3} gap="md">\n            <DSImage src="/hero.webp" alt="Shipped product surface" variant="hero" />\n            <DSIcon name="settings" size="lg" label="Settings" />\n            <DSLogo src="/logo.svg" alt="NaniSoft" />\n            <DSAvatar name="Ada Lovelace" src="/ada.webp" />\n            <DSIllustration src="/diagram.svg" alt="Brokerages drive trading" />\n            <DSVideo src="/demo.mp4" label="Walkthrough" captions={[]} variant="hero" />\n          </DSGrid>\n          <DSMediaCard image={{ src: '/cover.webp', alt: 'Release capsule in light' }} title="Release capsule" />\n          <Button>Continue</Button>\n        </div>\n      </DSStack>\n    </PrismProvider>\n  )\n}\n`,
  )
  write(path.join(app, 'src', 'main.jsx'), `import '@nanisoft/prism-ui/styles.css'\nimport { createRoot } from 'react-dom/client'\nimport App from './App.jsx'\n\ncreateRoot(document.getElementById('root')).render(<App />)\n`)

  const consumerPkg = JSON.parse(readFileSync(path.join(app, 'package.json'), 'utf8'))
  for (const key of Object.keys({ ...consumerPkg.dependencies, ...consumerPkg.devDependencies })) {
    if (/tailwind|postcss|sass|css-loader|style-loader/.test(key)) fail(`vite consumer must not install ${key}`)
  }
  if (existsSync(path.join(app, 'tailwind.config.js')) || existsSync(path.join(app, 'postcss.config.js'))) {
    fail('vite consumer must not carry a tailwind or postcss config')
  }
  if (existsSync(path.join(app, 'src', 'main.css')) || existsSync(path.join(app, 'src', 'globals.css'))) {
    fail('vite consumer must not carry a custom stylesheet')
  }

  if (run('npm install --no-audit --no-fund', app, 'vite install')) {
    if (run('npx vite build', app, 'vite build')) {
      const dist = path.join(app, 'dist')
      if (!existsSync(path.join(dist, 'index.html'))) fail('vite consumer: dist/index.html missing')
      const files = []
      const walk = (d) => {
        for (const e of readdirSync(d, { withFileTypes: true })) {
          const f = path.join(d, e.name)
          if (e.isDirectory()) walk(f)
          else files.push(f)
        }
      }
      walk(dist)
      const css = files.filter((f) => f.endsWith('.css'))
      if (css.length === 0) fail('vite consumer: no CSS emitted, so the one stylesheet did not reach the bundle')
      else {
        const text = readFileSync(css[0], 'utf8')
        assertContains(text, '--aspect-hero', 'vite bundle CSS')
        assertContains(text, '--breakpoint-xl', 'vite bundle CSS')
      }
      const fonts = readdirSync(path.join(app, 'node_modules', '@nanisoft', 'prism-ui', 'dist', 'fonts'))
      if (fonts.filter((f) => f.endsWith('.woff2')).length < 3) fail('vite consumer: Inter faces missing from the installed package')
      console.log(`clean-consumer: vite build ${files.length} file(s); css ${css.length}; fonts ${fonts.length}`)
    }
  }
}

// ── Next.js consumer ─────────────────────────────────────────────────────────
if (CONSUMER === 'next' || CONSUMER === 'all') {
  const app = path.join(scratch, 'next-app')
  const relUi = path.relative(app, uiTar).split(path.sep).join('/')
  const relTokens = path.relative(app, tokensTar).split(path.sep).join('/')
  write(
    path.join(app, 'package.json'),
    JSON.stringify(
      {
        name: 'prism-clean-next',
        private: true,
        scripts: { build: 'next build', start: 'next start' },
        dependencies: {
          next: '^16.3.5',
          react: '^19.3.0',
          'react-dom': '^19.3.0',
          '@nanisoft/prism-ui': `file:${relUi}`,
          '@nanisoft/prism-tokens': `file:${relTokens}`,
        },
        devDependencies: { typescript: '^5.7.0', '@types/react': '^19.0.0', '@types/node': '^22.0.0' },
      },
      null,
      2,
    ),
  )
  write(path.join(app, 'next.config.mjs'), `/** @type {import('next').NextConfig} */\nexport default { output: 'export' }\n`)
  write(
    path.join(app, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2017',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          paths: { '@/*': ['./*'] },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      },
      null,
      2,
    ),
  )
  write(
    path.join(app, 'app', 'layout.tsx'),
    `import type { ReactNode } from 'react'\nimport '@nanisoft/prism-ui/styles.css'\nimport { PrismThemeScript } from '@nanisoft/prism-ui/provider'\nimport { themeAttributes } from '@nanisoft/prism-ui/theming'\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="en" suppressHydrationWarning {...themeAttributes({ pack: 'mint', mode: 'dark' })}>\n      <head><PrismThemeScript defaultPack="mint" defaultMode="dark" /></head>\n      <body>{children}</body>\n    </html>\n  )\n}\n`,
  )
  write(
    path.join(app, 'app', 'page.tsx'),
    `import { Button } from '@nanisoft/prism-ui/components/button'\nimport { DSImage } from '@nanisoft/prism-ui/components/ds-image'\nimport { DSIcon } from '@nanisoft/prism-ui/components/ds-icon'\nimport { DSStack } from '@nanisoft/prism-ui/components/ds-stack'\nimport { DSGrid } from '@nanisoft/prism-ui/components/ds-grid'\n\nexport default function Page() {\n  return (\n    <DSStack gap="md">\n      <DSGrid columns={2} gap="md">\n        <DSImage src="/hero.webp" alt="Shipped product surface" variant="hero" />\n        <DSIcon name="search" label="Search" />\n      </DSGrid>\n      <Button>Continue</Button>\n    </DSStack>\n  )\n}\n`,
  )

  const consumerPkg = JSON.parse(readFileSync(path.join(app, 'package.json'), 'utf8'))
  for (const key of Object.keys(consumerPkg.dependencies ?? {})) {
    if (/tailwind|postcss|sass/.test(key)) fail(`next consumer must not install ${key}`)
  }
  if (existsSync(path.join(app, 'app', 'globals.css'))) fail('next consumer must not carry a custom stylesheet')

  if (run('npm install --no-audit --no-fund', app, 'next install')) {
    if (run('npx next build', app, 'next build')) {
      const out = path.join(app, 'out')
      if (!existsSync(path.join(out, 'index.html'))) fail('next consumer: out/index.html missing')
      const html = existsSync(path.join(out, 'index.html')) ? readFileSync(path.join(out, 'index.html'), 'utf8') : ''
      assertContains(html, 'Shipped product surface', 'next static HTML')
      const staticDir = path.join(out, '_next', 'static')
      if (!existsSync(staticDir)) fail('next consumer: no _next/static emitted')
      else {
        const cssFiles = []
        const walk = (d) => {
          for (const e of readdirSync(d, { withFileTypes: true })) {
            const f = path.join(d, e.name)
            if (e.isDirectory()) walk(f)
            else if (f.endsWith('.css')) cssFiles.push(f)
          }
        }
        walk(staticDir)
        if (cssFiles.length === 0) fail('next consumer: no CSS under _next/static')
        else {
          const text = readFileSync(cssFiles[0], 'utf8')
          assertContains(text, '--aspect-hero', 'next bundle CSS')
          assertContains(text, '--breakpoint-xl', 'next bundle CSS')
        }
        console.log(`clean-consumer: next export ${cssFiles.length} css file(s)`)
      }
    }
  }
}

if (!KEEP) rmSync(scratch, { recursive: true, force: true })

console.log(`\nclean-consumer: ${failures.length === 0 ? 'all pass' : `${failures.length} failed`} (${CONSUMER})`)
if (failures.length > 0) {
  for (const failure of failures) console.error(`  FAIL ${failure}`)
  process.exit(1)
}
// keep prints for CI logs
void statSync
console.log('clean-consumer: distribution isolation holds: tarball-only install, ESM exports, one stylesheet, no consumer tooling')
