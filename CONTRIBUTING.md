# Contributing to Prism

Thanks for contributing to Prism, NaniSoft's design system. This guide covers
setup, the contribution path, the acceptance criteria and the changeset
conventions. Read `CONTEXT.md` for the vocabulary and `DESIGN.md` for the rules
your change has to respect.

## The contribution path

Prism has one source of truth. There is no consumer merge, no token override and
no wrapper theme, so a downstream product never owns a style, a token or an
animation.

When Prism lacks a component, token, variant or behaviour:

1. **Request it upstream.** Open an issue at
   `github.com/NaniSoft/prism/issues` describing the product need rather than the
   implementation.
2. **Contribute a pull request against this repository** if you can. The change
   lands here, is published from here, and reaches every consumer through the
   packages.
3. **The maintainer owns the decision.** Prism is a curated system with one
   maintainer. A request that widens the public surface is accepted or declined
   by that maintainer, and the reasoning is recorded on the issue.

Do not ship a local override, a wrapper theme or a copied component. Those are
forks, and a fork has no upgrade path.

## Prerequisites

- **Node 22 LTS** (the version CI runs).
- **pnpm**, enabled with `corepack enable`. The exact version is pinned in
  `package.json` under `packageManager`.

## Setup

Run every command from the repository root.

```sh
pnpm install
```

## Everyday commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | run the documentation site |
| `pnpm build` | build every package and the site |
| `pnpm test` | run the test suite |
| `pnpm check` | run the gates (contrast, emitted contract, motion, surface, layout, dash, corpus drift) |
| `pnpm lint` | lint with oxlint |
| `pnpm typecheck` | type-check every package |
| `pnpm changeset` | declare a release for a published change |

Use `pnpm --filter @nanisoft/prism-ui <task>` to run one package.

## Making a change

- Write TypeScript for new code and prefer inference. Export types for public
  APIs.
- Use React 19 function components with the hook and JSX runtimes, and prefer
  named exports.
- A component consumes **semantic utilities only** (`bg-background`,
  `text-muted-foreground`). No raw hex outside the token foundation tier, no raw
  ramp utility, no token literal, no hardcoded duration or easing, and no
  keyframes.
- Put the component's documentation in a JSDoc comment on the exported
  component. The declaration build preserves it, and the corpus reads it.
- Keep the documentation current. When a public surface, token or rule changes,
  update the item's JSDoc or MDX, its catalogue entry, and the document that
  states the rule: `CONTEXT.md` for vocabulary, `DESIGN.md` for visual and token
  rules, `README.md` for adoption.

## Tests

New tests use Vitest and React Testing Library. Test user-facing behaviour rather
than implementation details, and co-locate the spec with its source. Write test
names in the present tense (`it('returns true when value is valid')`) rather than
starting them with "should". A component test covers keyboard operation, focus
management, roles and names, not only rendering.

## Writing changesets

Add a changeset whenever your pull request changes a published package. The
changeset becomes the entry in that package's `CHANGELOG.md`, so write it for a
consumer of the package.

```sh
pnpm changeset
```

A changeset is frontmatter (package and bump) followed by a title and an optional
body:

```markdown
---
'@nanisoft/prism-ui': minor
---

Add a `size` prop to `Button`

The prop accepts `sm`, `default` and `lg` and defaults to `default`.
```

**Title (the first line):**

- One line, sentence case, and no trailing period.
- Written from the consumer's perspective: what changed, not how.
- Wrap a component, prop or API name in backticks.
- No `**BREAKING:**` prefix; a `major` bump already marks a breaking change.
- 100 characters or fewer. Put anything longer in the body.

**Body:**

- Separate it from the title with a blank line.
- Write prose. Markdown lists are allowed.
- A `major` requires a body **and** a `# Migration` section with steps. A
  `minor` requires a body. A `patch` may be a title alone.

Validate before pushing; CI runs the same check:

```sh
pnpm changeset:validate
```

## Opening a pull request

