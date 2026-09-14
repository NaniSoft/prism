---
Type: grilling
Status: resolved
Labels: wayfinder:grilling
---

## Question

Which license do the public `@nanisoft/prism-*` npm packages carry? They ship `license: UNLICENSED` (bootstrap placeholder) and npm refuses a real publish without a real license — so this must land before the go-live swap of `release-pr.yml`. Decide MIT / Apache-2.0 / proprietary / other, covering: the map's framing ("org-internal in intent, public in availability"), whether NaniSoft wants attribution/brand protection on the design language, patent-grant needs, and what lands in each package's `LICENSE` + `package.json` (one license across all four packages vs. per-package).

## Draft proposal

**Status: draft for the human. Not resolved.** Researched 2026-09-14 against primary sources (npm docs, apache.org, choosealicense.com, GitHub license API, the LICENSE files of each precedent repo).

### Verified facts that shape the decision

**1. Upstream / precedent licenses (checked via GitHub license API + raw LICENSE files, 2026-09-14).**

| Project | License | Notes |
| --- | --- | --- |
| antd (`ant-design/ant-design`) | MIT | `Copyright (c) 2015-present Ant UED, https://xtech.antfin.com/` |
| `@ant-design/icons` (`ant-design/ant-design-icons`) | MIT | re-exported through prism-ui |
| Fumadocs (`fuma-nama/fumadocs`) | MIT | site foundation |
| plasma (`salute-developers/plasma`) | MIT | the monorepo shape Prism copies — `Copyright (c) Salute Devices` |
| MUI core, Mantine, Chakra UI, shadcn/ui, PrimeReact, Tailwind, Radix | MIT | the entire JS design-system mainstream |
| Carbon Design System (IBM) | Apache-2.0 | the one serious Apache outlier, and it's a corporate-authored system |

No mainstream community design system ships a brand/attribution clause in its *software license*. Brand control is always done *outside* the license: MUI (MIT code) keeps trademark language in its separate legal/store terms; Bootstrap (MIT code) ships a brand page that says "Do not use Bootstrap's branding for your own open or closed source projects". The license is not where design-system brand protection lives.

**2. Correction to this ticket's premise (and to ticket 07's Answer line).** npm does **not** actually reject a publish for `license: "UNLICENSED"` — it is a supported value, and npm's docs say only `name` and `version` are required to publish; `private: true` is the field that hard-blocks publish. Nothing here is blocked on npm validation. It still must land before go-live, for a better reason: publicly downloadable code marked `UNLICENSED` means "all rights reserved, no grant to anyone" — legally incoherent for a public registry, an immediate red flag for every corporate consumer's license scanner, and it grants NaniSoft's own internal consumers nothing either. (Ticket 07's Answer should be corrected when convenient; not edited here.)

**3. Packing gotcha that changes the Apache-2.0 math.** npm always includes `LICENSE`/`LICENCE` in the tarball regardless of the `files` array — but it does **not** auto-include a `NOTICE` file. All four packages currently declare `files: ["dist"]` and **no LICENSE file exists anywhere in the repo today**, so under Apache-2.0 a `NOTICE` would silently fail to ship unless `files` gains `"NOTICE"`. (`pnpm publish` follows `npm pack` semantics.)

**4. Repo state.** Only the four `packages/*/package.json` files carry `license` fields (all `UNLICENSED`); the root `package.json` is `private: true` and never publishes, so it needs no license field — though a root `LICENSE` is still worth adding for the GitHub repo page. None of the packages currently carry `repository`, `author`, or `homepage`, which npm metadata and provenance want anyway; since `package.json` must be touched regardless, that is the cheap moment to add them.

**5. Derivative-work flow from antd.** Prism *depends on* antd, it does not vendor antd source, so **no antd obligation flows into Prism's own LICENSE**: MIT's notice-preservation duty binds whoever redistributes antd's code, and npm already satisfies it by shipping antd's own MIT LICENSE inside `node_modules`. The duty becomes live only if prism-ui ever copies or adapts antd source (e.g. porting a component) — then that file must preserve the "Copyright (c) 2015-present Ant UED" notice, which is fully permitted inside Prism's own MIT code. Going Apache-2.0 while embedding MIT code is also legal (MIT is Apache-2.0-compatible), but adds per-file notice bookkeeping for zero benefit.

