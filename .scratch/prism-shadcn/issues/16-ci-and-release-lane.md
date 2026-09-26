---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 02, 05
---

# CI and release lane

## Question

**This ticket was rewritten after the release machinery research resolved. Read
this before planning.** Its original brief asked which parts of the old
repository's lane to copy. The answer is that most of the impressive parts were
never built there.

From [the findings](../research/02-old-repo-release-and-npm-machinery.md):

- There are **no composite actions**, no `CONTRIBUTING.md`, no `CODEOWNERS` and
  no root `scripts/`. The changeset validator, the title and migration rules,
  and the per-PR release preview are **coveo/plasma's**, recorded as a
  recommendation in the old repository's own scratch notes and never built.
  Those rules are available to copy from plasma directly.
- The workflow names are swapped, and `name:` is the truth: `release-pr.yml` is
  the version-PR lane on push to main, `cd.yml` is the publish lane on manual
  dispatch, and `ci.yml` carries the gates **and the site deploy**.
- There is no continuous deployment. The site ships on every merge to main.
- **Provenance is off**, established three ways. There is no `environment:`,
  no `id-token` and no `permissions:` block in the publish job, and the
  published manifests carry no attestations.
- npm auth is `NPM_TOKEN` into `NODE_AUTH_TOKEN` in the publish job only, and
  the root `.npmrc` has no auth key. The publish executable is `pnpm publish`,
  not `npm publish`.
- `privatePackages` is unset, so the private site is versioned and appears in
  changelogs.
- `stylelint` runs in CI with an empty rules object, so the CSS half of the lint
  gate is inert. A step appearing in a pipeline is not evidence it worked.
- **Four unconsumed changesets sit on `main`, one a major for all four
  packages.** Merged as they stand they would take all four to 1.0.0. The
  rebuild's major bump is therefore not the first major these names would have
  seen, and the migration note has to reckon with a 1.0.0 that never shipped.

So the lane is closer to greenfield than to a copy job. Settle:

1. **The workflow set.** Which workflows exist and what each does. Take the
   changeset rules from plasma, since they exist there and were wanted here.
   Decide which of plasma's supply-chain workflows are in scope; that is fog on
   the map, so name what is deferred rather than omitting it.
2. **Composite actions or inline steps.** The old repository inlines everything
   across three files and plasma has five composite actions. Decide, because it
   determines whether a Node or pnpm version bump is one edit or six.
3. **Trigger shape.** Whether publish is automatic on merge to main or manually
   dispatched, and whether the site deploy stays on every merge or moves to the
   release lane. Automatic publish on a four-package public scope wants an
   environment gate and a dry run; manual dispatch wants an escape hatch that is
   written down.
4. **npm authentication, as a human-executable checklist.** The old lane failed
   twice by the record: an organisation secret scoped to private repositories so
   it never reached a public repository's CI, and a publish token that turned
   out to belong to an account outside the organisation, which presents as a CI
   404. Resolve both explicitly. Produce the list of things that must be true
   before the first publish, because this is the step that has already failed.
5. **Provenance.** Whether to enable it via OIDC, what workflow permission it
   needs, and what it costs. The old lane granted nothing and used nothing.
6. **Changeset conventions.** Which of plasma's enforced rules earn their place
   and which are ceremony. The candidate rules are: a title capped at 100
   characters, no trailing period, no markdown heading in the title, no
   `BREAKING:` prefix, no markdown lists in the body, and a required migration
   section on a major. State which are adopted and which are dropped, because
   a validator that is too strict gets worked around.
7. **The release preview.** Whether a pull request gets a comment stating what
   the change would publish. plasma parses the emoji output of
   `changeset status`, which is a fragile dependency on human-formatted output.
   Decide whether to copy that or to read the changesets directly.
8. **Private package versioning.** Set `privatePackages` so the site is neither
   versioned nor tagged, which plasma does and the old repository did not.
9. **Versioning policy.** Independent per package, or fixed and linked across
   the four. The old repository used independent versioning and the versions
   drifted to 0.3.0 and 0.4.0. A component library and its token package are
   coupled enough that independent bumps can produce a broken combination, so
   decide deliberately and state the consumer's experience in each case.
