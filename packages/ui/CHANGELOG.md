# @nanisoft/prism-ui

## 0.11.0

### Minor Changes

- 3260391: A card title is a heading again, at a level the Block derives rather than guesses
  
  **The defect.** `CardTitle` renders a `div`, and that is correct: four cards in a
  grid are four titles under one section heading, and four `h2`s under one `h2` is
  four sections. But that reasoning is about the **element**, and the catalogue was
  reading it as a reason about the **outline** too. Every Block that drew a titled card
  drew it as plain text, so a page kept its `h2` and lost every heading below it. A
  feature grid of five cards was unreadable by heading navigation while looking
  identical. Found while migrating the company site, whose feature section had five
  `h4`s before the migration and five `<div>`s after.
  
  **The answer is one function, and it is the same answer in all six places.**
  `childLevel(headingLevel)` steps one level down, so a Block that draws a Section
  heading and a set of card titles puts the titles *under* the section, and the whole
  set moves together when the block is composed one level deeper than it was written
  for. A Block that draws no Section heading passes `headingLevel` directly, because
  there the card title is the one heading it renders. Both answers are right, and the
  test carries which is which rather than assuming one for all six.
  
  This is what answers the ticket's third criterion, that the same question be
  answered for *every* Item that draws a titled card. The sites are `FeatureGrid01`,
  `Pricing01`, `StackGrid01`, `AuthForm01`, `SettingsPanel01` and `AuthPage`, and the
  test that holds them is one file, because the consistency is the thing under test:
  five files with one case each would let the next Block answer differently and still
  pass, which is the failure this was filed about.
  
  **`CardTitle` gains `as`, defaulting to `div`.** The change is additive and no
  existing rendering moves. Its JSDoc previously told a caller to pass Prism's
  `Heading` inside it, and that was wrong: `Heading` is a step of the *type* scale
  whose floor is `lg`, and a card title sits at body size, so the only way to use it
  was to override the size back down, which asks a type-scale component to have no
  opinion about type. The element and the visual step are separate questions and this
  is the one that answers the element.
  
  **Two levels in one Block that had one hardcoded.** `SettingsPanel01` drew its
  group headings as a literal `<h3>`, so a panel composed under an `h4` in a document
  whose sections were `h4` announced its groups as siblings of the panel that
  introduces them. They are now one step below the panel title, so the panel's whole
  outline moves when the panel does.
  
  **`h6` holds rather than wraps.** A section already at `h6` has no child level.
  Wrapping to `h1` would put a card title *above* the section that introduces it, which
  a reader navigating by heading would meet first; holding at `h6` costs a repeated
  level, which a screen reader announces as the same depth rather than as a break in
  the outline. The clamp is asserted so a later change to the order is caught.
  
  **The proof that the test can fail.** Replacing `childLevel(headingLevel)` with a
  hardcoded `h3` in `FeatureGrid01` fails two cases, the default and the derived one,
  which is the exact defect the ticket names. A test that asserts "is a heading" would
  have passed that.
- 932ce96: Add `ChartFrame` and `Sidebar`, the two token families that shipped with no consumer
  
  `chart-1` through `chart-5` and the eight `sidebar-*` roles were in the contract
  and used by nothing. These two Components are what consume them honestly.
  
  **`ChartFrame` puts the table inside the frame rather than beside it.** Marks and
  cells are two renderings of one `series` array, so drift is structurally
  impossible; a table passed as a sibling prop is a table that says last quarter.
  The table is always in the document and `table="visible" | "hidden"` only decides
  whether it is *seen*, because `hidden` is `sr-only`: it is still announced and
  still findable in the page.
  
  **One frame means every chart in a product aligns to the same plot box.** Five
  charts each drawing their own axes is five sets of numbers that do not line up, and
  a dashboard where two charts disagree by six pixels looks broken in a way nobody
  can name. `mark="line" | "bar"` is a prop and the marks are internal on purpose: a
  mark with no axis, no gridline and no baseline is a bar that lies, and exporting
  one for a caller to place is the exact failure the frame exists to prevent.
  
  **`Sidebar`'s collapsed state is the same rail at a smaller width, not a second
  Component.** Hover surface, focus ring, current marking and accessible name are
  all present in both states and only the words and the padding change. The name
  moves to `sr-only` rather than unmounting and the trailing count is `aria-hidden`,
  so the name is the same *string* at both widths and a reader who collapses the rail
  loses nothing.
  
  ## The measured findings behind both
  
  **The sidebar needs its own ring, and the numbers are in the tests.** `ring` on a
  `sidebar` surface measures 2.86:1 on Mint light, 2.97 on Sky, 3.13 on Peach, 3.16 on
  Lavender and 3.22 on Blush. Four of the six light-mode packs would have shipped a
  sub-3:1 focus indicator had the rail inherited the page ring, which is the
  measured justification for the whole `sidebar-ring` family existing.
  
  **The chart tokens are below 3:1 and that is why the legend is not optional.** In
  light mode `chart-2` measures 2.49:1 against `card` and `chart-3` measures 2.15:1.
  Both are exempt from the contrast gate as graphic objects, so a mark in either is
  found by position and shape rather than by colour. That is why the legend is
  mandatory, the stroke is 2px, and the table is not optional. Past about three
  series hue is the only channel left, which the documentation states as a consumer
  decision rather than hiding.
  
  **One pair in this family is unmeasured.** `sidebar-ring` against `sidebar-accent`,
  the surface a focused item sits on while hovered or selected, is 3.19:1 in the
  base pack's dark mode and 3.82 to 4.21 in the light packs. It passes everywhere
  and it is the tightest pair in the family with no row in `check-contrast.mjs`, so it
  is reported rather than papered over.
  
  ## Two gate gaps found and closed
  
  **`check-variant-ink` listed eleven foreground roles and omitted the two sidebar
  ones.** `sidebar-primary-foreground` and `sidebar-accent-foreground` are both
  required 4.5:1 rows in the contrast table, so the list was telling the `Sidebar`
  that its own required pairing was an inherited one. It is the first Component in
  the package to put a `sidebar-*` fill in a variant, so nothing had hit it. The
  alternative was to add a decoy `text-sidebar-foreground` to silence the gate, which
  would have been a false pass.
  
  **`check-focus-indicators` recognised `ring-ring` only**, so a `ring-sidebar-ring`
  would have been reported non-compliant. The `Sidebar` therefore keeps the browser's
  outline as well as drawing its ring, which is asserted by a test so it stays a
  deliberate guarantee rather than an accident. Both ring roles are now accepted.
- 4650aff: Add `CommandPalette`, so a reader can reach any command by typing three letters
  
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
- 932ce96: Add the data display substrate: item, scroll area, carousel, toggle and the rest
  
  Nine Items, and the one that matters most is `item`, because it is the row almost
  every list in the package hand-rolls today.
  
  **`item` is the row and not the list.** A caller writes the `ul`, the `dl` or the
  grid and composes rows into it, because the same row appears in four different
  parents and a Component that owned the list would own all four.
  
  **`scroll-area` keeps the browser scrolling and takes over only the appearance of
  the bar.** The alternative is a transform on a `div`, which looks identical in a
  screenshot and has no scroll position, so no keyboard, no `scrollIntoView` and
  nothing to announce. The custom bar is also a real accessibility obligation rather
  than a decoration: a scrollbar is a control, and a control made of `div`s is worse
  than the one the browser shipped.
  
  **`aspect-ratio` takes the ratio as a prop rather than as a class.** Prism's
  stylesheet scans only Prism's own source, so a consumer's `aspect-[4/3]` is a rule
  the shipped sheet does not contain, and the box silently collapses.
  
  **`carousel` is never the only route to its content.** Every slide stays in the
  DOM, the controls state where the reader is through a required `position` function,
  and there is a focus handoff: a control that has just been disabled leaves the tab
  order without giving up focus, so a reader who pressed "next" onto the last slide
  would otherwise be stranded inside the carousel.
  
  **`toggle` is pressed; a `switch` takes effect at once.** The JSDoc says so and one
  test asserts the three controls side by side, because confusing them is the usual
  failure and the confusion is a bug report rather than a compile error.
  
  **`toggle-group` changes the role, not the look.** `single` is a `radiogroup` of
  `role="radio"` with `aria-checked`; `multiple` is a `toolbar` of pressed buttons
  where the arrows move the highlight without pressing it. A `group` carrying
  `aria-orientation` is an axe violation, so `group` was not implementable as the
  issue's phrasing suggested, and the toolbar is the more accurate role anyway.
  
  **`native-select` is an addition and not a rival.** The existing `Select` is Base
  UI: a `button role="combobox"` with a portalled popup, not a `select` element. A
  native select is right when the platform picker beats anything this package could
  draw, and wrong the moment an option needs to be more than a string. The test
  renders both and asserts one is a `SELECT` and the other a `BUTTON`.
  
  **`button-group` draws the focus ring once around the group** and the members
  suppress their own, with the click-versus-keyboard trade stated rather than hidden.
  
  **`table-sort` announces the direction it will go next, not the one it is in**, and
  its cycle returns to unsorted in three clicks, so the caller's original order is
  reachable from the control the reader already knows.
