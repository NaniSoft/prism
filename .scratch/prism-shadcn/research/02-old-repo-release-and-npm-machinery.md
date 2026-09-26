---
Labels: wayfinder:research
Type: research
Resolves: ../issues/02-old-repo-release-and-npm-machinery.md
Status: complete
---

# The old repository's release and npm machinery

`github.com/NaniSoft/prism`, branch `main`, read at tree `12a68563abfda2d3e40a6b964376bf328d2475f2`
(517 blobs, `truncated: false`), plus the npm registry's own view of the four
published names. Read on 2026-09-26.

**Method.** `api.github.com/repos/NaniSoft/prism/git/trees/main?recursive=1` for the
inventory, `raw.githubusercontent.com/NaniSoft/prism/main/...` for file contents, and
`registry.npmjs.org` for what actually landed. No clone. This is a report of the
current state and its recorded failure modes; it proposes nothing.

**Repository facts.** `private: false`, `visibility: "public"`, `archived: false`,
`default_branch: "main"`, `has_pages: false`, `homepage: null`, `pushed_at:
2026-09-25T15:41:09Z`, `created_at: 2026-09-14T11:50:09Z`. Note the repo was
created private (`.scratch/prism/issues/06-repo-bootstrap.md`) and is public now.

---

## 1. `.github/` inventory

`git/trees/main?recursive=1` returns exactly three paths under `.github/`:

| Path | Size | Type |
| --- | --- | --- |
| `.github/workflows` | — | tree |
| `.github/workflows/cd.yml` | 1460 | blob |
| `.github/workflows/ci.yml` | 1298 | blob |
| `.github/workflows/release-pr.yml` | 898 | blob |

**There is no `.github/actions/` directory, therefore no composite action of any
kind in this repository.** There is no `CODEOWNERS`, no `.github/skills/`, no
dependabot config, no `CODE_OF_CONDUCT`, no `FUNDING.yml`. All three workflows
inline every step.

### The map's "swapped names" claim is correct

`.scratch/prism/issues/23-go-live.md` records it under "Live-learned gotchas":

> "**The two workflow files carry swapped names**: `release-pr.yml` is *Changesets* (the
> version-PR lane, push-to-main) and `cd.yml` is the dry-run lane. The first swap
> attempt overwrote the version-PR workflow by filename and silenced the Changesets run
> on push — restored byte-for-byte, and the real publish landed in `cd.yml` where the
> dry-run lived."

Verified against the files themselves. The `name:` key of each file, not its filename,
is the truth:

| File | `name:` | Trigger | Jobs | Reality |
| --- | --- | --- | --- | --- |
| `release-pr.yml` | `Changesets` | `push: branches: [main]` | `version` | Version-PR lane. Opens/keeps open the "Version Packages" PR. Never publishes. |
| `cd.yml` | `Release (publish)` | `workflow_dispatch` | `publish` | The publish lane. Manually dispatched. |
| `ci.yml` | `CI` | `pull_request`, `push: branches: [main]` | `verify`, `deploy-site` | PR gates + site deploy. |

`ci.yml`'s and `cd.yml`'s filenames describe intent that does not match: there is no
continuous deployment anywhere in the repo. The site is deployed by the *`ci.yml`*
`deploy-site` job on push to `main`; `cd.yml` publishes to npm by hand.

### 1a. `.github/workflows/release-pr.yml` — the Changesets version-PR lane (898 B)

Header comment:

> "On every push to main: consume merged changesets and keep a "Version Packages"
> PR open. Merging that PR (once the publish workflow is armed) releases the
> packages — plasma's release shape: independently versioned, non-lockstep."

- `concurrency: group: changesets-${{ github.ref }}`, `cancel-in-progress: false` — so
  two pushes cannot race the version PR.
- One job, `version`, on `ubuntu-latest`:
  - `if: github.repository == 'NaniSoft/prism'` — **the job silently no-ops in any other repository.**
  - `permissions: contents: write`, `pull-requests: write`. These are the elevated
    permissions that let `changesets/action` open the PR. The repo's default is
    `default_workflow_permissions: read`, which is why the elevation is explicit
    (`.scratch/prism/issues/07-accounts-and-infra.md`: *"`default_workflow_permissions: read` is fine (workflows elevate at job level)"*).
  - `actions/checkout@v4`
  - `pnpm/action-setup@v4` — no `version:` input, so pnpm is taken from the root
    `package.json` `packageManager: "pnpm@11.18.0"`.
  - `actions/setup-node@v4` with `node-version: 24`, `cache: pnpm`. No `registry-url`.
  - `pnpm install --frozen-lockfile`
  - `changesets/action@v1` with `version: pnpm run version`; `env: GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
  - No `publish:` input. No `commit`, `title`, or `commitMode` inputs, so the
    action's own defaults apply (it commits the version bump and pushes it to the
    open branch).

The action requires the repository setting "Allow GitHub Actions to create and
approve pull requests", which the repo has on — verified in
`.scratch/prism/issues/07-accounts-and-infra.md`:
`can_approve_pull_request_reviews: true`.

### 1b. `.github/workflows/cd.yml` — the npm publish lane (1460 B)

Header comment, quoted in full because it is the lane's only documentation:

> "The npm publish lane (ticket 23). The Changesets workflow (release-pr.yml)
> owns the "Version Packages" PR; this workflow publishes what that PR merged:
>   - `pnpm build` first — the packages ship `files: ["dist"]` and their
>     `prepublishOnly` only runs publint, so dist must exist before
>     `changeset publish`.
>   - `changeset publish` ships every package whose local version is ahead of
>     npm, gated per tarball by publint; a no-op when everything is published.
> Dispatch manually after merging the "Version Packages" PR. The first run
> also verifies the org-level GitHub secrets (`NPM_TOKEN`,
> `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` — ticket 07), which are
> invisible to non-admin `gh secret list`."

- `on: workflow_dispatch:` — **and nothing else.** No `push`, no `schedule`, no
  `release`, no `workflow_call`. There is no automatic publish path in this repository.
- One job, `publish`, on `ubuntu-latest`:
  - `if: github.repository == 'NaniSoft/prism'`
  - **No `permissions:` block at all.** The job therefore runs at the repository
    default token permissions. `.scratch/prism/issues/07-accounts-and-infra.md` records
    that default as `read`. This job therefore has no `contents: write` and no
    `id-token: write`. It works only because by dispatch time there are no
    changesets left to version, and because it never needs to commit or mint an
    OIDC token.
  - `actions/checkout@v4`
  - `pnpm/action-setup@v4`
  - `actions/setup-node@v4` with `node-version: 24`, `cache: pnpm`,
    **`registry-url: https://registry.npmjs.org`** — this is the only step in the
    repository that produces an npm auth configuration.
  - `pnpm install --frozen-lockfile`
  - `pnpm build` (turbo build across all five workspaces; produces `packages/*/dist`
    and `apps/site/out`)
  - `changesets/action@v1` with `version: pnpm run version` **and** `publish: pnpm run release`;
    `env:` `GITHUB_TOKEN`, `NPM_TOKEN: ${{ secrets.NPM_TOKEN }}`,
    `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.
  - No `createGithubReleases`. No `gh release` step. No `--tag`. No `--access`.
  - No lint, no test, no `pnpm check` before publish.

### 1c. `.github/workflows/ci.yml` — PR gates and site deploy (1298 B)

- `on: pull_request`, `push: branches: [main]`
- `concurrency: group: ${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true`
- No top-level `permissions:`.

**Job `verify`** — `ubuntu-latest`, no `if:` guard (so it runs on forks, unlike the
other two jobs):
1. `actions/checkout@v4`
2. `pnpm/action-setup@v4`
3. `actions/setup-node@v4` (`node-version: 24`, `cache: pnpm`, no `registry-url`)
4. `pnpm install --frozen-lockfile`
5. `pnpm lint` → `turbo run lint && stylelint "**/*.css" --aei`
6. `pnpm exec turbo run test build`
7. `pnpm check` → `turbo run check` — the comment says
   `# prism-llms drift gate — corpus invariants must hold on every PR`

**Job `deploy-site`** — `name: Deploy site to Cloudflare`:
- `if: github.repository == 'NaniSoft/prism' && github.event_name == 'push' && github.ref == 'refs/heads/main'`
- `needs: verify`, `ubuntu-latest`, `timeout-minutes: 15`, `permissions: contents: read`
- checkout → `pnpm/action-setup@v4` → `setup-node@v4` → `pnpm install --frozen-lockfile`
  → `pnpm build` → `pnpm --filter @nanisoft/site run deploy`
- `env:` `CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}`,
  `CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`

Note this job re-runs the whole build from scratch in a second runner; there is no
artifact hand-off from `verify`.

---

## 2. The release path end to end

### `.changeset/config.json` (verbatim)

```json
{
  "$schema": "https://unpkg.com/@changesets/config/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "fixed": [],
  "linked": [],
  "ignore": []
}
```

- **`fixed` and `linked` are both empty arrays → packages are versioned
  independently, non-lockstep.** Independently confirmed by the registry: the four
  names sit at four different versions (`prism-tokens@0.3.0`, `prism-mcp-server@0.3.0`,
  `prism-llms@0.4.0`, `prism-ui@0.4.0`).
- **There is no custom changelog generator.** `changelog` is the stock
  `"@changesets/cli/changelog"`. There is no `.changeset/changelog.cjs`, no
  `.changeset/pre.json`, and no `.changeset/README.md`. The tree lists only
  `config.json` plus four pending change files.
- `"access": "public"` is what makes `changeset publish` pass `--access public`
  to the publish tool.
- `"commit": false` — the release action does the commit.
- `ignore: []` and no `privatePackages` key. **Inference, verified against the
  changesets runtime:** `@changesets/config@3.1.1`'s `parse` defaults
  `privatePackages` to `{ version: true, tag: false }` when the key is absent
  (`dist/changesets-config.cjs.js`: `} : { version: true, tag: false }`). So
  `apps/site`, which is `"private": true` and not in `ignore`, **is version-bumped
  and does appear in the Version Packages PR and in the generated CHANGELOG**, it is
  simply never published and never tagged. plasma sets
  `privatePackages: { version: false, tag: false }` (see
  `.scratch/prism/research/01-plasma-conventions.md` line 173); that was not adopted.
- No `bumpVersionsWithWorkspaceProtocolOnly` (plasma sets it `true`).

### End-to-end sequence, as actually wired

1. A contributor adds a file under `.changeset/` and merges. Nothing validates it;
   see §5.
2. Push to `main` → `release-pr.yml` (the `Changesets` workflow) runs
   `changeset version` via `changesets/action@v1`, commits, and keeps a
   **"Version Packages" PR** open.
3. A human merges that PR. Nothing is published at this point. The version PR is
   the only thing that stages bumps.
4. A human **manually dispatches `cd.yml`**. That job builds, then runs
   `changeset publish`, which publishes every package whose local version is ahead of
   npm and creates git tags.
5. **No GitHub Releases are created.** `api.github.com/repos/NaniSoft/prism/releases`
   returns `[]`. `createGithubReleases` is not set and no `gh release` step exists.
6. **No prerelease / `next` lane.** No `.changeset/pre.json`; `dist-tags` on all four
   packages is `{ latest: <x> }` only; no `-next.*` or `-alpha.*` version exists on
   the registry. There is no `next` branch convention and no second publish workflow.
   The nearest recorded attempt is plasma's, in
   `.scratch/prism/research/01-plasma-conventions.md` lines 213-219, which was
   described but not built.

### Git tags, as evidence of the tag naming scheme

`api.github.com/repos/NaniSoft/prism/tags` returns exactly ten tags, all
changesets-style `@nanisoft/<pkg>@<version>`:

```
@nanisoft/prism-ui@0.4.0        @nanisoft/prism-ui@0.3.0        @nanisoft/prism-ui@0.2.0
@nanisoft/prism-tokens@0.3.0    @nanisoft/prism-tokens@0.2.0
@nanisoft/prism-mcp-server@0.3.0  @nanisoft/prism-mcp-server@0.2.0
@nanisoft/prism-llms@0.4.0      @nanisoft/prism-llms@0.3.0      @nanisoft/prism-llms@0.2.0
```

Ten tags for ten published versions, one per publish. There is no `v`-prefix
convention and no single `v1.2.3` monorepo tag.

### Pending state at HEAD: four unconsumed changesets

`.changeset/` at `12a6856` holds four unreleased change files, and the
`package.json` versions on `main` already equal the published `latest` of every
package. So the next push to `main` will open a version PR for all four:

| File | Bumps |
| --- | --- |
| `.changeset/prism-owned-base-ui-break.md` | **major × 4** — `"@nanisoft/prism-tokens": major`, `"@nanisoft/prism-ui": major`, `"@nanisoft/prism-llms": major`, `"@nanisoft/prism-mcp-server": major` |
| `.changeset/spectral-refraction-system-revamp.md` | `prism-ui: minor`, `prism-llms: patch` |
| `.changeset/audit-a11y-theming-hardening.md` | `prism-tokens: minor`, `prism-ui: minor`, `prism-llms: patch` |
| `.changeset/site-first-use-truthfulness.md` | `prism-llms: patch` |

Worth noting for a clean-break rebuild: the old repository already carries a written,
unreleased, all-four-major changeset whose body reads *"This is a clean breaking
release. Remove imports of the retired runtime, migrate to the curated catalog, and
regenerate the docs/corpus after upgrading."* That changeset alone would take all four
to `1.0.0`. It has never been versioned or published.

### The dry-run path (local only)

Root `package.json`:

```json
"release:dry": "changeset status --verbose && pnpm -r --filter \"./packages/*\" publish --dry-run --no-git-checks"
```

`.scratch/prism/issues/23-go-live.md` records the fallback that is still the effective
release route: *"Until then, releases publish manually (`pnpm build && pnpm release`
locally); the first real CI release will be the true verification."*

