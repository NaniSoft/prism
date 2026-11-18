---
'@nanisoft/prism-tokens': minor
'@nanisoft/prism-ui': minor
---

Glass panes across every pack

Surfaces are now a thickness ladder of translucent panes over a tinted page
ground: `sidebar` at 0.55 alpha, `card` at 0.72 and `popover` at 0.92, each
carrying the rim highlight and inside hairline of the elevation stacks, with
the ground behind them blurred by the new `blur-glass` token. A dialog, an
alert dialog and a drawer render as the thickest pane rather than the page
ground. A reader with `prefers-reduced-transparency` gets every pane opaque,
from a fallback the token build emits beside each role, and every backdrop
blur the package authors stops. Focus rings in the seven pastels move one ramp
step deeper to hold 3:1 on the tinted ground.