- 3260391: `DiagramNode` carries a subtitle and a pack, and an unlabelled `Diagram` is named by its nodes
  
  **The subtitle is drawn, not only announced.** `DiagramNode` had one line of text
  and `DiagramProps` forced `label` on the non-decorative arm, so the only channel
  to a screen reader was the label. That is a text-only channel: a sighted reader
  looking at the picture got nothing, and the drawn name and the announced label
  were two strings a caller had to keep in step by hand. The subtitle is a second
  `<text>` under the name, and a node without one emits no `<text>` at all, so an
  absent subtitle is not an empty line.
  
  **A derived name makes the drift structurally impossible rather than discouraged.**
  `DiagramProps` gains a third union arm in which `label` is absent and the name is
  built from the nodes in draw order: `Tokens (the shared language), Pipeline (the
  engine), Twins`. The arm is `label?: never` and not `label?: string`, so an unnamed
  diagram and a diagram named with an empty string cannot be confused, and a blank
  label falls back to the derived name rather than announcing an unnamed image.
  
  Relation words are deliberately **not** in a derived name. Inventing a sentence out
  of the edges would make `Diagram` write words, which this system does not do; a
  caller who needs the relations announced passes `label`, and the JSDoc says so.
  
  **`pack` is per node and typed `PackId`, not `string`.** A free-text field would
  accept a name matching no emitted rule and the mark would silently keep the pack
  above it. The closed six-pack union is the one `ProductMark` already uses. It is
  per node rather than per diagram because a `pack` is a boundary on a **mark**, and
  a mark in a diagram is a node; a pack on the whole diagram would be a boundary on
  the arrangement, which is the thing the boundary law is not for. It is set on the
  `<circle>` rather than the `<svg>` or the node's `<g>`, so it re-inks that one mark
  and moves nothing else, and a circle is a shape the pack cannot re-round.
  `'default'` is the absence of the attribute, as `ProductMark` spells it.
  
  `check-pack-boundary` now reads three boundaries and reports 0 findings.
- 4650aff: Add `Diff`, where the bar measures how much of a line changed
  
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
- 3260391: `DocsShell` refuses a page with no address, and renders a link with no words as a label
  
  **This is a behavioural change and the honest reading of it is that a previously
  rendered page now throws.** Two leaks fed it. `DocsNavGroup.href === undefined` was
  the only guard, so `href: ''` fell to the anchor arm on both arms of the union, and
  `flatten` copied the same value into `Neighbour`, so one bad row published a second
  broken link in the pager. `title: string` admitted `''` on both arms, rendering a
  link announced as "link" and nothing else. Nothing in the type could stop either,
  and the Component's own JSDoc claimed that it could.
  
  An anchor with an empty `href` is a control a keyboard can reach and cannot operate,
  so the fix is at the tree rather than at the rendering: one pass over both `nav` and
  `toc` at the top of `DocsShell`, before anything renders, and a **page** with a
  blank address throws, naming the tree and the entry. Only the page arm is refused. A
  group with no address has a documented rendering, and a page has nothing to render
  in place of the link, so a label there would hide a page the tree is missing rather
  than report it.
  
  **Blank counts as absent, and that is required rather than pedantic.** All three
  consumer adapters write `url: node.index?.url ?? ''` for a folder with no index, so
  on the group arm `''` is the documented "no route" state and must render as a label.
  
  **A second bug surfaced while fixing the first.** `containsHref` read the group's
  address directly, and `under('', currentHref)` is `currentHref.startsWith('/')`,
  which is true for every absolute address. Treating `''` as "no address" in the
  renderer without fixing this would have made every label-only section claim to be
  the current one at once, so it reads through the same helper the renderer uses.
  
  The rail and the pager now ask one function whether an entry is a destination, so a
  row that is a label on the rail cannot become a neighbour in the pager.
- 932ce96: Add the feedback substrate: Spinner, Toast and the Empty State Block
  
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
- 932ce96: Add the form substrate: combobox, calendar, date picker, number field and the rest
  
  Nine Items, and the one that changes an existing Component's behaviour is the
  `Combobox`.
  
  **Typing never discards a choice.** A field showing exactly the chosen label is
  not narrowing anything, so "chosen and filtered out" is not a reachable state: the
  answer changes only on an explicit choose or an explicit clear. A combobox that
  empties its own selection as a reader types is the usual failure, and it loses
  data silently.
  
  **`Command` is the leaf row and it ranks nothing.** `matchRange` is a prop, so
  whoever filtered the list decides where the match fell, and one command object can
  be spread onto the row with its `keywords` accepted and never rendered.
  
  **`Calendar` keeps a disabled date drawn and in the arrow path, and refuses to be
  chosen.** A date that is simply absent is indistinguishable from a grid that
  failed to render that week, and a reader paging with the arrows should not have
  the path change under them.
  
  **`DatePicker` reseeds the month on show from the chosen value**, so re-picking a
  date in another month does not silently reset the grid to the month the caller
  created the field in.
  
  **`InputGroup` puts the focus on the control and the ring on the control.** The
  frame is a `div` and is never focused, because putting the ring on a wrapper is how
  an indicator ends up around the wrong box.
  
  **`NumberField` clamps a value as it arrives, not only as it is typed**, and an
  empty field reports `null` rather than zero. Base UI clamps typing and refuses the
  steppers past a bound but lets an out-of-range `value` straight through, so the
  clamp is applied on the way in and the consequence for a controlled consumer is
  documented: `onValueChange` is the authority.
  
  **`OneTimeCode` holds the code as one value, not six.** Backspace removes a
  character from the string and the rest close up, which is the only rule for an
  empty box that is not wrong for somebody. Base UI's own field strips the label from
  the first segment on purpose, so a visually hidden `<label for>` is rendered
  instead, and its steppers are put back in the tab order because an announced
  control a keyboard cannot reach is worse than a second stop.
  
  **`Form` makes the error and the way out of it one unit.** `FormError` draws the
  message and the caller's `action` in a single live region that is in the document
  before either of them, so a server error that arrives with the form is announced
  rather than appearing silently.
  
  **`Label` keeps the required mark as decoration.** The control's own `required` is
  what is announced and what the form enforces, so a second signal that says
  something slightly different is the thing to avoid.
  
  ## The ranking is now one module, not two surfaces' private copy
  
  `locate` and `RANKS` moved to `packages/ui/src/lib/rank.ts`, and the `Combobox`
  imports them from there rather than from the `CommandPalette`. A command palette
  and a combobox that each carried their own scorer would agree for a month and then
  diverge on the case nobody thought about, and a reader would find a query that
  floats to the top in one surface and sinks in the other. The first version put the
  scorer inside the palette and the combobox reached into a composite for it, which
  compiles and typechecks and is still wrong: the next surface to need one has no
  honest module to import, and the tempting answer is to copy the one it can see.
- 3260391: A hero action is the element you asked for, and a product row can carry its own sentence
  
  **`HeroAction` is a union, so a wrong action is a compile error.** It was one shape
  with an optional `href`, which made both likely mistakes silent. `{ label: 'Start
  free' }` compiled and rendered a primary button that went nowhere, and a hero's
  first action is almost always a link, so that is the likely one and it looks
  correct on the page. `{ label: 'Start free', href: maybeUrl }` compiled too, and
  rendered a button whenever `maybeUrl` was `undefined`, which is a runtime branch the
  type said nothing about.
  
  So the link arm **requires** `href` and the button arm **forbids** it, as
  `href?: never`. The second is the one worth having: a value that is sometimes a
  string and sometimes `undefined` is now a type error rather than a button. That is
  the ticket's "a caller should not be able to get it wrong silently", and it is a
  type rather than a runtime branch, which is the criterion the ticket asked for.
  
  **The forward arrow now follows the element, not the position.** It was
  `index === 0`, so an inert button was the one control in the action row wearing the
  mark that says it can be followed. A first action that is genuinely a button gets no
  arrow, and a second action gets none even when it is a link, because the arrow marks
  the row's one primary destination.
  
  The default **variant** stays positional, deliberately, and the two now move
  separately. What looks primary is a fact about the row's shape; whether it navigates
  is a fact about the element. Asserting they do not move together is the point,
  because the arrow used to follow position for both.
  
  The ticket's claim that the Block "renders every action as a plain `<Button>`" was
  stale, the way the Cta01 one was: `CtaLink` had already fixed the rendering. What
  was left was the half that had not been fixed, the type, plus the arrow and a test
  file, which did not exist. Eight tests assert the rendered element for each arm, the
  negative as well as the positive, the arrow on a link and its absence on a button,
  and `newTab` with its `rel`.
  
  **`ProductGrid01Product` gains an optional `detail`, and the JSDoc settles which
  level a sentence belongs at.** The documentation previously said a second line
  "belongs above the grid in `description`, where it applies to the set". That is true
  of a sentence about the set and false of a sentence about one product, and the
  company site had five products each carrying a sentence that was true of one and
  vacuous beside the other four. The migration folded nothing in, so three published
  sentences were dropped and the ledger recorded the loss as a catalogue gap rather
  than papering over it with a copy edit.
  
  Both levels now exist and the question to ask is written down: **does the sentence
  survive its neighbours?** A `description` would be equally true if you deleted any
  one row. A `detail` is false, or vacuous, beside the other four. A tagline is the
  shortest true thing about a member and reads the same in every row, which is what
  distinguishes it from a `detail`.
  
  A `detail` is drawn only when passed. A row that reserved the line would push every
  row below it down by one, and this is a stack of full-width rules where a ragged
  left edge is the most visible thing on the page. Six tests render both shapes,
  because a test asserting only the new field would pass on a Block that had quietly
  stopped drawing the grid-level description, which is the half every existing caller
  depends on.
  
  **Two proofs that the new tests can fail.** Reverting the arrow to `index === 0`
  fails exactly one case, the one the defect lives in. Reverting
  `childLevel(headingLevel)` to a hardcoded `h3` in the card-title work fails two.
  Neither defect would have been caught by an assertion of the shape the ticket
  described.