---

## 3. npm authentication, precisely

### Every occurrence in the entire `.github/` tree

Searched all three workflow files in full for `NODE_AUTH_TOKEN`, `NPM_TOKEN`,
`registry-url`, `.npmrc`, `--provenance`, `provenance`, `--access`, `id-token`,
`environment:`, `createGithubReleases`. Results, exhaustively:

| Token | `release-pr.yml` | `cd.yml` | `ci.yml` |
| --- | --- | --- | --- |
| `NODE_AUTH_TOKEN` | — | line 39 | — |
| `NPM_TOKEN` | — | lines 11 (comment), 38, 39 | — |
| `registry-url` | — | line 29 | — |
| `.npmrc` | — | — | — |
| `--provenance` / `provenance` | — | — | — |
| `--access` | — | — | — |
| `id-token` | — | — | — |
| `environment:` | — | — | — |
| `createGithubReleases` | — | — | — |
| `permissions:` | line 19 | **absent** | line 33 |

`cd.yml` lines 28-40, verbatim:

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
          registry-url: https://registry.npmjs.org
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: changesets/action@v1
        with:
          version: pnpm run version
          publish: pnpm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

The exact hits:

```
line 29:          registry-url: https://registry.npmjs.org
line 38:          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
line 39:          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### The root `.npmrc` carries no auth at all (verbatim, complete file)

```
# Project-local store: keeps every pnpm invocation (shell, CI, and tools that
# spawn pnpm with a different environment, e.g. Next's dependency auto-install)
# pointed at the same store. Content-addressed and hardlinked like the global one.
store-dir=.pnpm-store
```

No `//registry.npmjs.org/:_authToken=`, no `always-auth`, no `provenance=true`.
Authentication reaches npm entirely through the `NPM_CONFIG_USERCONFIG` `.npmrc`
that `actions/setup-node` writes from `registry-url` + `NODE_AUTH_TOKEN`, in the
temp directory, for the `cd.yml` job only.

### `environment:` is used nowhere

No GitHub Actions environment gates any job. There is no `production`
environment, no required reviewer, no environment-scoped secret. plasma's `cd.yml`
does gate on `environment: production`
(`.scratch/prism/research/01-plasma-conventions.md` line 213); that was not adopted.

### The two recorded failures, quoted from the repository

`.scratch/prism/issues/23-go-live.md`, "One open follow-up (user-side, org settings)":

> "the CI publish lane ran green only as a *no-op* — its log still shows
> `No NPM_TOKEN or OIDC available`, so the org secret **still isn't injected into
> this private repo** (org secrets scoped "Public repositories" don't reach private
> repos). Fix: org Settings → Secrets and variables → Actions → `NPM_TOKEN` →
> visibility "All repositories" (or Selected including `prism`), or set it as a repo
> secret: `gh secret set NPM_TOKEN -R NaniSoft/prism`. Until then, releases publish
> manually (`pnpm build && pnpm release` locally); the first real CI release will be
> the true verification."

The same file, gotcha 2:

