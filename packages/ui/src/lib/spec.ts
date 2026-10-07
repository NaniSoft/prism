/**
 * The five typed specifications a consumer composes an admin screen from, and the
 * three closed unions that name Prism's own vocabulary inside two of them.
 *
 * **One module, because it is one idea at five layers.** A field on a write form, a
 * column on an index, a relationship on a detail, a figure on a summary and an
 * occurrence on a trail are five places a typed declaration is handed to a Block, and
 * they answer the same question five times: what is the caller describing. Today
 * this package declares six field shapes, five figure shapes and four event shapes
 * which disagree with one another about whether a delta is a number or a percentage,
 * about a period, about a formatter and about whether a moment is a `Date`. Five
 * declarations of one typed value is the defect this module was created to end, and
 * the words a consumer learns on a form are then the words on a wizard, on a settings
 * region and on a log.
 *
 * **It lives beside `figure.ts` and `rank.ts` for the reason `rank.ts` gives.** The
 * first version of a shared type always lives inside the Block that happened to need
 * it first, and that makes a leaf depend on a composite: the combobox reached into
 * `command-palette` for the scorer, and the next surface to need one had no honest
 * module to import, so it copied the one it could see.
 *
 * **This is public surface and not an internal helper, which is the opposite of the
 * two files beside it.** `figure.ts` and `rank.ts` are declared internal because no
 * consumer imports them: the geometry a figure is drawn from and the score a
 * match takes are the inside of two Items. A consumer cannot type a column without
 * the column specification, and cannot hand a form its fields without the field
 * specification, so these declarations are published through `@nanisoft/prism-ui/spec`
 * and the surface gate holds the internal boundary in both directions around them.
 *
 * **Every declaration here is plain serialisable data.** No validator, no constraint
 * object, no schema, no pattern, no callback and no class. That is not tidiness: a
 * function in a specification is what makes the object unserialisable, and an
 * unserialisable specification is a specification an agent cannot read out of a
 * document, a corpus cannot store and a store cannot round trip. It is also what
 * keeps a Block that takes one from having to be a client Component for a feature it
 * was never going to own. The two consequences are named where they bite: validation
 * is the consumer's, entirely, and a metric's period is the consumer's, because a
 * comparison needs a period and the period is the consumer's fact.
 *
 * **A specification is not an Item.** It has no slug, no kind, no documentation page,
 * no Demo and no corpus entry, so nothing in the catalogue seam can see a member of
 * one of these unions. The seam below the catalogue is the emitted declaration, and
 * `scripts/check-spec-unions.mjs` reads it there.
 */
import type { ReactNode } from 'react'
import type { StatusTone } from '../components/ui/status'

/**
 * One choice on a field whose kind draws a set of them.
 *
 * Not exported, and not a member of the union: it is the shape every choice-bearing
 * arm shares, so declaring it once is what stops five arms from being five spellings
 * of one idea. A consumer names it in the array they pass, never as a type.
 */
type Choice = {
  /** The value the field submits, in the consumer's own words. */
  value: string
  /** The words a reader sees beside that value. */
  label: ReactNode
}

/**
 * What every field carries, whatever control is drawn for it.
 *
 * Held separately from `FieldSpec` because the point of the type is that a field has
 * the same shell whether Prism drew the control or the caller did: these five
 * optional members and the three required ones are the shell, and the arm adds only
 * what its own control needs to be drawn.
 */
type FieldCommon = {
  /**
   * The value's own key, and never the words of the label.
   *
   * It is what the consumer's values, its issue list and the form's own `FormData`
   * are all keyed by, so a key built out of a label's words breaks the moment the
   * label is translated.
   */
  key: string
  /**
   * The field's own name, required because a control with no name is announced as a
   * text field and every field on the page shares that one announcement.
   */
  label: ReactNode
  /** Text the reader must have, drawn under the control and referred to it. */
  help?: ReactNode
  /**
   * Text they might want, drawn in a tooltip. Forbidden from carrying anything
   * essential, because a reader who never opens a tooltip has not read it.
   */
  hint?: ReactNode
  /**
   * Drawn in the control and gone on the first keystroke, so it carries nothing
   * `help` does not.
   */
  placeholder?: string
  /** Marks a field the reader cannot fill today, rather than one that does not apply. */
  disabled?: boolean
  /**
   * The field's starting value. A controlled field takes its value from the
   * consumer's own state instead, and this is then where that state begins.
   */
  defaultValue?: string | number | boolean
  /**
   * Requiredness, and it is a rendering fact and an HTML fact rather than a rule:
   * Prism draws the mark and sets `required` on the control, and it never checks a
   * value against it. Whether the value is one is the consumer's.
   */
  required?: boolean
}

