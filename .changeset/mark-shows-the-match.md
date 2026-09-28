---
'@nanisoft/prism-ui': minor
---

Add `Mark`, so a search result can show which characters matched

A command palette and a search result list both need to show why a result
matched, and until this existed the only way to do that inside Prism was to drop a
span with hand-written styling into a consumer's own markup, which the authoring
contract does not permit.

```tsx
<Mark text="component library" ranges={[{ start: 0, end: 9 }]} />
```

It takes the string and the ranges rather than pre-split nodes, because a caller
that assembled the nodes had to compute the ranges and this Component has the
string. The ranges are handled rather than refused: they are sorted, overlapping
runs are merged, and a range that runs past the end of the string is clamped. Each
is a thing a search backend does as a matter of course, and a Component that threw
on any of them would be one a consumer has to wrap in a try, which is a worse
failure than a highlight that stops at the last character.

**It adds no semantics, and that is the decision rather than an omission.** A
consumer marking a hit wants a visual difference, not a screen reader announcing
"highlighted" between every character of a result. So it styles a `mark` and puts
nothing else on it, and a consumer who wants the announcement writes it.

The treatment is the existing warning token pair rather than a new role. A mark
sits behind the text it marks, so it needs a ground and a foreground, and that
pair is already measured against every surface in every pack and both modes by the
token contrast gate. A search hit is emphasis and not a caution, and the two are
kept apart by spending the existing token rather than by adding a role that means
"highlighted" and will be re-pointed at something else within a year.