- 4650aff: Add `Meter`, so a bounded measurement can show the limits it is approaching
  
  A disk at 95 percent and a test at 95 percent are the same reading until you say
  where the line is. Prism had a Progress for a task moving toward an end whose
  length is not known in advance, and nothing for a quantity that already has an
  answer against a limit the caller knows.
  
  ```tsx
  <Meter
    value={97}
    label="Storage used"
    valueText="97 gigabytes of 100"
    thresholds={[
      { at: 80, tone: 'warning' },
      { at: 95, tone: 'destructive' },
    ]}
  >
    <span>97 of 100 GB</span>
  </Meter>
  ```
  
  **The thresholds are the design.** A fill on its own is one number, and a number
  with no limit beside it cannot be acted on. Drawing the caller's own limits as
  notches on the track puts the boundary next to the reading, so a consumer passing
  a latency budget gets a latency budget rather than a generic bar filled to a
  similar fraction. The Component has no opinion about which numbers matter.
  
  **It stays neutral below every threshold.** It can see that a value is 40 percent
  of a maximum; it cannot see that 40 percent is a problem. The same number is
  routine on a latency budget and urgent on a disk quota, so a Component that
  coloured itself would be making a claim about the caller's product on the
  caller's behalf.
  
  **It is drawn as a hairline with ticks, not as a bar.** The Progress in this system
  is a two-pixel rounded trough, and a Meter that looked like one would be read as
  one. The difference is visible before it is read.
  
  `role="meter"` rather than `progressbar`, which is the ARIA distinction the whole
  Component turns on, and assistive technology reports the two differently. It is
  not a live region: the change that moved the reading is usually the thing worth
  announcing, so a consumer that wants it announced wraps it in a `LiveRegion`.
  
  Two failures are handled rather than rendered, because neither is visible in a
  screenshot. A value past the maximum is clamped to the track instead of drawn
  past its end, and a scale whose minimum equals its maximum draws an empty track
  instead of a `NaN` width, while still measuring.
- 932ce96: Add the overlay and menu substrate: alert dialog, context menu, menubar, sheet
  
  The eight Items that every menu-shaped surface in a product otherwise hand-rolls.
  Each is composed on the Base UI primitive rather than reimplemented, because focus
  trapping, portals, dismiss-on-outside-press and escape handling are four behaviours
  that are already correct there and four chances to get one wrong here.
  
  Each one makes a decision a consumer would otherwise make badly:
  
  - **`alert-dialog`** removes dismissal from the *type*, not just the default.
    `modal` and `disablePointerDismissal` are omitted from its props, so a caller
    cannot pass a value that re-enables outside-press dismissal on a surface whose
    subject is a decision. Escape still closes, and there is no corner X, because an X
    is a third answer to a question with two. `AlertDialogAction` is its own part,
    styled destructive by default, because the one button that must exist is that one.
  - **`context-menu`** knows which rows are commands and which are destinations.
    `ContextMenuItem` is a `div role=menuitem`; `ContextMenuLinkItem` is a native
    anchor. Two parts rather than one, so the "open in a new tab" case cannot be a div.
  - **`hover-card`** can never be the only route to what it shows, which is what makes
    its delay safe. The trigger is a real anchor, so a long delay costs a reader
    nothing, and `delay` is a prop because a pointer rest is a fact about the reader.
  - **`menubar`** is one Tab stop and owns the arrows inside itself, and it requires a
    `label` because nothing announces a bar until focus lands on it.
  - **`navigation-menu`** knows it holds links, so it ships no command part at all, and
    a closed group holds no links with `keepMounted` as the stated seam.
  - **`sheet`** is the Dialog with an edge. `side` is required and excludes `center`.
    All six overlay behaviours are inherited, not reimplemented, and a sheet dismisses
    on an outside press, which is the contrast with the alert dialog.
  - **`collapsible`** wires the trigger and the region with the library's own
    `aria-controls` and `aria-expanded`, and unmounts the closed panel so find-in-page
    and a screen reader see the same page the reader does.
  - **`resizable`** puts the whole behaviour on a focusable `separator` with a value,
    and remembers nothing: the position is a prop and a callback, because a design
    system cannot know a reader's panes.
  
  **`resizable` is not composed on Base UI, because Base UI 1.8.0 ships none.** The
  package's exports were enumerated and there is no `./resizable` and no `Resizable*`
  symbol, so the separator role, the focusable-divider keyboard model and the pointer
  drag are authored here. That is the one hand-rolled overlay in the batch, and it is
  confined to the three things an overlay must not reimplement, none of which a
  divider needs. It should be revisited when Base UI ships one.
  
  The focus-indicators gate test no longer pins which slot happens to sort first in
  the composite-widget bucket, nor the exact excluded total. Every additional menu in
  the package adds members to that bucket, so both were tests that failed when a
  correct Component was added. The count is now bounded from below, which is the
  invariant that holds as the tree grows.
- e14a903: `ProcessFlow01`: a pipeline of any length, drawn in order across as many lines as it needs
  
  `ProcessRail01` holds two, three or four steps and refuses a fifth in its type, and
  that decision is not in question. A rail is a claim about a sequence on one line, and
  a rail that quietly dropped a step to fit a width would be a diagram of a process that
  is not the process. A company site states six stages and was drawing them as a grid of
  short points, where the six ordinals and the terminal label were lost: a set read
  where a sequence had been.
  
  So the repair is a second shape rather than a wider tuple. Raising the rail's ceiling
  to six would have made the fourth column unrepresentable as a type error, which is
  the property that made the original decision good.
  
  **It is one ordered list, and the layout is built around that.** A flow that wrapped
  into a list per line would be several lists, and a screen reader would announce three
  lists of two, which is precisely the set-where-a-sequence-was this Block exists to
  prevent. So the stages are one `<ol>` and the wrapping is done by the grid. That has a
  consequence worth stating: the Block never learns where a line broke, and therefore
  cannot draw anything that is only correct on the widest screen.
  
  **The ordinal is the continuity mechanism, and it is treated as one.** It runs
  continuously from `01` to the last stage and it is stated as text rather than only
  drawn, so a reader who lands on stage four hears `04` and knows it continues stage
  three at whatever width they are using. Nothing else in the Block is load-bearing for
  the sequence, and that is why nothing else needs to know where the line broke.
  
  **The thread is a line through the stages, not a box around each one.** Each stage
  draws a top border and the grid separates them by a single pixel, so a run of stages
  on one line reads as one line broken by hairline gaps and the gap between two lines is
  wider. It is the rail's technique, and it is chosen here for one reason: it holds at
  any column count, including the single column a phone gets, without the Block knowing
  anything about it. A connector drawn between a stage and its successor would need the
  column count to be right and would be wrong at every width the type does not describe.
  
  **`stages` is an array and `columns` is a prop**, which is the split the ticket asks
  for. The length is content and the grid carries it; how many sit on one line is
  layout, and a caller who has to state both has to keep them in step by hand.
  
  **A flow of fewer than two stages throws.** One stage is a label, not a sequence, and
  the line the Block draws through it would claim a sequence that is not there. The
  message names `ProcessRail01` as the answer for two.
  
  ## The proof that the tests can fail
  
  The two assertions that matter are structural rather than visual, and each was proved
  by writing the mistake it exists to catch:
  
  - An ordinal that restarts per row, which is what a per-row implementation does, fails
    two cases: the continuous-ordinal assertion and the terminal-label one, because the
    last stage is then no longer the one the label is attached to.
  - A list nested per group of three, which is the set-where-a-sequence-was failure
    arriving through the markup, fails four.
  
  An assertion that the flow "looks like" a sequence would have passed both.
  
  The stage names are deliberately **not** headings. The sequence is the list, and
  promoting six stages to headings would put six entries in the outline for one process,
  so the section title is the only heading this Block renders.
