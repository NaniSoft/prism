---
'@nanisoft/prism-ui': minor
---

Add `Diff`, where the bar measures how much of a line changed

A conventional diff marks every changed line with the same coloured wash and a
rail. That tells a reader a line changed and nothing about how much, so rewriting
one identifier in a long line leaves the same mark as replacing the line outright,
and the reader's eye, which is fast at finding saturated bands, is drawn to the
least interesting change in the file.

```tsx
<Diff
  lines={[
    { kind: 'context', oldNumber: 1, newNumber: 1, content: 'export function run() {' },
    { kind: 'removed', oldNumber: 2, content: '  const limit = 100', changed: [[8, 13]] },
    { kind: 'added', newNumber: 2, content: '  const limit = 250', changed: [[16, 19]] },
  ]}
  label="Changes to run"
  labels={{ added: 'Added', removed: 'Removed', context: 'Unchanged' }}
  file="src/run.ts"
  summary="1 addition, 1 deletion"
/>
```

**The bar is change density.** Its width is the fraction of the line that actually
changed, so a one-character edit in a long line is a sliver and a rewritten line
fills the gutter. The marks that used to be a wash become a measurement, and the
eye goes where the reviewer's attention belongs.

**The line numbers carry the side, not the colour.** An added line has a new number
and no old one, a removed line the reverse. That asymmetry is structural, it is how
every diff reader a developer has used distinguishes the two, and it does not depend
on telling red from green. The colour is redundant on top of it, which is the right
way round: shape carries the meaning, colour reinforces it.

**The changed words are emphasised by weight, not by tint.** A diff that coloured
them green and red would spend the two hues a reader is most likely to be unable to
distinguish, and would also fight the line's own state colour. Weight survives
greyscale, which is the condition any encoding here has to survive eventually.

**It is a table**, because a diff is two columns of numbers beside a column of
text, and row and column navigation then come from the semantics rather than from a
grid of divs.

`labels` is required, for the same reason a Dialog's close label is a prop: a
shared library cannot know whether the word for this is "added", "ajoute" or
"hinzugefugt". `summary` is the caller's too, and a diff of a rename has no
additions and no deletions and is still a change, which is the case a computed
sentence gets wrong. The counts are exposed as `data-added` and `data-removed` so
a caller can style them without the Component shipping a sentence.

A test caught a real flaw in the first draft. A minimum bar width was applied to
every changed line to keep one visible, which meant a one-character change in a
long line was drawn at twelve percent when the data said half a percent. A
measurement is not allowed to overstate what it measured, so the floor now applies
only where the density is genuinely unknown, which is a changed line the caller
gave no ranges for.
