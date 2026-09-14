# CLAUDE.md

## Project

Prism — an Ant Design–based design system (`@nanisoft/prism-*` packages), with its site at prism.nanisoft.com (Fumadocs headless, static export on Cloudflare Workers). Apps always import from `@nanisoft/prism-ui`, never from antd directly. See the wayfinder map's Notes for all standing decisions.

## Wayfinding

Active effort: **Prism** — map at `.scratch/prism/map.md`. Work open, unblocked, unclaimed tickets from the frontier; set `Status: claimed` on a ticket before starting it.

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles map to default label strings of the same names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
