# Issue tracker: GitHub

Issues for this repo are GitHub issues at `github.com/NaniSoft/prism/issues`. A
change lands as a pull request against `main`, reviewed through the gates in
`docs/quality-gates.md`.

## Conventions

- One issue per need, not per implementation step. Describe the product need,
  not the patch; the maintainer owns the decision (see `CONTRIBUTING.md`).
- The issue carries its reasoning. `PRODUCT.md`, `CONTEXT.md` and `DESIGN.md`
  carry the rules a decision settles; a decision that changes one of them
  updates it in the same pull request.
- Triage state is a label on the issue (see `triage-labels.md`), not a line in a
  file.
- Comment and conversation history live on the issue thread.

## When a skill says "publish to the issue tracker"

Open an issue at `github.com/NaniSoft/prism/issues`, or open a pull request
against `main` when the work is already done. Confirm the remote with
`git remote -v` before writing a URL.

## When a skill says "fetch the relevant ticket"

Fetch the issue by number or URL. `gh issue view <number> --repo NaniSoft/prism`
reads one; the user will normally pass the number or the link directly.

## What is not here

There is no per-feature directory, no numbered ticket file, and no planning map
in the repository. A multi-session effort is a branch and a pull request, and
what it decides is written into the root documents as it is decided. If a skill
tells you to write `map.md`, a `spec.md`, or `issues/NN-<slug>.md`, do not
create those paths: put the question and its answer in the pull request
description or in the document the decision belongs to.