> "**npm publish failure modes, diagnosed in order**: CI 404 on PUT = the secret
> token's account isn't a publish-capable member of the `nanisoft` org (npm hides
> scopes you can't publish to as 404, not 403); local 403 after `npm login` = npm's
> 2FA-on-publish rule; both fixed by one granular access token (packages read+write,
> 2FA bypass) from the org-owner account — used locally, and set as the org secret."

And gotcha 3, which is a real trap for a rebuild:

> "The token initially didn't take locally because the `.npmrc` key had a typo
> (`registry.npmjs.og`) — npm silently kept using the old session token."

Both failure claims are consistent with the current files. Two things about their
present status:

- The **404-is-not-a-403** mechanism is npm's documented behaviour for a scope the
  authenticated account cannot publish to. The fix named in the ticket — *a
  **granular** access token with packages read+write and 2FA bypass, owned by an
  account that is a member of the `nanisoft` org* — is the necessary condition. The
  classic automation token type does not support 2FA bypass.
- The **secret-visibility** failure is a *repository-visibility* failure, and the
  visibility has since changed. `.scratch/prism/issues/23-go-live.md` says the secret
  was scoped "Public repositories" and the repo was private, so the secret never
  reached it. **The repository is `private: false` today.** **Inference:** an org
  secret scoped to "Public repositories" is now visible to this repository, so that
  specific blocker is retired by the visibility flip — but only by inference, since
  the org secret's current visibility cannot be read without org admin access. What
  is *not* retired: the recorded fact that no CI publish has ever actually published
  anything. Every one of the ten tags on `main` was produced either by the manual
  local route or by a lane that only ever ran as a no-op. The ticket's own words:
  *"the first real CI release will be the true verification"* — and there is no such
  run in the repository's record.

### What must be true for a first publish from a new public repository

Stated as preconditions read off the current files, each traceable:

1. **The repository guard must match.** `release-pr.yml`, `cd.yml#publish` and
   `ci.yml#deploy-site` all carry `if: github.repository == 'NaniSoft/prism'`. In a
   repository under any other `owner/repo` those jobs skip silently — a green run with
   no publish. A new repository name means every release job is disabled until this
   string changes.
2. **`NPM_TOKEN` must resolve in the new repository** as either a repository secret
   or an org secret whose visibility includes it. The failure this guards against is
   the recorded one: a secret scoped to a visibility class the repository is not in.
3. **`NPM_TOKEN` must be a real publish-capable npm credential for the `nanisoft`
   scope**: granular, packages read+write, 2FA bypass, held by an account that is a
   member of the `nanisoft` org. A non-member produces 404, not 403. A token without
   2FA bypass produces 403 from an account with 2FA-on-publish.
4. **`secrets.GITHUB_TOKEN` must be able to write**, for `release-pr.yml` — it has
   `contents: write` + `pull-requests: write` at job level, which is sufficient, and
   the repo's "Allow GitHub Actions to create and approve pull requests" toggle is on.
5. **`dist/` must exist before publish.** `files: ["dist"]` on all four packages and
   no `prepare`/`prepack`, so `changeset publish` would tarball an empty or missing
   `dist` if `pnpm build` is skipped. `cd.yml` does run `pnpm build`; anything that
   replaces it must too.
6. **The `@nanisoft` scope must be writable from that credential**, and the four
   names are already taken at `0.2.0`+ — a first publish from a new repository is
   a new version of an existing name, not a new name, so version numbers may not
   move backwards.

### What I could not establish about authentication

- Whether the org secret `NPM_TOKEN` currently exists, or its visibility.
  `gh secret list` is not callable without org admin credentials, and
  `api.github.com/repos/NaniSoft/prism/actions/secrets` requires authentication.
  Not derivable from public files.
- The concrete 2FA state of the npm account behind the token.
- Whether any publish in the ten-tag history actually came from CI or from a laptop.
  The ticket says the CI lane only ever ran as a no-op; I cannot independently
  confirm the origin of each publish from public files, though the absence of any
  GitHub Release and the recorded open follow-up are consistent with manual publishing.

---

## 4. Provenance and publish safety

**npm provenance is not enabled. Established three independent ways.**

1. **No flag, no permission.** No `--provenance` and no `provenance` string appears
   in any of the three workflows (exhaustive search above). `id-token: write` appears
   in none of them, and `cd.yml#publish` has no `permissions:` block at all, so its
   token cannot mint the OIDC assertion that provenance requires.
2. **The publish tool is never given the flag.** `changesets/cli@3.0.2`
   (`dist/getPublishPlan.mjs`) builds its args as
   `["publish", ..., "--access", release.access, "--tag", tag]` — lines 230-232 and
   239 for the npm tool, lines 337-340 for the pnpm tool. There is no
   `provenance` token anywhere in `dist/index.mjs` or `dist/publish.mjs`.
3. **The registry says so.** The published version document for
   `@nanisoft/prism-tokens@0.3.0` has `dist` keys
   `["shasum", "tarball", "fileCount", "integrity", "signatures", "unpackedSize"]`.
   There is **no `attestations` and no `provenance` key**. The `signatures` array is
   the registry's own ECDSA signature over the packument, present on every npm
   package; it is not a supply-chain attestation and is not tied to the publishing
   workflow.

**Which packages gate on `publint`.** All four published packages, none of them
partial:

| Package | `prepublishOnly` |
| --- | --- |
| `@nanisoft/prism-tokens` | `"publint"` |
| `@nanisoft/prism-ui` | `"publint"` |
| `@nanisoft/prism-llms` | `"publint"` |
| `@nanisoft/prism-mcp-server` | `"publint"` |
| `@nanisoft/site` | none (private) |

`publint: "^0.3.24"` is a `devDependency` of all four. `.scratch/prism/issues/06-repo-bootstrap.md`
describes the original state as *"`publint` as `prepublishOnly` in the three
publishable packages"*, but the fourth (`prism-llms`) acquired it later; the current
tree has four.

**`--access` and `--provenance` flags actually passed.** No flag is written down
anywhere in the repository. They are synthesised by `changeset publish`:

- `--access public`, sourced from `.changeset/config.json`'s `"access": "public"`.
- `--provenance`: never.
- Which executable runs is decided by `@changesets/cli`'s
  `getPublishTool` (`dist/getPublishPlan.mjs` lines 553-561): it uses
  `packages.tool.type` from `@manypkg/get-packages`, falling back to
  `package-manager-detector`. The workspace is pnpm (`packageManager:
  "pnpm@11.18.0"` plus a `pnpm-workspace.yaml`), so **the publish executable is
  `pnpm publish`, not `npm publish`**, with the same `--access`/`--tag` pair. The
  local dry-run script already assumed this: `pnpm -r --filter "./packages/*" publish
  --dry-run --no-git-checks`.

**`publishConfig`: absent from all five `package.json` files** and absent from the
published registry manifests (`@nanisoft/prism-tokens@0.3.0` has no `publishConfig`
key). There is no `publishConfig.registry`, no `publishConfig.tag`, no
`publishConfig.directory`, no `publishConfig.access`.

**Other publish-safety observations.**

- The published manifest is stripped of the packaging-critical fields by npm
  itself: the registry's version document for `prism-tokens@0.3.0` has **no `files`
  key** and **`scripts` reduced to `{lint, test, build}`** — `prepublishOnly: publint`
  is not in the published manifest. `devDependencies` *are* retained
  (`{vitest, publint, typescript}`), which is
  npm's normal behaviour.
- `publint` is the *only* publish gate. There is no `npm pack --dry-run` diff, no
  tarball-size check, no `attw`/`arethetypeswrong`, no API-extractor, no size-limit.
- Actions are pinned to mutable tags, not SHAs: `actions/checkout@v4`,
  `actions/setup-node@v4`, `pnpm/action-setup@v4`, `changesets/action@v1`. No
  `step-security/changeset-action`, no Dependabot, no CodeQL, no Scorecards.
- `pnpm-workspace.yaml` documents a deliberate **absence** of a supply-chain policy:
  > "Supply-chain policy: there is deliberately NO base `minimumReleaseAge` yet
  > (pnpm's default, 0 = no delay) …"
  with only `minimumReleaseAgeExclude` entries for four toolchain packages
  (`@cloudflare/workers-types@5.20260919.1`, `miniflare@5.20260918.0-alpha`,
  `wrangler@4.135.0`, `agents@0.24.0`).

---

## 5. Changeset conventions

### The honest finding: there is no changeset validator and no `CONTRIBUTING.md`

The complete root listing from `api.github.com/repos/NaniSoft/prism/contents/?ref=main`:

```
dir  .changeset          file .editorconfig     file .gitattributes
dir  .github             file .gitignore        file .mcp.json
dir  .scratch            file .npmrc            file AGENTS.md
dir  apps               file CLAUDE.md         file CONTEXT.md
dir  docs               file DESIGN.md         file LICENSE
dir  packages            file PRODUCT.md        file README.md
file THIRD-PARTY-NOTICES.md  file package.json  file pnpm-lock.yaml
file pnpm-workspace.yaml     file stylelint.config.mjs
file tsconfig.base.json      file turbo.json
```

**No `CONTRIBUTING.md`. No `CODEOWNERS`. No root `scripts/`.** So there are **zero
enforced changeset rules and zero error strings** in this repository. A repo-wide
text search for "changeset" finds the rules only as prose in `AGENTS.md`,
`CLAUDE.md`, and the `.changeset/*.md` files themselves:

- `AGENTS.md`, Commands block: `pnpm changeset               # declare a release before merging`
- `AGENTS.md`, "Working here": *"Add a changeset for every published package whose public behavior or docs projection changes."*
- `CLAUDE.md`, Verification: *"add changesets for published packages."*
- `README.md`: *"Read [`AGENTS.md`](./AGENTS.md) before contributing."*

That is the whole of it. Three sentences of prose, no mechanism. A PR that adds no
changeset is indistinguishable from one that adds a bad one.

### Where the map's claims about a validator and a release preview come from

Both exist — in **coveo/plasma**, recorded as a recommendation in
`.scratch/prism/research/01-plasma-conventions.md`, and were **not built here**.

`.scratch/prism/map.md` line 34 states the intent:

> "Two mechanics to copy: … (2) changeset validator + per-PR "what would this
> publish?" preview scripts."

`.scratch/prism/research/01-plasma-conventions.md` line 574 makes it a firm
recommendation:

> "**Steal `releasePreview.js` and `validateChangesets.js` whole.** … The validator's
> rules (≤100-char title, no trailing period, no `**BREAKING:**` prefix, prose-only
> body, `# Migration` section required for major) are the difference between a
> readable CHANGELOG and a wall of bullets."

**The closest thing to "enforced rules with exact error strings" that exists in any
public `NaniSoft/prism` file** is this paraphrase of plasma's
`scripts/validateChangesets.js` (a "~210-line validator"), at
`.scratch/prism/research/01-plasma-conventions.md` lines 230-236:

> - Frontmatter must parse; every package must be a real workspace package name; every bump must be `major|minor|patch`.
> - Title = first non-empty, non-`<!--` line after frontmatter. Must exist, must not be a heading, must not start with a list marker, **must not end with a period**, **must not start with `**BREAKING:**`**, and **must be ≤ 100 characters**.
> - Body headings must start at a single `#` (h1).
> - **Body must not use markdown lists** — checked by a fence-aware scanner so ` ```diff ` blocks' `-`/`+` markers don't false-positive.
> - `major` requires a body **and** a `# Migration` section; `minor` requires a body.
> - Ignores `README.md`, `config.json`, `pre.json`, `changelog.cjs`.

**These are paraphrases, not error strings.** The exact strings live in plasma's
`scripts/validateChangesets.js` and `CONTRIBUTING.md`, which are not in this
repository. Do not treat the list above as enforced by `NaniSoft/prism` — it is not
wired to anything.

### The per-PR release preview: also plasma's, also absent

`.scratch/prism/research/01-plasma-conventions.md` lines 206 and 221-225 describe it
and how it filters private packages:

> "`release-preview` — runs `node scripts/releasePreview.js`, captures stdout into
> `$GITHUB_OUTPUT` as a `message<<EOF` heredoc, and posts/updates a PR comment via a
> local composite action with `avoidRepostsWith: '<!-- changesets-release-preview -->'`
> and `updateExisting: 'true'` (so it never spams; it edits the existing comment,
> keyed on an HTML marker). Skipped on `changeset-release/*` branches."

> "Wraps `pnpm exec changeset status --since=origin/master --verbose`, parses its
> ANSI-coloured stdout with regexes into `{type, name, nextVersion}` rows, **filters
> out private packages (discovered via `pnpm list --recursive --depth -1 --json`)**,
> and emits a Markdown table grouped Patch/Minor/Major. When changes are detected but
> no changeset exists, it emits an explicit warning comment telling the author to run
> `pnpm changeset`. This gives every PR a "what would this publish?" answer without a
> human running anything."

**`NaniSoft/prism`'s `ci.yml` has two jobs, `verify` and `deploy-site`.** There is no
`release-preview` job, no `lint` job, no `test` job, no `demo` job, no
`node scripts/releasePreview.js`, and no `pnpm changeset:validate`. **The
private-package filtering mechanism the ticket asks about does not exist here**; the
`pnpm list --recursive --depth -1 --json` discovery and the `<!-- changesets-release-preview -->`
marker are plasma's, and there is no counterpart in this tree.

### What the four pending changesets look like, as a de-facto convention

`prism-owned-base-ui-break.md` (the all-four-major one) opens with a single
consumer-facing sentence and then a migration paragraph:

> "Replace the retired upstream component layer with Prism-owned source. …"
> "This is a clean breaking release. Remove imports of the retired runtime,
> migrate to the curated catalog, and regenerate the docs/corpus after upgrading."

`site-first-use-truthfulness.md` is a patch with one prose paragraph and no body
structure. `audit-a11y-theming-hardening.md` is a minor with `**bold**` lead-ins per
package and a `**Known follow-ups (measured, not yet fixed)**` section. None of these
conventions is checked by anything; they are habits.

---

## 6. Per-package release surface

### Full `package.json` files, verbatim

<details><summary><code>packages/tokens/package.json</code></summary>

```json
{
  "name": "@nanisoft/prism-tokens",
  "version": "0.3.0",
  "description": "Prism's pure token foundation — five brand packs, two modes, semantic CSS variables, and DTCG output for the Spectral Refraction design language.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "engines": {
    "node": ">=22"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.json && node scripts/build-figma.mjs",
    "lint": "oxlint .",
    "test": "vitest run",
    "prepublishOnly": "publint"
  },
  "devDependencies": {
    "publint": "^0.3.24",
    "typescript": "^7.0.2",
    "vitest": "^5.0.0"
  },
  "author": "NaniSoft",
  "homepage": "https://prism.nanisoft.com",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/NaniSoft/prism.git",
    "directory": "packages/tokens"
  }
}
```
</details>

<details><summary><code>packages/ui/package.json</code></summary>

```json
{
  "name": "@nanisoft/prism-ui",
  "version": "0.4.0",
  "description": "Prism's React design system — owned components, blocks, and pages with accessible Base UI behavior behind one import.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "engines": {
    "node": ">=22"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./provider": {
      "types": "./dist/provider/index.d.ts",
      "import": "./dist/provider/index.js"
    },
    "./components": {
      "types": "./dist/components/index.d.ts",
      "import": "./dist/components/index.js"
    },
    "./components/*": {
      "types": "./dist/components/*/index.d.ts",
      "import": "./dist/components/*/index.js"
    },
    "./blocks": {
      "types": "./dist/blocks/index.d.ts",
      "import": "./dist/blocks/index.js"
    },
    "./blocks/*": {
      "types": "./dist/blocks/*/index.d.ts",
      "import": "./dist/blocks/*/index.js"
    },
    "./pages": {
      "types": "./dist/pages/index.d.ts",
      "import": "./dist/pages/index.js"
    },
    "./pages/*": {
      "types": "./dist/pages/*/index.d.ts",
      "import": "./dist/pages/*/index.js"
    },
    "./products": {
      "types": "./dist/products/index.d.ts",
      "import": "./dist/products/index.js"
    },
    "./theming": {
      "types": "./dist/theming/index.d.ts",
      "import": "./dist/theming/index.js"
    },
    "./catalog": {
      "types": "./dist/catalog.d.ts",
      "import": "./dist/catalog.js"
    },
    "./styles.css": "./dist/styles.css",
    "./package.json": "./package.json"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "node scripts/clean-dist.mjs && tsc -p tsconfig.json && node scripts/copy-styles.mjs",
    "lint": "oxlint .",
    "test": "vitest run",
    "prepublishOnly": "publint"
  },
  "peerDependencies": {
    "react": "^19.3.0"
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/react": "^16.3.3",
    "@types/node": "^26.5.1",
    "@types/react": "^19.3.0",
    "jsdom": "^30.0.1",
    "publint": "^0.3.24",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "tsx": "^4.0.0",
    "typescript": "^7.0.2",
    "vitest": "^5.0.0"
  },
  "dependencies": {
    "@base-ui/react": "^1.8.0",
    "@nanisoft/prism-tokens": "workspace:*"
  },
  "author": "NaniSoft",
  "homepage": "https://prism.nanisoft.com",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/NaniSoft/prism.git",
    "directory": "packages/ui"
  }
}
```
</details>

<details><summary><code>packages/llms/package.json</code></summary>

```json
{
  "name": "@nanisoft/prism-llms",
  "version": "0.4.0",
  "description": "Prism's generated agent surface — llms.txt, owned-catalog Markdown, theme references, and the PrismDocsStore projection. Data-only; one dist/ serves npm, the site, and the MCP server.",
  "license": "MIT",
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./extractor": {
      "types": "./dist/extractor.d.ts",
      "import": "./dist/extractor.js"
    },
    "./data.json": "./dist/data.json",
    "./package.json": "./package.json"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.json && node scripts/build.mjs",
    "check": "node scripts/check.mjs",
    "generate-content": "node scripts/generate-content.mjs",
    "lint": "oxlint .",
    "test": "vitest run",
    "prepublishOnly": "publint"
  },
  "devDependencies": {
    "@nanisoft/prism-mcp-server": "workspace:*",
    "@nanisoft/prism-tokens": "workspace:*",
    "@nanisoft/prism-ui": "workspace:*",
    "@types/node": "^26.5.1",
    "publint": "^0.3.24",
    "typescript": "^7.0.2",
    "vitest": "^5.0.0"
  },
  "author": "NaniSoft",
  "homepage": "https://prism.nanisoft.com",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/NaniSoft/prism.git",
    "directory": "packages/llms"
  }
}
```
</details>

<details><summary><code>packages/mcp-server/package.json</code></summary>

```json
{
  "name": "@nanisoft/prism-mcp-server",
  "version": "0.3.0",
  "description": "Transport-free tool logic for Prism's read-only MCP — eight owned-catalog tools fed by prism-llms output. The HTTP transport lives in the apps/site Worker at /mcp.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "engines": {
    "node": ">=22"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "lint": "oxlint .",
    "test": "vitest run",
    "prepublishOnly": "publint"
  },
  "devDependencies": {
    "@modelcontextprotocol/client": "2.0.0",
    "publint": "^0.3.24",
    "typescript": "^7.0.2",
    "vitest": "^5.0.0"
  },
  "dependencies": {
    "@modelcontextprotocol/server": "2.0.0",
    "zod": "^4.6.5"
  },
  "author": "NaniSoft",
  "homepage": "https://prism.nanisoft.com",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/NaniSoft/prism.git",
    "directory": "packages/mcp-server"
  }
}
```
</details>

<details><summary><code>apps/site/package.json</code></summary>

```json
{
  "name": "@nanisoft/site",
  "version": "0.0.0",
  "private": true,
  "description": "prism.nanisoft.com — Fumadocs headless docs, landing page, and blog; static export served by Cloudflare Workers.",
  "scripts": {
    "dev": "pnpm --filter @nanisoft/prism-ui build && node scripts/stamp-mcp-data.mjs && node scripts/generate.mjs && next dev",
    "generate": "node scripts/generate.mjs",
    "build": "node scripts/stamp-mcp-data.mjs && node scripts/generate.mjs && next build && node scripts/copy-llms.mjs",
    "start": "next start",
    "deploy": "node scripts/stamp-mcp-data.mjs && wrangler deploy",
    "lint": "oxlint .",
    "test": "vitest run"
  },
  "dependencies": {
    "@nanisoft/prism-llms": "workspace:*",
    "@nanisoft/prism-mcp-server": "workspace:*",
    "@nanisoft/prism-tokens": "workspace:*",
    "@nanisoft/prism-ui": "workspace:*",
    "agents": "0.24.0",
    "feed": "^6.0.0",
    "fumadocs-core": "^16.15.11",
    "fumadocs-mdx": "^15.4.1",
    "next": "^16.3.5",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "zod": "^4.1.0"
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/react": "^16.3.3",
    "@types/node": "^26.5.1",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "jsdom": "^30.0.1",
    "vitest": "^5.0.0",
    "wrangler": "^4.135.0"
  }
}
```
</details>

### Tabulation

| Field | `prism-tokens` | `prism-ui` | `prism-llms` | `prism-mcp-server` | `site` |
| --- | --- | --- | --- | --- | --- |
| `name` | `@nanisoft/prism-tokens` | `@nanisoft/prism-ui` | `@nanisoft/prism-llms` | `@nanisoft/prism-mcp-server` | `@nanisoft/site` |
| `version` (git) | `0.3.0` | `0.4.0` | `0.4.0` | `0.3.0` | `0.0.0` |
| `latest` (npm) | `0.3.0` | `0.4.0` | `0.4.0` | `0.3.0` | not published |
| `private` | absent (false) | absent (false) | absent (false) | absent (false) | **`true`** |
| `files` | `["dist"]` | `["dist"]` | `["dist"]` | `["dist"]` | **absent** |
| `exports` keys | 1 | **13** | 4 | 1 | **absent** |
| `sideEffects` | `false` | `false` | **absent** | `false` | absent |
| `engines.node` | `>=22` | `>=22` | `>=22` | `>=22` | absent |
| `license` | `MIT` | `MIT` | `MIT` | `MIT` | **absent** |
| `author` | `NaniSoft` | `NaniSoft` | `NaniSoft` | `NaniSoft` | absent |
| `homepage` | `https://prism.nanisoft.com` | same | same | same | absent |
| `repository.type` | `git` | `git` | `git` | `git` | absent |
| `repository.url` | `git+https://github.com/NaniSoft/prism.git` | same | same | same | absent |
| `repository.directory` | `packages/tokens` | `packages/ui` | `packages/llms` | `packages/mcp-server` | absent |
| `publishConfig` | **absent** | **absent** | **absent** | **absent** | absent |
| `prepublishOnly` | `publint` | `publint` | `publint` | `publint` | absent |
| `type` | `module` | `module` | `module` | `module` | absent |
| runtime deps on siblings | none | `prism-tokens` | **none** | **none** | all four |
| `devDeps` on siblings | none | none | **all three** | none | — |
| `peerDependencies` | none | `react ^19.3.0` | none | none | — |

`scripts` per package:

- **tokens** — `build: tsc -p tsconfig.json && node scripts/build-figma.mjs`,
  `lint: oxlint .`, `test: vitest run`, `prepublishOnly: publint`. No `check`.
- **ui** — `build: node scripts/clean-dist.mjs && tsc -p tsconfig.json && node
  scripts/copy-styles.mjs`, `lint: oxlint .`, `test: vitest run`,
  `prepublishOnly: publint`. No `check`. `clean-dist.mjs` does
  `rmSync(dist, {recursive: true, force: true})` — the comment: *"so deleted
  components do not remain publishable or visible to the docs/API extractor."*
  `copy-styles.mjs` writes `dist/styles.css` (authored `src/styles.css` + baked
  theme rules for all ten pack×mode expressions) and copies `assets/fonts` to
  `dist/fonts`. Note `sideEffects: false` sits on a package that ships CSS through
  `dist` — harmless only because the stylesheet is an explicit `exports` entry
  rather than a side-effect import.
- **llms** — the only package with a `check` script:
  `build: tsc -p tsconfig.json && node scripts/build.mjs`,
  `check: node scripts/check.mjs`, `generate-content: node scripts/generate-content.mjs`,
  `lint: oxlint .`, `test: vitest run`, `prepublishOnly: publint`.
- **mcp-server** — `build: tsc -p tsconfig.json`, `lint: oxlint .`,
  `test: vitest run`, `prepublishOnly: publint`.
- **site** — `dev`, `generate`, `build`, `start`, `deploy`, `lint`, `test`. **No
  `check`**, which is what makes `turbo run check` a single-package gate.

### The two claims the ticket asks to confirm

**"`packages/llms/package.json` lists `@nanisoft/prism-mcp-server` as a devDependency."**
Confirmed, verbatim: `"@nanisoft/prism-mcp-server": "workspace:*"` in
`devDependencies`. **Inference on why:** `packages/llms/src/{index,extractor,markdown,demo-graph}.ts`
contain **zero** imports of `@nanisoft/prism-mcp-server` (verified by scanning every
`from '...'` / `import('...')` specifier in the four source files). The consumer is
`packages/llms/scripts/check.mjs`, which generates a `validate-store.ts` containing
`import { parsePrismDocsStore } from '@nanisoft/prism-mcp-server';` and shells out
to `pnpm exec tsc -p .turbo/check/store-validate/tsconfig.json` to prove
`data.json` satisfies `PrismDocsStore`. The repo's own record says the same, at
`.scratch/prism/map.md` line 50: *"PrismDocsStore's type canonically lives in
prism-mcp-server; prism-llms devDeps it type-only for validation."*

**"`packages/ui` has 10 export subpaths."** Confirmed with a precision correction.
`packages/ui`'s `exports` has **13 keys**:

- `.` (the root entry)
- 10 JavaScript/TypeScript module subpaths: `./provider`, `./components`,
  `./components/*`, `./blocks`, `./blocks/*`, `./pages`, `./pages/*`, `./products`,
  `./theming`, `./catalog`
- 1 stylesheet subpath: `"./styles.css": "./dist/styles.css"`
- 1 manifest subpath: `"./package.json": "./package.json"`

So "10" is the count of *module* subpaths; 12 subpaths exist beyond `.`. Every
module subpath carries exactly two conditions, `types` + `import` — no `require`, no
`default`, no `node` condition. The same `types` + `import`-only shape is used by
`prism-tokens` and `prism-mcp-server` (single `.` entry) and by `prism-llms`
(`.`, `./extractor`, `./data.json`, `./package.json`).

**Circular devDependencies: there are none.** Full internal dependency graph from
the five manifests:

```
apps/site            → (dependencies)     tokens, ui, llms, mcp-server
packages/ui          → (dependencies)     tokens
packages/llms        → (devDependencies)  tokens, ui, mcp-server
packages/mcp-server  →                    (no internal deps at all)
packages/tokens      →                    (no internal deps at all)
```

Every arrow is acyclic. `prism-mcp-server` declares no internal dependency, so
`llms → mcp-server` cannot close. The one thing worth naming is not a cycle but an
inversion: the *producer* of the data (`prism-llms`, which writes `data.json`)
devDepends on the *owner of the type contract* (`prism-mcp-server`), and the
*consumer* of the data (`apps/site`'s `worker/mcp.ts`, which does
`import docsData from '@nanisoft/prism-llms/data.json'` then
`parsePrismDocsStore(docsData)`) depends on both. The contract check lives on the
producing side, so a `PrismDocsStore` change surfaces as a `prism-llms#check`
failure rather than as an `mcp-server` test failure.

Also note the site imports the corpus as a bare JSON subpath:
`apps/site/worker/mcp.ts` has `import docsData from '@nanisoft/prism-llms/data.json';`.
`prism-llms`'s `exports` entry for that subpath is the string `"./dist/data.json"`
with no `types` condition, so nothing typechecks the JSON's shape at the import
site — the shape is checked only by `prism-llms#check` invariant 5.

### `repository.directory` correctness

All four are correct *for the repository that contains them today* and would all
become wrong the moment the packages move. Every one carries
`"url": "git+https://github.com/NaniSoft/prism.git"` with a `directory` of
`packages/tokens`, `packages/ui`, `packages/llms`, `packages/mcp-server`
respectively — all four correct. `homepage` is `https://prism.nanisoft.com` on all
four, and `author` is the literal string `NaniSoft` on all four. The npm registry
echoes the same values for `@nanisoft/prism-tokens@0.3.0`:
`repository: { url: "git+https://github.com/NaniSoft/prism.git", type: "git",
directory: "packages/tokens" }`, `author: "NaniSoft"`,
`homepage: "https://prism.nanisoft.com"`, `license: "MIT"`.

### Licensing, as published

Per-package `LICENSE` files exist for all four (`MIT License\n\nCopyright (c) 2026
NaniSoft\n\n…`), plus a root `LICENSE` and `THIRD-PARTY-NOTICES.md`. `.scratch/prism/issues/17-public-packages-license.md`
records why: *"npm accepts `UNLICENSED` publishes — the license lands for legal
coherence"*, and names the four mechanical fields: `license`, `author`, `homepage`,
`repository`. The npm maintainer account is a **personal** account, not an org
service account — `maintainers: [{ name: "durgaprasad.vennapusa", email:
"durgaprasad.vennapusa@gmail.com" }]` on the `@nanisoft/prism-tokens` packument.

---

## 7. The Cloudflare side

### `apps/site/wrangler.jsonc` (verbatim, complete)

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  // prism.nanisoft.com — one Worker serving the static export, the prism-llms
  // `.md` mirror, and (from ticket 22) the HTTP MCP endpoint.
  "name": "prism-site",
  "main": "worker/index.ts",
  "compatibility_date": "2026-09-01",
  "compatibility_flags": ["nodejs_compat"],
  "observability": {
    "enabled": true
  },
  "assets": {
    "directory": "./out",
    "binding": "ASSETS",
    // Next's static export emits `out/404.html` (app/not-found.tsx); the
    // default auto-trailing-slash html_handling matches trailingSlash: false.
    "not_found_handling": "404-page",
    // Only these paths invoke Worker code; everything else is pure asset
    // serving. `/mcp` is ticket 22's endpoint; the five `.md` globs are
    // ticket 16's one prefix rule, rewritten in worker/router.ts. Glob form
    // (not route-style `:slug*` — the asset router does not expand route
    // params; verified live: `:slug*` never matches, `*.md` does). Each glob
    // matches exactly ONE path segment — `*` never crosses `/` — which is
    // fine: section slugs are flat (`/docs/<slug>.md`); nested paths would
    // need the router to handle them regardless.
    "run_worker_first": [
      "/mcp",
      "/mcp/*",
      "/docs/*.md",
      "/components/*.md",
      "/blocks/*.md",
      "/pages/*.md",
      "/blog/*.md"
    ]
  },
  "routes": [
    {
      // Custom Domain: attaching auto-creates the prism.nanisoft.com DNS
      // record on the nanisoft.com zone (ticket 07) — no manual DNS step.
      "pattern": "prism.nanisoft.com",
      "custom_domain": true
    }
  ]
}
```

Extracted answers:

| Question | Answer |
| --- | --- |
| Worker name | `prism-site` |
| Entry point | `worker/index.ts` (`main`) |
| `compatibility_date` | `2026-09-01` |
| `compatibility_flags` | `["nodejs_compat"]` |
| Observability | `enabled: true` |
| Assets directory | `./out` (Next static export) |
| Assets binding | `ASSETS` |
| `not_found_handling` | `404-page` |
| Custom Domain | `prism.nanisoft.com`, `custom_domain: true` |
| `run_worker_first` | `/mcp`, `/mcp/*`, `/docs/*.md`, `/components/*.md`, `/blocks/*.md`, `/pages/*.md`, `/blog/*.md` |
| `.md` prefix rewrite | `/<section>/<slug>.md` → `/md/<section>/<slug>.md`, in `worker/router.ts` |

### The recorded `run_worker_first` gotcha, verbatim from the config

> "Glob form (not route-style `:slug*` — the asset router does not expand route
> params; **verified live: `:slug*` never matches, `*.md` does**). Each glob matches
> exactly ONE path segment — `*` never crosses `/` — which is fine: section slugs are
> flat (`/docs/<slug>.md`); **nested paths would need the router to handle them
> regardless**."

This is the exact failure mode the ticket names. A route-style `:slug*.md` pattern in
`run_worker_first` never matches any request, so the Worker is never invoked and the
`.md` mirror 404s as a plain asset. The failure is silent — the route is simply never
taken. The same comment records the second-order constraint: because `*` does not
cross `/`, a nested content path such as `/docs/guides/x.md` would not match
`/docs/*.md` either, and would need handling elsewhere.

### The rewrite, from `apps/site/worker/router.ts`

```ts
export const MD_SECTIONS = ['docs', 'components', 'blocks', 'pages', 'blog'] as const;

export function rewriteMdPathname(pathname: string): string | undefined {
  if (!pathname.endsWith('.md')) return undefined;
  const isKnownSection = MD_SECTIONS.some(
    (section) => pathname === `/${section}` || pathname.startsWith(`/${section}/`),
  );
  if (!isKnownSection) return undefined;
  return `/md${pathname}`;
}
```

So the router is a **prefix rule**, not a glob: `/docs/getting-started.md` →
`/md/docs/getting-started.md`. The `run_worker_first` globs are only a *gate* to
reach the Worker; the rewriting is unconditional once inside. The five `MD_SECTIONS`
and the five `.md` globs are kept in sync by hand, in two different files. The
router also handles `/mcp` and `/mcp/*` and passes everything else straight to
`env.ASSETS`.

### Deploy path

`apps/site/package.json`:

```json
"build": "node scripts/stamp-mcp-data.mjs && node scripts/generate.mjs && next build && node scripts/copy-llms.mjs",
"deploy": "node scripts/stamp-mcp-data.mjs && wrangler deploy"
```

`ci.yml`'s `deploy-site` job runs `pnpm build` (turbo, so the four packages' `dist/`
are built first — `prism-llms#build` must run because `stamp-mcp-data.mjs` reads
`packages/llms/dist/data.json` and `copy-llms.mjs` copies `dist/llms.txt`,
`dist/llms-full.txt`, `dist/md`) and then `pnpm --filter @nanisoft/site run deploy`,
with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from secrets.

`apps/site/scripts/stamp-mcp-data.mjs` is the honest-failure script:

> `stamp-mcp-data: ${DATA_JSON} not found — the Worker bundles it, so the prism-llms build must run first (pnpm build).`

`apps/site/scripts/copy-llms.mjs` explains the asset split:

> "`llms.txt`, `llms-full.txt`, and the `md/` mirror tree land in `out/` … `data.json`
> is deliberately NOT copied — the Worker bundles it from the package at build time
> (ticket 05: deploy is invalidation), keeping it out of the public asset surface."

### `.dev.vars.example` or equivalent: does not exist

The complete `apps/site` blob list (excluding `content/` and `public/fonts`) has no
`.dev.vars`, `.dev.vars.example`, `.env.example`, or `.env*` of any kind. The only
dotfile is `apps/site/.gitignore`, which lists `/app/antd-vars.css`, `/lib/generated/`,
`/worker/generated/`, `/.wrangler/`. (Inference: `/app/antd-vars.css` and the
comment's mention of `scripts/bake-antd-css.mjs` are stale Ant Design-era entries —
that script is not in `apps/site/scripts/`, and the site no longer depends on antd.
The root `.gitignore` has `!.env.example` negated, so an env example was once
contemplated but never committed.)

The Worker has **no bindings beyond `ASSETS`** — `worker/mcp.ts` states this
directly: *"`env` is unused (the corpus is bundled, there are no bindings)."* The
`Env` interface in `router.ts` has one member, `ASSETS`. So the deploy needs only
the two Cloudflare credentials, no `vars`, no KV, no D1, no R2.

### What deploying a NEW static site over `prism.nanisoft.com` would require

Facts first, then the inferences.

Facts:

- The custom domain is declared *in the repository's wrangler config*, not in the
  Cloudflare dashboard. `routes: [{ pattern: "prism.nanisoft.com", custom_domain:
  true }]`. The config's own comment claims: *"attaching auto-creates the
  prism.nanisoft.com DNS record on the nanisoft.com zone (ticket 07) — no manual DNS
  step."*
- `.scratch/prism/issues/07-accounts-and-infra.md` confirms the zone premise: *"no
  manual record — the `nanisoft.com` zone already lives on Cloudflare (NS
  `mimi`/`rustam.ns.cloudflare.com`); attaching a Workers Custom Domain auto-creates
  `prism.nanisoft.com`."* The account is `Durga Prasad Reddy`, id
  `3185310fec380cda3828cbdd9bd26be1`.
- The deploy runs from `ci.yml`'s `deploy-site` job, gated on
  `github.repository == 'NaniSoft/prism'` **and** `push` **and** `refs/heads/main`,
  and needs `secrets.CLOUDFLARE_API_TOKEN` + `secrets.CLOUDFLARE_ACCOUNT_ID`.
- The last recorded deploy is in `.scratch/prism/issues/23-go-live.md`: *"Site
  redeployed (Worker `prism-site`, version `9a6a58be`)"* — so a Worker named
  `prism-site` **already exists** in account `3185310fec380cda3828cbdd9bd26be1`, and
  the hostname is already attached to it.
- `worker/mcp.ts` pins the hostname into the application layer too:
  `allowedHostnames: ['prism.nanisoft.com']`, with the comment: *"the production
  hostname (the handler's default allowlist is localhost + `*.workers.dev` only)"*.
  A Worker served at any other hostname will refuse MCP requests even if TLS and
  routing are fine.

Inferences (marked as such, because they depend on Cloudflare platform behaviour and
on state I cannot read anonymously):

1. **If the new repository keeps the Worker name `prism-site`,** `wrangler deploy`
   from the new repository overwrites the existing Worker in the same account and the
   existing custom-domain attachment keeps working with no DNS action. This is the
   path of least resistance and the one the repo's own history took (the Worker
   survived being deployed from a repository that had been flipped from private to
   public).
2. **If the new repository renames the Worker,** the hostname must be **detached from
   the current Worker before it can be attached to the new one** — a custom domain
   can serve one Worker at a time. That is a dashboard or API operation, and it is
   the one genuinely new step a rename would introduce.
3. **Either way, `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` must resolve in
   the new repository.** Per ticket 07 they are **org-level** secrets, and the
   recorded failure mode for org secrets is a visibility mismatch. A new repository
   under the same org inherits the same class of risk.
4. **`allowedHostnames` must stay `['prism.nanisoft.com']`** or the `/mcp` endpoint
   silently 403s on the live hostname while every other route works — a partial
   failure that looks like a routing bug.
5. **`compatibility_date: 2026-09-01` must not be pushed into the future** past the
   current date, or Workers refuses the deploy. It is currently a valid, recent date.
6. The deploy is not gated by any GitHub Actions `environment:`, so there is no
   approval step and no environment-scoped credential. Whatever replaces it is a
   change in kind.

---

## 8. CI quality gates

### What CI actually runs

| Gate | Command | Turbo task? | Enforced by |
| --- | --- | --- | --- |
| Lint (JS/TS) | `pnpm lint` → `turbo run lint` | yes | `oxlint .` in all five workspaces |
| Lint (CSS) | `pnpm lint` → `stylelint "**/*.css" --aei` | no | `stylelint.config.mjs`, whose `rules` is **`{}`** |
| Tests | `pnpm exec turbo run test build` | yes | `vitest run` in all five workspaces |
| Build | `pnpm exec turbo run test build` | yes | `tsc -p` per package; `next build` for the site |
| Drift gate | `pnpm check` → `turbo run check` | yes | `packages/llms/scripts/check.mjs`, 7 invariants |
| Changeset validation | **absent** | — | nothing |
| Format check | **absent** | — | nothing (no Prettier, no `fmt:check`) |
| Typecheck task | **absent** | — | `tsc` inside `build`; `next build` typechecks the site |
| Dependency review / CodeQL / Scorecards | **absent** | — | nothing |
| E2E / visual regression | **absent** | — | nothing |
| Coverage threshold | **absent** | — | nothing |

### `turbo.json` (root, verbatim)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        ".next/**",
        "out/**",
        "worker/generated/**",
        "lib/generated/**",
        "!.next/cache/**"
      ]
    },
    "generate": {
      "outputs": ["src/generated/**"],
      "inputs": ["$TURBO_DEFAULT$", "scripts/**"]
    },
    "test": { "dependsOn": ["^build"] },
    "check": {
      "dependsOn": ["^build", "build", "@nanisoft/site#build"]
    },
    "lint": {}
  }
}
```

`apps/site/turbo.json` extends the root and only narrows `generate`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": { "generate": { "outputs": ["lib/generated/**"] } }
}
```

