/**
 * The pretty Markdown mirror, rewritten before asset serving.
 *
 * The mirror is a copied tree under `out/md/**`, and Cloudflare serves it only
 * if the Worker is invoked first. These section slugs and the globs in
 * `wrangler.jsonc`'s `run_worker_first` are the same set, kept in sync by hand;
 * a route-style `:slug*.md` pattern silently never matches, which is why the
 * config uses globs.
 */
export const MD_SECTIONS = [
  'docs',
  'components',
  'blocks',
  'pages',
  'foundations',
  'content',
] as const

export function rewriteMdPathname(pathname: string): string | null {
  const match = /^\/([^/]+)\/(.+)\.md$/.exec(pathname)
  if (!match) return null
  const [, section, rest] = match
  if (!section || !rest) return null
  if (!(MD_SECTIONS as readonly string[]).includes(section)) return null
  return `/md/${section}/${rest}.md`
}