/**
 * The input vocabulary a field is drawn from: the Components this package ships, and
 * the one arm for a control it does not.
 *
 * **Every member names a Component this package ships, and that is what makes the
 * union closed rather than a convention.** `kind` is drawn from Prism's own inputs
 * rather than from an HTML input type, because `type="email"` is what the platform
 * offers and `Input`, `MoneyField` and `Dropzone` are what this package offers, and a
 * specification naming the HTML type renders a different control from the one the
 * consumer asked for.
 *
 * **`slot` is an arm and not a catch-all property, and the difference is the whole
 * point of it.** A field whose control this package does not ship carries the
 * caller's own node in `control`, and Prism still draws the label, the help and the
 * error around it, so a field has the same shell either way. A catch-all property
 * would be the alternative, and it would put the hole back: a `props` bag is a second
 * way to say one thing and no gate can read what is in it.
 *
 * `scripts/check-spec-unions.mjs` reads this union out of the emitted declaration
 * and holds every member against the Component roster, so a member naming a control
 * this package does not ship fails the run rather than reaching a consumer.
 */
export type FieldKind =
  /** Text and numbers: the run of characters a reader types into. */
  | 'Input'
  | 'Textarea'
  | 'NumberField'
  | 'MoneyField'
  | 'SearchField'
  /** Secrets the consumer holds, and the code a reader reads once. */
  | 'PasswordField'
  | 'OneTimeCode'
  /** One or many choices, in a list this package draws or the platform's own. */
  | 'Select'
  | 'NativeSelect'
  | 'Combobox'
  | 'MultiCombobox'
  | 'ToggleGroup'
  | 'RadioGroup'
  | 'ChoiceCard'
  /** A moment and a span, as a date and as a value on a scale the caller names. */
  | 'Calendar'
  | 'DatePicker'
  | 'Slider'
  | 'RangeField'
  /** An on or off setting, drawn three ways. */
  | 'Switch'
  | 'Checkbox'
  | 'Toggle'
  /** What the reader brings or builds: files, images, and a set of values. */
  | 'Dropzone'
  | 'FileUpload'
  | 'ImageListField'
  | 'RepeatableRows'
  /** The caller's own control, drawn inside this field's label, help and error. */
  | 'slot'

/**
 * One field, as typed data.
 *
 * A discriminated union rather than one object with optional arms, and that is the
 * answer to the sharpest question a caller can ask of a declared field set: what a
 * field may be. The choice Prism grants is which member of a closed vocabulary to
 * use, and nothing else. Each arm adds only the data its own control needs to be
 * drawn, so a choice carries its options and a textarea carries its rows while a
 * money field carries neither.
 *
 * **Order is the array's order, and no Block reorders, hides or drops a field.** A
 * field whose value is absent renders empty rather than absent, because a form that
 * changes shape while the reader is halfway through it is a form the reader has to
 * read twice.
 *
 * **What a consumer may not put in a field.** No validator, no constraint object, no
 * schema, no pattern and no callback of any kind: validation is the consumer's,
 * entirely, because a Block ships no behaviour and evaluating a rule is behaviour.
 * `required` stays, and it is the mark and the HTML attribute rather than a rule. A
 * consumer who wants a minimum length, a uniqueness check, a cross field rule or a
 * mask brings a library and passes the results in through the issue list the Block
 * already takes; a consumer who needs a control this union does not name passes the
 * `slot` arm rather than widening the union for one screen.
 */