- 4650aff: Add `RunConsole01`, a run as a heading, a budget and the steps that got there
  
  The surface the fourth Kind exists for, and a Block rather than a Component
  because a run console is not one thing: it is a measurement beside a sequence
  beside a stream, and a reader needs all three in the same frame to answer the
  only question they have, which is whether the run will finish and what it is
  costing.
  
  ```tsx
  <RunConsole01
    title="Nightly reconcile"
    streaming={running}
    copy={{
      budgetLabel: 'Budget spent',
      budgetValue: (value, max) => `${value} of ${max} credits`,
      stepsLabel: 'Run steps',
      title: 'Run',
      waiting: 'Waiting for the first step',
    }}
    budget={{ value: 4200, max: 5000, thresholds: [{ at: 4500, tone: 'warning' }] }}
    steps={steps}
  />
  ```
  
  **It reimplements nothing.** The budget is a `Meter`, which draws the limits the
  caller named and stays neutral below all of them. The steps are a `Timeline`, which
  draws each duration to scale against the slowest one. What the Block adds is the
  arrangement, and two facts belonging to neither component: a run with no budget
  gets no budget meter, because a local run has no ceiling to be near and an empty
  meter is a measurement of nothing that is invisible because an empty meter looks
  like a meter; and the budget sits above the steps, because the first question about
  a run is whether it will finish and two columns would make the reader choose.
  
  **The live region exists only while the run is arriving.** A test caught this. The
  first draft wrapped the steps unconditionally, which left a live region on the
  page for a run that had already finished: it announces nothing on mount, but it is
  still there, and a later re-render with different steps is an unrelated change it
  will announce. Mounting it when the run starts is also the order that does not
  lose an announcement, because the region is on the page before the first event
  arrives, which is when a screen reader is listening. It wraps the steps and not the
  budget, so an append does not re-read the spending every time.
  
  **`LiveRegion` is a server Component, and that is a correction.** It shipped in
  0.8.0 carrying `'use client'` while reading its props, holding no state, running no
  hook and taking no event handler. The directive was a claim about work the
  Component does not do, and sixteen of forty-one components in this package are
  client. A live region is announced by the browser's own mutation observer rather
  than by JavaScript, which is the reason it is a good primitive: it works in a
  server-rendered page.
  
  ## The client budget
  
  The whole-tree client bundle measures **108.1 KB** with this branch's components
  in it, against a 116 KB ceiling, and the five components here cost about **0.1 KB**.
  
  That is worth stating plainly, because the number looked very different for a
  while. An earlier draft of this branch reported that the components added 2.3 KB,
  crossed a 92 KB ceiling, and needed the ceiling raised. That measurement was taken
  against a gate whose roster read two directories, and it was wrong for the same
  reason the old ceiling was: 53 emitted client modules were never read. The roster
  has since been widened to the whole tree, the honest figure is 108 KB, and these
  components land inside the existing ceiling with about 8 KB of headroom.
  
  **No ceiling change is proposed here.** The one that was drafted has been dropped
  rather than applied, because it would have moved a number to accommodate a
  measurement that was itself measuring the wrong set of files.
- 3260391: `StackGrid01` names the real product behind a codename, and `Cta01` states the rule it enforces
  
  **`StackPart` gains an optional `realName`.** The value goes inside the tile the
  Block already draws, so it is an additive optional field, matching `ProductGrid01`'s
  `pack` and `StatusLedger01`'s `detail`. It renders only when passed: a tile that
  reserves a line for absent content is a layout shift on the first thing a reader
  scrolls to, and because the grid is a grid, an empty line in one column would also
  knock the row's baseline out for every tile beside it. Both are asserted, the
  second by counting elements rather than by checking a class.
  
  **`Cta01`'s JSDoc told consumers the opposite of the truth.** It said a panel wants
  `default` or `secondary` and never `outline`, which was the answer *before* the
  `outline` variant was given its ink, and it contradicted the code forty lines below
  it, where the second action defaults to `outline`. A consumer reading the type would
  have been actively misled. The settled rule is the inverse on the first variant:
  `secondary` and `outline` are both fine and `default` is the one to avoid, because
  the band is `bg-primary` and `default` fills with `--primary`, so a default action
  on this band is the band's own colour against the band's own colour. Its label is
  legible, because `primary-foreground` on `primary` is a gated pair, and the control
  has no edge, which is a different defect and the reason the sentence is about the
  fill rather than the text.
  
  **A test that measured a pair it believed in.** The existing resolved-ink test
  asserted the pair the test itself thought the defaults resolve to, so it stayed green
  on a Block that had stopped asking for it. The new case renders `Cta01` with no
  explicit variant, reads the utilities off the two anchors, maps each to the token it
  names, and resolves those tokens from the emitted CSS. It asserts the resolved pair
  rather than the class string, because a class-string assertion passes on a token
  change, and it adds two things a ratio cannot see: that the ink is stated rather than
  inherited, and that the fill is one the band is not.
  
  The ticket's single lavender-dark figure understated the blast radius. The base pack
  failed in **both** modes, at 1.00:1 and 1.01:1, and seven of twelve combinations were
  affected. It is 13.59:1 or better in all twelve now.
  
  **The acceptance criterion asked for the wrong instrument.** It asked for a row in
  the token contrast gate, and that gate structurally cannot see this class of defect:
  it measures token pairs, and what failed was a component declining to use a value it
  was relying on by accident. `check-variant-ink.mjs` is the gate that holds it, and it
  already existed.
- e14a903: The fourth Kind: `live`, a surface whose content changes without a navigation event
  
  **This is a breaking change, released as a minor: 0.11.0.** `CATALOG_KINDS` gains a
  member, so a consumer switching exhaustively over `kind` is broken. A minor is the
  right line for a breaking change from a `0.x` version, where anything may change at
  any time, and taking 1.0.0 would declare the public API stable rather than describe
  this change. `CONTRIBUTING.md` says a breaking change is a `major` bump, so this is
  the one place the convention and the record disagree; the disagreement is deliberate
  and `DESIGN.md` carries it with the reasoning.
  
  **A `live` surface is what the other three cannot express.** A Component, a Block and
  a Page are all rendered from props, and props arrive when the caller says so. A run's
  event log, a monitoring view, anything fed by a socket, changes on its own. That is
  the whole of the fourth Kind, and it is why `RunStream01` is the first client
  Component in the package: a surface that receives events owns the subscription that
  delivers them, and that is not an accident of implementation.
  
  **Prism owns the surface, the consumer owns the transport.** `subscribe` is a
  function the consumer supplies and a function it tears down. There is no socket, no
  endpoint, no retry policy, no persistence and no provider to mount, so a consumer
  that already has a connection passes it in and one that does not has not acquired a
  client runtime by importing this.
  
  **Four transcriptions were found by the compiler rather than by a reader**, which is
  the argument for the ties that already existed. `STORE_KINDS`'s `_KindsMatch`
  assertion fired on the first edit. The exhaustive `KIND_LABELS` record added
  earlier fired the next, and adding a Kind is now a compile error in both places. The
  corpus builder's `KIND_SEGMENT` produced a mirror path of `undefined` and the
  `llms` gate reported it. And the site's three copies of the Kind labels were
  collapsed into one table, so the fourth Kind is one edit rather than three.
  
  **One divergence is deliberate and named.** A `live` surface ships as
  `registry:block`, because the `type` field belongs to the shadcn registry schema,
  which has no live surface and rejects a type it does not know. The **Kind** is ours
  and is `live` in `CATALOG_KINDS`, the corpus, the MCP tools and the site's Sections.
  The registry is a derived internal artefact, never served and never an install lane,
  so the two vocabularies are allowed to differ because only one of them is ours. The
  catalogue gate carries it as a named exception keyed on the Item's own `source`, so
  the exception cannot drift from the thing it excuses, and the other 103 items are
  still compared strictly.
  
  **The Section plurality rule is gone, and two Sections is why.** It read that a
  Section holding Items is plural. `patterns` broke it from the prose side and `live`
  from the catalogue side, because `components`, `blocks` and `pages` are plural nouns
  and `live` is an adjective with no plural. A rule two of nine Sections decline is a
  convention, not a law, and a second exception would have invited a third. What is
  asserted instead is the fact underneath it: every Section is registered once, in the
  root ordering, at a segment the manifest agrees with.
  
  ## The proof that the tests can fail
  
  `RunStream01`'s fourteen tests are proved by writing the mistakes they exist to catch.
  Appending instead of sorting, which is the reconnect bug, fails the ordering cases.
  And three defects were found by the tests rather than reasoned about in advance:
  
  - **`statusLabel` rendered twice.** The heading fell back to it when no `title` was
    given, so "Failed after 3 attempts" was the surface's subject *and* its state. A
    status is not a heading.
  - **`initial` was a trap.** It read like the current event list and quietly seeded
    only once. It now also *reseeds* when `resubscribeKey` changes, which is what a
    second run in one surface means, and the log clears with it rather than the old
    run's events growing the new run's.
  - **A `setNewest` before its declaration**, which the run-switch test caught as a
    temporal-dead-zone error and which no type checker in this repository would.
  
  **A `live` surface is budgeted, not exempted.** A Block composes Components, so its
  own client figure restates theirs. A live surface is the only client code a consumer
  pulls in *for itself*, so it has a row: 10 KB, of which `ScrollArea` is 8.1. The
  figure is set above the measured size, because a budget below it is a wish.
- 4650aff: Add `Timeline`, so a run of events can be read for where the time went
  
  A run's events in order answer "what happened" and are silent on the only other
  question anyone has about an agent run, a deploy or an import: which step was
  slow. Today that means reading every number and doing the arithmetic.
  
  ```tsx
  <Timeline
    entries={[
      { id: 'plan', title: 'Plan', duration: 900 },
      { id: 'read', title: 'Read feed', duration: 4200 },
      { id: 'edit', title: 'Edit source', duration: 1200 },
      { id: 'done', title: 'Ready' },
    ]}
    label="Run steps"
  />
  ```
  
  **The bars share a left edge and are scaled against the longest step in the run.**
  That is the whole idea, and the relative scale is the deliberate choice: the shape
  of the run is the question, and a shared zero baseline would be a second axis
  nobody reads. The consequence worth stating is that the bars answer "which step was
  slow" and deliberately do not answer "how long did the run take", because only the
  caller knows whether its steps ran sequentially or overlapped.
  
  **A step with no duration draws no bar.** A run's opening event has no length, and
  a zero-width bar beside it would read as "this was instant" rather than "this has
  no duration", which are different claims and only one is true.
  
  **It is an ordered list, so the sequence and the count are in the accessibility
  tree.** The marks and spine are `aria-hidden` on the rail that holds both, and the
  entry's own words carry the state, so nothing depends on a reader distinguishing
  the marks. It is not a live region: a run still arriving is normally wrapped in a
  `LiveRegion` by the caller, because announcing the list itself would re-announce
  the whole run on every append.
  
  Three degeneracies are handled rather than rendered, and all three are invisible in
  a screenshot: a run where no step reports a duration draws no bars rather than
  dividing by nothing, a zero duration does not win the longest-step comparison and
  scale everything else away, and the spine stops at the last entry rather than
  trailing past the end of the run as though a step had not arrived.
  
  The four states are a different vocabulary from the four product-capability tiers
  a `StatusLedger01` row carries, and they are two lists about two subjects rather
  than two lists about one: a `planned` agent run is a category error and a `failed`
  capability is a category error, which is the test that tells them apart.

