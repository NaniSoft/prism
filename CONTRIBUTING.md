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

## Governance

Prism has one maintainer, and `CODEOWNERS` carries a single catch-all owner
line. The vocabulary is fixed in `CONTEXT.md`; use its terms and avoid the words
it retires. The visual and token rules are fixed in `DESIGN.md`. If a change
would contradict either, open an issue rather than changing the document to
match the code.

## License

Prism is distributed under the MIT license in `LICENSE`. Third-party works are
attributed in `THIRD-PARTY-NOTICES.md`. Keep the license and notices intact.
