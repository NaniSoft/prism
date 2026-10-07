'use client'

import type { ReactNode } from 'react'

import {
  Contact01,
  type Contact01Status,
  type ContactValue,
} from '../../blocks/contact-01'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { FieldKindName } from '../../lib/field-render'
import type { FieldSpec } from '../../lib/spec'
import { cn } from '../../lib/utils'

/**
 * One choice in a select field.
 *
 * A `value` that is a key and a `label` that is a sentence, because that is what a
 * native `<option>` holds and nothing else. A caller who needs a description beside
 * an option, a count or anything nested is reaching for a control the platform
 * cannot render, and `Contact01` names that rather than pretending otherwise.
 */
export type ContactPageOption = {
  /** What the form submits for this choice, which is a key and not a sentence. */
  value: string
  /** The words the reader sees, in the product's own language. */
  label: string
}

/**
 * One declared field of the contact form.
 *
 * **Flat, on purpose, where `FieldSpec` is a union.** A consumer's form data is
 * flat: a record read out of a content type, a CMS entry or a JSON file has one
 * shape with an optional `options` key, and a caller that had to narrow their own
 * record before they could hand it to a page would be doing the Block's type work
 * at every call site. So the flat record is converted to the shared specification
 * once, inside this module, and the one shape it cannot build is refused here with
 * a message that names the Page's own prop. That is `AboutPage`'s arrangement for
 * the same pair of link fields, and the cost is the same: a caller who wants the
 * compile error rather than the thrown one types their fields as `FieldSpec` and
 * composes `Contact01` directly.
 */
export type ContactPageField = {
  /** The caller's key for this field, and the key the value arrives under. */
  id: string
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /** The control the field draws. Five, and they are the five `Contact01` draws. */
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  /** Whether the reader may submit the form without filling it. */
  required: boolean
  /** A line under the control, announced with it. */
  description?: ReactNode
  /** What the control shows while it is empty. A hint, not a name. */
  placeholder?: string
  /** The choices of a `select` field, and forbidden on the other four. */
  options?: readonly ContactPageOption[]
  /** The platform's own autofill hint for this field. */
  autoComplete?: string
}

/**
 * Every field of an office but whether it carries a map link.
 *
 * Not exported, because the two arms below are what a caller writes and this is
 * only the half they share.
 */
type ContactPageOfficeFacts = {
  /** A stable key for the office, carried on the markup as `data-office`. */
  id: string
  /**
   * The name of the place: the city, the region, the desk.
   *
   * Required, because a card of postal lines with nothing naming which place they
   * are is a set of addresses a reader has to guess between.
   */
  name: string
  /** The postal lines, one per entry, in the order a reader reads them. */
  lines: readonly string[]
  /** Whatever else is true of this place: the hours, the languages, the nearest station. */
  detail?: ReactNode
}

/**
 * One place a reader can reach a person, and the one link it may carry.
 *
 * **`mapLabel` is required wherever `mapHref` is, and declared forbidden where it is
 * not**, for the reason every other link in this package carries the same union: a
 * control whose only words are a coordinate or a route is a control a screen reader
 * announces as punctuation, and it is also the one control on a card whose words a
 * mouse reader cannot select, because the words they select are the ones on the
 * control rather than the ones in the address bar.
 */
export type ContactPageOffice =
  | (ContactPageOfficeFacts & {
      /** Where a map of this place is, as a native anchor's `href`. */
      mapHref: string
      /** The words on that link. Required here, and forbidden on the other arm. */
      mapLabel: string
    })
  | (ContactPageOfficeFacts & {
      /** No map link on this card, so no destination to name. */
      mapHref?: never
      /** No accessible name owed, because there is no link to name. */
      mapLabel?: never
    })

/**
 * The props a ContactPage takes.
 *
 * Every string, every destination and the outcome of the request are props, and the
 * Page ships none of them. A contact screen is where a design system's copy is most
 * tempting and most expensive, because it is the screen a product writes its own
 * apology into, and a sentence written here would be inherited by every consumer.
 */