export type FieldSpec =
  /** A run of text, with the rows it is drawn at. */
  | (FieldCommon & { kind: 'Textarea'; rows?: number })
  /** An amount in the consumer's currency. */
  | (FieldCommon & { kind: 'MoneyField' })
  /** A one time code, with the digits it has. */
  | (FieldCommon & { kind: 'OneTimeCode'; length?: number })
  /** One choice from a list, with the choices themselves. */
  | (FieldCommon & { kind: 'Select'; options: readonly Choice[] })
  /** One choice from the platform's own list, with the choices themselves. */
  | (FieldCommon & { kind: 'NativeSelect'; options: readonly Choice[] })
  /** One choice from a filtered list, with the choices themselves. */
  | (FieldCommon & { kind: 'Combobox'; options: readonly Choice[] })
  /** Several choices from a filtered list, with the choices themselves. */
  | (FieldCommon & { kind: 'MultiCombobox'; options: readonly Choice[] })
  /** Several choices drawn as marks the reader toggles. */
  | (FieldCommon & { kind: 'ToggleGroup'; options: readonly Choice[] })
  /** Several choices drawn as a row where one of them is the answer. */
  | (FieldCommon & { kind: 'RadioGroup'; options: readonly Choice[] })
  /** Several choices drawn as whole selectable surfaces. */
  | (FieldCommon & { kind: 'ChoiceCard'; options: readonly Choice[] })
  /** Files the reader brings, with the types accepted and whether more than one is. */
  | (FieldCommon & { kind: 'Dropzone'; accept?: readonly string[]; multiple?: boolean })
  /** Files the reader has already chosen, with the types accepted. */
  | (FieldCommon & { kind: 'FileUpload'; accept?: readonly string[]; multiple?: boolean })
  /** A set of values, with what an empty row looks like before there is one. */
  | (FieldCommon & { kind: 'RepeatableRows'; emptyRow?: ReactNode })
  /** The caller's own control, which is the only member carrying a node rather than data. */
  | (FieldCommon & { kind: 'slot'; control: ReactNode })
  /** Every other member of the closed vocabulary, which needs nothing beyond the shell. */
  | (FieldCommon & {
      kind:
        | 'Input'
        | 'NumberField'
        | 'SearchField'
        | 'PasswordField'
        | 'Calendar'
        | 'DatePicker'
        | 'Slider'
        | 'RangeField'
        | 'Switch'
        | 'Checkbox'
        | 'Toggle'
        | 'ImageListField'
    })

/**
 * An ordered group of fields, under one heading.
 *
 * Every field belongs to a group, so a form with no headings is one group with no
 * label rather than a second arrangement. A heading is a real document level object
 * rather than a bold row, which is what the three surveyed systems that have
 * grouping all agree on, and one shape covering both cases costs a consumer one line
 * and saves the catalogue a second Block.
 *
 * `id` is the stable identifier a caller keys its own per group state by, and it is
 * optional here because a group nobody keys anything by does not need one. A stepped
 * surface keys its answers by it, and a sequence whose entries have no identity is a
 * sequence whose saved answers have nowhere to live.
 *
 * **What a consumer may not put in a group.** No rule of any kind, no validator and
 * no callback, for the reason the field gives. No second list saying which groups sit
 * on which step of a stepped surface, either: that would be a second list free to
 * disagree with this one about a step's contents and about the order of a form.
 */
export type FieldSpecGroup = {
  /** The group's heading, absent for a form that has none. */
  label?: ReactNode
  /** A sentence under the heading, absent for a group that needs none. */
  description?: ReactNode
  /** The stable identifier a caller keys its own state for this group by. */
  id?: string
  /** The fields, in the order they are drawn and never re-sorted. */
  fields: readonly FieldSpec[]
}

/**
 * The cell vocabulary a column is drawn from: the reading Components this package
 * ships, and the one arm for a cell it does not.
 *
 * **A different union from `FieldKind`, and sharing one would be a defect rather than
 * a saving.** A field names a control a reader fills and a column names a value a
 * reader reads, so a union carrying both would let a caller ask for a money field as
 * a table cell and receive a control inside a table. `NumberField` and `MoneyField`
 * are therefore on `FieldKind` and not here: a cell holding a number is `Typography`
 * carrying the consumer's own formatted value, for the reason a metric's value is the
 * caller's composed node rather than a number this package reduces. The two unions
 * are held disjoint by `scripts/check-spec-unions.mjs`, in every direction, because a
 * disagreement between them is invisible in review.
 *
 * `slot` is an arm for the same reason the field's is: the caller's own node goes
 * where the cell would be and Prism still draws the header, the alignment and the
 * sort affordance around it.
 */