## 0.10.2

### Patch Changes

- `Hero01`'s headline and supporting line take a node rather than a string
  
  `SectionHeading` has always taken a `ReactNode` for both, so a `string` here made
  this Block the odd one out rather than making it stricter. Three of the five
  product sites set the emphasised word in their own mark inside the headline, so
  the narrow type would have cost each of them the emphasis or a second component.
  
  A widening, and additive. Every string a site renders is still the site's own, and
  `check-block-copy.mjs` still holds this Block to shipping no copy of its own.

## 0.10.1

### Patch Changes

- A drawing's data props accept a read-only array
  
  `PulseGraph`, `PulseSeries` and `Diagram` took `SomeNode[]` rather than
  `readonly SomeNode[]`, so a consumer whose content is held as `as const` had to
  copy the array at every call site to satisfy the type. Every NaniSoft product site
  holds its landing content as `as const`, so the copy was not optional: the first
  consumer to compose a running hero had to write `nodes={[...FIGURE.nodes]}` to get
  it to compile, which is a cost in exchange for nothing.
  
  The props now take a read-only array. This is a widening, so it is additive rather
  than breaking, and it is the correct shape for a prop that only reads its data: a
  Component that mutates an array a caller passed is a Component that has taken
  ownership of it, and none of these three do.

## 0.10.0

### Minor Changes

- 75434f8: Add a running figure to the system, and the ambient cycle scale that prices it
  
  The system had one law of motion: motion is state feedback, on an 80/160/280
  millisecond scale, and there are no keyframes anywhere. That law was right and
  it held. It also meant a product page could say what its product does and show
  nothing about it, which is what happened to four sites at once.
  
  This adds the second law, and it is a separate law rather than an exception to
  the first. Feedback is a response to something the reader did. A cycle is a
  demonstration of something the system does, and no reader is waiting for it.
  The test for which one a motion is does not require taste: stop the animation
  and ask whether the figure is still true and still legible.
  
  **New Components**
  
  - `PulseGraph` draws a running system: named nodes, the relations between them, a
    marker travelling a rail, and a breathing focus. A node's `lane` says it is a
    stage in a sequence, which draws the rail; a node with no lane is a field.
    `carries` on a relation says the line is carrying something, and draws a head
    at its end so the claim survives motion being off.
  - `PulseSeries` draws a live instrument: columns rising out of a caller-named
    baseline, with a reticle crossing them once per cycle. The values are the
    caller's own and the tallest sets the scale.
  - `SignalField` is a field of marks: the atmosphere a figure is drawn over.
    Decorative by default, still unless asked to drift, and honestly named as the
    one component in the system that is texture.
  
  **`Hero01` gains the band it was missing**
  
  All four sites hand-wrote the same two-column grid, each with its own gap and its
  own breakpoint. It is now the `instrument` slot, and an action naming an `href`
  renders as a real link rather than a button that goes nowhere. The centred form
  is unchanged, so this is additive.
  
  **New tokens**
  
  `ambient` and `ambient-ease` are two closed groups measured in seconds, separate
  from `duration` because folding them in would have made one name mean both 280ms
  and 7.2s. The emitted contract asserts the closed set and fails any cycle under
  one second, because a sub-second cycle is a flicker and no value in the 80 to
  280ms band could ever have caught that.
  
  **What this does not change**
  
  Nothing is hidden. No ambient rule sets `opacity: 0` and nothing waits for a
  script, an intersection or a timer, so every figure is complete at first paint
  and a consumer needs no exception to enable the `hidden-state` gate. Reduced
  motion is one `animation: none`, and because every resting state is the full
  form, that reader gets the same figure, still. All three are server Components,
  so this adds zero bytes of client JavaScript.

### Patch Changes

- cb16073: A variant that sets its own fill sets its own ink, and `outline` now says which
  
  `Button`'s and `CtaLink`'s `outline` variant carried `bg-background` with no `text-` for the life of the package. On the page ground and on a card the omission was invisible, because the ink a control inherits there is `foreground` and `card-foreground` is equal to it in all twelve pack and mode combinations, so the variant was correct everywhere the design system itself placed it and wrong everywhere else.
  
  `Cta01` draws its band as a filled `bg-primary` surface with `--primary-foreground` as the band's ink, and defaulted its second action to `outline`. The second action was therefore `--background` behind `--primary-foreground` and measured **1.00:1 to 1.10:1 in seven of the twelve combinations**: the base pack in both modes, where light mode pairs `#ffffff` with `#ffffff`, and all five pastel packs in dark mode. The button was in the document, focusable, announced, and unreadable. It was found by resolving computed values in a browser, because neither the class name nor the token contract says anything about it.
  
  The fix is `text-foreground` on the variant, which is a no-op on the page ground and on a card and correct everywhere else. Measured across all twelve after the change: lowest is 13.59:1.
  
  A consumer that passed `variant="secondary"` on that action, as the product site did, saw no difference and needs no change. The default is unchanged, deliberately: `outline` reads as one filled action and one alternative, and it is now a safe default because it carries its own ink rather than because it was made to stop.
  
  Two gates hold it, and neither could have caught the original:
  
  - `check:variant-ink` fails a variant whose own fill has no `text-` utility of its own, read from the source. It reads source rather than the emitted stylesheet on purpose: Tailwind only emits a variant something uses, so the sheet is a record of what was chosen rather than of what is available. A state fill such as `hover:bg-accent` is exempt, because exempting it is the difference between a rule that finds the defect and a rule nobody can run.
  - a test resolves the pair from the emitted token CSS for all twelve combinations rather than asserting a class name, and pins the seven that used to fail by name. A test written over class names would have passed against the broken button, because the class name never changed; only the resolved pair did.
  
  `Cta01Action`'s `variant` now states which weight a panel wants and why, with the measurement, so a consumer does not have to discover it.
- Updated dependencies [75434f8]
  - @nanisoft/prism-tokens@0.10.0

## 0.9.0

### Minor Changes

- 93758a6: The face ships with the package, so a site writes one property for its typeface
  
  `@nanisoft/prism-ui` declared `--font-sans: Inter, ui-sans-serif, system-ui, ...` and shipped no font file. Naming a family is not shipping it: the first entry resolved to nothing and every page fell through to the platform's UI face, which is the one face a design system never means by its first choice. All four consumer sites were compensating with their own custom property and a build-time network fetch, and the company site had already shipped that way by accident.
  
  The face is here now, as three latin roman weights with the licence beside them, and the `@font-face` sources are relative to the emitted stylesheet so they resolve from a consumer's install rather than from the consumer's origin. That last point is the old line's failure exactly: it emitted the face at an absolute path, which resolved against whichever site imported it, and the face silently failed in all four repositories.
  
  A consumer's own override is now unnecessary rather than merely discouraged. `--font-sans` resolves to a face this package ships, so a site that deletes its `--font-sans` override still renders in the design system's face rather than in the platform's.
  
  Three gates hold the arrangement, and none of them is discipline:
  
  - `check:typeface.mjs` fails a token family that names no face this package ships and no family the reader's own machine provides, read from the **emitted** stylesheet rather than the source. The original defect was invisible in source: the rules shipped, the subsets were preloaded, and only the class carrying the variable was missing, so the family resolved to nothing at computed-value time with no error anywhere.
  - the same gate fails an `@font-face` source that is absolute or a web-root path, which is how the old line failed silently.
  - the build refuses to emit a stylesheet that names a face it did not copy, so a package cannot ship a sheet pointing at a file that is not in the tarball.
  
  The face is 70.7 KB and every consumer installs it whether or not it renders a page, because a subpath does not reduce install size. That is the accepted price of one package instead of two.
  
  The weight axis is absent, deliberately. The design system retired the width axis, and optical sizing, which it approximated, is the browser's initial behaviour, so a file carrying a width range is not the file this design asked for. 700 is absent for a second reason: the authored scale emits it and the shipped source renders it nowhere, and a 23.8 KB file no page renders is 23.8 KB every consumer downloads forever.

## 0.8.0

### Minor Changes

- 86cbc20: The accessible name a control announces is now a prop, so a consumer can localise it
  
  `Pagination`, `Dialog` and `Breadcrumb` each shipped an `aria-label` that a
  consumer could not change, and `ProductSwitcher` shipped a `label` default that
  put the word "Products" into every consumer's navigation. A consumer could
  localise the visible text of a pagination step and not the name a screen reader
  announced for it, which left a control that looked localised and was half of it.
  
  What changed:
  
  - `Pagination` takes `label` for the region name, and each of `PaginationPrevious`
    and `PaginationNext` takes `label` beside its existing `text`, so the visible
    word and the announced name move together.
  - `Dialog` takes `closeLabel` for the built-in close control, so a localised
    dialog no longer announces "Close" in a product that never uses that word.
  - `Breadcrumb` takes `label` for its region name.
  - `ProductSwitcher` no longer defaults `label`. A switcher with no `label`
    renders a navigation with no accessible name, which is a real state the caller
    resolves, rather than one that is quietly wrong.
  
  Every new prop keeps the word Prism would have used as its default, so nothing
  changes for a consumer that never set one. The one behaviour that does change is
  `ProductSwitcher`'s, and it is the point: the default was a claim about a
  consumer's product that the prop existed so they would not have to make.