export type ContactPageProps = {
  /** Optional label above the page's own heading. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /**
   * The page's heading, and this screen's `h1`.
   *
   * Required, and drawn by the Page rather than handed to the form band. See the
   * Page's JSDoc for why the screen needs two headings and why they are not the
   * same sentence twice.
   */
  title: ReactNode
  /** One or two sentences under the heading, for what to expect from a reply. */
  description?: ReactNode
  /**
   * The name of the form band, which sits one step below the page heading.
   *
   * Required rather than optional, and the reason is `Contact01`'s own: that Block
   * requires a title, because a form with no heading is a form in a page. A screen
   * that drew a page heading and gave the form band nothing would have a page whose
   * title was the title of one of its own regions, and a reader navigating by
   * heading would meet the form and not the page.
   */
  form: {
    /** The band's heading. */
    title: ReactNode
    /** One supporting line under it, for the part the heading cannot carry. */
    description?: ReactNode
  }
  /**
   * The fields, in the order the reader should meet them.
   *
   * `readonly` because the normal way a consumer writes a field list is an `as
   * const` fixture or a record read out of a build step, and a prop typed as a
   * mutable array rejects both at the moment they are most useful.
   */
  fields: readonly ContactPageField[]
  /**
   * Called with the declared fields' values when the reader submits.
   *
   * Required, for the reason `Contact01` gives: it is the only thing this Page does
   * with what the form collected, and there is no arm of this screen in which a
   * message is gathered and then nowhere to go.
   */
  onSubmit: (value: ContactValue) => void
  /** The label on the one control that submits. */
  submitLabel: string
  /**
   * What the reader is told happens to what they type, drawn under the fields where
   * the reader is about to press the control.
   */
  consent?: ReactNode
  /**
   * The outcome of the caller's own request, drawn in a live region and announced.
   *
   * `Contact01`'s status, taken unchanged rather than restated. Its four states are
   * read for two things only: `sending` disables the submit control, because a
   * second press while the first request is in flight is a duplicate enquiry a
   * support inbox cannot merge, and `error` makes the announcement assertive. A Page
   * that named the same state `working` would have to translate it at the boundary,
   * which buys a vaguer word and a table to keep in step.
   */
  status?: Contact01Status
  /**
   * The closing band: a `Faq01` for the questions nobody should have to ask to find
   * this screen, a `Newsletter01`, or a legal line.
   *
   * Named for the band most consumers put here, and it holds any of the three,
   * because a contact screen is the band, the places, and the questions, and the
   * last of those is content rather than a footer.
   */
  footer?: ReactNode
  /**
   * The level of the page's own heading, and one step below it for the band
   * headings, and two below for an office's name.
   *
   * Defaults to `h1`, because a Page owns the top of the document outline.
   */
  headingLevel?: HeadingLevel
  /** Layout only, exactly as on every Item. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
} & (
  | {
      /**
       * The places a reader can reach a person, in the order a reader should meet
       * them. At least one, and the band is only there when there are.
       */
      offices: readonly ContactPageOffice[]
      /**
       * The accessible name and the visible heading of that band.
       *
       * Required here and forbidden on the other arm. "Offices", "Where we are"
       * and "Locations" are three products' words, and a row of addresses with
       * nothing above it is the region every contact screen forgets to name.
       */
      officesLabel: string
    }
  | {
      /** No places on this screen, so there is no band to name. */
      offices?: never
      /** No word is needed, because there is no band to name. */
      officesLabel?: never
    }
)

/**
 * One declared field as `Contact01` draws it, with the two shapes kept apart.
 *
 * `Contact01` declares a union whose select arm requires `options`, and this Page's
 * prop is flat on purpose, so the union is built here once and the flat pair is
 * checked above before this runs. The alternative was forwarding the flat record
 * and letting the Block's own diagnostic fire three frames down, which names the
 * Block rather than the prop the caller passed.
 */
