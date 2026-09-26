import localFont from 'next/font/local'

/**
 * Self-hosted Inter.
 *
 * The authored token stack (`--font-sans`) names Inter first, but until this
 * module the site shipped no Inter file, so every page silently fell back to
 * the platform UI face. `next/font/local` loads the official Inter variable
 * font at build time, emits the `@font-face` rules with a metric-adjusted
 * fallback, and exposes the loaded family through the `--font-sans` custom
 * property.
 *
 * The class is applied to `<body>`, so the property is set on the element
 * itself rather than inherited from `:root`. A directly applied custom property
 * always wins over an inherited one, which is what keeps this override out of a
 * cascade fight with the token package's own `@theme static` block. The token
 * source stays as authored; only the site's resolved value points at the file.
 *
 * Inter is licensed under the SIL Open Font License 1.1. The license text is
 * committed beside the fonts in `src/fonts/LICENSE.txt` and recorded in
 * `THIRD-PARTY-NOTICES.md`.
 */
export const inter = localFont({
  src: [
    { path: '../fonts/InterVariable.woff2', weight: '100 900', style: 'normal' },
    { path: '../fonts/InterVariable-Italic.woff2', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-sans',
  display: 'swap',
  fallback: [
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  adjustFontFallback: 'Arial',
})
