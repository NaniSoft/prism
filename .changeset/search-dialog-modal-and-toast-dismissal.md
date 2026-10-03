---
'@nanisoft/prism-ui': minor
---

`SearchDialog` is a real modal, and `Toast` dismisses when no transition runs

Two accessibility defects, and a consumer sees both.

**`SearchDialog` claimed modality it did not have.** It rendered `aria-modal="true"`
with no focus trap, so Tab walked out of the dialog and into the page behind it;
it took no focus back, so a keyboard reader who opened search, pressed Escape and
kept tabbing had lost their place entirely; its field suppressed the browser
outline and drew no replacement, so the one control holding focus showed nothing;
and it had no portal and no scroll lock, so the panel scrolled with the document
and could be clipped by an ancestor.

It is now composed from `Dialog`, so the focus trap, the page scroll lock, the
portal, the dismissal on Escape and on the scrim, and the return of focus to the
control that opened it all come from the one modal implementation this package has.
There is one modal in the package rather than one and a claim. Its props, its
ranking, its result list and its live region are unchanged.

Two things about the composition are worth knowing:

- `onClose` now fires once the dialog has finished leaving rather than at the
  moment it was asked to. The modal owns the reader's focus while it is closing,
  so handing over earlier would take the focus return with it. Unmount from
  `onClose` exactly as before.
- The panel and the scrim are now `Dialog`'s rather than the search dialog's own.
  The scrim is a blurred `bg-background/80` wash instead of a `bg-foreground/40`
  one, and the panel is centred in the viewport rather than pinned 15 percent from
  the top. A site that styled either through its own sheet will want to know.

**`Toast` dismissal depended on a transition ending.** The leave handed over on the
end of its own opacity transition, so a global reduced-motion kill written as
`transition: none` rather than as a `0.01ms` duration meant the event never fired,
`onDismiss` was never called, and the toast was stranded in `data-phase="leaving"`
for good: visible, undismissable, still taking the pointer, and a live region that
never stopped announcing. This is the one place in the system where a global
motion kill destroyed state rather than merely removing movement, and
`packages/ui/src/styles.css` states the invariant it broke.

The leave now asks the browser what is actually running on the toast rather than
waiting for an event a killed transition never sends. It waits for the fade when
there is a fade, it hands over on the same commit when there is not, and
`onDismiss` is called exactly once either way. Nothing else about the contract
moved, and the length of the leave is still `duration-slow` from the stylesheet
rather than a number in this package.

**`Dialog` takes an optional `initialFocus`.** Left out, the panel focuses its
first tabbable element, which is unchanged. It is named for the dialog whose first
tabbable element is not the control the reader came for, which is what
`SearchDialog` now uses to put the cursor in the field.

**The bump is `minor` rather than `patch`, for two reasons.** `Dialog` gains a
public prop, which is new surface rather than a correction. And `SearchDialog`'s
panel and scrim visibly change to `Dialog`'s, which is a behaviour a consumer can
see on their site rather than a fix they never notice. Both are additive and
neither breaks a call site.