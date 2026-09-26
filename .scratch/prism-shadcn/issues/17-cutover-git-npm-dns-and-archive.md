---
Labels: wayfinder:task
Type: task
Status: resolved
Blocked by: 13, 14, 15, 16
---

# Cutover: git, npm, DNS, and archiving the old repository

## Question

Nothing exists until this runs. The plan is a document; this is the list of
things a human has to do, in order, with the facts each step needs recorded so
the ones after it can rely on them.

There is no decision in this ticket. It is the one ticket that does rather than
decides, and it earns its place by unblocking nothing and delivering the
destination.

Run it in this order.

1. **Create the repository.** Initialise git here, on a fresh history, with the
   first commit being the plan this map produced. Push to a new public
   repository. Record the remote URL, the default branch name, and who has
   admin. `NaniSoft/prism` is not overwritten and not renamed; it stays public
   and untouched as an archive.
2. **Carry the content across.** Copy the old repository's prose: guides, blog
   posts, per-item guidance that the inventory classified as portable, the
   brand policy page, and the licence and third-party notices. Record what was
   copied verbatim, what was rewritten, and what was dropped, because the
   dropped list is the honest record of what the rebuild cost.
3. **Set npm metadata.** Scope access, package descriptions, `homepage`,
   `repository` including `directory`, `author`, `license`, `files`,
   `sideEffects`, `engines`. Every `package.json` currently says version
   `0.0.0` and the scope is a placeholder, so this is the step that makes the
   packages publishable at all.
4. **Verify a dry run.** Publish every package to a scratch tag or with
   `--dry-run`, and inspect the resulting tarball contents. Confirm the file
   list is what the package promises, that no source file or test leaks in, and
   that the stylesheet and token artifacts a consumer needs are actually
   present. `publint` is the floor, not the ceiling.
5. **Resolve the publish credentials.** Execute the checklist from the release
   lane ticket. Confirm the token's account is in the organisation and that the
   secret's repository visibility includes public repositories. Record where the
   token lives and who holds it, without putting it in this repository.
6. **Publish the major.** Publish all four packages as the new major version.
   Verify on the registry that the versions resolve, that the tarball is
   installable in a scratch project outside this repository, and that a
   consumer can import a component, import the stylesheet, select a pack and a
   mode, and render.
7. **Deprecate the old versions.** Mark the previous versions deprecated on npm
   with a message pointing at the new major and the migration notes. They are
   not unpublished. Record which versions were deprecated.
8. **Move the domain.** Point `prism.nanisoft.com` at the new site's Worker.
   The old repository's map records that the Workers Custom Domain attachment
   auto-creates the DNS record, so confirm whether the existing record needs
   changing or whether a new attachment does it. Then verify in a browser, at
   desktop and mobile sizes, in both modes: the landing route, a docs route, a
   per-item route, the themes route, `llms.txt`, a per-item Markdown mirror, and
   the MCP endpoint answering a real protocol request.
9. **Verify the agent surface end to end.** Fetch `llms.txt` from the live
   domain and confirm its links resolve. Call the MCP endpoint for one
   component's documentation, its props, and its source, and confirm the answers
   describe the new system rather than the old one. This is the check that
   catches stale artifacts, because a corpus that still documents Spectral
   Refraction is worse than no corpus.
10. **Write the migration note.** A single document for existing consumers:
    what changed, the old package and API names against the new ones, the old
    pack identifiers against the new ones, and the copy-out workflow against
    the library workflow. Publish it on the site and in the repository root.
11. **Close the map.** Record the resolution on this ticket, append the pointer
    to the map's Decisions so far, and confirm no fog remains that the
    destination needs.

Do not edit the old repository at any point. It is the archive and the record
of why the previous system looked the way it did.

## Answer

### What this is, and what it is not

This ticket is the one that acts rather than decides, so its resolution is the
runbook an operator executes, not the act itself. Nothing external was run from
this session: no repository was created, nothing was published, no DNS record
was touched, the old repository was not edited, and no dependency was installed.
Every concrete fact below is pulled from the resolved tickets rather than
restated generically, and every step is tagged with an owner.

