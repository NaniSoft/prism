---
'@nanisoft/prism-ui': minor
---

Declare `react` and `react-dom` as peer dependencies

`react` was already a peer dependency in fact: every module in the package imports
it, and nothing declared it. What that cost was not a failed install but silence.
A package with no peer range cannot be incompatible with a React version, so npm
and pnpm had nothing to warn about, and the manifest never said which React this
library is written for. Both are now `^19.2.0`, the range this repository builds
and tests against, and the site already resolves. `react` and `react-dom` stay in
`devDependencies` so the package still builds and tests locally.

`react-dom` is a peer even though no module here imports it, because
`@base-ui/react` does, for the floating elements the Dialog, the Popover, the Menu
and the Tooltip render through. Two places already treated it as your copy rather
than the package's, the client budget's shared runtime and the registry's implicit
set; this is the manifest catching up with those two decisions.

If your application is on React 18, install React 19. Nothing in the package uses a
React 19 only API, but every gate, test and build in this repository runs on 19, so
a narrower claim would not be one this repository can back.