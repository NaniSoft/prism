---
Type: task
Status: claimed
Labels: wayfinder:task, ready-for-human
Blocked by: 04, 07
---

## Question

Nothing to decide — execute the Figma setup guide (ticket 04) with the accounts from ticket 07:

- Create the Prism Figma library from antd's official kit; connect synced Figma Variables fed by prism-tokens.
- Enable + verify Dev Mode MCP inside an agent session.
- Write the one-page convention doc ("map designs to prism-ui; tokens come from Variables").

## Inherited requirements

Deferred here by resolved tickets — execute with these in hand (2026-09-14 audit):

- **Verify the chosen plugin imports DTCG `$type: 'shadow'` composites** (from [Token architecture](09-token-architecture-spec.md)) before the floating-shadow token exports as a real composite rather than a `$description`/`$extensions` string.
- **Resolve ticket 04's flagged open items** (see its Answer): kit choice, `boxShadow` STRING syntax, Code Connect needing Organization, Enterprise Variables API re-check.
- **Finalize the `.mcp.json` Figma entry** (from [Wire agent tooling](15-wire-agent-tooling.md)) — ready to paste, *both* fields required or Claude Code silently skips it: `"figma": { "type": "http", "url": "https://mcp.figma.com/mcp" }`.

## Answer

<!-- what was done, URLs, who holds seats -->

## Comments

### Agent prep pass — 2026-09-14 (ticket stays claimed; human checklist below)

**Inherited requirement 1 — plugin shadow verification (resolved NEGATIVE, decisively).**
Findings: `.scratch/prism/research/14-figma-shadow-plugin-verification.md`. No off-the-shelf
plugin imports DTCG `$type: "shadow"` composites — source-verified for the one open-source
candidate (Microsoft's **Variables Import** skips all six composite types with a reported info
line); the other two are closed-source with no shadow evidence. Consequence adopted:
**the floating shadow exports as `$type: "string"` carrying the CSS `box-shadow` string**
(`0 4px 16px 0 rgba(11, 18, 32, 0.16)` — byte-identical to what the antd `boxShadow`
allowlist entry consumes), with the true composite preserved in `$extensions["prism.shadow"]`.
`$description` is wrong for this (plugins map it to the Figma variable *description*, not its
value). Binding answer: a Figma STRING variable **cannot** bind to an effect at all (COLOR →
shadow colour, FLOAT → offset/blur/spread per field only) — the shadow variable is Dev-Mode
parity, never a live style, under any future plugin or Enterprise REST.

**Chosen plugin for the first run: Variables Import (Microsoft)** — MIT, source-auditable,
real cross-collection `VARIABLE_ALIAS`, manifest-driven 2-collections × Light/Dark (its demo
is literally this shape; manifest mode order sets the default).

**Inherited requirement 2 — ticket 04's flagged open items:**
- *Kit choice*: free "Ant Design Open Source" scaffold, paid v6 file only as fallback
  (auto-applied, guide's recommendation; recorded in the convention doc).
- *`boxShadow` STRING syntax*: resolved — CSS `box-shadow` string; there is no Figma-native
  string syntax (nothing parses one; Figma only *emits* CSS via Copy-as-CSS).
- *Code Connect*: stays Organization-only ($25/seat Dev), not v1; unchanged.
- *Enterprise Variables API*: gate confirmed Enterprise-only as of 2026-09-14 (same day as the
  guide's research); re-check triggers only on a CI-sync or >20-modes need.

**Agent-side work landed:**
- `docs/design-conventions.md` — the one-page convention doc; linked from `AGENTS.md` + `CLAUDE.md`.
- **ADR-0002 §2d amended** (verified against the research): per-collection×mode file layout +
  importer manifest (`dist/figma/<pack>/manifest.json`, `primitive.tokens.json`,
  `semantic.<mode>.tokens.json`); tier 1 ships `{ref}` aliases (Figma resolves per mode);
  shadow-as-string rule; recorded the tier-name-collision hazard (`shape.radius.*` exists in
  both tiers — ambiguous for the importer's name-based alias lookup; the tokens pass resolves it).
- First-import fixture: `.scratch/prism/assets/14-figma-first-import/` (manifest + 3 token
  files + README with acceptance criteria; JSON validated; ADR-0001 values real, TBDs
  desc-noted as STAND-INs).
- `.mcp.json`: `figma` remote entry added (`type: "http"` + `url`) — becomes "real" when the
  OAuth below succeeds; comes back out if it fails.

**Remaining — human checklist (Full seat, Figma in browser):**

1. [ ] **Library file**: open
     [Ant Design Open Source](https://www.figma.com/community/file/831698976089873405) →
     **Open a copy** → team **NaniSoft** (a folder, not Drafts) → rename the copy to
     **`NaniSoft Design System`**.
2. [ ] **Prune**: delete the kit's demo/cover pages; delete or hide the kit's own colour
     styles so antd hexes can't be picked by accident.
3. [ ] **First import**: install the
     [Variables Import](https://www.figma.com/community/plugin/1253424530216967528/variables-import)
     plugin → run it in the library file → select
     `.scratch/prism/assets/14-figma-first-import/manifest.json` (drag all four files in / per
     plugin UI) → check the outcome against the README's six expectations (two collections;
     Light default; duration info-lines expected; aliases resolve; shadow = STRING variable;
     descriptions land).
4. [ ] **Publish**: Assets tab → Libraries icon → under "This file" → Publish. Then team →
     View settings → Libraries → enable as a team default library.
5. [ ] **MCP**: in a fresh Claude Code session in this repo, `/mcp` → **figma** → approve →
     **Authenticate** → Allow access → expect "Connected". Verify seat:
     `! claude mcp list` shows figma connected; a follow-up agent session runs `whoami`
     (exempt from rate limits; reports seat type — expect a Dev or Full seat on Professional,
     200 read calls/day).

Resolution lands when 1–5 are confirmed (or fail with details); then the map gets this ticket's
gist and the tokens-fog note inherits the shadow/manifest decisions above.