export type ColumnKind =
  /** A run of text, which is also how a number a consumer formatted is drawn. */
  | 'Typography'
  /** An amount, with the consumer's currency and their own formatting. */
  | 'Price'
  /** A moment, drawn relative to the reader's now. */
  | 'RelativeTime'
  /** A state, drawn as a tone beside the consumer's own words for it. */
  | 'Status'
  /** A short label, drawn as a compact mark. */
  | 'Badge'
  /** A person, drawn as their own image or initials. */
  | 'Avatar'
  /** A set of marks, drawn as a tag group. */
  | 'TagGroup'
  /** Several items ticked, drawn as a checklist. */
  | 'Checklist'
  /** Two texts beside one another, drawn as a diff. */
  | 'Diff'
  /** A run of text with a phrase emphasised in it. */
  | 'Mark'
  /** A key the reader presses, drawn in the monospaced face. */
  | 'Kbd'
  /** An identifier or a fragment, drawn as a code block a reader can take away. */
  | 'CodeBlock'
  /** The caller's own node, drawn inside this column's header, alignment and sort affordance. */
  | 'slot'

/**
 * One column of a record index, as typed data.
 *
 * **Three required members, for the reasons the field specification gives and no new
 * ones.** `key` is required and is never the words of the header, because it is what
 * the caller's rows and a future selection are keyed by. `header` is required because
 * a column a screen reader reaches without a name is a column every row announces as
 * untitled. `kind` is required and is drawn from Prism's own cell vocabulary rather
 * than from an HTML attribute.
 *
 * `align` defaults to the start because this package does not know the number, and a
 * consumer who does knows it. `width` is layout and takes a `className` for the same
 * reason `className` is for layout everywhere else in this system. `sortable` says
 * the column can be ordered, and the affordance it draws announces the direction it
 * will go next rather than the direction it is in.
 *
 * **What a consumer may not put in a column.** No rule, no validator, no schema, no
 * pattern, no aggregation and no derived total: a total owed across every account is
 * a metric beside the index rather than a cell in it, and a Block that added one up
 * would be doing arithmetic over a population it never fetched. `slot` is the way to
 * a cell this union does not name.
 */
export type ColumnSpec = {
  /** The value's own key, and never the words of the header. */
  key: string
  /** The column's own name, required because an unnamed column is announced as untitled. */
  header: ReactNode
  /** The cell this column is drawn from. */
  kind: ColumnKind
  /** Text the reader must have, referred to the cell. */
  help?: ReactNode
  /** Where a value belongs in the cell, and the start unless the caller says otherwise. */
  align?: 'start' | 'center' | 'end'
  /** A `className` for the column's width, because width is layout. */
  width?: string
  /** Whether the column can be ordered, which draws the sort affordance. */
  sortable?: boolean
}

/**
 * The collection arrangements a relationship is drawn in: the four this package can
 * already draw, and the one arm for a section it cannot.
 *
 * A set of rows, a set of rows in a panel, a run of dated occurrences and a set of
 * people. Those are the arrangements Prism ships components for, which is what makes
 * this union closed on the same grounds the field's is: every member names something
 * this package already draws, and a caller chooses between Prism's arrangements
 * rather than describing one.
 *
 * **It is not a slot per region, and the answer is why.** Every surveyed screen that
 * wanted one relationship per card turned a detail into a grid of equal panels, each
 * with its own heading, its own frame and its own way of asking to be read, and the
 * result was a page of cards that happen to share a parent rather than one record
 * with things attached to it. A relation is an entry in one ordered list on one frame
 * instead. A section a reader should have to ask for is the `slot` member, drawn open
 * and placed by the caller, rather than a collapsed one.
 *
 * Held disjoint from `FieldKind` and `ColumnKind` by
 * `scripts/check-spec-unions.mjs`, because a union carrying two of the three would let
 * a caller ask for a field where a relation belongs and receive a labelled input
 * inside a record.
 */