function asContactField(field: ContactPageField): FieldSpec {
  const shared = {
    key: field.id,
    label: field.label,
    required: field.required,
    help: field.description,
    placeholder: field.placeholder,
    autoComplete: field.autoComplete,
  }

  if (field.type === 'textarea') return { ...shared, kind: FieldKindName.textarea, rows: 4 }

  /*
    `text`, `email` and `tel` all draw Prism's `Input`, which is the control this
    package ships for a run of characters; the platform's own `type` attributes are
    not part of the shared vocabulary, so asking for an email is asking for an
    `Input` with the `autoComplete` hint a password manager reads. `inputMode` and
    `type` are the platform's, and the caller who needs a numeric keypad reaches for
    the `NumberField` kind on the Block directly rather than through this Page's
    flat prop.
  */
  if (field.type !== 'select') return { ...shared, kind: FieldKindName.input }

  const options = field.options ?? []
  if (options.length === 0) {
    throw new Error(
      `ContactPage: the field "${field.id}" is a select and passes no options, so the control would render with ` +
        'nothing in it, which is a question no reader can answer and looks answered only because the control is ' +
        'there and focusable. Pass the choices, or declare the field as a text field and check the answer in ' +
        'your own handler.',
    )
  }

  return { ...shared, kind: FieldKindName.nativeSelect, options: options.map((option) => ({ ...option })) }
}

/**
 * The two checks the office union makes for a TypeScript caller, run here for the
 * JavaScript one and for the value that came out of a build step with the type's
 * guarantee already gone.
 *
 * Both are about a card that would say less than it appears to. An office with no
 * postal lines is a card that asserts a place exists and does not say where, and a
 * map link with no words is a control announced as a coordinate.
 */
function assertOffices(offices: readonly ContactPageOffice[] | undefined): void {
  for (const office of offices ?? []) {
    if (office.lines.length === 0) {
      throw new Error(
        `ContactPage: the office "${office.id}" declares no postal lines, so the card would name a place and say ` +
          'nothing about where it is. Pass the lines a reader would write on an envelope, or drop the office and ' +
          'let the form carry the enquiry.',
      )
    }
    if (office.mapHref !== undefined && (!office.mapLabel || office.mapLabel.trim() === '')) {
      throw new Error(
        `ContactPage: the office "${office.id}" carries a map link with no mapLabel, so the control would be ` +
          'announced by its destination, which is punctuation rather than a name. Pass the words that say what ' +
          'the link does, or drop it.',
      )
    }
  }
}

/**
 * A complete contact screen: the page heading, the form the caller declares, the
 * places a reader can reach a person, and the questions they should not have to ask
 * to find this screen.
 *
 * **The offices are the part that makes this a Page rather than a `Contact01`, and
 * it is worth saying what that Block cannot do.** A contact Block is a band: one
 * form, in one column, with the caller's fields. A contact screen is the band, the
 * places, and the questions, and the two extras are what a reader actually arrives
 * with, because a reader who wants to write has a fallback and a reader who has run
 * out of patience has a map. `Contact01` has an `address` arm and this Page does not
 * use it, for three reasons that all point the same way: that arm holds exactly one
 * postal address where a business has as many as it has regions; it has no field for
 * a name for the place, so three cities are three unlabelled blocks of lines; and
 * its link arm is a `mailto`, which is the wrong link for a place that is not
 * reachable by post. A consumer whose only address is one postal address beside one
 * form should compose `Contact01` with that arm, which is the better arrangement
 * for one address, and the cost here is the other thing: the offices are a band
 * under the form rather than a column beside it, because a Block that draws its own
 * `Section` cannot be dropped into a grid column without the page's vertical rhythm
 * doubling, which is the same reason `dashboard-page` stacks its bands rather than
 * setting two of them side by side.
 *
 * **The offices are facts and not controls, and the type is what holds that.** A
 * postal line is a string a reader copies. `detail` is a node, because the honest
 * thing under a place is sometimes a sentence and sometimes a small table of
 * opening hours, and a string would force one of those to be flattened. The only
 * link a card may carry is the caller's own map link, and it carries words, and the
 * union is what makes those words required. A screen that turned its regions into
 * navigation would be telling a reader that a place is a topic they can read about,
 * and the only topic any of them has is how to get there.
 *
 * **The page heading and the form band are two headings and not one sentence twice.**
 * The rejected alternative was handing `title` to the form and letting the Block's
 * section heading be the page's `h1`, which is what `onboarding-page` does and what
 * it can do because its first band is the whole screen. Here the first band is a
 * form with a name of its own, and a screen whose page heading was "Talk to us" and
 * whose form heading was also "Talk to us" would be a page with one heading drawn
 * twice and a reader navigating by heading who met the form rather than the page.
 *
 * **The status is `Contact01`'s, and the refusal to invent one is the whole of this
 * Page's copy law.** There is no success sentence anywhere in this file, no `sent`
 * flag written by this package, and no "we will reply within a day". A contact
 * request can be delivered, held by a filter, filed by a bot, refused as a duplicate
 * and answered, and one sentence cannot be true of all five, so the caller owns the
 * promise and writes the words. The cost is that a consumer who installs this screen
 * has to write a sentence they will get wrong once.
 *
 * **It is a client Component, and the reason is `onSubmit`.** A handler is a
 * function, a function is a piece of state, and a function cannot cross from a
 * server Component to a client Component, so a server Page that took one would hand
 * a caller a form that gathers a person's name, an address and a message and then
 * calls nothing. `Contact01` is a client module for the same reason and the Page
 * cannot be a server module in front of it. The cost is stated rather than hidden:
 * every datum on this screen is serialised across the boundary to reach a band three
 * elements down, and the rejected alternative was a form slot, which would have
 * been a Page that owns a heading, a row of addresses and nothing a reader could
 * submit.
 */