### State of this working directory at resolution time

- The root file set ticket 14 wrote is present on disk: `PRODUCT.md`,
  `CONTEXT.md`, `DESIGN.md`, `AGENTS.md`, `README.md`, `CONTRIBUTING.md`,
  `LICENSE`, `THIRD-PARTY-NOTICES.md`, `CODEOWNERS`,
  `.github/pull_request_template.md` and `.editorconfig`. `CLAUDE.md` was
  deliberately not written (ticket 14, "Deviations").
- The rest of the tree is still the pre-rebuild layout: `packages/tokens`,
  `packages/registry`, `apps/docs`, root `package.json` shelling to `@ds/*` at
  `0.0.0`, no `.changeset/`, no `.github/workflows/`, no release scripts. The
  rename to `packages/ui`, `packages/llms`, `packages/mcp-server` and
  `apps/site`, and the version and metadata edits, are the map's implementation
  work (tickets 05 to 16), not external actions. They are local and
  credential-free, and they are a precondition for steps 3 onward. This ticket
  does not perform them because this session is barred from editing `packages/`
  and `apps/` and from installing dependencies.

### Local versus human: the split

The line is credentials and org membership, not difficulty. Everything that
touches npm the organisation, the GitHub organisation, or the Cloudflare account
needs a human; everything else can be done in this working directory.

| Step | Owner | Why |
| --- | --- | --- |
| 1. Create and push the repository | **human**, GitHub org admin | needs to create `NaniSoft/prism` on GitHub and hold admin |
| 2. Carry the content across (the record) | **local agent**, no credentials | reads the public archive and this repository's research only |
| 3. Set npm metadata | **local agent**, no credentials | edits `package.json` files in this working directory |
| 4. Verify a dry run | **local agent**, no credentials | packs and inspects tarballs locally |
| 5. Resolve publish credentials | **human**, npm org owner | trusted publisher config and 2FA live on npmjs.com |
| 6. Publish the major | **human**, npm org owner plus GitHub environment approver | dispatches `publish.yml` |
| 7. Deprecate the old versions | **human**, npm org owner | `npm deprecate` on the old package versions |
| 8. Move the domain | **human**, Cloudflare account admin | Cloudflare Custom Domain and DNS |
| 9. Verify the agent surface end to end | **agent**, no credentials | fetches the live domain once steps 6 and 8 land |
| 10. Write the migration note | **local agent**, done here; site copy at publish | `MIGRATION.md` is drafted in this working directory |
| 11. Close the map | **orchestrator**, local | edits `map.md`, which this ticket does not |

Steps 3 and 4 need the rebuild implemented first (the `@ds/*` to `@nanisoft/*`
renames and the build). That implementation is local, credential-free, and owned
by tickets 05 to 16; it is named here so step 3 is not attempted against the
current `0.0.0` tree.

### 1. Create the repository

Owner: **human with GitHub org admin.**

- Initialise git here, on a fresh history (this directory is not a git
  repository today). The first commit is the plan this map produced: the
  `.scratch/prism-shadcn/` map, its tickets, its research and its prototype,
  plus the root file set ticket 14 wrote.
- Push to a **new public repository**. `NaniSoft/prism` is not overwritten and
  not renamed; it stays public and untouched as an archive.
- Record the remote URL, the default branch name (`main`), and who has admin.
- `NaniSoft/prism` public and default branch `main` is precondition 1 of the
  npm checklist (ticket 16, section 4), so recording it is not bookkeeping.

### 2. Carry the content across

Owner: **local agent, no credentials.** The inventory from ticket 01 is the
source; no new reading of the archive is strictly required, but the archive is
public. Record, as the honest cost of the rebuild, what was copied, rewritten
and dropped.

- **Verbatim, carried:** 37 of the 43 one-line catalogue descriptions (ticket
  11, section 2), reassigned to the checked catalogue's `description` field,
  subject to the dash gate and to item renames. The corpus **generator**
  (`packages/llms/src`, four modules, 16,867 bytes) is ported by ticket 12, not
  carried as content.
