# 05 — Agent surface and repository truth sweep

Type: task
Status: resolved
Blocked by: 04

## Question

Regenerate and rewrite the LLM/MCP corpus, current product/design/agent docs, package metadata, attribution, and release notes so the repository tells one current truth while preserving historical records as history.

## Acceptance

- The generated corpus, MCP descriptions/rendering, quickstart, and current docs describe only the Prism-owned Base UI-backed system.
- No active source/config/package path depends on or routes consumers to the retired runtime.
- Historical ADRs/research remain identifiable as superseded rather than silently rewritten.
- Changesets declare the breaking package releases and docs corpus delta.
- Full build/test/check/lint passes.

## Answer

Regenerated the 43-item, six-guide, ten-theme corpus and rewrote MCP storage, search, rendering, fixtures, and tests around the owned catalog. Current README, product/design/agent docs, package metadata, attribution, ADRs, and changelogs now describe the Prism-owned Base UI-backed system; older Ant Design material is retained as explicitly historical context. Added the breaking release changeset. Final `pnpm build`, `pnpm test`, `pnpm check`, and `pnpm lint` all pass; active package and declaration sweeps contain no legacy runtime or public Base UI references.