1. Branch off `main`. Do not push to `main`.
2. Make the change following the conventions above.
3. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm check`,
   and make them pass.
4. Add a changeset for every published package your change affects.
5. Fill in the pull request template: proposed changes, potential breaking
   changes, and the acceptance criteria checklist.

CI runs the gates on every pull request. A version pull request is opened on
`main` by the release lane; publishing is a separate, manual, environment-gated
step described in `.github/workflows/publish.yml`.

## Releases

Publishing is manual and environment-gated. Merging a pull request never
publishes on its own.

1. The release lane opens or updates a "Version Packages" pull request on `main`
   from the changesets. Merge it once the versions and the `CHANGELOG.md` entries
   are right.
2. Rehearse first: Actions -> Release (publish) -> Run workflow, on `main`,
   `channel: latest`, `dry_run: true`. The rehearsal builds, verifies the
   tarballs and runs `pnpm publish --dry-run` without touching the registry.
3. Publish: run the same workflow with `dry_run: false`. The `npm-publish`
   environment puts a required reviewer in front of the job.

`@nanisoft/prism-tokens` and `@nanisoft/prism-ui` are a linked pair and share a
version. `@nanisoft/prism-llms` and `@nanisoft/prism-mcp-server` version
independently. `@nanisoft/site` is private and is never versioned or tagged.

The publish job uses npm trusted publishing over OIDC and enables provenance, so
it carries no long-lived token. If OIDC is ever unavailable, the fallback is a
granular access token with `Packages: Read and write`, scoped to `@nanisoft`,
with 2FA bypass, owned by an account that is a member of the `nanisoft` org with
publish rights, stored as a repository secret `NPM_TOKEN`. A secret scoped to
private repositories never reaches this public repository, and a token owned by
an account outside the org presents as a 404 rather than a 403.

Run the release floor directly with `pnpm release:verify`, which packs every
publishable package and asserts its contents.

### Before the first publish

Each item is checked once, by a human, before the first publish from this
repository:

- `NaniSoft/prism` exists, is public, and has `main` as its default branch.
- The npm account that owns the four packages has two-factor authentication on.
- Each of `@nanisoft/prism-tokens`, `@nanisoft/prism-ui`,
  `@nanisoft/prism-llms` and `@nanisoft/prism-mcp-server` has a trusted publisher
  on npmjs.com: **Organization or user** `NaniSoft`, **Repository** `prism`,
  **Workflow filename** `publish.yml`, **Environment name** `npm-publish`, and
  allowed action direct `npm publish`.
- Each package sets `repository.url` to
  `git+https://github.com/NaniSoft/prism.git` exactly (case-sensitive, or
  provenance fails silently) and the matching `repository.directory`.
- GitHub allows Actions to create and approve pull requests, so the release lane
  can open the version pull request.
- `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are repository secrets, not
  org secrets.
- Branch protection on `main` requires the `ci.yml` `verify` check.
- The rehearsal passes: dispatch the publish workflow with `dry_run: true` and
  confirm `node scripts/verify-tarballs.mjs` passes.

### Prereleases

The `next` branch is the prerelease lane.

- Enter it once: `git switch -c next && pnpm changeset pre enter next`, then
  commit `.changeset/pre.json` to `next`.
- The release lane versions pushes to `next` as `1.0.0-next.0`, `1.0.0-next.1`
  and so on. Dispatch the publish workflow on `next` with `channel: next` to
  publish under the `next` dist-tag. `latest` is untouched.
- Exit it: `pnpm changeset pre exit` on `next`, commit the removal of
  `.changeset/pre.json`, and merge `next` into `main`. The next version pull
  request collapses the prereleases into a single stable release.

## Governance

Prism has one maintainer, and `CODEOWNERS` carries a single catch-all owner
line. The vocabulary is fixed in `CONTEXT.md`; use its terms and avoid the words
it retires. The visual and token rules are fixed in `DESIGN.md`. If a change
would contradict either, open an issue rather than changing the document to
match the code.

## License

Prism is distributed under the MIT license in `LICENSE`. Third-party works are
attributed in `THIRD-PARTY-NOTICES.md`. Keep the license and notices intact.