- **Rewritten:** all six guides (Quickstart, Architecture, Composition, Theming,
  Agent workflow, Brand policy). Section-level moves: Quickstart's `For agents`
  goes to Agent workflow; Architecture's `Source-to-corpus pipeline` goes to
  Agent workflow and Architecture keeps a one-paragraph summary; Composition's
  `Explore the catalog` is dropped; nothing is merged or dropped as a whole.
  The brand policy page's "What is ours" identifiers and its
  `createPrismTheme()` status line are removed while the licence mechanics, the
  may/may-not structure and the unregistered-marks reasoning are preserved. The
  14 ported demos are re-expressed against the new API, not copied. Six
  descriptions are rewritten (`card`, `typography`, `auth-page`, plus three for
  dropped items).
- **Dropped:** all 43 generated per-item stubs (a 452-byte template with zero
  `##` headings), the five demos whose items do not ship (`component-demo`,
  `site-header`, `site-footer`, `docs-shell`, `blog-layout`), the blog and
  `/rss.xml` (never had a post), every old per-item URL and per-theme deep link,
  and all non-site prose the inventory excluded (the ADRs, `.scratch/prism/`,
  the old root documents).
- The licence and third-party notices are re-authored rather than copied:
  `LICENSE` is a thin MIT, copyright NaniSoft, 2026, and
  `THIRD-PARTY-NOTICES.md` is new and covers Base UI, Tailwind, fumadocs,
  Lucide, Inter and the rest of the dependency set (ticket 14, section 8).

### 3. Set npm metadata

Owner: **local agent, no credentials.** This is the step that makes the packages
publishable at all: every `package.json` currently says `0.0.0` and the scope is
the `@ds/*` placeholder.

- Package names and scope, exactly: `@nanisoft/prism-tokens`,
  `@nanisoft/prism-ui`, `@nanisoft/prism-llms`, `@nanisoft/prism-mcp-server`.
  The site is `@nanisoft/site`, private.
- Versioning policy (ticket 16, section 9): `fixed: []`; `linked:
  [["@nanisoft/prism-tokens", "@nanisoft/prism-ui"]]`;
  `updateInternalDependencies: "patch"`;
  `bumpVersionsWithWorkspaceProtocolOnly: true`. The tokens and ui pair share a
  version; llms and mcp-server version independently.
- Per-package `package.json`: `homepage` (the site), `repository` including
  `directory`, `author`, `license: MIT`, `files: ["dist"]`, `sideEffects`,
  `engines`, and `repository.url` exactly
  `git+https://github.com/NaniSoft/prism.git` (case-sensitive, or provenance
  silently fails; checklist item 4).
- Exports each package publishes:
  - `prism-tokens`: `.` to `./dist/index.js`; `./css/*` to `./dist/*.css`;
    `./dist/*`; `./package.json`. `sideEffects: ["*.css"]`.
  - `prism-ui`: twelve keys, the ticket 07 contract: `.`, `./provider`,
    `./components`, `./components/*`, `./blocks`, `./blocks/*`, `./pages`,
    `./pages/*`, `./theming`, `./catalog`, `./styles.css`, `./package.json`.
    `sideEffects: ["*.css"]` (never `false`; the package ships a stylesheet).
  - `prism-llms`: `.` (the `PrismDocsStore` type and guard) and `./data.json`
    (the raw store). `files: ["dist"]`.
  - `prism-mcp-server`: `.` (the transport-free `createPrismMcpServer(store)`
    factory). No `bin` at launch (ticket 13, section 7); stdio clients use
    `npx mcp-remote https://prism.nanisoft.com/mcp`.
- `privatePackages: { "version": false, "tag": false }` in
  `.changeset/config.json`, so `@nanisoft/site` is neither versioned nor tagged
  and never appears in a changelog.
- Add a `major` changeset for the rebuild before merging. The validator requires
  a body and a `# Migration` section on a major; point that section at
  `MIGRATION.md`.