export type RelationKind =
  /** A set of rows, drawn as a table. */
  | 'Table'
  /** A set of rows in a panel, which is a panel rather than a page. */
  | 'ListPanel'
  /** A run of dated occurrences drawn down one column, whose only spatial claim is order. */
  | 'Timeline'
  /** A set of people, drawn as their faces and their names. */
  | 'AvatarGroup'
  /** The caller's own arrangement, placed by the caller and drawn open. */
  | 'slot'

/**
 * One relationship of a record, as typed data.
 *
 * **`members` is the caller's own typed data and is deliberately the weakest type in
 * this module, because that is what binds the depth.** A member is a row, a person,
 * an occurrence or a node in the caller's data, and never another relation, so a
 * record whose related records have their own is a graph the consumer walks and this
 * draws one ring of. A descendant is reached by a link rather than by depth: a member
 * carries the caller's own `href` when the caller wants to open it, and the
 * destination is the caller's route. `scripts/check-spec-unions.mjs` holds that bound
 * by failing on a member whose own type names `RelationSpec`, so the one-ring limit
 * is in the type rather than in a convention somebody is asked to remember.
 *
 * **`count` is the caller's own string rather than a number derived from `members`,
 * and the reason is that a derived count is false the moment the collection is larger
 * than the page.** `href` is an optional destination on the heading, for a caller who
 * wants the whole section to go somewhere rather than scroll, and `hrefLabel` is the
 * words that destination is named in: a link with no name announces as a link.
 *
 * **What a consumer may not put in a relation.** No rule, no validator, no schema, no
 * nesting, no disclosure and no count derived from what was handed over. Every
 * relation is drawn open in the order the caller declared, because a relation a reader
 * has to choose to find is a claim about the reader's freedom that this architecture
 * holds a Page out of making.
 */
export type RelationSpec = {
  /** The relationship's own key, stable, and never the words of the label. */
  key: string
  /** The collection's own name, in the caller's words. */
  label: ReactNode
  /** The arrangement it is drawn in. */
  kind: RelationKind
  /** A destination for the whole section, rather than a scroll. */
  href?: string
  /** The words that destination is named in, required wherever `href` is set. */
  hrefLabel?: ReactNode
  /** The collection's size, in the caller's own words, and never derived here. */
  count?: string
  /** The members, one ring deep, in the order they are drawn. */
  members: readonly unknown[]
}

/**
 * One figure over a population, as typed data.
 *
 * **A metric is a reading taken over a population this package never saw, which is
 * what makes it a typed value of its own rather than a field with another name.** A
 * balance on one row is a field and a total owed across every account is a metric.
 * Nothing in a metric belongs to one record, and there is no record to open.
 *
 * `value` is a node rather than a number, in the consumer's units and their own
 * formatting, because a figure the consumer composed is one this package cannot print.
 * `delta` is a `number` whose sign is the direction, with no direction member beside
 * it. `deltaFormat` is the consumer's own composed words rather than the
 * `(value: number) => string` callback the `Metric` Component takes, and the reason
 * is the same one that keeps the whole module serialisable: a function is not data an
 * agent can read out of a document, and a delta of `0.12` is twelve percent, twelve
 * cents or twelve milliseconds. `series` is the readings behind the shape, and
 * `seriesLabel` names them, because a shape with no name is not announced and two
 * shapes in a row of four cannot be told apart.
 *
 * **Trend is the caller's, and there is no `period` member.** A comparison needs a
 * period and the period is the consumer's fact: a billing screen's month is not a
 * trading screen's week, and a union of week, month and quarter would be this package
 * choosing the axis of somebody's business. The words for the period go where the
 * caller's words go, in `deltaFormat` and in `hint`.
 *
 * **What a consumer may not put in a metric.** No aggregation of any kind, no derived
 * rate of change, no period over period arithmetic, no threshold, no target, no
 * severity, no freshness, no as of clock, no unit, and no drill down beyond the
 * `href` the caller passes. A total computed over the figures a caller happened to
 * hand is a number that is false the moment the population is larger than the page.
 */
