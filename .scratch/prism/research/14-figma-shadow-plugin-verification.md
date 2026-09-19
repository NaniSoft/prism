# Figma shadow/plugin verification — Prism (NaniSoft)

Resolves the two inherited requirements in `.scratch/prism/issues/14-execute-figma-setup.md` ("Verify the chosen plugin imports DTCG `$type: 'shadow'` composites" + "resolve ticket 04's `boxShadow` STRING syntax item"). Researched: 2026-09-14. Background: `.scratch/prism/research/04-figma-greenfield-setup.md` §3 and §6; ADR-0002 §2d.

> **Executive summary.** **No off-the-shelf plugin imports DTCG `$type: "shadow"` composites** — verified against source code for the one open-source candidate (Microsoft's *Variables Import* skips `shadow` with an info message) and against the authors' own docs/changelogs for the two closed ones. So the "verify the plugin imports shadows" requirement resolves **negatively**, and ADR-0002 §2d's provisional plan ("floating shadow exported as a `$description` plus `$extensions` string") must change shape but not spirit: emit the shadow as a **real `$type: "string"` token** whose `$value` is the resolved **CSS `box-shadow` string** (the same string antd's `boxShadow` map token gets), with the structured composite carried in `$extensions["prism.shadow"]`. `$description` alone is wrong — plugins map `$description` to the Figma variable *description*, not its value, so the token would import as an empty/untyped variable. Use **Variables Import (Microsoft)** for the first pipeline run: MIT + source-verified DTCG support, real `VARIABLE_ALIAS` creation **across collections**, and a manifest file that models `prism.primitive` (1 mode) + `prism.semantic` (Light/Dark) exactly. And the binding answer that reframes the whole ticket: **a Figma STRING variable cannot be bound to an effect at all** — Figma binds COLOR variables to a shadow's *color* and FLOAT variables to its *X/Y/Blur/Spread* fields, one field at a time. The shadow STRING variable is therefore documentation parity for Dev Mode, never a live style, and this stays true even after Prism writes its own plugin (and even on Enterprise, where the Variables REST API exposes the same four types).

---

## 1. What DTCG actually says about `$type: "shadow"`

