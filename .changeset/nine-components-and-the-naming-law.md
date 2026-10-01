---
'@nanisoft/prism-ui': minor
---

Nine Components, and the naming law that the next thousand will follow

Closes the gap in Component coverage: a `Pill` beside `tag-group`, a `Drawer`
that is a Sheet with a gesture rather than an overlay, an `ImageZoom` that is a
`Lightbox` with the dialog taken out, a `VideoPlayer` that owns no engine, an
`EmojiPicker` that ships no emoji table, a `RepoStars` whose mark is a slot
because a host logo is a licensed asset, a `ChoiceCard` built on real radios
rather than ARIA, a `BillingSource` that has no `mask` prop on purpose, and a
`PackSwitcher` that makes Prism's pack axis switchable at runtime, which nothing
did before.

Four of the nine ship no JavaScript at all. That is the number worth reading
against the roster: nine catalogue Items cost 19.3 KB of the deduplicated client
bundle rather than the sum of their rows, and `VideoPlayer` in particular is a
server Component that a page can carry a dozen of for free.

`DESIGN.md` gains the naming law this roster needed earlier: a slug says what a
Component does, and the only number it may carry is a variant ordinal on a name
that is already true. `button-47` tells a reader nothing; `split-button` tells
them what it is and what happens if it changes. Five upstream-shaped items are
refused by that law and each refusal is recorded with its reason rather than left
to be rediscovered.

The client ceiling moves from 260 KB to 280 KB, measured at 269.7 KB over 177
entry points, and the gate's header says plainly that this is the third kind of
number it has printed: not a correction of a bad measurement, and not a forecast
of weight that had not landed, but a report on weight that is here. It also names
the pattern, because five moves in a row triggered by the same event is the
finding: a ceiling that moves once per batch of work is recording a history rather
than measuring a policy.

`Progress`, `dayKey` and the `live` subpath fix from the previous release are
unchanged. No consumer import breaks; every name here is an addition, and the
four `*Variant` to `*Form` renames from that release are still additive because
nothing imported the old names.