Root `package.json` scripts (verbatim):

```json
"build": "turbo run build",
"test": "turbo run test",
"check": "turbo run check",
"lint": "turbo run lint && stylelint \"**/*.css\" --aei",
"changeset": "changeset",
"version": "changeset version",
"release": "changeset publish",
"release:dry": "changeset status --verbose && pnpm -r --filter \"./packages/*\" publish --dry-run --no-git-checks"
```

Also: `"private": true`, `"packageManager": "pnpm@11.18.0"`, `"engines": { "node":
">=22" }`, devDependencies `@changesets/cli ^3.0.2`, `oxlint ^1.82.0`, `stylelint
^17.15.0`, `turbo ^2.10.12`, `typescript ^7.0.2`.

### Reconciling `turbo.json` and the root scripts with what the workflows run

| Root script | Equivalent in CI | Match? |
| --- | --- | --- |
| `pnpm lint` | step `pnpm lint` | exact |
| `pnpm test` | folded into `pnpm exec turbo run test build` | same task, but CI adds `build` to the same invocation |
| `pnpm build` | folded into `pnpm exec turbo run test build`, and run again in `deploy-site` and in `cd.yml` | same task |
| `pnpm check` | step `pnpm check` | exact |
| `pnpm changeset` | **never run** | not a CI step; a human command |
| `pnpm version` | run by `changesets/action` in `release-pr.yml` and `cd.yml` | exact |
| `pnpm release` | run by `changesets/action` in `cd.yml` only | exact |
| `pnpm release:dry` | **never run** | local only |