**6. What no license does.** Neither MIT nor Apache-2.0 grants trademark rights (Apache-2.0 §6 explicitly reserves them and permits only nominative use; MIT is silent, which reserves by default). Neither protects the *visual language* — copyright covers code, not a look; "Spectral Refraction", the token architecture, and the docs prose are not licensed away by either. Only a trademark claim/policy (and, if worth it, registration) protects the "Prism" name and logo.

### Comparison

| Axis | MIT | Apache-2.0 | Proprietary (`UNLICENSED` / custom EULA) |
| --- | --- | --- | --- |
| **Attribution & brand protection** | Requires preserving the copyright + permission notice in copies. Grants no trademark rights (silent = reserved). Brand must be protected by a separate policy — same as Apache. | Same notice preservation, plus "state changes" and NOTICE carry-forward. §6 *explicitly* reserves trademarks. Brand must still be protected by a separate policy. | Full control of name/brand on paper, but nothing to enforce against a public tarball already downloaded; and it forfeits ecosystem use entirely. |
| **Patent grant** | None. Implied-license arguments are the only backstop. | Express, perpetual, royalty-free grant over contributions, with patent-retaliation termination. | None. |
| **"Org-internal in intent, public in availability" fit** | Excellent — no ceremonies, no obligations on NaniSoft (no CLA, no copyleft), anyone may fork/self-host but cannot claim the Prism brand. Matches every antd-based system in the ecosystem. | Good, but heavier: NOTICE mechanics + state-changes for a benefit a design system doesn't use. | Contradicts the map — a public npm package with no grant is unbuildable-adjacent for consumers and a takedown/cease-and-desist liability for NaniSoft. |
| **Ecosystem friction** | Zero. Default expectation for JS UI libraries; every compliance allowlist accepts it; contributors expect it (antd/Mantine/Chakra/shadcn are all MIT). | Low but nonzero: "state changes" and NOTICE rules surprise contributors; per-file header boilerplate; some teams ask why a UI kit needs it. | Max — scanners flag it, enterprises won't touch it, and the LLM/MCP/docs surface (the map's whole point) gets no right to consume. |
| **Notable users** | antd, Mantine, MUI, Chakra, shadcn/ui, plasma, PrimeReact, Tailwind | Carbon (IBM) | essentially no public design system |

**"Other" — dual-license `(MIT OR Apache-2.0)`.** Common in the Rust ecosystem, rare in JS UI. A consumer picks per copy, so it maximizes compatibility, but it doubles the LICENSE surface for a design system where nobody is exercising the patent axis. Not recommended.

### Recommendation

**MIT, identical across all four packages (`prism-tokens`, `prism-ui`, `prism-llms`, `prism-mcp-server`), plus one root `LICENSE`, plus a separate third-party attribution file — and brand protection deliberately carried *outside* the license.**

Reasoning:

1. **Patent grant is the only real differentiator, and Prism doesn't need it.** Apache-2.0's grant exists to protect multi-contributor infra/algorithmic projects. Prism's UI components carry no patentable technique, its design tokens/visual language aren't patentable subject matter, its contributor base is NaniSoft alone, and the layer where patent risk would actually sit (antd) ships no patent grant anyway — Prism adopting Apache-2.0 wouldn't cover that layer. Buying a patent grant nobody needs with NOTICE machinery and state-changes obligations is a bad trade.
2. **Brand protection is orthogonal, so don't let it drive the license.** Whichever permissive license is chosen, "Prism" and the logo get exactly the same (zero) protection. The lever is a short brand/attribution policy on prism.nanisoft.com — "Prism is built by NaniSoft; the Prism name and logo may not be used for derivative npm packages or forks" — the MUI/Bootstrap pattern. Deciding Apache-2.0 for brand reasons would be deciding on a clause that doesn't do the job.
3. **Ecosystem fit is the tiebreaker and it is unanimous.** Every system Prism is measured against ships MIT. Choosing Apache-2.0 makes Prism the odd one out in its own category, for no gain, and adds contributor friction before Prism has any external contributors.
4. **"Org-internal in intent" survives MIT intact.** MIT obliges NaniSoft to accept nothing: no CLA, no source-dumping of internals, no outside roadmap input. It permits strangers to fork Prism, but the map already concedes public availability — and a fork using Prism's *code* under MIT is fine, while a fork using Prism's *name* is what the brand policy (decision point 2) addresses.