10. **A prerelease lane.** The old repository had none and no `next` branch. The
    rebuild is a clean break, which is the case prereleases exist for. Decide
    whether to have one, and if so how a prerelease is ended. If plasma's
    mechanism is copied, note the recorded outcome there: prerelease versions
    ended up stranded on private packages and the mechanism was never explained.
11. **The site deploy lane.** How the site deploys, on which trigger, and
    whether a pull request gets a preview.
12. **Cache and runtime versions.** Node and pnpm pinning, the lockfile policy,
    turbo remote cache, and whether the project-local pnpm store carries over.
    The old repository adopted a local store after store corruption incidents.
13. **What a published tarball can be verified against.** The licence, the
    notices file, the repository and directory, the commit, and whether the
    version corresponds to a tagged release. `publint` is a floor.

Read the old `.github/` in full despite it being small, plus the root
`package.json`, `turbo.json` and `.npmrc`. Read plasma's `.changeset/` and
`scripts/validateChangesets.js` for the rules worth taking. Consult `cloudflare`
and `wrangler` for the site deploy, and read the current npm provenance
documentation rather than trusting the old lane's approach.

## Answer

The lane is rebuilt, not copied. Three workflows, four composite actions,
three root scripts, and a config change. Filenames say what the workflow does:
there is no `cd.yml` and no `release-pr.yml`. Every decision below is traceable
to `research/02-old-repo-release-and-npm-machinery.md` or to current npm /
pnpm / changesets documentation read on 2026-09-26.

### 1. The workflow set

Three files. Names are the truth; nothing is inferred from a filename.

| File | Trigger | Jobs |
| --- | --- | --- |
| `.github/workflows/ci.yml` | `pull_request`; `push` to `main` | `verify`, `release-preview` (PR only), `deploy-site` (push main only) |
| `.github/workflows/release.yml` | `push` to `main` and `next` | `version` |
| `.github/workflows/publish.yml` | `workflow_dispatch` only | `publish` |

`ci.yml` runs the gates on every PR and every push to `main`: `lint`,
`typecheck`, `test`, `build`, `check` (the turbo task set from ticket 05), then
`node scripts/verify-tarballs.mjs` (§13). `release-preview` runs on PRs only and
posts the release preview (§7). `deploy-site` runs on merge to `main`, needs
`verify`, and is the only deploy path (§11).

`release.yml` is the changesets version-PR lane on `main`, and additionally
versions prereleases on `next` (§10). It never publishes.

`publish.yml` is the only publisher. Manual dispatch, environment-gated (§3).

**Deferred supply-chain workflows, named rather than omitted.** None of these
ship in the first cut, and none is silently dropped:

- `.github/workflows/codeql.yml` — CodeQL code scanning. Deferred until the
  component and site packages carry real logic worth scanning; oxlint and the
  TypeScript build already cover most of what CodeQL would report on a
  seven-package TS monorepo.
- `.github/workflows/scorecards.yml` — OSSF Scorecard. Deferred; it needs the
  repo to have accumulated a scoreable history (branch protection, review
  policy) before a score means anything.
- `.github/workflows/dependency-review.yml` — `actions/dependency-review-action`
  on PRs. Deferred to the same ticket as Renovate (see below); meaningful only
  once dependency updates arrive as PRs.
- **Renovate** — `renovate.json` plus the app, not a workflow. Deferred.
- **`minimumReleaseAge`** — pnpm's dependency-age floor in
  `pnpm-workspace.yaml`. Deferred; the map records it as fog.

The one in-scope supply-chain measure taken now: every third-party action is
pinned to a full commit SHA with the release in a trailing comment
(`step-security/harden-runner` itself is deferred, consistent with plasma's
being the only thing plasma does here).

### 2. Composite actions, not inline steps

Four composite actions under `.github/actions/`, so a Node or pnpm bump is one
edit:

- `.github/actions/setup/action.yml` — `actions/setup-node` (Node from
  `.node-version`), `corepack enable pnpm`, cache the pnpm store keyed on
  `pnpm-lock.yaml`, cache `node_modules/.cache/turbo`, `pnpm install
  --frozen-lockfile`. Inputs `node-version` and `registry-url` (default empty).
- `.github/actions/build/action.yml` — `pnpm build` (turbo).
- `.github/actions/gates/action.yml` — `pnpm lint && pnpm typecheck && pnpm test
  && pnpm build && pnpm check` plus `pnpm changeset:validate`; the whole gate
  set in one step so `ci.yml` and `publish.yml` cannot drift.