The single-line CI invocation `pnpm exec turbo run test build` is equivalent to
running `pnpm test && pnpm build`, except that turbo resolves the shared task graph
once — so a package needed by both is built once and cached. Note it uses
`pnpm exec turbo` directly rather than the two npm scripts, so any future change to
the `test` or `build` script bodies will not be reflected in CI.

**`turbo run check` resolves to exactly one package.** Only
`@nanisoft/prism-llms` defines a `check` script; `tokens`, `ui`, `mcp-server` and
`site` do not. And `check` `dependsOn: ["^build", "build", "@nanisoft/site#build"]`,
so the drift gate transitively builds `prism-ui`, `prism-tokens`,
`prism-mcp-server`, `prism-llms` and the whole site. `.scratch/prism/map.md` line 57
records why the site build is in there: *"`turbo.json` orders the llms drift check
after the site generator to keep the determinism gate stable."* The consequence is
that `pnpm check` in CI is the most expensive step in the pipeline, and it is a
**corpus** gate, not a code gate.

### The drift gate itself — `packages/llms/scripts/check.mjs`

Its header states the seven invariants, and they are worth quoting because they are
the only hand-written quality gate in the repository:

> "Build-fresh — `dist/` is never committed — and asserts the seven invariants:
>   1. every catalog item has doc MDX (stub or full)          — the emit throws on a gap
>   2. every demo passes the self-contained contract          — this gate is the contract's enforcement point
>   3. cross-refs resolve (ComponentDemo ids, imported items) — nothing dead
>   4. every item doc carries a frontmatter description       — it becomes the llms.txt bullet
>   5. `data.json` validates against `PrismDocsStore`         — runtime guard + tsc, type-only devDep
>   6. every `llms.txt` link target exists; the `md/` mirror is complete
>   7. determinism: build twice, byte-compare"