### Mechanical change per option

**Option A — MIT (recommended).**

Add a root `LICENSE` and one identical `LICENSE` per package (4 files):

```
MIT License

Copyright (c) 2026 NaniSoft

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- All four `packages/*/package.json`: `"license": "UNLICENSED"` → `"license": "MIT"`. Root `package.json` unchanged (`private: true`).
- Because npm auto-includes `LICENSE` per package, no `files` change is needed.
- Add a repo-root `THIRD-PARTY-NOTICES.md` (attribution hygiene, not an obligation): antd + `@ant-design/icons` (MIT, © Ant UED) and Fumadocs (MIT), linked from the docs site. This is the polite—and future-proof, if prism-ui ever adapts antd source—way to credit the foundation.
- While in `package.json`: add `"author": "NaniSoft"`, `"repository"`, `"homepage": "https://prism.nanisoft.com"` per package.
- Copyright year: use a flat `2026` (machine-parsed cleanly by licensee/GitHub). The antd-style `2015-present` range is an acceptable alternative — cosmetic, human's call.

**Option B — Apache-2.0.**

- Same 5 files, each containing the full Apache-2.0 text (the standard 11 KB text from apache.org — not summarized, not abridged).
- All four `packages/*/package.json`: `"license": "Apache-2.0"`.
- Add a `NOTICE` file (root + each package, or rely on one per package) e.g.:

  ```
  Prism
  Copyright 2026 NaniSoft

  This product includes software developed by Ant UED
  (Ant Design, https://ant.design, MIT License).
  ```
- **Required because of the packing gotcha above:** each package's `files` array becomes `["dist", "NOTICE"]` — otherwise NOTICE never ships and the license's own §4(d) expectation is unmet.
- Conventionally, each source file gets the Apache appendix header ("Copyright 2026 NaniSoft / Licensed under the Apache License, Version 2.0 …") — a per-file tax on every new file in a design system.

**Option C — Proprietary.**

- Keep `"license": "UNLICENSED"` and add `"private": true` (the actual publish blocker), or `"license": "SEE LICENSE IN LICENSE"` with a custom NaniSoft EULA — but then the packages cannot go to public npm as described. Only coherent if Prism is distributed privately (GitHub Packages / a private registry) or unlisted. Directly contradicts the map's "public in availability".

**One license vs per-package.** One license, MIT, all four. `prism-tokens` (data), `prism-llms` (generated data + code), `prism-mcp-server` (tool logic), and `prism-ui` (components) are one product family consumed together; mixed licenses create scanner noise and a support burden. The only precedent for splitting is a free/paid tier (MUI X Pro), which does not exist here — and MUI's own stewardship pledge is instructive: "anything we release under an MIT license will remain MIT-licensed forever."

### Decision points for the human (ranked)

1. **Who is the copyright holder, legally?** "NaniSoft" is the brand; is it a registered legal entity, or is the real owner the individual (Durga Prasad Reddy Vennapusa)? A copyright line naming an entity that doesn't legally exist is unenforceable and complicates a future trademark filing. *Recommendation:* `"Copyright (c) 2026 NaniSoft"` if NaniSoft is (or is becoming) the operating entity; otherwise `"Copyright (c) 2026 NaniSoft (D. Vennapusa)"`. Confirm before the first publish — retroactively re-attributing published versions is messy.
2. **Do you want the Prism name/logo trademarked?** A registration is real money and maintenance; an unregistered claim plus a published policy is nearly free. *Recommendation:* do **not** file now; publish a short brand/attribution page on prism.nanisoft.com stating Prism is built by NaniSoft and that the name/logo may not be used for forks or derivative packages; revisit registration only if Prism gains external users or imitators.
3. **Is Apache-2.0's patent grant worth the NOTICE + state-changes overhead?** *Recommendation:* no — nothing in a wrapped-antd design system exercises it, and the real risk carrier (antd) grants nothing either. Reject unless a lawyer says otherwise.
4. **What license covers the docs/prose and the design language itself?** The code license does not reach `PRODUCT.md`, `CONTEXT.md`, ADRs, or prism.nanisoft.com prose and demos — those default to all-rights-reserved. *Recommendation:* leave them unlicensed (reserved), and add a visible site footer line: "Code: MIT. Docs and visual language: © NaniSoft, all rights reserved." That is the only mechanism that actually protects the Spectral Refraction narrative while the code stays free.
5. **One license across all four packages?** *Recommendation:* yes, uniform MIT; revisit only if a paid tier ever exists, and if it does, adopt MUI's pledge that anything already published under MIT stays MIT forever.
6. **Any attribution demand beyond notice preservation?** (a "built with Prism" credit, console banner, footer requirement.) BSD-3/CC-BY territory, and it would make Prism the only design system in its class asking for one. *Recommendation:* no.
7. **Future external contributions — CLA, DCO, or nothing?** Apache-2.0's patent grant is partly a substitute for a CLA; under MIT, inbound patents from outside contributors are unaddressed. *Recommendation:* nothing at go-live (no external contributors exist); adopt DCO if/when the first outside PR arrives.
8. **Confirm the npm premise correction** (fact, not really a decision): npm does not block `UNLICENSED` publishes — the go-live requirement is legal coherence, not registry validation. Ticket 07's Answer line should be corrected when convenient.

## Answer

Resolved 2026-09-14 — human ratified the draft in full ("all four as recommended"). Decision: **MIT, identical across all four packages**, copyright "NaniSoft".

Adopted, per the draft's recommendations: MIT over Apache-2.0 (no patent-grant need for a wrapped-antd design system; the `NOTICE` would silently fail to ship under `files: ["dist"]`) and over proprietary (contradicts "public in availability"); one uniform license across prism-tokens, prism-ui, prism-llms, prism-mcp-server; per-package + root `LICENSE`; third-party attribution (antd, `@ant-design/icons`, Fumadocs) in `THIRD-PARTY-NOTICES.md`; brand/attribution protection via a short policy page on prism.nanisoft.com, never license clauses; no trademark filing now (revisit if imitators appear); docs/prose and the visual language stay © NaniSoft all-rights-reserved, surfaced as a site footer line ("Code: MIT. Docs and visual language: © NaniSoft."); no attribution demand beyond notice preservation; no CLA/DCO at go-live — adopt DCO when the first external PR arrives; the npm premise correction is accepted and ticket 07's Answer was amended accordingly.

Implementation remaining (mechanical, not a decision — gated before the `release-pr.yml` go-live swap): five LICENSE files (root + four packages, "Copyright (c) 2026 NaniSoft" — legal entity confirmed 2026-09-14, no fallback), `"license": "MIT"` in the four `package.json` files, `THIRD-PARTY-NOTICES.md`, and the brand-policy page + site footer when the site exists.

## Comments

### Re-ratification — 2026-09-14

The original resolution was a batch-level approval ("all four as recommended"); the audit pass put every decision point to the human individually. **All 7 confirmed, none reopened**: MIT uniform across all four packages · no trademark filing now (brand policy page instead) · Apache-2.0 rejected (no patent-grant need) · docs/prose stay © NaniSoft reserved with the site footer line · one license across all four · no attribution demand beyond notice preservation · no CLA at go-live, DCO when the first external PR arrives.

**New fact**: the human confirmed **NaniSoft is the legal entity** — the LICENSE carries `Copyright (c) 2026 NaniSoft` outright; the "(D. Vennapusa)" fallback is moot.
