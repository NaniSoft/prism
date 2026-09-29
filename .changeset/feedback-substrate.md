---
'@nanisoft/prism-ui': minor
---

Add the feedback substrate: Spinner, Toast and the Empty State Block

Three Items, and the one that changes an existing Component's behaviour is the
`Toast`.

**A pause holds the remaining time rather than restarting it.** A reader who
hovers or focuses a toast for ten seconds gets the four seconds they had left, not
four fresh ones, because a rest is a fact about the reader and the countdown is
about the content. Restarting the clock on every pointer move means a toast can be
held open indefinitely by a reader who simply rests on it, which is the opposite of
what a pause is for.

**`duration` defaults to 4000 with its reason, and `0` turns the clock off.** A
toast that vanishes before a screen reader has finished announcing it is worse than
no toast at all, and a toast that never leaves strands the reader. Both are
judgements about the reader rather than about the content, which is why the
default is stated and overridable rather than fixed.

**`closeLabel` is required with no default**, and it is the only surface in the
package where a default is wrong rather than merely unhelpful. A toast arrives on
its own initiative, with no button the reader pressed and no context to carry an
implication about the product's language, so four products in two languages cannot
all be told the control says "Close". A default is right when the caller may
override it; here the string is the whole of the contract and guessing it is
guessing a product's words.

**The enter and leave are three phases with the handoff on the element's own
`transitionend`**, filtered to `opacity` and with no second clock. Two timers for
one animation is two things to keep in step, and a mismatch shows as a toast that
fades and never goes.

**`Spinner` is a server Component.** It holds no state, runs no hook and attaches
no handler, so the client directive would be a claim about work it does not do. Its
JSDoc states the three-way difference from `Progress` and `Skeleton`, because
"reports a position", "has the shape of what is arriving" and "something is
happening" are three different claims and the usual failure is using the third when
the first or second is what the reader needed. The honest reason a spinner is often
wrong is layout shift: it hides the shape of what is coming.

**`EmptyState01` requires a `reason` closed to three values**, because
`first-run`, `no-match` and `not-permitted` want different words and different
actions, and a consumer who cannot say which kind of empty they have writes "No
data", which is the state this Block exists to end. It throws rather than shipping
a button that lies, following the `instrument-panel-01` precedent.

## Nothing was deleted, and that is a finding

The fourth part of this ticket was to remove a superseded `empty` entry. The search
was exhaustive across `packages/tokens/src`, the emitted tokens, the catalogue, the
registry and the whole tree, and there is no `empty` token, no `empty` Component and
no `empty` catalogue entry to remove. It was already resolved: `DESIGN.md` records
that the old `empty` Component "returns as `empty-state-01`, a Block", and the
change note that renamed it is in the history. Nothing was invented in order to
have something to delete.
