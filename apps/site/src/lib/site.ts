/**
 * The three facts every surface that identifies this site reads.
 *
 * The name, the description and the origin appear in the root metadata, the
 * structured data, the sitemap, the robots file and the share card, and they are
 * stated once here for the reason the Section manifest is stated once: five
 * surfaces that each name the site separately is five surfaces that will
 * eventually name it five ways. A name that differs between the share card and
 * the page is not a small difference, because the share card is the one a
 * reader meets before the page.
 *
 * The origin is the Worker's custom domain from `wrangler.jsonc` rather than a
 * value read from a request. The site is a static export, so there is no request
 * at build time to read a host from, and a build that guessed would publish one
 * deployment's hostname into every other deployment's pages. It is written as a
 * literal because it is the one thing in this repository a build cannot derive:
 * `wrangler.jsonc` declares the route as a Cloudflare pattern, and parsing that
 * for a hostname would couple the site's identity to the Worker's config format
 * to save eleven characters.
 *
 * Nothing here imports anything. The module is read by the root layout, by the
 * metadata route and by a page component, and the first of those is rendered on
 * every request, so a module graph here is a module graph on every page.
 */

/** The site's canonical name, as its own pages and its share cards both say it. */
export const SITE_NAME = 'Prism'

/**
 * One sentence describing what the site is, for the places that show a
 * description rather than a body of copy: the metadata, the share card and the
 * sitemap.
 *
 * It names the three things the site actually is and none of the things it is
 * not. "Token-driven component and block catalog" was the previous wording and
 * it described one seventh of the site to a reader who had not arrived yet: the
 * site documents Components, Blocks, Pages and the tokens underneath all four,
 * and a reader choosing between this and a component gallery is deciding on the
 * first clause.
 */
export const SITE_DESCRIPTION =
  'Prism is the NaniSoft design system: a DTCG token pipeline, a React library of Components, Blocks and Pages you compose without writing CSS, and the documentation for all of it.'

/** The origin every relative URL in the site's metadata resolves against. */
export const SITE_URL = new URL('https://prism.nanisoft.com')