The exact failure strings it can emit, from the `fail(...)` calls:

```
[determinism] two builds differ: <comma-separated paths>
[demo-contract] <layer>/<item>/demos/<file>.tsx: <violation.reason>
[cross-refs] <file> imports '<name>', which is not a public prism-ui runtime export
[cross-refs] <layer>/<item>/index.mdx references example '<id>', which has no demos/<id>.tsx
[descriptions] item '<name>' has an empty description
[store] data.json does not satisfy PrismDocsStore:\n<tsc output>
[links] llms.txt was not emitted
[links] llms.txt links <url>, which was not emitted
[links] item '<name>' has no mirror file md/<layer>/<id>.md
[links] guide '<url>' has no mirror file md/docs/<slug>.md
[links] theme '<slug>' has no mirror file md/theme/<slug>.md
[links] blog post '<slug>' has no mirror file md/blog/<slug>.md
```

plus the summary line on success:
`prism-llms#check: 7 invariants green — <n> items, <n> guides, <n> themes, <n> files`,
and the two bail-outs:
`prism-llms#check: emit failed\n<message>` and
`prism-llms#check: <n> failure(s)\n\n<joined failures>`.

This is the **only** place in the repository where a hand-written validator produces
exact error strings — and it is about the docs corpus, not about changesets.

