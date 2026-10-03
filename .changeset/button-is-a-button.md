---
'@nanisoft/prism-ui': minor
---

`Button` is `type="button"`, the carousel leaves the caret keys, and a number field takes one

**`Button` defaults `type` to `"button"`.** A `<button>` with no `type` is a submit
button as far as the HTML is concerned, so the default was that every Prism `Button`
a consumer placed in their own form submitted it: a Cancel, a Close, a second step of
a wizard, anything that was not the one control that should. The failure is silent
and it costs data, which is why the default is stated on the Component rather than
left to the HTML.

Nothing in this repository changed, and that is worth saying with the evidence rather
than as an assurance: every `<form>` in `packages/ui` and `apps/site` already states
its submit button's `type`, which is why no call site moved. The one behaviour change
is for a consumer who relied on the old default, and the migration is one token:

```tsx
// a control that used to submit by default
<Button>Save</Button>

// now
<Button type="submit">Save</Button>
```

The trade is deliberate. A submit button is a decision someone makes about a form and
this Component cannot see the form, so making the destructive default the safe one
and the deliberate act the explicit one is the only arrangement where the mistake is
the one you have to write on purpose. `ToggleGroupItem`, `MultiCombobox` and
`SelectionToolbar` already wrote `type="button"` by hand for the same reason.

**`Carousel` answered the arrow keys for whatever was inside a slide.** The key
handler sits on the region, so every key that bubbled out of a slide reached it, and a
slide is the caller's slot: it can hold a field, a number field, a `select` or an
editable region, and in all four Left, Right, Home and End belong to the value. The
Component was calling `preventDefault()` on them unconditionally, so a reader typing
a caption moved the carousel instead. It now answers a key only when nothing inside
is using it, which is the discipline `ResizableHandle` applies to the same keys on
the other axis. A reader arriving on the carousel or on one of its own controls is
unaffected.

**`NumberField` documented a route to the unit that its props did not carry.** The
drawn unit is `aria-hidden`, on the reasoning that a screen reader already says the
unit when the caller puts it in the field's description, and there was no
`aria-describedby` on the props to put it in, so a value of 1,250 was announced as
1,250. The prop is there now and is forwarded to the input. The unit stays hidden: a
reference already says it once, and two announcements of the same word is one too
many. The unit belongs in the description and not in the accessible name, because
`aria-label` is optional, so a field with a real `<label>` has no name to put it in,
and a name reading "Parcel weight, kg" against a visible label reading "Parcel
weight" is what WCAG 2.5.3 forbids and what voice control cannot activate.

`aria-describedby` is an addition, so nothing breaks. `Button` and `Carousel` change
behaviour, which is why they are here rather than described as a patch.
