---
'@nanisoft/prism-ui': minor
---

A stored theme is written when a reader decides, and not before

`PrismProvider` wrote `prism-theme` on every resolved change, including the
first resolution from the server-rendered attributes or from its own defaults. A
first-time visitor therefore ended the load with a stored value they never chose,
and that value outranked the site's default on every later visit, so a site that
changed its default could not reach anyone who had ever loaded the page.

The write is now gated on a decision. It happens when a caller changes the pack,
the mode or the toggle, and when the library recovers a decision from
`prism-theme-mode`, a key earlier lines wrote and this one does not. It does not
happen on a first resolution from the document or the defaults, so a first visit
ends with an empty store and a returning visit keeps its choice.

Two readers of one stored value now share one rule. `resolveTheme` in
`@nanisoft/prism-ui/theming` is the rule, `PrismProvider` calls it, and the boot
script implements it as a string. The script cannot import the function, because
the build minifies and a renamed identifier inside its own `try` would throw
there and fail open, so the two are held together by a build-failing equivalence
gate that runs the emitted string and the rule over one table of stored values:
nothing stored, a valid pair, a valid mode with a retired pack, a valid pack with
a retired mode, garbage, a JSON array, a JSON string, `null`, an empty object, a
partial, a server-rendered pack and mode, and the retired key. Every fall-through
is asserted to be whole, which is the divergence this fixes: the old string
validated the pack and the mode independently, so a stored `{ mode: 'dark' }` with
no pack half-applied there and fell through whole in the rule.

A value that is present but is not a pair is no longer repaired field by field,
and it is not cleared. It is the only record that this reader ever chose anything.

The boot script records where the theme came from in `data-theme-origin` on
`<html>`, and it is the only writer: the provider never touches it, because two
writers would make the origin a race rather than a record. The value is one of

| Value | Meaning |
| --- | --- |
| `stored` | the key held a valid `{ pack, mode }` pair |
| `legacy` | the key was empty and `prism-theme-mode` held a recoverable mode |
| `unparsed` | the key held a value that is not a pair, and the theme fell through whole |
| `document` | the key was empty and the root element's own attributes supplied the theme |
| `default` | neither did, so the consumer's defaults apply |

It is written on every path the script reaches, so an absent origin is never an
unread one. It is not `data-theme`, which the migration guide retires; it records
the provenance of a resolution and never a pack.

The migration clause reads `prism-theme-mode`, puts the recovered decision in
`prism-theme` and removes the key it read, in one guarded step. That is how it
expires: it fires only while a retired key still holds a mode, at most once per
reader, and it is retired for good by deleting the last entry of
`LEGACY_MODE_STORAGE_KEYS`. There is no date and no version constant in it.

The pre-paint string gets its own ceiling in raw bytes,
`check-boot-budget.mjs`, because it runs before paint on every page and adding it
to the per-component client budget would corrupt the unit that table measures. The
ceiling is derived by addition: the pinned non-migration base, plus the measured
clause, plus one migration generation.
