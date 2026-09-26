---
Labels: wayfinder:research
Type: research
Status: resolved
---

# How does the old repository release, and what will bite us

## Question

The old repository already publishes four packages under `@nanisoft` and has a
working release lane. This effort re-publishes the same four names from a new
repository, on a clean break, as a major bump. The lane has to be rebuilt, and
the old one carries at least two recorded failures worth not repeating.

Read `github.com/NaniSoft/prism` branch `main` and report:

1. **The full `.github/workflows/` inventory.** Every file, its triggers, and
   what it does, job by job. The old map records that two workflow files carry
   swapped names, so establish what each one actually is rather than what it is
   called.
2. **The release path end to end.** Changeset config, how a version PR is
   opened, what triggers the publish, whether publishing is automatic or
   manually dispatched, and whether GitHub Releases are created.
3. **npm authentication, precisely.** The old map records two concrete
   failures: the org-level `NPM_TOKEN` secret was scoped to private
   repositories only and so never reached a public repo's CI, and publishing
   needs a granular token with 2FA bypass held by an org owner. Establish what
   the workflows do today, and what has to be true for a publish from a new
   public repository to succeed on the first attempt.
4. **Provenance and publish safety.** Whether npm provenance is enabled,
   whether `publint` gates every package or only some, and what `--access`
   and `--provenance` flags are passed.
5. **The changeset conventions**, including any validator script. The old map
   records that releases are driven by changesets and never inferred from
   commit messages, and that every PR is expected to answer "what would this
   publish?".
6. **Per-package release surface.** For each of the four packages: `files`,
   `exports`, `prepublishOnly`, `sideEffects`, `engines`, `license`, `author`,
   `homepage`, `repository`, and whether the `repository.directory` field is
   set correctly now that the packages live in a different repository.
7. **The Cloudflare side.** The Worker name, the Custom Domain attachment, the
   assets configuration including `run_worker_first` and the `.md` prefix
   rewrite, and what deploying the new site over `prism.nanisoft.com` would
   require.

Flag anything that cannot be established from public files. Do not propose a
workflow; report the current one and its failure modes.

## Answer

Full findings, 1 569 lines with every inference collected in one section, are in
[research/02-old-repo-release-and-npm-machinery.md](../research/02-old-repo-release-and-npm-machinery.md).

### Three premises of this ticket were wrong, and that is the headline

The ticket, and the map's Decisions so far, described a changeset validator, a
per-PR release preview with private-package filtering, `CODEOWNERS` and
`CONTRIBUTING.md` as things the old repository had. **It has none of them.**

- **No `.github/actions/` directory.** No composite actions at all. All three
  workflows inline every step. plasma has five.
- **No `CONTRIBUTING.md`, no `CODEOWNERS`, no root `scripts/`.** So there are
  zero enforced changeset rules and zero error strings to port.
- **No `.dev.vars.example`.** The Worker has no bindings beyond `ASSETS`.

The changeset title rule, the no-trailing-period rule, the `# Migration`
requirement on a major, and the release preview are **coveo/plasma's**, recorded
as a recommendation in the old repository's own
`.scratch/prism/research/01-plasma-conventions.md` and never built. This map
inherited plasma's conventions and then attributed them to the old repository.
Corrected here so the release lane ticket stops treating them as prior art to
copy.

Independently confirmed against the repository root listing: `LICENSE`,
`THIRD-PARTY-NOTICES.md`, `PRODUCT.md`, `CONTEXT.md`, `DESIGN.md`, `AGENTS.md`,
`CLAUDE.md`, `README.md`, `tsconfig.base.json`, `turbo.json`, `stylelint.config.mjs`
and `docs/` are present. `CONTRIBUTING.md` and `CODEOWNERS` are not.

### The swapped workflow names are confirmed, and `name:` is the truth

| File | `name:` | Trigger | What it actually is |
| --- | --- | --- | --- |
| `ci.yml` | `CI` | `pull_request`, `push: main` | Gates, plus the site deploy |
| `release-pr.yml` | `Changesets` | `push: main` | The version-PR lane |
| `cd.yml` | `Release (publish)` | `workflow_dispatch` only | The npm publish lane |

There is no continuous deployment anywhere. The site deploys from a
`deploy-site` job inside `ci.yml` on push to main, so the site ships on every
merge rather than on a release.

### The release path as it stands

`fixed: []` and `linked: []`, so packages version independently, which the
registry confirms: tokens and mcp-server at 0.3.0, ui and llms at 0.4.0. Publish
is manual dispatch only. There are no GitHub Releases; the repository has ten
changeset-style `@nanisoft/pkg@x.y.z` tags instead. There is no prerelease lane
and no `next` branch. The changelog is stock, with no GitHub-linked generator.

**Four unconsumed changesets sit on `main`, one of them a `major` for all four
packages.** Merged as they are, they would take all four to 1.0.0, and they have
never been versioned. So the rebuild's major bump is not the first major these
names would have seen, and the migration note has to reckon with a 1.0.0 that
never shipped.

### npm authentication, and why the recorded failures happened

`NPM_TOKEN`, `NODE_AUTH_TOKEN` and `registry-url` appear in `cd.yml` only. The
root `.npmrc` contains `store-dir=.pnpm-store` and no auth key whatsoever. There
is no `environment:`, no `id-token` and no `permissions:` block in the publish
job. So the publish lane has no environment gate, no OIDC and no provenance
path, and it depends entirely on a repository-level secret that the old
repository's own map records as scoped to private repositories and therefore
never injected into a public repository's CI.

**Provenance is off, established three ways:** no flag and no `id-token`
anywhere; `@changesets/cli@3.0.2` only ever passes `--access` and `--tag`; and
the published manifests carry no `dist.attestations`. Also worth knowing: the
publish executable is `pnpm publish`, not `npm publish`, because the changeset
action reads the detected workspace package manager.

All four packages gate on `publint` via `prepublishOnly`, which is better than
plasma, where `llms` and `mcp-server` do not. There is no `publishConfig`
anywhere.

### Two defects the ticket did not ask about

**`stylelint` runs in CI with `rules: {}`.** The CSS half of the lint gate has
been inert since real CSS landed, which means the old repository's styles were
never actually linted despite appearing to be.

**`privatePackages` is unset** in `.changeset/config.json`, so changesets' runtime
default of `{version: true, tag: false}` applies and `apps/site` is version
bumped and appears in changelogs. plasma sets it to `false`; that was not
adopted. A private app should not be versioned.

### Corrections to the ticket's own assumptions

`packages/llms` does devDepend on `@nanisoft/prism-mcp-server`, but only for
`scripts/check.mjs`; its `src/` has zero imports of it, so the dependency is
narrower than the package graph suggests. There are no circular devDependencies:
`mcp-server` declares no internal dependencies at all. And `packages/ui` has
**13** `exports` keys, being 10 module subpaths plus `./styles.css` plus
`./package.json`, so the "10 subpaths" figure counts modules only.

### Not establishable without credentials

Organisation secret state and visibility, the shape and scopes of the publish
token, GitHub Actions run logs, and all Cloudflare state. Every inference is
marked as one and gathered in the findings file. The practical consequence is
that the first-publish checklist has to be written as a human-executable
procedure rather than derived from what the old lane is known to do, because what
the old lane is known to do is "fail".

