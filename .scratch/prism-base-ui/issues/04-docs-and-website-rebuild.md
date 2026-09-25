# 04 — Docs and website rebuild

Type: task
Status: resolved
Blocked by: 02, 03

## Question

Revamp the landing page, theme gallery, docs information architecture, examples, and static-site shell around the new Prism-owned catalog without changing the established Spectral Refraction world.

## Acceptance

- The site imports no third-party UI package and no retired component runtime.
- Components, blocks, and pages are organized, searchable, and documented as the product's primary taxonomy.
- Live examples and copyable source remain the single docs source.
- Light/beam-dark and all five packs remain flash-free and interactive.
- Desktop and mobile routes build and render cleanly.

## Answer

Rebuilt the static Next.js site around the owned catalog: landing composition, theme gallery, searchable components/blocks/pages IA, live demos, copyable source, guides, and agent entry points. The site imports Prism and React-facing app code only, uses the blocking theme bootstrap plus provider synchronization, and has been checked in production static output at desktop and mobile sizes in light and beam-dark. The final visual pass fixed primary-button contrast, selected-tab styling, restored-theme timing, and responsive overflow evidence.