- `.github/actions/comment-on-pr/action.yml` — create-or-update a PR comment
  keyed on an HTML marker (`<!-- prism-release-preview -->`), so the preview
  never spams (§7). Ported from plasma's `comment-on-pr`.

Node and pnpm appear in exactly one file: `setup`. Everything else consumes it.

### 3. Trigger shape

**Publish is manual dispatch with an environment gate.** `publish.yml`:

```yaml
on:
  workflow_dispatch:
    inputs:
      channel:
        type: choice
        options: [latest, next]
        default: latest
      dry_run:
        type: boolean
        default: false
```

The release procedure, written down: merge the "Version Packages" PR, then
Actions -> Publish -> Run workflow on `main`, `channel: latest`, `dry_run:
false`. `environment: npm-publish` puts a required reviewer in front of the
job, so a merge alone never publishes. `dry_run: true` runs the full build plus
`node scripts/verify-tarballs.mjs` and
`pnpm -r --filter "./packages/*" publish --dry-run --no-git-checks` without
touching the registry: that is the rehearsal and the escape hatch.

**The site deploys automatically on every merge to `main`** (§11). It is not
tied to a release, because docs and content ship faster than versions.

The old lane's structural hazard is closed: a credential failure used to exit
green as a no-op. Here the publish job fails loudly if `changeset publish`
finds nothing to publish while the version PR was merged (`git tag` for the
expected version already exists -> the `--assert-tags post` check fails, §13).
A green publish now means bytes landed.

### 4. npm authentication, as a human-executable checklist

**Preferred: npm trusted publishing over OIDC. No long-lived token.** The four
names are already published, so a trusted publisher can be configured on each
one before the first publish from this repository; there is no bootstrap-token
step.

Pre-first-publish checklist, each item executable by a human:

1. `NaniSoft/prism` exists, is **public**, default branch `main`.
2. The npm account that owns the four packages is signed in with 2FA **on**
   (required to save a trusted publisher).
3. For each of `@nanisoft/prism-tokens`, `@nanisoft/prism-ui`,
   `@nanisoft/prism-llms`, `@nanisoft/prism-mcp-server`: npmjs.com -> the
   package -> Settings -> Trusted Publisher -> GitHub Actions, and enter
   exactly: **Organization or user** `NaniSoft`, **Repository** `prism`,
   **Workflow filename** `publish.yml`, **Environment name** `npm-publish`,
   **Allowed actions** direct `npm publish`. (Up to 10 publishers per package;
   one is needed.)
4. Each `package.json` sets `"repository": { "type": "git", "url":
   "git+https://github.com/NaniSoft/prism.git", "directory": "packages/<name>" }`.
   `repository.url` must match the GitHub repo **case-sensitively** or
   provenance silently fails.
5. GitHub repository settings: "Allow GitHub Actions to create and approve pull
   requests" = on (the version PR needs it). Default workflow permissions may
   stay `read`; `release.yml` and `publish.yml` elevate per job.
6. `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` set as **repository**
   secrets (not org secrets). `CLOUDFLARE_ACCOUNT_ID` is
   `3185310fec380cda3828cbdd9bd26be1` per the old record.
7. Branch protection on `main` requires the `ci.yml` `verify` check.
8. Run the rehearsal: dispatch `publish.yml` with `dry_run: true`; confirm
   `node scripts/verify-tarballs.mjs` passes and the dry-run tarballs contain
   exactly `dist/`, `LICENSE`, `THIRD-PARTY-NOTICES.md`, `package.json`,
   `README.md`.
9. Dispatch `publish.yml` for real. Then, **per package**, set Settings ->
   Publishing access -> "Require two-factor authentication and disallow
   tokens", and delete the old `NPM_TOKEN` org/repo secret.

**Fallback token path, if OIDC is ever unavailable** (an escape hatch, not the
default). The token must be a **granular access token**: `Packages: Read and
write`, scoped to `@nanisoft`, **Bypass 2FA** enabled, owned by an account that
is a **member of the `nanisoft` org** with publish rights. Store it either as a
**repository** secret `NPM_TOKEN` or as an org secret whose visibility is "All
repositories" / a selected list that includes `prism`; a secret scoped to
"Private repositories only" will never reach this public repository. The
publish job then passes `registry-url: https://registry.npmjs.org` to `setup`
and `NODE_AUTH_TOKEN` from `NPM_TOKEN`. The two recorded old failures are
exactly these: **(a)** the org secret was scoped to private repositories and so
was invisible to the public repo; **(b)** the token belonged to an account
outside the org, which npm reports as **404, not 403** (npm hides scopes the
account cannot publish to). Both are preconditions above, checked before the
first publish.