### Reconciling `turbo.json` outputs with what is actually generated

`turbo.json`'s `build.outputs` lists `dist/**`, `.next/**`, `out/**`,
`worker/generated/**`, `lib/generated/**`, and negates `!.next/cache/**`. The
generators that write files are `stamp-mcp-data.mjs` (→ `worker/generated/`),
`apps/site/scripts/generate.mjs` (→ `lib/generated/`, and formerly
`app/antd-vars.css`), and `copy-llms.mjs` (→ into `out/`, already covered).
`packages/tokens/scripts/build-figma.mjs` writes into `dist/`, covered.
`.scratch/prism/issues/23-go-live.md` item 9 flagged exactly this as a hygiene task
(*"add `app/antd-vars.css` + `lib/generated/**` to root `build.outputs`"*) and the
`lib/generated/**` half landed; the `app/antd-vars.css` half is now moot because
that file is no longer generated.

### The `stylelint` gate is currently a no-op

`stylelint.config.mjs` in full:

```js
/** @type {import('stylelint').Config} */
export default {
  // Rules arrive with the first real CSS (token CSS output, site styles);
  // the Spectral Refraction language (map ticket 08) will set the property
  // ordering and custom-pattern conventions.
  rules: {},
};
```

`pnpm lint` runs `stylelint "**/*.css" --aei` and it exits 0 on any CSS, because
there are no rules. The comment says the rules arrive "with the first real CSS",
which has since happened (`packages/ui/src/styles.css` is substantial and
`copy-styles.mjs` bakes ten theme scopes into `dist/styles.css`), and the rules never
arrived. **Inference:** the CSS half of the lint gate has been inert for the whole
life of the repository.

