---
Type: prototype
Status: resolved
Labels: wayfinder:prototype, ready-for-human
Blocked by: 08, 09
---

## Question

What does prism.nanisoft.com's landing page actually *look like* — in Prism's visual language?

Raise fidelity cheaply: a rough Prism-themed landing prototype (hero, feature grid telling the "many expressions" story, CTA, footer) to react to. Explore:
- How loudly Prism shows its antd foundation.
- Dark-mode-first or light-first presentation.
- How the components → blocks → pages story is told visually.

Links the prototype as an asset; the outcome feeds the site build and the landing blocks catalog.

## Answer

Resolved 2026-09-14 — three structural variants were built and the human reacted **"A"**: the **Specimen** direction wins.

- **How loudly Prism shows its antd foundation: loudly.** The foundation is the hero — a live themed specimen plate (`<Button /> <Input /> <Switch /> <Slider /> <Tag /> <Table />`) with mono annotations. The brand is not a repaint of antd; it is antd, themed, shown plainly.
- **Dark-first.** The page opens in blue beam-dark; light mode appears once, deliberately, as the "docs in daylight" peek after the dithered divider — a counterpoint, not a toggle.
- **The taxonomy story is spatial progression**: three bands, 01 Components (raw parts) → 02 Blocks (the stat card, pre-composed) → 03 Pages (the mini page wire) — composition depth reads left to right.

Declined: **B — Ledger** (light-first editorial; its green-pack beam-dark agent band survives as the pattern for the agent-surface story) and **C — Workbench** (live pack × mode instrument; revisit if a theming showcase page is ever wanted).

**Asset**: branch **`prototype/landing-variants`** (commit `a97a13a`) holds the full variant set — the primary source; raid it when building the real page. Main carries the winner only: variant A stands in on the site's `/` route (`packages/ui/src/prototype/landing/`, exported at `@nanisoft/prism-ui/prototype`), switcher and losing variants dropped from main per prototype capture. Still prototype-grade by design — the real prism-ui page is built in the site-build pass. Brand inks remain provisional until the pack implementation pass (ADR-0002).

Prototype mechanics, for the record: antd + `@ant-design/icons` added to prism-ui (their real home per ADR-0003); `@ant-design/nextjs-registry` + Archivo Variable (wdth axis) / JetBrains Mono fonts wired at the site root per ticket 02; the provisional ADR-0002-shaped theme lives in the prototype folder. Feeds the site-build fog: the landing patch there now means "build the Specimen direction as a real prism-ui page."
