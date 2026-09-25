// prism-ui components barrel — every antd pass-through plus wrapped components.
// One proxy module per component lives at src/components/<antd-id>/index.ts.
// The generated pass-throughs point at antd's component modules directly; this
// aggregate remains public for consumers that need the full catalog (the docs
// route), while narrow landing imports use their per-component subpaths.

export * from '../generated/antd-components.js';
export { DisplayTitle, type DisplayTitleProps } from './display-title/index.js';