### 4. Verify a dry run

Owner: **local agent, no credentials.**

- `publint` is the floor and stays `prepublishOnly` on all four packages.
- Above it, `scripts/verify-tarballs.mjs` packs each publishable package and
  asserts: `LICENSE` present; `THIRD-PARTY-NOTICES.md` present;
  `repository.url` exactly `git+https://github.com/NaniSoft/prism.git` and
  `repository.directory` correct; no `**/src/**`, no `**/*.test.*`, no
  `**/*.spec.*`, no `**/__tests__/**`, no stray `tsconfig*.json`; `dist/` for
  all four, `dist/styles.css` for `prism-ui`, `dist/data.json` for `prism-llms`.
- The rehearsal is `publish.yml` with `dry_run: true`, which runs the full build
  and `pnpm -r --filter "./packages/*" publish --dry-run --no-git-checks`
  without touching the registry. Inspect the resulting tarballs: the file list
  must be exactly `dist/`, `LICENSE`, `THIRD-PARTY-NOTICES.md`, `package.json`,
  `README.md`.
- `ci.yml` runs `verify-tarballs.mjs --mode=verify` on every PR and push (pack
  only, no tag assertions).

### 5. Resolve the publish credentials

Owner: **human with npm org owner rights.** This is the step that has already
failed twice, so it is a checklist and not a memory.

Preferred path, npm trusted publishing over OIDC, no long-lived token. The four
names are already published, so a trusted publisher is configurable before the
first publish from this repository. Pre-first-publish checklist (ticket 16,
section 4):

1. `NaniSoft/prism` exists, is public, default branch `main`.
2. The npm account that owns the four packages is signed in with 2FA on
   (required to save a trusted publisher).
3. For each of the four packages: npmjs.com, the package, Settings, Trusted
   Publisher, GitHub Actions, and enter exactly: Organization or user
   `NaniSoft`; Repository `prism`; Workflow filename `publish.yml`; Environment
   name `npm-publish`; Allowed actions direct `npm publish`.
4. Every `package.json` `repository.url` matches the GitHub repo
   case-sensitively (step 3).
5. GitHub repository settings: "Allow GitHub Actions to create and approve pull
   requests" is on; default workflow permissions may stay `read`, and
   `release.yml` and `publish.yml` elevate per job.