export function ContactPage({
  eyebrow,
  title,
  description,
  form,
  fields,
  onSubmit,
  submitLabel,
  consent,
  status,
  offices,
  officesLabel,
  footer,
  headingLevel = 'h1',
  className,
}: ContactPageProps) {
  assertOffices(offices)

  /*
    The band heading is one step below the page heading and an office's name is one
    step below that, which is what `childLevel` is for: a hardcoded level in each
    would be right exactly once.
  */
  const BandHeading = childLevel(headingLevel)
  const OfficeHeading = childLevel(BandHeading)

  return (
    <div data-slot="contact-page" className={cn(className)}>
      <Section data-slot="contact-page-heading">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
      </Section>

      {/*
        The `stacked` arrangement, because this Page draws the offices as its own
        band rather than handing them to `Contact01`'s `address` arm, and the split
        arrangement would leave the form in three fifths of a full width section
        with an empty column beside it. See the JSDoc for the three reasons.
      */}
      <Contact01
        title={form.title}
        description={form.description}
        groups={[{ fields: fields.map(asContactField) }]}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        consent={consent}
        status={status}
        variant="stacked"
        headingLevel={BandHeading}
      />

      {offices === undefined ? null : (
        <Section data-slot="contact-page-offices">
          <SectionHeading
            as={BandHeading}
            align="left"
            title={officesLabel}
            className="mb-10"
          />

          <div
            data-slot="contact-page-office-row"
            className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {offices.map((office) => (
              <Card
                key={office.id}
                data-slot="contact-page-office"
                data-office={office.id}
                className="h-full"
              >
                <CardHeader>
                  <CardTitle as={OfficeHeading}>{office.name}</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col items-start gap-4">
                  {/*
                    An `address` element, because that is what a place's postal
                    lines are, and `Contact01` reaches for the one utility that
                    resets the platform's italic address rather than putting it in a
                    token: an italic address is a browser default and not a design
                    decision.
                  */}
                  <address
                    data-slot="contact-page-office-address"
                    className="text-muted-foreground flex flex-col gap-1 not-italic text-sm"
                  >
                    {office.lines.map((line, index) => (
                      /*
                        Positional, because a postal line is display content and a
                        business with two branches on one street can legitimately
                        print the same line twice.
                      */
                      <span key={`${office.id}-${index}`}>{line}</span>
                    ))}
                  </address>

                  {office.detail === undefined ? null : (
                    <div
                      data-slot="contact-page-office-detail"
                      className="text-pretty text-sm"
                    >
                      {office.detail}
                    </div>
                  )}

                  {office.mapHref === undefined ? null : (
                    <CtaLink
                      data-slot="contact-page-office-map"
                      href={office.mapHref}
                      variant="ghost"
                      size="sm"
                    >
                      {office.mapLabel}
                    </CtaLink>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {footer === undefined ? null : (
        <div data-slot="contact-page-footer">{footer}</div>
      )}
    </div>
  )
}

export default ContactPage