One more recorded trap, carried as a habit: the old `.npmrc` auth key typo
(`registry.npmjs.og`) was silent because npm fell back to an old session
token. The new root `.npmrc` carries **no auth key at all**; OIDC is the only
CI auth source, so there is no key to typo.

### 5. Provenance: enabled, and paid for with one permission

Enabled via trusted publishing. `publish.yml` job permissions:

```yaml
permissions:
  contents: write   # git tags and GitHub Releases
  id-token: write   # OIDC: trusted publishing and provenance
```

There is no `secrets.NPM_TOKEN` in the OIDC path. Cost: nothing. The publish
job is on a GitHub-hosted runner (`ubuntu-latest`), the repository is public,
and all four packages are public, which are the three conditions provenance
requires.

**Flag vs auto-generation.** npm CLI auto-generates provenance under OIDC and
needs no `--provenance`. Our publisher is **not** npm CLI: `changeset publish`
runs the workspace's detected package manager, which is `pnpm publish`, and
`pnpm publish` attaches provenance through its own `--provenance` option.
`changeset publish` cannot pass a flag through, so the publish job sets
`NPM_CONFIG_PROVENANCE: 'true'` in its job env (pnpm reads the `npm_config_*`
environment). If a future pnpm auto-generates on OIDC, the env var is a no-op.
Verification after publish:
`npm view @nanisoft/prism-ui@<version> --json` must contain
`dist.attestations`.