export type MetricSpec = {
  /** The figure's own key, stable, and never the words of the label. */
  key: string
  /** What the figure is, required because a figure with nothing saying so is a guess. */
  label: ReactNode
  /** The figure itself, in the consumer's units and their own formatting. */
  value: ReactNode
  /** The change, as a number whose sign is the direction. */
  delta?: number
  /** The change in the consumer's own words, required wherever `delta` is set. */
  deltaFormat?: ReactNode
  /** The period, the source or the caveat that matters this week. */
  hint?: ReactNode
  /** The readings behind the shape, in the order they happened. */
  series?: readonly number[]
  /** The name of that series, required wherever `series` is set. */
  seriesLabel?: string
  /** A destination for the figure, which is the only drill down there is. */
  href?: string
  /** The words that destination is named in, required wherever `href` is set. */
  hrefLabel?: ReactNode
}

/**
 * One dated, attributed occurrence, as typed data.
 *
 * **It names no vocabulary of what happened, and there is deliberately no `kind`
 * member.** `FieldKind` and `ColumnKind` are closed unions and that is legitimate,
 * because every member names a Component this package ships and the caller chooses
 * which of Prism's own controls to use. An event's kind would name what somebody's
 * product calls a thing that happened, and no enumeration of those is this package's
 * to publish: a member on a Prism type would be promising that every consumer's world
 * is this one. A caller needing one puts the word in `action` or composes a `Status`
 * into `detail`. That is the same line the field specification draws with its `slot`
 * arm, and it is what makes one type usable by a shipment scan, a sign in and a
 * permission change without any of them growing the type.
 *
 * `at` is a `number` or a `string` printed exactly as passed and never a `Date`,
 * because this package ships no formatting, and the machine value rides on the
 * element so a reader that orders by it can. `actor` is required because a record of
 * what happened with nobody to attribute it to is not a record of what happened, and
 * the words for a carrier's scan or a nightly job are the consumer's to write.
 * `tone` is a colour and `toneLabel` is the information, so the label is required
 * wherever the tone is set: on a record a reader may be checking a claim against, a
 * colour alone is worse than anywhere else.
 *
 * **Immutability is a rendering fact here and nothing more.** What is rendered is the
 * entries it was handed, in the order it was handed, with no control that edits one,
 * removes one or reorders one, and that absence is what append only means. What
 * cannot be rendered is that the record is immutable, tamper evident, signed, sealed,
 * retained or admissible, because a Block has no authority over the store behind it.
 * So there is no `immutable` member, no seal and no verification mark, and a consumer
 * whose domain requires one enforces it in its own store and shows what the store
 * says. There is no retention member and no window either, for the same reason: the
 * window, the archive, the purge, the legal hold and the export are properties of a
 * store rather than of a drawing. And a trail draws a moment and never a length, so
 * there is no `duration`, no scale, no range and no axis: a bar's length is a claim
 * about a difference between two caller moments.
 *
 * **What a consumer may not put in an event.** No `kind`, no `progress`, no
 * `severity`, no `duration`, no `role`, no retention, no immutability and no time
 * axis, each refused above for a reason rather than left out.
 */
export type EventSpec = {
  /** The occurrence's own key, stable, and never the words of anything. */
  key: string
  /** When it happened, printed as passed, and never a `Date` this package would format. */
  at: number | string
  /** Who or what did it, in the words the system uses for a person or a process. */
  actor: ReactNode
  /** What was done, in the product's own verb or clause. */
  action: ReactNode
  /** What it was done to, absent for an occurrence that names no document. */
  target?: ReactNode
  /** Anything the four fields above cannot hold, which is the caller's own node. */
  detail?: ReactNode
  /** A tone beside the words, never on its own. */
  tone?: StatusTone
  /** The words that tone means, required wherever `tone` is set. */
  toneLabel?: ReactNode
  /** A destination for the occurrence, which is the only route out of one. */
  href?: string
  /** The words that destination is named in, required wherever `href` is set. */
  hrefLabel?: ReactNode
}
