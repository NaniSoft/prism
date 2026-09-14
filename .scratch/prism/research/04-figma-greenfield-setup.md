# Figma greenfield setup — Prism (NaniSoft)

Resolves: `.scratch/prism/issues/04-figma-greenfield-setup.md` · Researched: 2026-09-14 · All facts checked against primary sources on the day.

> **Executive summary.** Greenfield Prism needs one **Figma Professional plan** (paid — this is not optional), **one Full seat** for whoever owns the library file, and **Dev seats** ($12/mo) for engineers. There is **no official antd Figma kit** — the antd team has explicitly declined to build one — so the base library is the free "Ant Design Open Source" community file treated as a *disposable scaffold*, with Prism's **Figma Variables** as the real source of visual truth. Token sync is **one-way code → Figma via a small repo-owned Figma plugin** fed by `@nanisoft/prism-tokens` build output (the Variables REST API is **Enterprise-only**, so it is off the table on Professional). The **Figma Dev Mode MCP remote server** (`https://mcp.figma.com/mcp`) works on **any seat and any plan, including free Starter** — but on a paid plan with a Dev or Full seat you get **200 tool calls/day** instead of 6/month. The desktop MCP server additionally requires the **Figma desktop app** plus a Dev or Full seat.

---

## 0. Reality checks that change the plan

Three findings from the primary sources that contradict assumptions baked into the map and this ticket. Read these first — the guide is built around them.

### 0.1 There is no official antd Figma UI kit

- `ant.design/docs/resources` labels **every** Figma entry **"Third Party"**. The only "Official" design resources are **Sketch** files (Sketch Symbols, Mobile Components, Ant Design Pro, Ant Design Chart) plus **Kitchen**, a Sketch plugin.
- The antd GitHub org has no Figma kit repo: `ant-design/antd-library` is an **Axure** library ("Axure library for Ant Design", `library.ant.design`), and `ant-design/kitchen` is a Sketch plugin (last push 2023-05-18).
- The antd team's own position, from the maintainer `arvinxx` on [ant-design/ant-design discussion #40405 "Official Figma Support"](https://github.com/ant-design/ant-design/discussions/40405) (opened 2023-01-25, still **open**):
  > "We won't support figma for now, and maybe never. Because we don't use figma internally so we have no people to work for figma version design resources."
- So "import antd's official Figma UI kit" is not achievable. What *is* achievable: import a community kit and **restyle it through Prism's own Variables** so the kit's original fidelity stops mattering. That is exactly what the map already plans ("antd's official kit, restyled via Variables") — the kit is the component *shape* scaffold, never the colour/type source.

### 0.2 The Figma Variables REST API is Enterprise-only