Why `pnpm publish` and not `npm publish`: `@nanisoft/prism-ui` declares
`"@nanisoft/prism-tokens": "workspace:*"`. pnpm rewrites the workspace protocol
to a real range at pack time; npm would publish the literal `workspace:*` and
break every consumer. So pnpm is the correct publisher, and pnpm's OIDC
support is the floor: **pin pnpm >= 11.6** (early 11.x had the unresolved
`${NODE_AUTH_TOKEN}` placeholder regression, fixed by pnpm/pnpm#11526). We pin
`pnpm@11.18.0` (§12). To stay clear of that regression either way, `setup` is
called with **no** `registry-url` for the OIDC path: `actions/setup-node` with
`registry-url` writes `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}` into
`.npmrc`, and `registry=https://registry.npmjs.org` in the root `.npmrc`
already routes pnpm correctly without that line.

### 6. Changeset conventions: four rules adopted, four dropped

Implemented in `scripts/validate-changesets.mjs` (ported from plasma's
`validateChangesets.js`, trimmed), wired as `pnpm changeset:validate` inside the
`gates` composite.

**Adopted:**

- Frontmatter parses; every package name is a workspace package; every bump is
  `major | minor | patch`.
- The title is the first non-empty, non-comment line after frontmatter, capped
  at **100 characters**.
- The title must **not end with a period**.
- The title must **not start with `**BREAKING:**`** (a `major` already marks
  breaking).
- A `major` requires a body **and** a `# Migration` section. A `minor`
  requires a body.

**Dropped as ceremony:** title-must-not-be-a-markdown-heading; title-must-not-
start-with-a-list-marker; body-must-not-use-markdown-lists (and its fence-aware
scanner); body-headings-must-start-at-h1. These four reject ordinary careful
writing to protect a changelog that a reader can already parse. A validator that
is too strict gets worked around, which is the failure the ticket names.

### 7. The release preview: read the changesets, no emoji parsing

`scripts/release-preview.mjs` reads `.changeset/*.md` directly through the
changesets programmatic API (`@changesets/read` plus
`@changesets/assemble-release-plan`, added as devDependencies) and renders a
Markdown table of the packages and next versions that merging the PR would
release, grouped by bump. It posts/updates one PR comment through
`.github/actions/comment-on-pr` keyed on `<!-- prism-release-preview -->`.
No `changeset status` parse, no ANSI stripping, no regex over 🦋 output.
`@changesets/assemble-release-plan` is what `changesets/action` itself uses, so
linked and internal-dependency propagation is exact rather than approximated.

The preview **filters private packages** from the table (`@nanisoft/site` is
the only one) and, when `git diff` against the base shows package files changed
but no changeset exists, emits a warning comment telling the author to run
`pnpm changeset`. It is skipped on `changeset-release/*` branches. Job
permissions: `contents: read`, `pull-requests: write`.

### 8. Private package versioning

`.changeset/config.json` sets `"privatePackages": { "version": false, "tag":
false }`. `@nanisoft/site` is neither version-bumped nor tagged and never
appears in a changelog. The old repository left the key unset and so versioned
the site under changesets' runtime default. Adopted from plasma.

### 9. Versioning policy: one linked pair, two independents

```json
"fixed": [],
"linked": [["@nanisoft/prism-tokens", "@nanisoft/prism-ui"]],
"updateInternalDependencies": "patch",
"bumpVersionsWithWorkspaceProtocolOnly": true
```

- **`@nanisoft/prism-tokens` and `@nanisoft/prism-ui` are a linked pair.** They
  share a version number, so `prism-ui`'s rewritten dependency on `prism-tokens`
  (`workspace:*` -> the linked range) can never point outside tokens' published
  versions. Consumer experience: `pnpm add @nanisoft/prism-ui` selects a
  `prism-tokens` that is guaranteed compatible; there is no combination of the
  two that a consumer can install and have break. The old repository's
  independent bumps, which drifted tokens to 0.3.0 while ui sat at 0.4.0, are
  the failure this removes.
- **`@nanisoft/prism-llms` and `@nanisoft/prism-mcp-server` version
  independently.** They have no runtime dependency on the component library and
  are consumed à la carte; forcing them to move with the UI would publish empty
  versions. Consumer experience: install `@nanisoft/prism-mcp-server` at
  whatever version the MCP tool surface changed, without the component library
  moving in lockstep.

### 10. A prerelease lane: yes, on `next`, with a written exit

The clean break is exactly what prereleases are for. No new workflow: `next`
rides the existing two.

- **Enter, once:** `git switch -c next && pnpm changeset pre enter next` writes
  `.changeset/pre.json` (recording the pre tag `next`). Commit it to `next`.
- **Version:** `release.yml` fires on push to `next`; if `.changeset/pre.json`
  is absent it bootstraps `pnpm changeset pre enter next`, then runs
  `pnpm changeset:version` and commits the bump with
  `chore(release): version packages [skip ci]`. Versions become
  `1.0.0-next.0`, `1.0.0-next.1`, and so on.
- **Publish:** dispatch `publish.yml` on `next` with `channel: next`;
  changesets is in pre mode and publishes under the `next` dist-tag, so
  `@nanisoft/prism-ui@1.0.0-next.0` is installable as
  `@nanisoft/prism-ui@next` and `latest` is untouched.
- **Exit, documented:** `pnpm changeset pre exit` on `next` removes
  `.changeset/pre.json`; merge `next` into `main`. The next version PR then
  collapses the accumulated prerelease changes into a single stable release,
  and `publish.yml` on `main` publishes it to `latest`. Record the exit in the
  changelog migration note.

Only publishable packages move: `privatePackages.version: false` (§8) means the
site cannot strand a prerelease the way plasma's did.

### 11. The site deploy lane

`ci.yml`, job `deploy-site`:

```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
needs: verify
permissions: { contents: read }
steps:
  - checkout
  - setup
  - build
  - run: pnpm --filter @nanisoft/site run deploy   # node scripts/stamp-mcp-data.mjs && wrangler deploy
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

Deploy on every merge to `main`, after the gates pass, using the site's own
`deploy` script. Secrets are **repository-level** `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`; org-scoped secrets carry the visibility failure the
old lane recorded. The Worker name stays `prism-site` and the custom domain
attachment stays in `apps/site/wrangler.jsonc` (ticket 17 owns the DNS move).
No GitHub `environment` gate on the deploy; it is a content deploy, not a
release.

**Cloudflare preview URLs on pull requests are optional and not adopted.**
The mechanism, if wanted later: a `site-preview` job runs
`wrangler versions upload` (or `wrangler deploy --env preview`) to produce a
`*.workers.dev` preview URL and comments it on the PR. It is deferred because
the Worker's `allowedHostnames` pins `prism.nanisoft.com` for `/mcp`, so a
preview host would 403 the MCP route and misrepresent the site; and the static
export is reproducible from any branch. PRs get a build check via `verify`, not
a live URL.

### 12. Cache and runtime versions

- **Node: 22 LTS.** `.node-version` contains `22`; `setup` consumes it via
  `actions/setup-node`'s `node-version-file`. Root `engines.node` becomes
  `">=22.14.0"` (the floor for OIDC Node support, and the same floor the
  packages inherit). CI no longer runs 24; the declared floor is what CI runs.
- **pnpm: pinned, via corepack.** Root `packageManager` stays
  `pnpm@11.18.0`; `setup` runs `corepack enable pnpm`, so corepack installs
  exactly the pinned pnpm. No `pnpm/action-setup` with a floating version. The
  11.18.0 pin is deliberately above the 11.6 OIDC floor (§5).
- **Store:** the project-local store stays. Root `.npmrc` gets
  `store-dir=.pnpm-store` (`.pnpm-store/` gitignored), and `setup` caches
  `$(pnpm store path)` keyed on `hashFiles('pnpm-lock.yaml')` with a
  `restore-keys` prefix. The old repository adopted the local store after store
  corruption and it carries over.
- **Lockfile:** `pnpm-lock.yaml` is committed; every CI install is
  `pnpm install --frozen-lockfile`. No job ever passes
  `--no-frozen-lockfile`.
- **Turbo remote cache: deferred, and said so.** Only the local turbo cache
  (`node_modules/.cache/turbo`) is used, cached per job/ref/SHA. Remote caching
  is deferred until there is a second CI runner that benefits; no `TURBO_TOKEN`
  or `turbo login` step exists.

### 13. What a published tarball is verified against

`publint` stays as `prepublishOnly` on all four packages: that is the floor.
Above it, `scripts/verify-tarballs.mjs` packs each publishable package
(`pnpm pack --pack-destination` into a temp dir), reads the tarball with
`tar -tzf`, and asserts:

1. `LICENSE` is present.
2. `THIRD-PARTY-NOTICES.md` is present.
3. `package.json` `repository.url` is exactly
   `git+https://github.com/NaniSoft/prism.git` (case-sensitive) and
   `repository.directory` equals the package's directory.
4. No source or test file leaks: no `**/src/**`, no `**/*.test.*`, no
   `**/*.spec.*`, no `**/__tests__/**`, no `tsconfig*.json` beyond what is
   intended.
5. The artifacts a consumer needs are present: `dist/` for all four,
   `dist/styles.css` for `prism-ui`, `dist/data.json` for `prism-llms`.
6. **The version corresponds to a tagged release.** Two modes:
   `--mode=prepublish` asserts `git tag --list "@nanisoft/<pkg>@<version>"` is
   empty for every package about to publish (so publishing will create the
   tag), and `--mode=postpublish` asserts each tag now exists on the remote.
   This is the check that turns a silent no-op into a failure.

`ci.yml` runs `verify-tarballs.mjs --mode=verify` on every PR and push (pack
only, no tag assertions). `publish.yml` runs `--mode=prepublish` before the
publish step, then `--mode=postpublish` after it. The old repository's only
gate was `publint`, which cannot see a missing notices file or a leaked `src/`.

### Repository files this ticket creates

`.github/workflows/{ci,release,publish}.yml`,
`.github/actions/{setup,build,gates,comment-on-pr}/action.yml`,
`scripts/validate-changesets.mjs`, `scripts/release-preview.mjs`,
`scripts/verify-tarballs.mjs`, `.node-version`, and the updated
`.changeset/config.json`, root `.npmrc` and root `package.json` scripts
(`lint`, `typecheck`, `test`, `build`, `check`, `changeset`,
`changeset:validate`, `changeset:version`, `release`, `release:pre:enter`,
`release:pre:exit`, `release:dry`, `release:verify`).

### Handed onward

- `CONTRIBUTING.md` and the PR template (ticket 14) must document: add a
  changeset for every published change, the four adopted rules from §6, the
  release procedure from §3, the prerelease enter/exit from §10, and the
  fallback-token rules from §4.
- Ticket 17 executes the §4 checklist, the §13 dry run, and the prerelease
  branch creation.
- Terminal command: `pnpm build && pnpm release` remains possible locally with
  a granular token in `~/.npmrc`, but it bypasses provenance and CI; it is a
  last resort, documented as such, not the lane.