Two versions of the format matter, and they disagree. Prism targets the **2023-07 snapshot** (ADR-0002 §2d: "stable DTCG subset only"; the 2025.10 draft's `$extends`/`$root`/color-object forms are deliberately unused).

### 1.1 The 2023-07 snapshot (the one Prism builds against)

Source: <https://design-tokens.github.io/community-group/format/> (§9 "Composite types" → §9.5 Shadow; page states "This is a snapshot of the editors' draft… may change at any moment… work in progress", content last published 2023-07-24).

Verbatim, §9.5:

> "Represents a shadow style. The `$type` property **MUST** be set to the string `shadow`. The value **must** be an object with the following properties:
> - `color`: The color of the shadow. The value of this property **MUST** be a valid color value or a reference to a color token.
> - `offsetX`: … **MUST** be a valid dimension value or a reference to a dimension token.
> - `offsetY`: …
> - `blur`: …
> - `spread`: …"

Followed immediately by the spec's own open question:

> "Is the current specification for shadows fit for purpose? Does it need to support multiple shadows, as some tools and platforms do?" (linked to issue [#100 — Shadow type feedback](https://github.com/design-tokens/community-group/issues/100))

Consequences:

- **Five fields, no `inset`** — `inset` does not exist in this version (anywhere; verified by full-text read).
- **No array form** — multi-shadow is *not* standardised here. The "multi-shadow = array" convention is a de-facto tool convention (Tokens Studio emits arrays; see §3 evidence), not spec.
- Sub-values may be explicit values **or** alias references ("`{some.other.token}`") — §9 Composite types: "Sub-values may be explicit values (e.g. `"#ff0000"`) or references to other design tokens that have sub-value's type."
- `dimension` sub-values are **strings with units** (`"4px"`, `"0.5rem"`; §8.2 — "`0` which also **MUST** be followed by either a `"px"` or `"rem"` unit").
- Prism's floating shadow is a *single* shadow, so the 2023-07 composite form expresses it completely (`elevation.floating` = one drop shadow; `elevation.none` is `none`, and ADR-0001 §3 permits exactly one shadow, no inner shadows).

### 1.2 The 2025.10 draft (noted, deliberately unused)

Source: <https://www.designtokens.org/TR/drafts/format/> ("Draft Community Group Report", dated 08 September 2026, explicitly a preview "not to be implemented"), plus the normative JSON Schema at <https://github.com/design-tokens/community-group/blob/main/schemas/src/2025.10/format/values/shadow.json> (raw: <https://raw.githubusercontent.com/design-tokens/community-group/main/schemas/src/2025.10/format/values/shadow.json>).

- Value **MUST** be "either: a single shadow object …, or an array of shadow objects and/or references to shadow tokens" (`minItems: 1`). Multi-shadow **is** standardised here.
- `shadowObject` properties: `color`, `offsetX`, `offsetY`, `blur`, `spread`, **`inset`** — with `"required": ["color", "offsetX", "offsetY", "blur", "spread"]`, `additionalProperties: false`, and `inset` described as "Whether this shadow is inside the containing shape (inner shadow) rather than a drop shadow (default: false)" (optional boolean).
- Dimensions become objects (`{ value, unit }`) — one of the reasons ADR-0002 excludes this draft.

### 1.3 Does DTCG say how composites land on platforms with no composite type?

**No general rule exists in either version.** Full-text read of both documents found exactly one fallback clause, and it is scoped to `strokeStyle` (§9.2.3 "Fallbacks"):

> "some tools and platforms may not support the full range of stroke styles that design tokens of this type can represent … they should therefore fallback to the closest approximation that they do support. The specifics of how a 'closest approximation' is chosen are implementation-specific."

Everything else is permissive, not normative: §9 says "Tools **MAY** provide specialised functionality for composite tokens" (e.g. a design tool listing shadow tokens when applying a drop shadow), and §9.1 "Groups versus composite tokens" only requires that composites be ordinary tokens (referenceable, `$description`/`$extensions` allowed). **There is no spec text telling a tool that cannot represent a composite (Figma: four variable types, no composite) what to do** — so "skip it and say so" (Microsoft) and "ignore it" (the other two) are both spec-conformant. This is the root cause of the gap ticket 14 inherited.

---

## 2. Plugin by plugin

### 2.1 Variables Import — **chosen for the first run** (Microsoft, open source)

- Plugin: <https://www.figma.com/community/plugin/1253424530216967528/variables-import> · Repo: <https://github.com/microsoft/figma-variables-import> · Author/maintainer: Microsoft (README: "© 2023 Microsoft"), MIT licensed. Maintained: last push 2026-02-05 ("Extended Type Functionality and Adapted for newer DTCG format (#12)", PR <https://github.com/microsoft/figma-variables-import/pull/12>); tree inspected at commit `5697060`.

| Requirement | Verdict | Evidence (source file on `main`) |
|---|---|---|
| Accepts DTCG | **Yes** — `$type`/`$value` and legacy `type`/`value`; `$description` → variable description; `$extensions["com.figma"].scopes` → variable scopes; `$extensions.codeSyntax`/`.codeSyntaxPlatform` → code syntax | `src/utils/tokens/types.ts`, `src/controller/variables.ts` |
| `$type: "shadow"` | **No. Not imported in any form.** `tokenTypeToFigmaType()` maps all six composite types (`strokeStyle, border, transition, shadow, gradient, typography`) to `default: null`; the import loop then reports an **info** line — `Unable to add <name> mode <mode> because shadow tokens aren't supported.` — and `continue`s. No STRING fallback, no effect style, not silent. | `src/controller/variables.ts` (both before and after PR #12 — #12 only added basic types: `fontSize/borderRadius/lineHeight/letterSpacing/strokeWidth/spacing/gap/padding` → FLOAT, `fontFamily/fontWeight` → STRING) |
| Aliases → `VARIABLE_ALIAS` | **Yes**, real aliases via `figma.variables.createVariableAlias(target)`, with a retry queue so aliases may precede their targets; cycles reported as errors. **Cross-collection aliases work**: targets are looked up by Figma name across *all* local collections *and* available library collections in one batch. Cross-*file* aliases only work in a locally built plugin (`figma.variables.importVariableByKeyAsync`), not the community build — README caveat. | `src/controller/variables.ts`, `src/utils/tokens/aliases.ts`, README |
| Multi-collection, multi-mode, multi-file | **Yes**, via a **manifest** JSON dropped alongside the token files (detected by content: an object containing both `"name"` and `"collections"`). Shape: `{ name, collections: { "<collection>": { modes: { "<mode>": ["file.json", …] } } } }`. The shipped demo is literally Prism's shape: a `Global` collection with one mode plus a `Web alias` collection with `Light`/`Dark` mapped to two files. The collection's first mode is `collection.modes[0]` renamed → **manifest mode order decides the default mode** (Light must come first). | `src/controller/index.ts`, `src/controller/variables.ts`, `demo/manifest.json` |
| Naming | DTCG path is dot-joined, then `name.replaceAll(".", "/")` → `primitive/color/ground/light`. Matches the mapping table in research 04 §3.3. | `src/controller/variables.ts` |

One gotcha for `toDtcg()`: `dimension`/`number` values go through `parseFloat` and the unit is **dropped without conversion** (`"0.5rem"` would become the FLOAT `0.5`, not `8`). Only `fontSize`/`lineHeight` get rem→px. Prism emits px, so this is harmless — but it belongs in the ticket's acceptance notes.

### 2.2 Design Tokens to Variables — **reject**

- Plugin: <https://www.figma.com/community/plugin/1410168064290005516/design-tokens-to-variables> · Author: Afnizar Nur Ghifari (support `afnizarhilmi@gmail.com`), "Licensed under Community Free Resource License", "No network access".
- **No source available** — the author's GitHub (<https://github.com/afnizarnur>; 34 repos listed via the GitHub API) has no repo for this plugin. **UNVERIFIED at code level** (searched: GitHub repo + user search API, plugin page, web search for a repo).
- Its own description (read from the rendered community page, 2026-09-14): "Convert JSON data using W3C Design Tokens specs or formats generated by generators into Figma Variables, supporting multiple modes", with a "🟡 **Supported tokens**" section saying "**Tested only for colors at the moment.**" No mention of shadow, STRING, FLOAT, aliases, or collections anywhere in the description, and nothing in the visible version history (v12, September 16 2024, "Add feature to update existing collection"; page states "Last updated 2 years ago").
- Verdict: even ignoring shadows, a color-only, 2-year-stale, closed-source plugin cannot be the verification vehicle for Prism's mixed COLOR/FLOAT/STRING file.

### 2.3 tokenhaus — **reject for the verification run** (re-test later if it grows up)

- Plugin: <https://www.figma.com/community/plugin/1578065513743190845/tokenhaus-variable-import-export-with-links> · Author: Alp Yaprak (`@alpyaprak`, support `alp@tokenhaus.co`), "Licensed under Community Free Resource License", "No network access". First release 2025-12-03, v6 2025-12-13 ("Last updated 9 months ago"), actively answered comments.
- **No source available** — GitHub repo search for "tokenhaus" returns 0 repositories, and the author's account (`Alpyaprak`) holds only unrelated repos. **UNVERIFIED at code level.**
- What its page *does* claim (read 2026-09-14): "Export variables to DTCG (W3C Design Tokens) format", "Import tokens from JSON with full alias resolution", "Preserve links between primitive and semantic tokens", "Multi-Mode Support: Full support for Light/Dark modes", conflict handling, drag & drop. It is a **Figma-variables-first** tool (its headline feature is exporting *variables* out), and Figma variables cannot be shadows — so a `$type: "shadow"` composite has no plausible code path. **"Shadow" appears nowhere on the page nor anywhere in the v1–v6 changelog** (full history expanded and searched on the rendered page).
- Best feature Prism should steal the *idea* of: it round-trips primitive↔semantic alias links, which is the one thing Microsoft's plugin cannot export back out. Worth re-testing if Prism ever wants a Figma→JSON audit path.

### 2.4 Corroborating vendor evidence (Tokens Studio — cited as evidence about Figma's constraints, not as a candidate)

- "Tokens Studio supports 23 unique Token Types and there is only 4 Variable Types" — <https://docs.tokens.studio/figma/variables-overview>.
- Box Shadow tokens are applied to layers as effects and "can be attached to **Effect Styles** in Figma" (a multi-shadow token becomes one effect style with several effects); when variables are involved, only the *sub-values* map to variables ("color properties become color variables, while `dimension` and `number` properties become number variables") — the shadow itself is never a variable. <https://docs.tokens.studio/manage-tokens/token-types/box-shadow>. Its value shape is `{ x, y, blur, spread, color, type: "dropShadow" | "innerShadow" }`, arrays for multi-shadow — i.e. **Figma's own effect JSON**, not CSS.
- The industry-standard sync plugin therefore confirms the same ceiling Prism hit: shadows live in effect styles/layers, variables only carry their parts.

---

## 3. Figma's shadow syntax + the binding question (load-bearing)

### 3.1 Can a STRING variable be bound to a layer's drop shadow? **No.**

From Figma's own docs — <https://help.figma.com/hc/en-us/articles/15343107263511-Apply-variables-to-designs> ("Apply variables to designs"):

- COLOR: "Color variables can be applied to new and existing color styles as well as the **color property of shadow effects**." (Steps: layer → Effect settings icon → color swatch → **Libraries tab** → pick variable.) Also: "While shadow colors don't have gradient stops, you can still apply color variables to the shadow color."
- FLOAT ("number"): the property table lists "**Effects**" as bindable ("Click Apply variable" / "Hold Shift and click into the field") — per-field. The doc does not enumerate which fields; in the Effect settings panel those fields are **offset X, offset Y, blur, spread**. Corroborated by Figma forum support: "you can apply the variables to X, Y, Blur and Spread in effects by clicking the variable icons" — <https://forum.figma.com/ask-the-community-7/how-do-you-add-shadows-to-variables-22487> (community helper, not Figma staff — corroborating only).
- STRING: exhaustively listed as "the **text content** of any text layer", "**font family or font weight and style**", and "**instances with variant properties**". Effects are absent.
- BOOLEAN: layer visibility only.
- **No whole-shadow binding exists in any form** — there is no variable type that carries a shadow, and no UI to point a shadow effect at a single variable.

So: **a `boxShadow` STRING variable is documentation-only.** It is visible in the Variables panel, in a published library's variable list, in Dev Mode's variable inspection, and in MCP `get_variable_defs` *only if* some node property references it (which, for a shadow string, is never — nothing binds it). It does not render, does not style, and cannot be applied. The same ceiling applies to the Enterprise-only Variables REST API (same four resolved types), so writing Prism's own plugin later does **not** lift it.

Practical consequence for ticket 14: "verify the import" for the shadow token means *verify the STRING variable lands with the right value and description*, not *verify it styles a card*. If Prism ever wants Figma to *render* the floating shadow from tokens, the only mechanism is per-field binding: FLOAT variables for offset/blur/spread + a COLOR variable for the shadow colour, applied to a drop-shadow effect in the Effect settings (or by Prism's future owned plugin via `figma.createEffectStyle()`/`effects`). Optional, deferred — ADR-0001 §3's "one shadow" makes it cheap to add later.

### 3.2 What syntax, then?

There is **no Figma-native string syntax to conform to** — Figma's native shadow representation is the plugin/REST *Effect object* (`{ type: "DROP_SHADOW", color: {r,g,b,a}, offset: {x,y}, radius, spread, blendMode, visible }`), which is an object, not a string, and no Figma surface parses a shadow out of a string (Figma's "Copy as CSS" *emits* a CSS `box-shadow` string; nothing accepts one). Since the STRING's only readers are humans, Dev Mode, and generated code, the syntax should be the one the code already speaks:

**Recommended `toDtcg()` emission for the floating shadow:**

```json
"elevation": {
  "floating": {
    "$type": "string",
    "$value": "0 4px 16px 0 rgba(11, 18, 32, 0.16)",
    "$description": "Floating layer shadow (cards, popovers, modals). CSS box-shadow: offsetX offsetY blur spread color. Resolves per mode.",
    "$extensions": {
      "prism.antd": { "map": "boxShadow" },
      "prism.shadow": {
        "$type": "shadow",
        "color": "#0B122029",
        "offsetX": "0px",
        "offsetY": "4px",
        "blur": "16px",
        "spread": "0px",
        "inset": false
      }
    }
  }
}
```

Rules, each with its reason:

1. **`$type: "string"`** (not `"shadow"`): the only DTCG type every candidate consumer keeps. Microsoft's plugin imports `"string"` verbatim (`case "string": variable.setValueForMode(modeId, value)`), so the shadow becomes a real Figma STRING variable on the first run instead of an info message.
2. **`$value` = the resolved CSS `box-shadow` string**, byte-identical to what Prism hands antd's `boxShadow` map token and what prism-ui ships in CSS (`offsetX offsetY blur spread color`, px units, explicit `0` spread, `rgba(r,g,b,a)` with 0–1 alpha, `, `-separated list if a pack ever needs two shadows). One string, three consumers (antd, Figma Dev Mode, codegen) — that is the whole point of the DTCG export. `elevation.none` → `"none"`.
3. **Keep the real composite, but in `$extensions["prism.shadow"]`**, using the **2023-07 single-object form** (`color`/`offsetX`/`offsetY`/`blur`/`spread`; `inset: false` optional, dimensions as unit strings, colour as 8-digit hex `#RRGGBBAA` per DTCG §8.1). DTCG §5.5 requires tools to *preserve* extension data they don't understand, so this is lossless for translation tools (Style Dictionary) and for Prism's own future plugin, while never tripping a Figma importer's unsupported-type path.
4. **Do not ship the value in `$description`** (ADR-0002 §2d's provisional wording): `$description` becomes the Figma variable's *description* field, not its value — plugins that support `$description` (Microsoft's does: `variable.description = update.token.$description`) would create an empty/untyped variable and put the shadow in the tooltip.

---

## 4. Verdict

**Chosen plugin for the first pipeline-verification run: Variables Import (Microsoft)** — <https://www.figma.com/community/plugin/1253424530216967528/variables-import>, repo <https://github.com/microsoft/figma-variables-import> (MIT).

Why it beats the alternatives on Prism's actual constraints (DTCG shape mandated, two collections, cross-collection aliases, two modes, one shadow composite, FLOAT + STRING tokens):

| Constraint | Variables Import | Design Tokens to Variables | tokenhaus |
|---|---|---|---|
| DTCG accepted | **yes (source-verified)** | claimed, "tested only for colors" | claimed (variables-first) |
| `$type: "shadow"` | **skipped, reported** (no STRING fallback) | no evidence | no evidence |
| COLOR/FLOAT/STRING/BOOLEAN | **all four (source-verified)** | color only | claimed, unverified |
| Cross-collection `VARIABLE_ALIAS` | **yes (source-verified)** | no evidence | claimed (its speciality) |
| 2 collections + Light/Dark modes | **yes, manifest-driven** (demo = exactly this shape) | multi-mode only, single-collection shape unknown | claimed |
| Open source / auditable | **MIT** — Prism's owned plugin can reuse its alias-queue + manifest + `utils/tokens` code | no | no |
| Tells you what it dropped | **yes, per token, with the type name** | unknown | unknown |

For a verification run, a plugin that *reports* its gaps beats one that *claims* more than it proves.

**Answer to the inherited requirement, plainly:** the chosen plugin does **not** import `$type: "shadow"` composites, and no off-the-shelf plugin does. Therefore `toDtcg()` should not ship the floating shadow as a bare composite in the Figma export: emit it as a **`$type: "string"` token carrying the CSS `box-shadow` string** (`"0 4px 16px 0 rgba(11, 18, 32, 0.16)"` for blue-light), with the true composite in `$extensions["prism.shadow"]` (§3.2). That keeps ADR-0002's key-parity and "resolved values, not `{ref}` aliases" rules intact while making the Figma file importable *and* the shadow legible in Dev Mode.

**Two consequences ticket 14 should record:**

1. **The STRING shadow is Dev-Mode parity only** (§3.1) — nobody can bind it. Don't write a convention doc that promises designers "shadows come from Variables"; the honest sentence is: colours/radii/spacing/type come from Variables; the shadow is *recorded* as a STRING variable and must be re-applied as an effect (per-field variable binding is available if wanted).
2. **ADR-0002 §2d's file layout needs one refinement to be plugin-importable.** The manifest maps **one file per (collection × mode)**, while ADR-0002 currently specifies one document per pack × mode containing both tiers. Resolution that leaves `toDtcg(pack, mode)` untouched: the *build script* partitions its output into `dist/figma/` — one primitives file (no modes) + one semantic file per mode per pack — plus a `dist/figma/manifest.json`:

```json
{
  "name": "Prism (blue)",
  "collections": {
    "prism.primitive": { "modes": { "Default": ["prism.blue.primitive.tokens.json"] } },
    "prism.semantic": { "modes": { "Light": ["prism.blue.semantic.light.tokens.json"], "Dark": ["prism.blue.semantic.dark.tokens.json"] } }
  }
}
```

   (`Light` first → renamed `collection.modes[0]` → default mode. Alias targets resolve across the two collections in one batch because the primitive and semantic paths differ.)

**Acceptance criteria for the run:** drop `manifest.json` + the token files into the plugin; expect variables created for all COLOR/FLOAT/STRING tokens; expect exactly one info line per mode for `elevation/floating` ("…because shadow tokens aren't supported") **if** Prism still emits the composite — and zero errors once it emits `$type: "string"`; expect `prism.semantic`'s `surface/ground` etc. to render as aliases of `prism.primitive` values; expect exactly two modes on `prism.semantic` with Light default; then publish the library.

---

## Sources

**DTCG / W3C design tokens format**
- Format spec, 2023-07 snapshot (§8 types, §9 composites, §9.5 shadow, §9.2.3 fallbacks): https://design-tokens.github.io/community-group/format/
- Format draft 2025.10 (§9.6 shadow, single-or-array value): https://www.designtokens.org/TR/drafts/format/
- 2025.10 shadow JSON Schema (`inset`, required list, `additionalProperties: false`): https://github.com/design-tokens/community-group/blob/main/schemas/src/2025.10/format/values/shadow.json
- 2025.10 token type enum: https://github.com/design-tokens/community-group/blob/main/schemas/src/2025.10/format/tokenType.json
- Issue #100 "Shadow type feedback" (multi-shadow/inset open issue): https://github.com/design-tokens/community-group/issues/100

**Variables Import (Microsoft)** — chosen
- Figma community page: https://www.figma.com/community/plugin/1253424530216967528/variables-import
- Repository (MIT): https://github.com/microsoft/figma-variables-import
- Type mapping + skip message + alias queue + manifest loop: https://github.com/microsoft/figma-variables-import/blob/main/src/controller/variables.ts
- Manifest detection by content (`"name" in document && "collections" in document`): https://github.com/microsoft/figma-variables-import/blob/main/src/controller/index.ts
- Manifest demo (`Global` single-mode + `Web alias` Light/Dark): https://github.com/microsoft/figma-variables-import/blob/main/demo/manifest.json
- PR #12 "Extended Type Functionality and Adapted for newer DTCG format" (composites still unsupported): https://github.com/microsoft/figma-variables-import/pull/12

**Design Tokens to Variables** — rejected
- Figma community page (author, "Supported tokens: Tested only for colors at the moment", v12 2024-09-16): https://www.figma.com/community/plugin/1410168064290005516/design-tokens-to-variables
- Author GitHub (no plugin repo): https://github.com/afnizarnur

**tokenhaus** — rejected for the run
- Figma community page (author Alp Yaprak, feature list, v1–v6 changelog, no shadow mention): https://www.figma.com/community/plugin/1578065513743190845/tokenhaus-variable-import-export-with-links
- GitHub repo search (0 results for "tokenhaus"): https://api.github.com/search/repositories?q=tokenhaus

**Figma: variables × effects** (the binding answer)
- Apply variables to designs (shadow *color* via Libraries tab; "Effects" row for number variables; STRING = text content / font family / variant props): https://help.figma.com/hc/en-us/articles/15343107263511-Apply-variables-to-designs
- Overview of variables, collections and modes: https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes
- Forum corroboration, per-field binding only ("apply the variables to X, Y, Blur and Spread in effects"): https://forum.figma.com/ask-the-community-7/how-do-you-add-shadows-to-variables-22487

**Tokens Studio (evidence about Figma's constraints, not a candidate)**
- "23 unique Token Types … only 4 Variable Types": https://docs.tokens.studio/figma/variables-overview
- Box Shadow composite token (effect/Effect Style destination; sub-values → variables; `{x,y,blur,spread,color,type}` shape; arrays for multi-shadow): https://docs.tokens.studio/manage-tokens/token-types/box-shadow

## UNVERIFIED items

1. **tokenhaus's handling of `$type: "shadow"`** — closed source; no repo found (GitHub repo + user search API). Evidence is the absence of any shadow mention in its description and full v1–v6 changelog, plus the fact that its domain is Figma variables (which cannot be shadows). A 5-minute throwaway import in Figma settles it if ticket 14 wants belt-and-braces.
2. **"Design Tokens to Variables"' handling of everything non-color** — closed source; its own page says "Tested only for colors at the moment". Not fetched/inspectable beyond the rendered community page.
3. **Which effect numeric fields accept FLOAT variables** — offset X/Y, blur, spread is the observable field set in Figma's Effect settings panel, but Figma's help doc lists only "Effects" without enumerating fields. Corroborated by a community-forum reply (non-staff).
4. **Community build vs `main` of Variables Import** — behaviour asserted here is from `main` (commit `5697060`, 2026-02-05). The published community build is stated by the README to lack cross-*file* aliasing (`figma.variables.importVariableByKeyAsync`); everything Prism needs (local multi-collection, cross-collection aliases, manifest) is in the community path per the source, but the run itself is the proof.
5. **`get_variable_defs` returning STRING shadow variables** — expected to *exclude* them (nothing binds a shadow string to a node), but Figma does not document MCP tool output exhaustively; confirm during the run if it matters to the convention doc.
