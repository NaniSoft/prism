---
'@nanisoft/prism-ui': patch
---

prism-ui: `PrismProvider` now carries the `'use client'` directive. A server component rendering the provider handed antd's `ConfigProvider` a `theme` whose `algorithm` serialized to `undefined` across the RSC boundary — silent light-token derivation for dark themes. `prismTheme` is plain frozen data, so the props serialize and the algorithm attach happens client-side; consumers need no changes.