### What the build actually typechecks

There is no `typecheck` task. Type safety rides on `build`:

- `packages/{tokens,ui,llms,mcp-server}` each run `tsc -p tsconfig.json`, against
  `tsconfig.base.json`: `target es2022`, `module nodenext`, `moduleResolution
  nodenext`, `strict`, `verbatimModuleSyntax`, `isolatedModules`, `resolveJsonModule`,
  `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`,
  `noFallthroughCasesInSwitch`, `declaration`, `declarationMap`, `sourceMap`,
  `newLine: lf`.
- `apps/site` runs `next build` on `next@^16.3.5` with `output: 'export'`.
  `next.config.ts` does not set `typescript.ignoreBuildErrors`, so Next's own
  typecheck runs. **Inference:** the site is typechecked, but as a side effect of
  `next build` rather than as a named gate, and a failure there is reported as a
  build failure.
- The Worker is in the site's TS program. `router.ts` explains the choice: *"Typed
  structurally — the worker typechecks in the same TS program as the site, so
  `@cloudflare/workers-types` (whose globals clash with the DOM lib) is not a
  dependency."* `Env` and `WorkerExecutionContext` are hand-declared interfaces.

### Node version drift, noted

Workflows pin `node-version: 24` in all four `setup-node` steps. The root
`package.json` declares `engines: { node: ">=22" }`, and all four published packages
inherit `engines: { node: ">=22" }`. CI runs 24; the declared floor is 22. Nothing
verifies 22, and nothing sets `engine-strict`.

---

## 9. The two recorded failures, and where they stand

Restated from the ticket, with what the public files actually show:

**(a) The org secret `NPM_TOKEN` was scoped to "Public repositories" and therefore
never injected, so CI publish could not work.**

- Recorded: `.scratch/prism/issues/23-go-live.md`, "One open follow-up" — quoted in
  full in §3 above. Also `.scratch/prism/issues/07-accounts-and-infra.md`:
  *"Publish token = **org-level GitHub secret `NPM_TOKEN`** (granular, org-scoped,
  automation-type), shared with `NaniSoft/prism`. Note for later sessions: org
  secrets don't appear in repo-level `gh secret list` for non-admins — the first
  publish run is the real verification."*
- The mechanism the files show: `cd.yml` reads `secrets.NPM_TOKEN` in a job that has
  **no `permissions:` block** and reaches npm through
  `actions/setup-node`'s `registry-url` + `NODE_AUTH_TOKEN`. There is no second
  auth path, no OIDC/trusted-publishing fallback, and no `environment:`.
- The recorded symptom, verbatim: the lane's log *"still shows `No NPM_TOKEN or OIDC
  available`"* — i.e. it published nothing and exited green, because with no
  `NPM_TOKEN` there is nothing for `changeset publish` to do once every version is
  already on npm. **A credential failure in this lane is indistinguishable from a
  successful no-op.** That is the structural hazard, independent of the scoping bug.
- **Current status: the repository is now `private: false`.** Whether the org secret's
  visibility was changed to "All repositories" cannot be read without org admin
  access. Marked as an open unknown.

**(b) npm publish needs a granular token with 2FA bypass from an org-owner account,
and a CI 404 means the token's account is not in the org.**

- Recorded: `.scratch/prism/issues/23-go-live.md` gotcha 2, quoted in full in §3.
- Consistent with everything the files show: `.changeset/config.json` has
  `access: public` and all four names are scoped packages under an existing org
  (`@nanisoft`), whose packument lists a **personal** npm account as the sole
  maintainer. Nothing in the repo expresses the required token shape, so the
  requirement lives only in prose in a resolved ticket.
- The `.npmrc` typo gotcha (gotcha 3) is worth carrying forward as a habit: the
  repository's own `.npmrc` contains **no** auth key, so a local publish is entirely
  dependent on the developer's own `~/.npmrc`. A malformed key there is silent —
  *"npm silently kept using the old session token."*

**Neither failure has a verified fix in the repository's record.** The most recent
statement about them, `.scratch/prism/map.md` line 55, still reads: *"**One open
follow-up**: the org secret `NPM_TOKEN` still isn't injected into the private repo
(scoped "Public repositories") — fix org-secret visibility before trusting the CI
publish lane; until then release manually via `pnpm build && pnpm release`."* That
sentence is stale in its premise (the repo is public now) and unchanged in its
conclusion (the CI publish lane is not trusted).

---

## 10. What I could not establish, and what is inference

**Not establishable from public files:**

1. Whether the org secrets `NPM_TOKEN`, `CLOUDFLARE_API_TOKEN`,
   `CLOUDFLARE_ACCOUNT_ID` exist today, and their visibility class.
   `api.github.com/repos/NaniSoft/prism/actions/secrets` requires authentication;
   org-secret listings require org admin. `gh secret list` returns nothing to a
   non-admin, which is the trap the repo's own ticket warns about twice.
2. The npm token's type, scopes, 2FA-bypass flag, and owning account. npm's
   registry API does not expose it.
3. Whether any of the ten published versions was published from CI or from a
   developer machine. No GitHub Release exists, and no workflow run log is public.
4. The exact error strings of a changeset validator, because there is no changeset
   validator in this repository. The strings live in `coveo/plasma`'s
   `scripts/validateChangesets.js` and `CONTRIBUTING.md`, neither of which is in
   `NaniSoft/prism`.
5. Cloudflare-side state: the current Worker script ID, its current route
   attachment, the DNS record's present content, and whether `prism.nanisoft.com`
   currently resolves. The Cloudflare API needs the account token. The last recorded
   values are in `.scratch/prism/issues/23-go-live.md`: Worker `prism-site`, version
   `9a6a58be`.
6. GitHub Actions settings: default workflow permissions, the
   `can_approve_pull_request_reviews` toggle's current state, and the environment
   list. `api.github.com/repos/NaniSoft/prism/actions/permissions/workflow` requires
   authentication. `.scratch/prism/issues/07-accounts-and-infra.md` records them as of
   2026-09-14: `default_workflow_permissions: read`,
   `can_approve_pull_request_reviews: true`.
7. Whether the repo's own workflow-run history ever shows a green publish. That is
   visible only to someone with Actions read access.
8. A repo-wide text grep. `api.github.com/search/code` returned
   `403 {"message":"API rate limit exceeded"}` unauthenticated. I compensated by
   reading the complete 517-blob tree (not truncated) and the full text of every
   release-relevant file: all three workflows, all five `package.json` files, the
   root `package.json`, `.npmrc`, `.changeset/config.json`, both `turbo.json` files,
   `pnpm-workspace.yaml`, `stylelint.config.mjs`, `tsconfig.base.json`,
   `apps/site/wrangler.jsonc`, `apps/site/next.config.ts`, `apps/site/worker/*`, and
   the three `apps/site/scripts/*.mjs`. Provenance would have to be enabled in one
   of a workflow, a `package.json` `publishConfig`, or an `.npmrc`; none of those
   exists, and the registry independently confirms it.

**Marked as inference throughout, collected here:**

- Changesets' `privatePackages` default is `{ version: true, tag: false }` when the
  key is absent, so `apps/site` is versioned and appears in CHANGELOGs. Source read
  directly from `@changesets/config@3.1.1` `dist/changesets-config.cjs.js`.
- `changeset publish` executes **`pnpm publish`**, not `npm publish`, because
  `getPublishTool` reads the workspace's detected package manager. Source read from
  `@changesets/cli@3.0.2` `dist/getPublishPlan.mjs`.
- The `--access public` flag is synthesised by changesets from
  `.changeset/config.json`; no flag is written in the repository.
- An org secret scoped to "Public repositories" is now visible to this repository,
  because the repository is now public. Depends on the org setting, unreadable here.
- The stylelint gate has been inert for the repository's life (empty `rules`, and
  real CSS predates the rules never being written).
- `next build` typechecks the site because `typescript.ignoreBuildErrors` is unset.
- `run_worker_first` glob-vs-route-pattern behaviour is quoted from the repository's
  own comment, which asserts it was *"verified live"*. I did not reproduce it against
  a live Worker; I report the repo's claim.
- Deploying to `prism.nanisoft.com` from a new repository: the custom-domain detach /
  re-attach requirement under a Worker rename, and the account-token prerequisites.
  These follow from Cloudflare's one-Worker-per-custom-domain model and from ticket
  07's account facts, not from anything in the repository.
