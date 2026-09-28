---
'@nanisoft/prism-ui': minor
---

Add `CommandPalette`, so a reader can reach any command by typing three letters

Prism had a Select, a DropdownMenu and a set of Tabs, and nothing for the fastest
route to an action that lives behind three levels of menu.

```tsx
<CommandPalette
  open={open}
  onOpenChange={setOpen}
  label="Commands"
  inputLabel="Search commands"
  groups={[
    {
      id: 'appearance',
      label: 'Appearance',
      items: [
        {
          id: 'theme',
          label: 'Toggle theme',
          hint: 'Cmd K T',
          keywords: ['dark', 'light', 'colour'],
          onSelect: setTheme,
        },
      ],
    },
  ]}
  empty={{ message: (query) => `Nothing matches ${query}` }}
/>
```

**It ranks, and that is the difference between this and a filtered menu.** Matches
are scored by where the query falls: the start of the name beats the start of a
word inside it, which beats a match further along, which beats a keyword-only hit.
A palette that filters without ordering shows every command containing the query in
declaration order, so the command the reader meant sits below one that merely
mentions their query and they scroll.

**The groups are ordered by their best match too.** Ranking only *within* a group
leaves the premise broken, because an exact match in a late group still sits below
a poor match in an early one. Ordering the groups by their strongest member puts
the best answer at the top and keeps the headings, which is the whole of what a
grouped list is for.

**It is composed on the Dialog rather than beside it.** Focus trapping, Escape, the
portal, the scroll lock and the return of focus are five behaviours that are correct
in the Dialog and would be five chances to get one wrong here. A palette that rolled
its own overlay would be a second answer to all five questions, and the second
answer is the one that ships the bug.

**The matched run is emphasised by weight, not by a background**, which is a
deliberate difference from `Mark`. A Mark is right in a list of search results,
where the match is the reason the row is there. In a palette the match is a hint
while the label is what is being read, and a saturated background on every matched
character fights the text it sits inside. Two surfaces, two treatments, one reason.

Three behaviours are decisions rather than defaults and are asserted in the tests:

- **Enter never runs a command the reader did not point at.** With nothing
  highlighted it does nothing. This is the one outcome a palette must never
  produce, and it is invisible in a screenshot because nothing on screen changes
  when it happens.
- **The arrows wrap.** A palette is a transient surface where overshoot is common,
  and a reader who overshot should not have to press Up to come back.
- **The highlight is clamped, not reset, as the list changes.** A reader who arrows
  down three rows and then types one more character is choosing from a list that
  moved under them, and yanking the highlight to the top discards where they were.

`keywords` is what makes the palette good rather than merely present: a reader who
has to name a command exactly already knows it exists, which defeats the surface.
`suggest` covers the rest, because a palette that opens onto a bare list makes a
reader type before they know what is available. `empty` takes the query so the
sentence can be the caller's, which is the only way "no results" avoids shipping in
English.
