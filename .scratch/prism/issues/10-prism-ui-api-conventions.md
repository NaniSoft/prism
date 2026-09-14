---
Type: grilling
Status: open
Labels: wayfinder:grilling, ready-for-human
Blocked by: 02, 03
---

## Question

Define `@nanisoft/prism-ui` conventions:

- Export surface: barrel structure, subpath organization for components/blocks/pages; what `PrismProvider` owns (ConfigProvider, theme, locale, direction?) vs leaves to apps.
- antd re-export policy: which components pass through untouched, which get Prism wrappers (and what added value justifies a wrapper), how parity is kept when antd upgrades.
- Blocks/pages taxonomy: naming conventions, prop conventions (data-in vs composition-in), how blocks compose components and pages compose blocks.
- Styling extension points for consumers that don't break encapsulation.
- Deprecation/versioning policy across the taxonomy.

Output: written conventions (ADR) prism-ui is implemented against.
