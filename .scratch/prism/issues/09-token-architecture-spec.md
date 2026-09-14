---
Type: grilling
Status: open
Labels: wayfinder:grilling, ready-for-human
Blocked by: 02, 08
---

## Question

Define `@nanisoft/prism-tokens`: the API and architecture.

- `createPrismTheme()` signature and what it returns (ConfigProvider-ready theme object? token tiers? both?).
- Token tiers: primitives → semantics → antd mapping (`token` / `components` / `algorithm`); where the Figma-Variables export slots in.
- Dark mode: algorithm composition strategy, user override surface.
- Brand pack shape: what a second brand may change vs must leave alone.
- Fidelity rule: how much of antd's token surface Prism exposes vs abstracts away.

Output: a written spec (ADR) the tokens package is implemented against.