- b31e444: Ship the consumer gate kit, so a cross-repository law reaches a consumer in one release
  
  The four repositories that consume this package coordinated through a prose
  contract mirrored in four files. It could not be enforced, because prose cannot
  fail, and it had already drifted: two sites that mattered held three
  implementations of one rule and one of the three rules was false.
  
  The laws are now the failure messages of gates in this package, and a consumer's
  repository holds only its own data.
  
  ```sh
  pnpm exec prism-gates                 # every gate prism-gates.json names
  pnpm exec prism-gates --gate=links    # one gate
  pnpm exec prism-gates --json          # machine-readable, for a test
  ```
  
  Configure it with a `prism-gates.json` at your repository root. A consumer holds
  its stylesheets, its pack map, its coverage floors, the destinations its own
  corpus gets wrong, and the custom properties its own build supplies. It does not
  hold the wording of a rule, because a wording held in four places is four rules
  that will disagree.
  
  The gates are `pin` (the design system is an exact version, and the token package
  is this package's dependency rather than yours), `retired-line`, `stylesheet-ownership`
  with `token-read`, `links`, `pack-boundary`, `hidden-state` and `runtime-token-read`.
  
  **This release adds the `gates` export subtree and a `prism-gates` binary, and
  adds `gates` to `files`.** It also means a consumer no longer needs to declare
  `@nanisoft/prism-tokens`: resolve it through this package, which requires it at an
  exact version, and the pair cannot be mismatched. Removing the token package from
  a consumer's `package.json` and from its `pnpm-workspace.yaml` is part of the
  adoption; the `pin` gate fails on either.
  
  The kit is outside `dist/` on purpose. It is a build-time program for another
  repository and must never enter a consumer's module graph or its bundle.
- 86cbc20: Add `LiveRegion`, a region that announces what just changed in it
  
  Prism had no live region at all, so a result list that filtered as you type, a
  search whose count updated, and any stream that appended to the page all changed
  silently for anyone using a screen reader. The fourth Kind the design rules
  already decide, `live`, is specified to own an event log surface, and an event
  log surface is a live region, so this is the prerequisite rather than a
  convenience.
  
  ```tsx
  <LiveRegion busy={streaming} label="Run output">
    {lines.map((line) => (
      <p key={line.id}>{line.text}</p>
    ))}
  </LiveRegion>
  ```
  
  Three decisions are in the Component rather than left to each consumer to make
  the same way:
  
  - **It renders nothing when it has nothing to say.** A live region that is
    always present announces every unrelated state change of its ancestors, so an
    empty region is not rendered at all rather than rendered as an empty element.
    The test is "renders nothing" rather than a list of the nothing values, because
    an empty string, a null state and a false condition are three routes to it and a
    list of three is a list a fourth route would miss.
  - **The politeness default is the least interruptive value still announced.** A
    run log that announces assertively interrupts a screen reader mid-sentence, and a
    consumer with a genuinely urgent event passes `politeness="assertive"`.
  - **`aria-busy` is about the caller's knowledge, not about an animation.** A busy
    region is still readable, and a caller that sets it permanently has told
    assistive technology the stream never ends.
  
  The component owns the region and not the transport. A consumer owns the socket,
  the retry, the persistence and the order events arrive in, which is the same split
  the documentation Page makes with its navigation, and it is why Prism stays
  transport-agnostic and no consumer inherits a connection it did not ask for.
- 86cbc20: Add `Mark`, so a search result can show which characters matched
  
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
- 86cbc20: Add `Tree`, so a file browser, a category tree and an outline have something to build from
  
  Prism had a working tree and could not reach it. The implementation existed as
  two private renderers inside the documentation Page, with its depth rule, its
  current-item marking and its rule that a group with no index renders a label.
  What was missing was that it was unreachable, and that its data type was bound to
  documentation navigation rather than being a tree's own vocabulary, so a file
  tree, a category tree, an outline and a knowledge base all had nothing to build
  from.
  
  ```tsx
  <Tree
    label="Documentation"
    currentHref="/foundation/colors"
    nodes={[
      { type: 'group', title: 'Foundation', items: [
        { type: 'page', title: 'Colors', href: '/foundation/colors' },
      ] },
      { type: 'divider', title: '' },
      { type: 'page', title: 'Overview', href: '/overview' },
    ]}
  />
  ```
  
  **It is navigable by the arrow keys**, which is the part a consumer cannot
  assemble for themselves. A tree is one Tab stop and the arrows move inside it.
  Composing the markup gives the Tab order of the document instead, which is every
  node in the tree and none of the arrows. The flat order is collected from the DOM
  rather than computed from the node data, so there is no second list to fall behind
  the first, and a label is skipped rather than focused and doing nothing.
  
  **A flat list renders a flat tree.** An outline is a tree of depth one, so a caller
  passes leaves and gets leaves. A Component that required nesting to express a flat
  structure would make the common case the awkward one.
  
  **A group with no index is a label, not a link.** This is the rule the
  documentation Page already reasoned at length and it is carried across rather than
  reinvented: a group with an index is a destination and renders an anchor, a group
  without one renders a span that carries no `href`, is not focusable, and cannot be
  reached by Tab. Inventing a route for it would publish an address that resolves to
  nothing. The empty case is authored too, because a tree that renders nothing is a
  control with nothing in it.
  
  The documentation Page keeps its own renderers and does not change. Its two rules
  are specific to a documentation rail, which is one shape a tree takes rather than
  the shape. Whether the Page later composes this Component is a separate decision
  this does not make.

## 0.7.0

### Minor Changes

- 5c43520: Add `DocsShell`, a documentation page that takes a site's navigation as data
  
  `DocsShell` is a documentation screen: a navigation rail, the document, a
  contents rail, and a pager to the neighbouring pages. It replaces the unstyled
  `docs-shell` the retired line published, and it is the Page the three NaniSoft
  product sites already import by that name.
  
  The navigation is data. A tree of one page and a tree of twenty-seven render the
  same way, at any depth, and the frame is sized by what the caller passed rather
  than by a fixed arrangement, so three sites whose documentation sets differ in
  shape share one Page with no per-site fork.
  
  - `nav` and `toc` are closed unions of `page`, `group` and `divider`. Both are
    read in the order given: nothing is sorted or alphabetised, so a site that
    files its rail as a pipeline and its contents as a reference has both in one
    render.
  - The pager is derived from `nav` and `currentHref`. There is no `neighbours`
    prop, so a neighbour that is not in the tree cannot be expressed, and each
    consumer loses one derivation of its own.
  - A group with no `href` renders a `span` rather than an anchor with no
    destination. The three sites spell that case today as an empty string, and two
    of them carry a stylesheet rule that styles the result back into a label; those
    rules are now deletable.
  - A section carries no status, no badge, no count, no collapse and no sort. A
    status written into a title stays in the title as words.
  - Both rails are bounded against the viewport, because one site's tree is half
    again as tall as another's.
  
  The corpus fix that shipped with it: the props extractor read each declaration
  body twice with two depth counters that disagreed, so a Page whose `index.tsx`
  re-exported a value and a type from one sibling published every prop twice and
  swept the members of its navigation union into its own prop list. It now reads
  each body once.

## 0.6.0

### Minor Changes

- 956fc8f: A call to action with a destination renders a link, and an icon is required only where a tile is
  
  Every primary call to action in the Block family declared an `href` its type then
  never rendered. The control was a `<button>` with no handler: the type said the
  component could navigate, the documentation implied it, and the markup could not
  do either. Sixteen of them across the family, five of them to another origin.
  
  **`CtaLink` is a new Component.** It renders a native `<a>` and carries the
  visual weight of a call to action, so assistive technology announces a link and
  the browser's own affordances all work: a status bar showing the destination, a
  context menu to copy it, middle-click to open a new tab. It is a Component in its
  own right rather than an `as` or `href` prop on `Button`, which is the answer
  `BreadcrumbLink` and `PaginationLink` already give twice in this package. It is a
  server component, so the swap costs no client JavaScript.
  
  `href` is required on `CtaLink`: an anchor without one is not a link. `newTab` is
  a declared prop and the only way to open a new browsing context, because `target`
  is not accepted, so the relationship cannot be opted out of by accident. When it
  is set, `rel` defaults to `noopener noreferrer`; a consumer that needs a
  different relationship passes `rel` and it wins. Prism does not parse the
  destination and does not decide what counts as external.
  
  **`Cta01` no longer offers an action that navigates nothing.** `Cta01Action`'s
  `href` is required, there is no optional arm and no dead-button arm, and a new
  `actionSlot` takes a control the Block does not own, such as a client router's
  link. The Block makes no guess about cross-origin. The one rendered change in
  this release is a button becoming the link its type always said it was: the link
  is styled from the same recipe as the button it replaces, at every shared variant
  and size, and a test asserts that class-for-class.
  
  **`FeatureGrid01`'s icon is required only where a tile is rendered.** The
  requirement is a union discriminated on `variant` rather than an optional prop,
  because an optional prop turns a safe-at-render condition into an unsafe one and
  permits an empty accent tile per feature. The `icon` variant is the one an
  omitted `variant` selects, so the default and the required icon live on the same
  arm; the `bare` variant renders no tile and requires no icon, and the type says
  so rather than the renderer finding out. `IconFeature` and `BareFeature` are
  exported, and the union is the type the site's API table is extracted from.
  
  **The version the four downstream site plans pin is `0.6.0`.** It is
  `@nanisoft/prism-ui@0.6.0`, and `@nanisoft/prism-tokens@0.6.0` with it, because the
  two are linked in `.changeset/config.json` and the pending
  `a-server-rendered-pack-boundary-can-be-mode-correct` changeset already declares a
  minor for both from `0.5.1`. This one declares a minor as well and so does not
  raise it.
  
  Migration: a `Cta01` action needs a destination. Where the action was a label
  alone, give it the `href` it was always declared with, or move the control into
  the new `actionSlot`. A `FeatureGrid01` in the `bare` variant can now drop the
  `icon` its type used to demand; the `icon` variant still demands one per feature.
- d001983: A diagram is a Component, and a product's mark is one item rather than two copies
  
  Three of the four product sites draw something in the position where an empty box
  is most visible, and all of it was a canvas. A canvas reads computed style from
  one element while a pack is an attribute on an ancestor, so a scoped `data-pack`
  boundary hands it the pack's light values on a dark page, and no token gate can
  see it: the value the drawing holds is a legal token value, applied to the wrong
  pack. Cutting the canvases without a replacement is the alternative, and it
  leaves three heroes with an empty slot.
  
  `Diagram` draws named things and the labelled relations between them as inline
  vector markup. Every stroke and every fill is a semantic utility, never a
  resolved value, so a boundary restyles the drawing through the cascade exactly as
  it restyles a heading. It is a server Component: no hook, no mode, no context, no
  prop spread, and no client code, so a consumer renders it from a server file
  with no provider mounted. Its node mark is a circle and a relation is a path
  because both are shapes with no radius concept, which is what keeps a boundary
  from moving anything but colour; a `<rect>` was rejected because its corner
  attribute is a CSS property and no utility pins it. Every mark names an explicit
  stroke width, an explicit stroke and an explicit fill, because a shape left to
  its defaults either paints opaque black over its own labels or resolves its edge
  to the surface it sits on. A relation naming a node it does not have is dropped,
  and the count of dropped relations is on the element rather than swallowed.
  
  `ProductMark` promotes the two-part mark the product row and the product switcher
  each hand-wrote into one catalogue item. The ring is `brand-ink` and the core is
  `primary`, which is not a preference: a pastel brand value is a fill and never
  text, so the core may be `primary` and the name may not, and a wordmark reads
  `brand-ink` rather than `foreground` or `primary-foreground`. A hand-written copy
  gets one of those two wrong and nothing in the rendered result says which. The
  mark carries its own `data-pack` boundary, so a product's hue follows from the
  pack the caller passed rather than from whichever pack the page is wearing, and
  the boundary sits on an element with no radius utility, which is the placement
  the pack-boundary law allows. A product with no pack of its own is drawn as the
  full spectrum rather than as a colourless mark, built from the five series tokens
  because they are the only five-way colour set the contract publishes.
  
  `scripts/check-vector-ink.mjs` holds both Components to the emitted contract. It
  fails a literal colour, a gradient whose stops are not contract references, a
  `var(--x)` naming a property the contract does not publish, and a paint utility
  whose suffix is not a contract role, which is the last of the four a colour
  regex cannot see because a Tailwind class is a name and not a value. Its scanned
  set is a declared list of two file names rather than a pattern, a Component that
  is not on disk fails the run rather than emptying it, and every exclusion carries
  a reason and is printed on every run, with an exclusion that resolves to nothing
  a finding rather than a line that quietly stops appearing.
- 4f9ce77: A server-rendered pack boundary can now be mode-correct
  
  The only dark selector for a pack was `[data-pack="<id>"].dark`, which requires
  the mode class on the same element. A server cannot know the reader's mode, so a
  subtree carrying a second pack rendered in that pack's light values on a dark
  page. The token build now emits the two-member list
  
  ```
  [data-pack="<id>"].dark, .dark [data-pack="<id>"]
  ```
  
  as one rule with one declaration block, for all five packs. The compound half is
  retained, because it is what a dark surface on a light page is and it is a
  capability the package already published.
  
  Consumers get a second change alongside it. `themeAttributes` now takes `mode` as
  optional, because a required one is that same impossibility written into the type:
  the only way to ask for a boundary with no mode class of its own was to pass
  `'light'` as a guess, and the guess is wrong for half of readers. Omitting `mode`
  is the honest spelling of "wear the mode of the element carrying `.dark`". The
  change is a widening, so every existing caller still compiles.
  
  The theme-boundary law in `DESIGN.md` is rewritten to match. It previously
  instructed an implementer to put `data-pack` and `class="dark"` on a boundary
  together, which works for a client-applied boundary and cannot work for a
  server-rendered one.
- c126ee3: A stored theme is written when a reader decides, and not before
  
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
- 76c8d96: Fourteen items, four catalogue gates, and a Block that publishes its interface
  
  **Fourteen items ship.** Three Components (`Prose`, `FactList`, `ProductSwitcher`),
  nine Blocks (`ProcessRail01`, `StatusLedger01`, `ProductGrid01`, `StackGrid01`,
  `LogoStrip01`, `NoteGrid01`, `InstrumentPanel01`, `SiteHeader`, `SiteFooter`) and two
  Pages (`NotFoundPage`, `BlogPostPage`). Every one of them earns its place by the
  growth rule rather than by taste: a marketing Block when at least three of the four
  sites compose that section today, a Component when it has one job no existing
  Component can express. The evidence is in the ticket and in each item's own
  JSDoc, which names the sites and the line numbers.
  
  **The three contested shapes are settled as specified, and the specifications
  held.** A process rail admits four steps and refuses five, in the type: `steps` is
  a tuple union, so a five-element array is a compile error and not a fifth column. A
  status ledger has four tiers rather than five, and the words for a tier are the
  caller's: the four sites between them use eight words for those four states
  (`live`, `available` and `complete` are one; `approved`, `specified` and `designed`
  are one; then `planned`; then `direction`), and the vocabulary is what `statusLabel`
  is for. A product row's mark is two parts because a filled dot fails contrast on a
  light card, so the mark is `ProductMark`: a hairline ring in `brand-ink` around a
  core in the product's own `primary` fill, with the name in the brand ink beside it.
  
  **Four gates the catalogue's own rules depend on now exist and are wired into
  `check` and, because they read only `src/`, into `build`.** `check-item-docs`
  holds AGENTS.md's claim that a documentation comment is the only path from an Item
  to its published interface. `check-block-copy` holds DESIGN.md's claim that a
  Block ships no copy and no sample data. `check-item-category` holds CONTEXT.md's
  closed set of seven Categories and the sentence that a Block and a Page have none.
  `check-block-imports` holds the claim that a Block fetches nothing and a Page
  imports no router and no data client. Each resolves its roots from its own
  location, fails a root that resolves to nothing, prints its coverage and every
  exclusion on every run, has no report-only mode, and is proved red by a fixture
  before it is proved green.
  
  **Two of those four gates were red on the tree they were written against, and both
  findings were real.** `check-item-docs` found seven exported functions whose
  documentation comment was not attached to the declaration: `CardHeader`,
  `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `SectionHeading` and
  `Hero01`. A comment three functions above a declaration does not reach the emitted
  `.d.ts`, so those seven were absent from the corpus. `check-block-copy` found
  `pricing-01` rendering the word "Popular" on a featured plan that passed no badge:
  a hardcoded claim every consumer of the Block inherited, published by the corpus as
  part of the Block's own documentation. The fallback is gone; a featured plan with
  no badge now renders no badge.
  
  **Five additive fields on four shipped items**, each with three of the four
  consumers passing a value the item could not take, counted per consumer with a
  file and a line and never per string. `SectionHeading.index`, for the mono ordinal
  all four sites render above every section head (www `Landing.tsx:49`, atlas
  `landing.tsx:48`, nexus `Landing.tsx:38`, alphalens `Landing.tsx:66`).
  `Cta01.secondaryAction`, for the pair of actions all four closing bands render
  (www `Landing.tsx:186`, atlas `landing.tsx:243`, nexus `Landing.tsx:221`,
  alphalens `Landing.tsx:285`). `Cta01.note`, for the footnote three of the four
  render under it (atlas `landing.tsx:250`, nexus `Landing.tsx:228`, alphalens
  `Landing.tsx:292`). `FeatureGrid01.numbered`, for the ordinal all four render on
  every card (www `Landing.tsx:166`, atlas `landing.tsx:116`, nexus `Landing.tsx:132`,
  alphalens `Landing.tsx:142`). `Hero01.align`, for the left-aligned hero three of
  the four compose (atlas `landing.tsx:69`, nexus `Landing.tsx:63`, alphalens
  `Landing.tsx:87`). All five are additive: nothing changed shape and nothing was
  removed.
  
  **A Block and a Page publish both an interface section and a composition section.**
  `packages/llms` read the extractor's output for a Block and threw the interface half
  away, so the tool told an agent a Block had no own props. The extractor reads a
  named props type off an emitted declaration whether that declaration belongs to a
  Component or to a Block, so both sections are now built and both are assembled into
  the mirror file, `llms-full.txt` and the Store's `doc`.
  
  The Store now carries both fields for every kind, and `get_item_props` prints
  both when it has both. The sentence "a Block has no own props" is gone from the
  tool as well as from the published document. It was the one place the two
  sections were still exclusive, because that tool branched on `item.props` and
  fell back to the composition section, so a Block was answered with its
  composition and a denial of the interface it publishes. The test asserts the
  sentence's absence, so a refactor that restores it fails even if the composition
  is still printed, and a second test covers the one-present case so the
  both-present branch cannot swallow it.
  
  **Four accessible names became required props** on `SiteHeader`, `LogoStrip01`,
  `NotFoundPage` and `BlogPostPage`, and a Block that ships no copy ships no
  reader-facing copy either. `navLabel`, `productsLabel`, `label`, `linksLabel` and
  `trailLabel` are words a screen reader reads out, and no Block should be choosing
  them for a consumer whose site calls its own landmarks something else. This is the
  one breaking change in the release, and it is on four new Blocks and two new Pages
  plus one new required prop on `SiteHeader`, all of which are new in the same
  release, so no existing call site changes.
  
  **`ProductSwitcher.label` has no default** for the same reason: a consumer whose set
  is not a set of products should pass its own word rather than accept a claim about
  what the set is.

### Patch Changes

- 8d24f32: A pack boundary's effect on corner radius is stated, and gated
  
  A scoped `data-pack` boundary resolves the pack's colour AND the pack's corner
  radius beneath it, because radius is the only non-colour member of a pack block
  and the token build emits it the same way. The radius range across the five packs
  is 0.5rem to 1rem, so a row of elements each carrying its own pack shows a spread
  of corner radii, and a small pill becomes a different pill five times over. The
  governing law stated the colour half and was silent on the shape half, so an
  implementer following it exactly produced mismatched corners and called it
  correct.
  
  The law now states both halves and where a boundary may sit. The agent-facing
  surface no longer says the attribute belongs on the root element, which it did
  while listing the radius among the values it will pick up: a tool that shows the
  value and denies the subtree is worse than a tool that is silent.
  
  `check-pack-boundary.mjs` holds the law. It reads the emitted `--radius-*`
  bindings rather than a list of class names, which is the part that matters: a
  scale step like `rounded-xl` is `calc(var(--radius) * 1.4)`, so an element
  carrying one is pinned to a step and the step is pack-relative. The first version
  of the gate treated "carries a radius utility" as the safe case and passed
  exactly the defect the ticket is about. The gate also reads the colour contract
  from the token source, so a second per-pack axis the token build has not been
  asked about is a finding rather than a property silently counted as a colour.
  
  One live boundary was found and repaired: the themes page scoped five cards, one
  per pack, each with `rounded-xl`, so the page a reader uses to compare packs was
  comparing shape as well as colour. The cards now carry a literal radius and the
  pack's radius is shown in the row's own label, where it is information rather
  than an accident.
- feb1384: The catalogue is a set comparison between three lists, not a count
  
  A module on disk with no catalogue entry left every count correct. It shipped,
  `shadcn add` installed it, and `registry.json` listed it, so it was absent from
  the corpus, the documentation site and every agent-facing tool with a fully
  green gate run. The two lists a reader trusts, the catalogue and the registry,
  were on the wrong side of that hole, and the checks that believed they covered it
  compared lengths or compared a file against something derived from itself.
  `validate-registry.mjs` holds the registry against the disk and the manifest and
  never reads the catalogue. `sync-registry.mjs` reads the disk, so it cannot
  disagree with the disk about what is on it. The site's
  `test/catalogue-order.test.ts` holds the catalogue against the generated
  ordering and the documentation tree, and both are built from the catalogue, so a
  disagreement there is impossible by construction.
  
  `scripts/check-catalogue.mjs` reads the three sets independently and compares
  them in both directions, name for name, with one printed line per offending
  item. A length assertion cannot report which item is wrong, so nothing in the
  run reports a length on its own: the three set sizes print as supplementary
  coverage underneath the findings that carry the detail. All six directions a
  three-set comparison implies are implemented, plus the kind of an item in each
  pair of sets, the three naming rules that reconcile the three conventions, and a
  claim that a canonical key is held by only one entry in each set.
  
  The registry generator deliberately keeps reading the disk. Deriving the
  registry from the catalogue is the obvious way to remove the second list, and it
  would delete the disagreement the check exists to see, because the generator
  would then agree with the catalogue by construction.
  
  The version and the roster are two claims on two labelled lines, so a version
  bump and a roster error cannot produce the same output. The run states its
  coverage every time: roots resolved, files walked, files actually read, and how
  many comparisons passed. Roots resolve from the script's own location and never
  from the working directory, and a root that resolves to nothing fails the run
  naming both causes.
  
  `PRISM_CATALOGUE_ROOT` points a run at another package root. It changes which
  directory is read and nothing else, which is what lets the tests run the real
  command over a fixture tree and read the real output. The gate fails on a
  catalogue it cannot read, including an empty one: a roster that cannot be read
  and a roster with nothing in it are different facts, and only one of them is a
  green run.
- 4744cce: The Slider thumb rings at full strength, and the surface check now reads both ways
  
  Two changes, and only two, in the component package.
  
  **The focus indicator.** The Slider's thumb suppressed the browser outline and
  drew its ring at `ring-ring/50`, so the element a keyboard user lands on carried
  an indicator that composites to between 1.14:1 and 2.74:1 against every surface
  in all six themes. That fails WCAG 1.4.11 on the one indicator a keyboard user
  has, and the Slider's own JSDoc says it is reachable by Tab. Thirteen other
  components already drew that ring at full strength; the Slider was the one that
  was missed. Nothing said so, because the contrast gate measures the `ring`
  TOKEN and the alpha is applied in the component rather than in the token, so it
  reads the Slider's ring as compliant.
  
  `packages/ui/scripts/check-focus-indicators.mjs` is the new gate. It reads the
  class strings on the elements of every shipped Component, derives the set of
  components whose own JSDoc claims keyboard reach or operation, and fails any of
  them that suppresses a focus style without declaring a `ring-ring` colour at
  full alpha alongside a `focus-visible:ring-N` width. The claim is read from the
  JSDoc because `AGENTS.md` names that as this repository's documentation source,
  so a component that stops claiming to be focusable is a documentation change and
  shows up in the table the run prints rather than in a list someone maintains
  beside the code. The unit is a class string on one element, so a Dialog's panel
  or a Tooltip's trigger can suppress the outline legitimately; every such
  exclusion is declared with its reason, printed with the slots it resolved to,
  and fails the run if it stops matching anything. The run fails if the table
  empties, and states how much it read, classified, tabled and excluded.
  
  **The surface check.** `scripts/check-surface.mjs` compared the published
  surface against the source in one direction for two of its three rules. A
  wildcard subpath that resolved to zero declarations used to leave those two
  rules reading no file at all and the run still printed its success line, which is
  how a published surface drifts from its source without a consumer failing first.
  A wildcard target that matches nothing is now a finding naming the target. The
  internal side, which the gate deliberately did not check, is now a declared
  boundary checked in both directions: a new file under `dist/lib` is a finding
  naming it, and a declared internal declaration that is no longer emitted is a
  finding naming it too. The boundary and the per-target match counts are printed
  on every run. The three existing rules and their messages are unchanged.
  
  **The version the four downstream site plans pin is `0.6.0`.** It is
  `@nanisoft/prism-ui@0.6.0`, and `@nanisoft/prism-tokens@0.6.0` with it, because
  the two are linked in `.changeset/config.json` and the pending
  `a-server-rendered-pack-boundary-can-be-mode-correct` changeset declares a minor
  for both from `0.5.1`. The patch declared here does not raise it: changesets
  takes the highest bump in the queue, and a minor is already queued. A site plan
  that pins `0.6.0` therefore resolves every subpath the export map publishes,
  including `./components`, `./blocks`, `./pages`, `./provider`, `./theming`,
  `./catalog` and `./styles.css`.
  
  No public prop, no type and no export changed. The one rendering change is a
  ring alpha on the Slider thumb, in both modes.
- Updated dependencies [4f9ce77]
- Updated dependencies [5dcb347]
  - @nanisoft/prism-tokens@0.6.0

## 0.5.1

### Patch Changes

- 2fc6a0a: Retune `muted-foreground` so muted text clears 4.5:1 on the muted surface
  
  The base pack's `muted-foreground` moves from neutral 500 to neutral 600. It
  cleared 4.5:1 on the page background but fell to 4.34:1 on `muted`, where the
  pill, avatar fallback, kbd and tab-list pattern place it. The contrast gate now
  also checks `muted-foreground` on `muted`. The pastel packs were already pinned
  to their neutral 700 and are unchanged.
- Updated dependencies [2fc6a0a]
  - @nanisoft/prism-tokens@0.5.1

## 0.5.0

Prism was rebuilt from a fresh repository on a clean break. The package is now a
published React library a consumer installs and composes, not component source to
copy. It ships one precompiled `styles.css`, the optional `PrismProvider` and the
`data-pack` plus `dark` theme axes, and the Components, Blocks and Pages
taxonomy. There is no override path.

Changesets are appended above this entry for every published change.