`POST /v1/files/:file_key/variables` is gated in the [Variables REST API docs](https://developers.figma.com/docs/rest-api/variables-endpoints/):

> "This API is available to full members of Enterprise orgs."

At **$90/seat/mo Enterprise** vs **$16/seat/mo Professional**, this single sentence eliminates the "clean" CI-driven sync option for Prism v1. It also makes the whole thing reversible later — see §4.

### 0.3 Dev Mode MCP no longer requires a paid seat

The 2025-era "you need a Dev/Full seat on a paid plan" rule is gone for the **remote** server. From [Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server), verbatim:

> "The remote server is available on all seats and plans."
> "The desktop server is available on a Dev or Full seat for all paid plans."

Paid plans are still required for **libraries** and for **variable modes** — which Prism genuinely needs — so Professional is bought for those reasons, not for MCP.

---

## 1. (a) Create the NaniSoft team — what's free vs paid

### 1.1 Plan + seat facts (recorded 2026-09-14)

Prices from [figma.com/pricing](https://www.figma.com/pricing/); seat definitions from [Manage seats in Figma](https://help.figma.com/hc/en-us/articles/360039960434-Manage-seats-in-Figma); plan feature table from [Figma plans and features](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features).

| Plan | Full seat | Dev seat | Collab seat | Billing |
|---|---|---|---|---|
| **Starter** | Free | — | — | Free |
| **Professional** | $16/mo | $12/mo | $3/mo | monthly or annual |
| **Organization** | $55/mo | $25/mo | $5/mo | billed annually |
| **Enterprise** | $90/mo | $35/mo | $5/mo | billed annually |

Seat semantics (verbatim from the seats article):

- **Full seat** — "Full access to all Figma products, including Figma Design, Figma Make, Dev Mode, Figma Draw, Figma Slides, and FigJam." **The only seat that can edit design files**, hence the only seat that can own/publish the library.
- **Dev seat** — "Full access to Dev Mode, Figma Slides, and FigJam" + "View and comment access in Figma Design files." **Cannot edit the design files.**
- **Collab seat** — Slides + FigJam, view/comment in Design files; "No access to Dev Mode; basic inspection only."
- **View seat** — not purchasable; "Viewers/commenters are always free on paid plans."

What each plan adds that Prism cares about:

| Capability | Starter (free) | Professional | Organization | Enterprise |
|---|---|---|---|---|
| Team/folders | "A single team with one folder and 3 files" | unlimited folders | multiple teams | teams + workspaces |
| Version history | 30 days | unlimited | unlimited | unlimited |
| **Libraries** (components/styles/variables) | **no** — "you can't publish them in a library to access them in other files" | **yes** | yes + team/workspace/org scope | yes |
| **Variable modes** | **no** | "Up to 10 modes per collection" | "Up to 20" | "Unlimited modes with extended collections" |
| Dev Mode | **no** | **yes** | yes | yes |
| Code Connect | no | no | yes | yes |
| Branching/merging | no | no | yes | yes |
| **Variables REST API** | no | no | no | **yes** |

### 1.2 Step-by-step

1. **Sign up / create the team.** In the Figma file browser: *New team* → name it **NaniSoft**. Do not create it as a Starter team if you intend to publish libraries — the Starter plan caps you at "one folder and 3 files" and cannot publish libraries at all.
2. **Buy Professional.** Start here. Upgrade to Organization later only if you need branching/merging, Code Connect, or org-wide library scoping.
   - **Do not buy Enterprise for the Variables API.** $90 × seats/mo to avoid one manual plugin run is not the trade. Revisit in §4.4.
3. **Assign exactly one Full seat** — the person who owns `NaniSoft Design System` (the library source file). Publishing a library "Requires a Full seat with edit access to the library's source file" ([Publish a library](https://help.figma.com/hc/en-us/articles/360025508373-Publish-a-library)).
4. **Assign Dev seats** to every engineer who will run Dev Mode MCP or inspect designs. $12/mo each; they get Dev Mode + view/comment in design files. They cannot accidentally break the library, which is the right default.
5. **Collab/View for PM + anyone else who just needs to look** — $3/mo Collab, or free Viewer. Note the MCP consequence in §5.2: a Collab/View seat is rate-limited to **6 tool calls/month**, so anyone expected to run an agent against Figma needs a Dev seat.
6. **Record in ticket 07's Answer:** team name, plan, who holds the Full seat, the seat roster, and the password-manager entry.
7. **Skip for v1:** Organization "branching and merging" (nice for a design-system file, not worth 3× the seat cost before the site ships) and "Manage MCP connectors" (Organization/Enterprise, admins only).

**Free vs paid, in one line:** you can prototype the entire Prism Figma setup on **Starter for $0** (drafts, local variables in one file, remote MCP at 200 calls/day) — but you **cannot publish a library or use a second variable mode** there, so the moment you need dark mode shared across files you are on **Professional**.

---

## 2. (b) Base the library on an antd kit, restyle via Variables

### 2.1 Pick the kit (honest comparison)

| Option | Cost | antd version | Variables? | Verdict for Prism |
|---|---|---|---|---|
| **Ant Design Open Source** — [figma.com/community/file/831698976089873405](https://www.figma.com/community/file/831698976089873405) | Free | stale (v4-era; comments ask "Will v5 be available soon?") | no | **Recommended starting scaffold.** Free, code-accurate historically, published by `@antdesign` on Figma Community. Listed on ant.design's resources page (labelled "Third Party"). |
| **Ant Design System - v6** — [figma.com/community/file/1574139834768289607](https://www.figma.com/community/file/1574139834768289607) | third-party, paid | v6 | yes (claims "official Ant Design tokens, components, and themes (light & dark)") | The only v6-shaped option. Buying it is a judgement call for ticket 14; even then, strip its token layer and bind to Prism's. |
| [antforfigma.com](https://www.antforfigma.com) | paid (~$199, widely criticised) | rolling | yes | Skip unless v6 fidelity turns out to be the blocker. |
| [AntUIKit](https://www.antuikit.com) / [AntBlocks UI](https://www.antblocksui.com/#figma) | paid / mixed | varies | varies | AntBlocks UI is *blocks* (useful later for dashboard compositions), not a component base. |
| Official antd kit | n/a | n/a | n/a | **Does not exist** — see §0.1. |

**Decision for the guide:** start with the free **Ant Design Open Source** file, treat it as scaffolding to be overwritten, and accept that its v4-era fidelity is a non-issue *because* §2.4 re-binds every visible property to Prism Variables. Re-evaluate the v6 file only if component variants turn out to be materially missing.

### 2.2 Import it as a team library

Prerequisites: a Professional plan (libraries are paid-only), and a **Full seat**.

1. **Duplicate into the team.** Open the community file → **Open a copy** → choose the **NaniSoft** team → a folder. Publishing is blocked from Drafts: "If the file is in your drafts, you'll need to move it to a folder before publishing."
2. **Rename to the library's real name.** "A library inherits its name from the source file" — so call it **`NaniSoft Design System`**, not "Ant Design Open Source". The library name is what every consumer sees.
3. **Prune before publishing.** Delete the kit's demo/cover pages, and delete or hide its own colour styles so nobody can pick an antd colour by accident (§6). Fewer published assets = a smaller library panel.
4. **Publish.** Assets tab → Libraries icon → under "This file" → **Publish** → describe the change → uncheck anything you don't want public → **Publish**. (There must be "at least one component, style, or variable in the file".)
5. **Enable it as a team default library.** Team dropdown → **View settings** → Libraries → toggle the library on and choose which file types it applies to (Professional path per [Enable a library for a team](https://help.figma.com/hc/en-us/articles/360039234953-Enable-a-library-for-a-team)). "Only team admins can manage default libraries for the team."
6. **Subscribe consumers.** Designers/engs open any file in the team and the library's components appear in the Assets panel; published updates arrive as a "library update available" banner they accept per-file.
7. **Org/Enterprise only (not v1):** choose publish scope (team / workspace / org), and set a **team default variable mode** — available on Enterprise "if the library contains a variable collection with at least two modes".

### 2.3 Set up the Prism Variables layer (do this before restyling)

Two collections, published from `NaniSoft Design System`:

- **`prism.primitive`** — raw values. One variable per primitive token (`prism/blue/500`, `prism/gray/100`…). No modes. Nothing in the design references these directly except `prism.semantic`.
- **`prism.semantic`** — the layer designs actually consume. Aliases into `prism.primitive`, and the only collection with modes.

Modes: Professional allows "Up to 10 modes per collection" — Prism v1 needs exactly two, **`Light`** (default) and **`Dark`**. Create via the Variables view → open the collection → **New variable mode**; "Moving a column fully left makes it the **default mode**" ([Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)). Set **Light** as default so unpublished/new files render in the NaniSoft brand.

Variable types are only four — `COLOR`, `FLOAT`, `STRING`, `BOOLEAN` — so antd's `borderRadius`, `fontSize`, `lineHeight`, spacing and `boxShadow` are `FLOAT`/`STRING` variables; shadows are `STRING` (Figma's box-shadow value syntax). This 4-type ceiling is one of the documented Tokens Studio pain points ("Tokens Studio supports 23 unique Token Types and there is only 4 Variable Types") and it binds Prism equally.

### 2.4 Restyle the kit through Variables (never by hand)

1. Select a kit component instance → open **Detach instance** only where the kit has no equivalent variant you need. Prefer leaving it as an instance and editing the *main component* once.
2. In the right sidebar, click each fill / stroke / effect / border-radius value → the variable picker (the `⌥`/stack icon) → **apply a variable** from `prism.semantic`. Never type a hex.
3. Work main-component-first, in descending traffic order: `Button`, `Input`, `Select`, `Table`, `Modal`, `Card`. Every fill you bind in a main component propagates to all instances.
4. Repeat per mode: with the collection in **Dark** mode, check contrast — aliases resolve per-mode automatically ("an alias's rendered value follows the active mode in context").
5. Publish again. Consumers get the restyled components on update.
6. Once `prism-mcp-server` / Code Connect exist (Organization plan required for Code Connect — a later upgrade), bind kit main components to `prism-ui` component names so `get_code_connect_map` returns Prism components instead of generic divs. Until then §6's convention doc is the manual substitute.

---

## 3. (c) One-way token sync: `@nanisoft/prism-tokens` → Figma Variables

Goal per the map: **one-way code → Figma only**. Two-way is explicitly out of scope ("tar pit"). Also note the direction is unusual: most token tooling assumes *Figma is the source of truth*. Here the npm package is, and Figma is a *rendered view* of it.

### 3.1 The three candidates

**Option A — Tokens Studio for Figma (plugin, git-backed)**

[docs.tokens.studio](https://docs.tokens.studio/) documents sync providers for GitHub, GitLab, Bitbucket, Azure DevOps, JSONBin, Supernova, the Tokens Studio Platform, a generic URL provider, and generic versioned storage. Its relationship to Variables is *export/import*, not sync: it can "attach Design Tokens to Variables (and styles)" — export Tokens→Variables, and separately "Create Tokens from Variables" ([Variables and Tokens Studio](https://docs.tokens.studio/figma/variables-overview)).

- **Fits** the map's *name* (Tokens Studio is the industry default) but not the map's *constraint*: its git provider means the plugin both **pulls and pushes** token JSON from the repo. That makes the Figma file a writable token editor and re-opens the two-way tar pit the map closed.
- Multi-mode export needs paid pro features: "Export from Themes (pro)" is required to get "a single collection with multiple modes", and "Non-Local Variables (pro)" is separate.
- Documented gaps: "Tokens Studio is not yet able to control Figma's Scoping or Hide from Publishing features"; the plugin's Theme Switcher stops working once themes attach to a Variable Collection; many variables can be silently skipped.
- **Verdict: wrong direction.** Adopting Tokens Studio as the *sync* layer hands the source of truth to a plugin and a git round-trip. Using it purely as a one-shot importer (git sync disabled) is acceptable but buys nothing over Option C.

**Option B — Figma Variables REST API**

The semantically perfect fit: three endpoints, all documented at [developers.figma.com/docs/rest-api/variables-endpoints](https://developers.figma.com/docs/rest-api/variables-endpoints/):

| Method | Path | Tier / scope |
|---|---|---|
| `GET` | `/v1/files/:file_key/variables/local` | Tier 2, `file_variables:read` |
| `GET` | `/v1/files/:file_key/variables/published` | Tier 2, `file_variables:read` |
| `POST` | `/v1/files/:file_key/variables` | Tier 3, `file_variables:write` + edit access |

The `POST` is a single **atomic** bulk write of four ordered arrays — `variableCollections`, `variableModes`, `variables`, `variableModeValues` — returning `meta.tempIdToRealId` so one request can create a collection, two modes, every variable, and every per-mode value in one shot. Limits are generous: "Max 40 modes per collection; mode names ≤ 40 characters", "Max 5000 variables per collection", names must be unique per collection and "cannot contain special characters like `.{}'", body ≤ 4MB (`413` above). Modes are created through `variableModes` and values set per mode via `variableModeValues[].modeId`; aliases are `VARIABLE_ALIAS` objects. Published variables must use a **main** file key: "This must be a main file key, not a branch key, as it is not possible to publish from branches."

- **Blocked:** "This API is available to full members of Enterprise orgs." `$90/seat/mo`. Not viable for Prism v1 on Professional.
- **Verdict: right design, wrong plan tier.** Design the token JSON so this is a drop-in later (§4.4).

**Option C — a small repo-owned plugin fed by the tokens build (recommended)**

A thin Figma plugin in the Prism monorepo (e.g. `tools/prism-figma-sync`) that reads the **built** `@nanisoft/prism-tokens` JSON and writes local variables with the plugin API (`figma.variables.createVariable()`, `setValueForMode()`, `setVariableAsync()` for aliases). No third-party plugin dependency; no Figma credential in CI; no read path back to the repo.

- Runs inside `NaniSoft Design System` on Professional — no Enterprise needed.
- One-way by construction: the plugin has no export step committed to the repo, and the built JSON is the only input.
- Deterministic and diffable: the same input JSON always produces the same collection/mode/variable names.
- Cost: it's ~200 lines of plugin code you own, and it runs when a human clicks it, not on merge.
- Off-the-shelf stand-ins if you don't want to write it yet: **[Variables Import](https://www.figma.com/community/plugin/1253424530216967528/variables-import)** ("batch import a bunch of variables from a single JSON file, or multiple modes from multiple JSON files", explicitly "intended as a temporary" tool), **[Design Tokens to Variables](https://www.figma.com/community/plugin/1410168064290005516/design-tokens-to-variables)** (W3C DTCG format, multi-mode), **[tokenhaus](https://www.figma.com/community/plugin/1578065513743190845/tokenhaus-variable-import-export-with-links)** (preserves alias links). Fine for ticket 14's first run; replace with the owned plugin once token shape stabilises.

### 3.2 Recommendation

**Option C.** Ship ticket 14 with **Variables Import** (or Design Tokens to Variables) to prove the pipeline, then replace it with the repo-owned `prism-figma-sync` plugin. Keep `@nanisoft/prism-tokens`' build output **DTCG/W3C-shaped** so the same file is both plugin-readable and, if Prism ever lands on Enterprise, a direct payload for `POST /v1/files/:file_key/variables`.

**Do not use Tokens Studio as the sync layer** — its git provider reintroduces the two-way coupling the map forbids, and the multi-mode export path sits behind pro features.

### 3.3 Mapping: tokens → Variables (incl. dark mode)

| `@nanisoft/prism-tokens` | Figma |
|---|---|
| token group/file | **collection** (`prism.primitive`, `prism.semantic`) |
| token path `color.bg.container` | variable name `color/bg/container` (`/`-separated; `.` `{}` `}` are illegal, names unique per collection) |
| token sets `light` / `dark` | **two modes** on `prism.semantic`, `Light` (default) + `Dark` |
| alias / reference | `VARIABLE_ALIAS` (resolved per-mode at render time) |
| `color.*`, `opacity.*` | `COLOR` variable |
| `fontSize`, `lineHeight`, `spacing`, `borderRadius`, `size` | `FLOAT` |
| `fontFamily`, `boxShadow`, `transition` | `STRING` |
| boolean-ish component flags | `BOOLEAN` |
| brand packs | additional modes (or additional collections once >10 — Professional cap) |

Operationally: `pnpm --filter @nanisoft/prism-tokens build` emits `dist/figma/prism.tokens.json` → open `NaniSoft Design System` → run the sync plugin → **publish the library**. Publishing is manual and deliberate — treat "publish" as the release gate for design-side changes, mirroring changesets on the code side.

---

## 4. (d) Enable the Figma Dev Mode MCP server and wire it into Claude Code

### 4.1 Two servers, two requirement sets

| | **Remote** (recommended) | **Desktop** |
|---|---|---|
| URL | `https://mcp.figma.com/mcp` | `http://127.0.0.1:3845/mcp` |
| Desktop app | **not required** — "connects directly to Figma's hosted endpoint without requiring the Figma desktop app" | **required** — "You can only use the desktop MCP server via the Figma desktop app" |
| Plan/seat | "available on all seats and plans" | "available on a Dev or Full seat for all paid plans" |
| Enable | nothing to toggle; OAuth on first connect | Dev Mode toggle (`Shift+D`) → inspect panel → **"Enable desktop MCP server"** |
| Feature set | "the broadest set of features"; write-to-canvas, code-to-canvas | reduced; only runs while the desktop app is active |
| Use when | default for Prism | offline/air-gapped, or an org policy that forbids the hosted endpoint |

Sources: [local-server-installation](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/), [remote-server-installation](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/), [Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server).

### 4.2 Rate limits (the real constraint on agentic use)

From [Rate limits & access](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/) — "Per-minute rate limits apply in addition to daily or monthly tool call limits", and "Rate limits apply to Figma MCP server tools that read data from Figma" (write tools are exempt).

| Seat | Starter | Professional | Organization | Enterprise |
|---|---|---|---|---|
| View, Collab | Up to 20/month | Up to 6/month | Up to 6/month | Up to 6/month |
| Dev, Full | Up to 200/day, 10/min | Up to 200/day, 15/min | Up to 600/day, 20/min | 600/day |

*(The Enterprise Dev/Full per-minute cell is not rendered in the dev-docs table; [figma.com/pricing](https://www.figma.com/pricing/) states 20/min for Enterprise.)*

Practical reading for Prism: **a Dev seat on Professional = 200 read-tool calls/day, 15/min.** Enough for a few agent-driven implementation sessions a day, not for an agent freely browsing the file. Budget calls: give the agent a specific frame link rather than letting it explore. Also note "you can only access Figma content that you already have permission to view or edit" — MCP grants no new access.

### 4.3 Wire it into Claude Code

Claude Code is in the [Figma MCP Catalog](https://www.figma.com/mcp-catalog/), which is mandatory: "Only clients listed in the Figma MCP Catalog can connect to the Figma MCP Server."

**Preferred — the official Figma plugin** (from [Claude Code and Figma: Set up the MCP server](https://help.figma.com/hc/en-us/articles/39888612464151-Claude-Code-and-Figma-Set-up-the-MCP-server)):

```bash
claude plugin install figma@claude-plugins-official
```

Then `/plugin` → Installed → **figma** → authorise in the browser (**Allow access**) → `/plugin` shows it **connected**. This bundles Figma's MCP skills, which the docs recommend for write-to-canvas flows ("you should also install Figma's skills for your MCP client").

**Manual — CLI:**

```bash
# remote (default choice for Prism)
claude mcp add --transport http figma https://mcp.figma.com/mcp
# every project, for this user
claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp
# desktop server, only if you chose the desktop route
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
```

**Manual — repo-committed `.mcp.json`** (project scope, per [code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp)). HTTP entries use `type` + `url`; `headers` is optional and Figma's remote server uses OAuth rather than a static header:

```json
{
  "mcpServers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    },
    "figma-desktop": {
      "type": "http",
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

Two gotchas, both load-bearing:

- **`type` is required.** An entry with a `url` and no `type` is read as stdio and skipped with: `MCP server "<name>" has a "url" but no "type"; add "type": "http" (or "sse" / "ws") to this entry`.
- **Project-scoped servers need approval.** Claude Code prompts once per server in interactive sessions (reset with `claude mcp reset-project-choices`); before the workspace is trusted, approvals in committed settings are ignored and the server stays "⏸ Pending approval". For a personal-everywhere config prefer `--scope user` instead.

**Verify:** `/mcp` in Claude Code → **figma** → **Authenticate** → Allow access → expect "Authentication successful. Connected to figma". Re-run `/mcp` to confirm. `whoami` is the documented troubleshooting tool and is **exempt** from rate limits — run it first when a call fails, since it reports the authenticated email and seat type.

**Recommended for Prism:** commit only the **remote** `figma` entry in the repo `.mcp.json` (it works for everyone on any seat). Leave `figma-desktop` to individual user scope — it's machine-specific and only runs while someone has the desktop app open.

### 4.4 What the agent can actually read

Tools exposed (see [Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) and the dev docs): `get_design_context` / `get_code` (generated code for a selected frame), `get_variable_defs` (**the Prism-critical one — returns the Figma Variables on a node, i.e. our token names**), `get_metadata`, `get_screenshot`, `get_code_connect_map` / `add_code_connect_map`, `get_figjam`, `create_design_system_rules`, plus remote-only `use_figma` (write to canvas) and `generate_figma_design`. Write-to-canvas "is currently available to Full and Dev seats on paid plans" and "Dev seats only have read-only access outside drafts"; it's free in beta and "will eventually be a usage-based paid feature".

Content the server will share: variables, components, layout data from Design files; FigJam board content; Figma Make prototype code; Code Connect mappings ("real code tied to your codebase"); and fonts uploaded to the account. Figma's framing: "The Figma MCP server only sends the context and details of your design files—not any code."

Mechanics worth knowing: the agent "won't be able to navigate directly to the selected URL, but it will extract the node ID" — so paste a **link to selection** (right-click layer → *Copy link to selection*) rather than describing a frame. And a link is mandatory; there is no "browse the file" tool.

---

## 5. (e) Convention doc outline

One page, lives in the repo (e.g. `docs/design-conventions.md`), linked from `AGENTS.md`/`CLAUDE.md` so agents read it before touching a Figma-derived component. Three laws up top, then the mechanics.

````markdown
# Prism × Figma conventions

## The three laws
1. **Designs map to prism-ui components.** A Figma frame is a specification for
   `@nanisoft/prism-ui` components, never a description of DOM to write by hand.
   Apps import from `prism-ui`; antd is never imported directly.
2. **Tokens come from Figma Variables.** Every colour, radius, spacing and type
   value in a design resolves to a `prism.*` variable. If `get_variable_defs`
   returns nothing for a node, the design is wrong — fix the design, not the code.
3. **Never hand-pick colors.** No hex, no `#1677ff`, no "close enough". A value
   missing from `prism.semantic` is a missing token: add it to
   `@nanisoft/prism-tokens`, re-run the sync, publish the library, then use it.

## Team + seats
- Team `NaniSoft`, Figma **Professional**. Full seat = library owner; Dev seats =
  engineers; Collab/View = read-only (and rate-limited to 6 MCP calls/month).
- Library source file: `NaniSoft Design System`. Only that file publishes.

## How designs are built
- Base kit is the Ant Design Open Source community file, duplicated into
  `NaniSoft Design System` and restyled — it is scaffolding, not truth.
- Components come from the published library, never copy-pasted into a file.
- Variables: `prism.primitive` (no modes, nothing references it directly) and
  `prism.semantic` (modes `Light` = default, `Dark`). Alias semantic → primitive.

## How tokens flow (one-way only)
`@nanisoft/prism-tokens` source → `pnpm build` → `dist/figma/prism.tokens.json`
→ sync plugin run inside `NaniSoft Design System` → **publish library**.
Never edit variables in Figma and expect them to reach code; never edit the
generated JSON. Two-way sync is out of scope by decision.

## Agents
- Remote MCP server `https://mcp.figma.com/mcp`, configured in repo `.mcp.json`.
- Paste **link to selection**, never a file link or a prose description.
- Expect `get_variable_defs` to return `prism.*` names; map them to
  `@nanisoft/prism-tokens` keys 1:1.
- Budget: 200 read-tool calls/day on a Dev seat (15/min). One frame per ask.
- `create_design_system_rules` output is reviewed and committed, not trusted blind.

## Escalation
A design that needs a value/token/component prism-ui doesn't have: file it
against the token package first, don't fork the value locally.
````

---

## 6. Open questions / follow-ups for ticket 14

1. **Kit choice is a real decision.** Free stale kit vs paid v6 kit. Recommendation above is free-first, but ticket 14 should eyeball both and record the choice.
2. **Plugin vs off-the-shelf for the first sync run.** Off-the-shelf proves it in an hour; the owned plugin is the durable answer.
3. **`boxShadow` as `STRING`** needs validating against Figma's expected syntax before the plugin commits to a shape.
4. **Code Connect** needs Organization ($25/seat Dev). Not v1; revisit when `prism-ui` has a stable component surface — it's what makes `get_code_connect_map` return Prism components instead of generic markup, and it's the strongest reason to eventually upgrade.
5. **Enterprise Variables API** — re-check the plan gate if Prism ever needs CI-driven sync or >20 modes. The DTCG-shaped `dist/figma/prism.tokens.json` should stay compatible so this is a swap, not a rewrite.

---

## Sources

**Figma plans, seats, billing**
- Pricing + seat prices + AI credits + MCP rate-limit FAQ: https://www.figma.com/pricing/
- Manage seats in Figma: https://help.figma.com/hc/en-us/articles/360039960434-Manage-seats-in-Figma
- Figma plans and features: https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features

**Libraries + variables**
- Publish a library: https://help.figma.com/hc/en-us/articles/360025508373-Publish-a-library
- Enable a library for a team: https://help.figma.com/hc/en-us/articles/360039234953-Enable-a-library-for-a-team
- Guide to variables in Figma: https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma
- Modes for variables: https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables

**Dev Mode MCP server**
- Guide to the Figma MCP server: https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server
- Get started with the Figma MCP server: https://help.figma.com/hc/en-us/articles/39216419318551-Get-started-with-the-Figma-MCP-server
- Remote server installation: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- Desktop/local server installation: https://developers.figma.com/docs/figma-mcp-server/local-server-installation/
- Rate limits & access: https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/
- What is the Figma MCP server (help collection): https://help.figma.com/hc/en-us/articles/35280968300439-Figma-MCP-collection-What-is-the-Figma-MCP-server
- MCP catalog: https://www.figma.com/mcp-catalog/

**Claude Code config**
- Claude Code and Figma: Set up the MCP server: https://help.figma.com/hc/en-us/articles/39888612464151-Claude-Code-and-Figma-Set-up-the-MCP-server
- Claude Code MCP config (`.mcp.json`, transports, approval): https://code.claude.com/docs/en/mcp

**Tokens + Variables REST API**
- Tokens Studio docs: https://docs.tokens.studio/
- Tokens Studio — Variables and Tokens Studio: https://docs.tokens.studio/figma/variables-overview
- Tokens Studio — remote token storage providers: https://docs.tokens.studio/token-storage/remote/
- Figma REST API — Variables endpoints (Enterprise gate, scopes, limits): https://developers.figma.com/docs/rest-api/variables-endpoints/
- Figma REST API intro (base URL `https://api.figma.com`): https://developers.figma.com/docs/rest-api/

**antd Figma kit**
- ant.design resources (all Figma entries "Third Party"): https://ant.design/docs/resources
- "Ant Design Open Source" free community file: https://www.figma.com/community/file/831698976089873405
- "Ant Design System - v6" third-party file: https://www.figma.com/community/file/1574139834768289607
- antd discussion #40405 "Official Figma Support" (maintainer: no Figma support): https://github.com/ant-design/ant-design/discussions/40405
- `ant-design/antd-library` (Axure, not Figma): https://github.com/ant-design/antd-library
- `ant-design/kitchen` (Sketch plugin): https://github.com/ant-design/kitchen

**Sync plugins (off-the-shelf options)**
- Variables Import: https://www.figma.com/community/plugin/1253424530216967528/variables-import
- Design Tokens to Variables: https://www.figma.com/community/plugin/1410168064290005516/design-tokens-to-variables
- tokenhaus: https://www.figma.com/community/plugin/1578065513743190845/tokenhaus-variable-import-export-with-links
- Tokens Studio for Figma: https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma
