---
'@nanisoft/prism-ui': patch
---

A variant that sets its own fill sets its own ink, and `outline` now says which

`Button`'s and `CtaLink`'s `outline` variant carried `bg-background` with no `text-` for the life of the package. On the page ground and on a card the omission was invisible, because the ink a control inherits there is `foreground` and `card-foreground` is equal to it in all twelve pack and mode combinations, so the variant was correct everywhere the design system itself placed it and wrong everywhere else.

`Cta01` draws its band as a filled `bg-primary` surface with `--primary-foreground` as the band's ink, and defaulted its second action to `outline`. The second action was therefore `--background` behind `--primary-foreground` and measured **1.00:1 to 1.10:1 in seven of the twelve combinations**: the base pack in both modes, where light mode pairs `#ffffff` with `#ffffff`, and all five pastel packs in dark mode. The button was in the document, focusable, announced, and unreadable. It was found by resolving computed values in a browser, because neither the class name nor the token contract says anything about it.

The fix is `text-foreground` on the variant, which is a no-op on the page ground and on a card and correct everywhere else. Measured across all twelve after the change: lowest is 13.59:1.

A consumer that passed `variant="secondary"` on that action, as the product site did, saw no difference and needs no change. The default is unchanged, deliberately: `outline` reads as one filled action and one alternative, and it is now a safe default because it carries its own ink rather than because it was made to stop.

Two gates hold it, and neither could have caught the original:

- `check:variant-ink` fails a variant whose own fill has no `text-` utility of its own, read from the source. It reads source rather than the emitted stylesheet on purpose: Tailwind only emits a variant something uses, so the sheet is a record of what was chosen rather than of what is available. A state fill such as `hover:bg-accent` is exempt, because exempting it is the difference between a rule that finds the defect and a rule nobody can run.
- a test resolves the pair from the emitted token CSS for all twelve combinations rather than asserting a class name, and pins the seven that used to fail by name. A test written over class names would have passed against the broken button, because the class name never changed; only the resolved pair did.

`Cta01Action`'s `variant` now states which weight a panel wants and why, with the measurement, so a consumer does not have to discover it.