6. `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are **repository** secrets,
   not org secrets. The account id is
   `3185310fec380cda3828cbdd9bd26be1` per the old record.
7. Branch protection on `main` requires the `ci.yml` `verify` check.
8. Run the rehearsal from step 4.
9. Publish for real (step 6). Then, per package, set Settings, Publishing access,
   "Require two-factor authentication and disallow tokens", and delete the old
   `NPM_TOKEN` org or repo secret.

**The two historical failure causes, resolved explicitly:**

- The org-level `NPM_TOKEN` was scoped to **private repositories only**, so it
  never reached a public repository's CI. This is why the preferred path is
  repository secrets plus trusted publishing, and why a fallback org secret must
  be visible to `prism` ("All repositories" or a selected list including it).
- The publish token belonged to an account **outside the organisation**. npm
  reports that as a **404, not a 403**, because it hides scopes the account
  cannot publish to. The account must be a member of the `nanisoft` org with
  publish rights.

Fallback token path, if OIDC is ever unavailable: a granular access token with
`Packages: Read and write`, scoped to `@nanisoft`, **Bypass 2FA** enabled, owned
by an org member with publish rights. Note the recorded trap: the old `.npmrc`
auth key typo (`registry.npmjs.og`) was silent because npm fell back to a session
token. The new root `.npmrc` carries no auth key at all, and `setup` is called
with no `registry-url` on the OIDC path.

Record where the token lives and who holds it, without putting it in this
repository.

### 6. Publish the major

Owner: **human**, npm org owner, plus the `npm-publish` environment approver.

- Merge the "Version Packages" PR, then Actions, Publish, Run workflow on
  `main`, `channel: latest`, `dry_run: false`. `environment: npm-publish`
  requires a reviewer, so a merge alone never publishes.
- `publish.yml` re-runs the `gates` composite, runs
  `verify-tarballs.mjs --mode=prepublish`, publishes with
  `pnpm publish` (not `npm publish`, because `workspace:*` must be rewritten),
  then runs `--mode=postpublish`. `NPM_CONFIG_PROVENANCE: 'true'` is set in the
  job env, because `changeset publish` cannot pass a flag through and pnpm
  attaches provenance through its own option. `pnpm` is pinned to `11.18.0`,
  above the 11.6 OIDC floor.
- Publish all four packages as the new major. The version PR produces the
  numbers; the expected first version is `1.0.0`.
- A `next` prerelease lane exists for the clean break: enter on the `next`
  branch with `pnpm changeset pre enter next`, publish with `channel: next`,
  exit with `pnpm changeset pre exit` and merge to `main`. Versions read
  `1.0.0-next.0`. Only publishable packages move, because `privatePackages` is
  off for the site.
- Verify, after publish:
  - on the registry that the versions resolve;
  - the tarball installs in a scratch project **outside this repository**;
  - a consumer can import a component, import the stylesheet, select a pack and
    a mode, and render;
  - `npm view @nanisoft/prism-ui@<version> --json` contains `dist.attestations`;
  - the `--mode=postpublish` tag assertions pass (a green publish now means
    bytes landed, closing the old lane's exit-green-on-credential-failure
    hazard).

### 7. Deprecate the old versions

Owner: **human with npm org owner rights.**

- Mark the previous published versions deprecated on npm, not unpublished:
  `prism-tokens@0.3.0`, `prism-mcp-server@0.3.0`, `prism-ui@0.4.0`,
  `prism-llms@0.4.0`. The message points at the new major and at `MIGRATION.md`.
- Record which versions were deprecated. Note the 1.0.0 that never shipped: it is
  not on npm (the four unconsumed changesets were never consumed), so there is
  nothing to deprecate for it, and the migration note reckons with it rather
  than the deprecation list.

### 8. Move the domain

Owner: **human with Cloudflare account admin.**

- Point `prism.nanisoft.com` at the new site's Worker. The Worker is
  `prism-site`, `main` is `worker/index.ts`, `compatibility_date` is
  `2026-09-01`, flags are `nodejs_compat`, observability is enabled.
- Custom Domain attachment: `routes: [{ "pattern": "prism.nanisoft.com",
  "custom_domain": true }]`. The old repository's map records that the Workers
  Custom Domain attachment **auto-creates the DNS record**, so confirm whether
  the existing record needs changing or whether a new attachment does it.
  Record which.
- Assets: `directory: "./out"`, `binding: "ASSETS"`,
  `not_found_handling: "404-page"`, `html_handling: "auto-trailing-slash"`.
- `run_worker_first` and `MD_SECTIONS` are the same set, kept in sync by the
  failing `check-worker-globs.mjs`: `MD_SECTIONS = ['docs', 'components',
  'blocks', 'pages', 'foundations', 'content']`, and the globs are `/mcp`,
  `/mcp/*`, `/<section>/*.md` for each. The recorded lesson: `run_worker_first`
  needs **glob** patterns; a route-style `:slug*.md` silently never matches, so
  the Worker is never invoked and the mirror 404s as a plain asset. Verify depth
  with `wrangler deploy --dry-run` and use `**` if a nested mirror path is ever
  introduced.
- The site deploys on every merge to `main` through `ci.yml`'s `deploy-site`
  job, after `verify`, using the `deploy` script and the repository-level
  Cloudflare secrets. It is not tied to a release.
- The MCP host allowlist is `['prism.nanisoft.com']`; a `*.workers.dev` preview
  URL would 403 the MCP route, which is why PR previews are not adopted.
- Verify in a browser, at desktop and mobile sizes, in both modes: the landing
  route `/`, a docs route, a per-item route, `/themes`, `llms.txt`, a per-item
  `.md` mirror, and the MCP endpoint answering a real protocol request.

### 9. Verify the agent surface end to end

Owner: **agent, no credentials, once steps 6 and 8 have landed.**

- Fetch `llms.txt` from the live domain and confirm its links resolve. It has
  six sections (`Guides`, `Foundations`, `Content`, `Components`, `Blocks`,
  `Pages`) where the old one had five; the old `Theming` section folded into
  `Foundations`.
- Call the MCP endpoint for one component's documentation, its props and its
  source, and confirm the answers describe the new system. This is the check
  that catches stale artifacts: a corpus that still documents Spectral
  Refraction is worse than no corpus.
- The expected MCP answers: the eight tools (`list_items`, `get_item_doc`,
  `get_item_props`, `get_item_source`, `get_theme_doc`, `list_pages`, `get_page`,
  `search_docs`); props from the generated `## Props` definition list; source is
  the public import line plus the verbatim demo; `get_theme_doc` answers packs,
  modes and the bound token groups; a lookup miss is `isError: true` with
  did-you-mean suggestions, never a throw.

### 10. Write the migration note

Owner: **local agent** for the root draft, done in this ticket; the site copy is
a publish-time step.

Written to [`MIGRATION.md`](../../../MIGRATION.md) at the repository root. It
covers, against the resolved facts:

- **What changed:** the clean break and the new library lane.
- **Package and API names:** the four unchanged package names and their last old
  versions (`prism-tokens@0.3.0`, `prism-mcp-server@0.3.0`, `prism-ui@0.4.0`,
  `prism-llms@0.4.0`); `createPrismTheme` and per-key merge removed;
  `data-theme` to `data-pack`; `beam-dark` to `class="dark"`; `./products`
  removed; the provider and theming subpaths kept but changed.
- **Pack identifiers:** old `blue, green, lavender, rose, peach` against new
  `default, blush, mint, lavender, sky, peach`, with `lavender` and `peach`
  surviving by name, `default` new, and the rest marked unconfirmed.
- **Copy-out against the library:** the old `shadcn add` lane against install
  plus import, with the prohibited actions enumerated.
- **The 1.0.0 that never shipped:** the four unconsumed changesets would have
  taken all four packages to 1.0.0; it was never published, so a consumer seeing
  it in the old changelog must not expect it on npm, and the new major is the
  first line that ships.
- **Every unknown marked explicitly** rather than invented: the exact new
  version, the pack mapping, the deprecation list, the site URL of the note, and
  whether any old version beyond the four exists.

At cutover, publish the same document on the site (it is consumer-facing) and
mark the draft banner removed only after the packages and the domain are live.

### 11. Close the map

Owner: **orchestrator; this ticket does not edit `map.md`.**

**No fog remains that the destination needs.** The map's "Not yet specified"
section is empty: the roster graduated to ticket 19, the contribution path to
ticket 14, and visual regression to ticket 15. Every question the way to the
destination needed is decided, and this ticket supplies the execution runbook.
There is no remaining gap between the settled decisions and a publishable
destination.

**Recommended closing edit for the orchestrator** (not performed here): append
one bullet to the map's "Decisions so far" list, after the ticket 12 entry:

> - [Cutover: git, npm, DNS, and archiving the old repository](issues/17-cutover-git-npm-dns-and-archive.md):
>   the one task ticket, resolved as a human-executable runbook. The root file
>   set from ticket 14 is written; `MIGRATION.md` is drafted at the repository
>   root; and the runbook splits local, credential-free work from the human
>   steps that need npm org, GitHub and Cloudflare access (repository creation
>   and push, dry run and publish, deprecation, DNS, live verification). No fog
>   remains.

No edit to `map.md` was made by this ticket.

### Files written by this ticket

- `.scratch/prism-shadcn/issues/17-cutover-git-npm-dns-and-archive.md` (this
  file: `Status: resolved` and this Answer)
- `MIGRATION.md` at the repository root (the draft migration note)

No other file was created or changed.
