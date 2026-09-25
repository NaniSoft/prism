---
"@nanisoft/prism-tokens": minor
"@nanisoft/prism-ui": minor
"@nanisoft/prism-llms": patch
---

Accessibility and theming hardening from two design audits.

**Token architecture (prism-tokens)**
- antd's overshoot `motionEaseOutBack`/`motionEaseInBack` seeds are pinned to the single brand curve (bounce is banned).
- Component overrides drop `algorithm: true`; antd's component algorithm re-derived the global map tokens from antd defaults, which turned light-mode hairlines into stock greys (`#d9d9d9`) and discarded the pack's tinted `colorBorder`. The allowlist therefore grew by `colorPrimaryBorder`, routed to the ink because antd's `genFocusOutline()` hardcodes that token as the `:focus-visible` outline colour and its derived stop fails WCAG 1.4.11.
- `Button.primaryColor` now carries `textOnInk` (white in light, `#0A0F1C` in beam-dark). antd defaults it to `colorTextLightSolid` (`#fff`), which failed AA on every lightened beam-dark ink (blue 4.18:1, peach 3.62:1).
- Shared success/warning hues darken to `#15803D`/`#B45309` and every state hue is gated at ≥4.5:1 on the white surface and ≥3:1 on the beam ground.
- ADR-0002 errata 3–6 record each change with evidence; the allowlist test asserts the new key.

**Accessibility and components (prism-ui)**
- `styles.css`: reduced-motion handling, `font-display: swap`, ≥24px/44px touch targets.
- `PageHeader` gains an optional `level`; `DocsShell` renders separators as non-link labels and labels its asides; `ProductDot`/`productDotBackground` resolve the ambient mode; the throwaway `./prototype` subpath is removed.

**Site (apps/site)**
- Mobile `DocsShell` now collapses to one column below 900px (the article was ~54px wide at 390px).
- Pack-switcher labels use a visually-hidden pattern (not `display:none`) so the collapsed radios keep their accessible name.
- Reduced-motion override moved after the base rule (source order had been defeating it).
- Landing specimen Switch/Slider/Input given accessible names; shell nav exposes `aria-current="page"` plus a selected state.
- Small mono annotations and ledes render at full contrast (an ink@0.82 wash composited to ~3.5:1 on the pastel light grounds); the hierarchy comes from mono/size rather than a fade.
- Coarse-pointer hit areas raised on the shell Segmented controls; theme-gallery strip stacks on phones.
- Dropped the duplicate `next/font` pipeline; the `v1.0` landing tag follows the pack instead of a hardcoded antd blue; copy confirmation is announced via a live region.

**Known follow-ups (measured, not yet fixed)**
- antd's *preset* state `Tag` colours fail AA for every possible seed (`#16A34A` 2.47:1, `#15803D` 2.64:1, `#166534` 2.84:1 light) because antd mixes the tag background toward the seed. Fixing them needs a dedicated mode-aware `stateXText` token (a published tier-1 addition that also flows to the DTCG/Figma export) plus a tag recipe. Direction approved (tinted wash + accessible text); implementation is a separate, reviewable change.
- Body-prose opacity tiering (0.75–0.85 on 14–15px paragraphs) is left as-is pending the same review; the measured failures (mono labels, ledes, island mode) are fixed.
- The 515 KB single-file theme bake and the ~1.08 MB initial client chunk remain open (splitting per theme would trade away flash-free theming for stored non-default themes).

Minor (0.x) for the component-override changes and the `./prototype` removal.
