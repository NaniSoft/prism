import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * The five kinds a change record can be, and the closed set is the taxonomy.
 *
 * A taxonomy and not a severity ladder, and the difference decides the tones
 * below. A change record says what kind of change it is; it does not say how bad
 * it was, because "bad" is a property of a reader's exposure rather than of the
 * record. A security fix in a package nobody installed is not more urgent than a
 * typo fix in the package everybody did, and the record cannot tell the two apart.
 * So these are the kinds and the words are the kinds.
 */
export type Changelog01Kind = 'added' | 'changed' | 'fixed' | 'removed' | 'security'

/**
 * The tone each kind draws, from the contract's own five.
 *
 * **This is a reading order and not a severity scale, and the difference is the
 * whole argument for the `security` line below.** A tone here says how loudly the
 * kind is announced when a reader scans a page of releases; it does not say how much
 * attention the entry deserves, because that is a fact about the reader's exposure
 * and not about the record. The five, in the order a reader meets them:
 *
 * - `added` takes `success`, which is the one tone in the contract that means a
 *   good outcome. Something is now here that was not, and that is the kind a
 *   reader scans a changelog for first.
 * - `changed` takes `info`. It is the most common kind and the least consequential
 *   of the five, and `info` is the tone that means "not an alarm" without claiming
 *   anything either.
 * - `fixed` takes `info` as well, and sharing it with `changed` is deliberate
 *   rather than an omission. Both kinds describe something that already existed:
 *   a change is a different thing and a fix is the same thing working. Which of the
 *   two a reader cares about is a fact about their product, and a page that drew
 *   them in different colours would be making that call on their behalf. The dot
 *   tells them there is a record and the kind beside it tells them which kind it
 *   is, which is what `Status` is for.
 * - `removed` takes `neutral` and not `destructive`, and this is the second
 *   decision worth arguing. A removal is a fact about the past: it is very often
 *   the end of a migration the reader asked for and is entirely good news for
 *   them, and painting it in the contract's alarm colour would put a red dot on a
 *   release note that deserves a green one. `neutral` is also honest about the
 *   tense. Nothing is wrong. Something is gone.
 * - `security` takes `warning`. See below.
 *
 * The tones are the Block's because a tone is a visual decision, and the words are
 * the kind the caller chose. `Status` is the right Component for that split: the
 * dot is `aria-hidden` and the label carries the meaning, so a reader who cannot
 * separate `warning` from `neutral` still reads which kind each entry is.
 */
const KIND_TONE: Record<Changelog01Kind, StatusTone> = {
  added: 'success',
  changed: 'info',
  fixed: 'info',
  removed: 'neutral',
  security: 'warning',
}

/**
 * The share of the line the kind mark takes in the wider of the two arrangements.
 *
 * Two tracks rather than one, so the entry text starts at the same place on every
 * row and the dots line up down the page. A grid whose first track is the mark's
 * own width would put every entry's text at a different offset by the length of
 * its kind, and a changelog is scanned down that edge.
 */
const TRACKS: Record<'kinds' | 'plain', string> = {
  kinds: 'sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4',
  plain: 'grid-cols-1',
}

/**
 * One change record inside a release: a kind, a title, and the sentence or two
 * that say what changed.
 *
 * `kind` and `title` are required, and a record with neither is a line in a list
 * a reader has to interpret. `body` is optional because half of what a changelog
 * publishes is a one line record: "Dropped the deprecated `mode` prop", which is
 * complete on its own and would be worse with a sentence under it.
 */
export type Changelog01Entry = {
  /** The record's stable key within its release. */
  id: string
  /** Which of the five kinds this record is. */
  kind: Changelog01Kind
  /** The one line that says what changed. */
  title: string
  /**
   * The detail under the line: why it changed, what it affects, what to do about
   * it. A node, so a caller may pass a paragraph, a list of migration steps, or a
   * `CodeBlock` showing the old and the new call side by side.
   */
  body?: ReactNode
  /** Where the full record lives. Its presence makes the entry carry a link. */
  href?: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * A link whose only words are the entry's own title tells a reader nothing about
   * what following it does, and the same rule holds here as in every other Block
   * that draws one.
   */
  hrefLabel?: string
}

/**
 * One release: what it is called, when it was, one line about it, and its records.
 *
 * `version` and `entries` are required and `at` is not, because a changelog is
 * grouped by release in one product and by date in another, and a date is a fact
 * about the release rather than part of its identity. `1.4.0` and `2026-09-30` are
 * both legitimate things to print where a version goes, and the Block prints the
 * string it was handed in the mono face because both are machine notation.
 */
export type Changelog01Release = {
  /** The release's stable key within the set. */
  id: string
  /**
   * The version, or the date, or whatever identifies this group of records, as the
   * product writes it.
   */
  version: string
  /** The moment, as a string. Printed verbatim; see `ContentGrid01Entry`'s `at`. */
  at?: string
  /** One line about the release as a whole, for a reader deciding whether to read on. */
  summary?: ReactNode
  /**
   * The records, in the order the product published them.
   *
   * Order is the caller's, and a changelog is one of the two surfaces in this
   * system where the order is genuinely a claim: a security fix belongs next to
   * the change that made it necessary far more often than it belongs at the top of
   * the list.
   */
  entries: Changelog01Entry[]
}

/**
 * The props a Changelog01 takes.
 *
 * Every string is a prop and the Block ships none: no version, no date, no kind
 * word, no title, no body and no link label. A changelog is the highest risk of
 * hardcoded copy in this package, because the vocabulary of change is the most
 * tempting kind of copy to write: five words, a fixed order, and every product
 * apparently needs them. Five words in English is five words every consumer of
 * this Block inherits, and the corpus publishes them as the design system's own.
 */
export type Changelog01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a changelog composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The releases, newest first unless the product says otherwise.
   *
   * The Block does not sort. A changelog's order is a publication decision with a
   * long tail of exceptions, and a Block that sorted by version string would
   * reorder `1.10.0` before `1.9.0` for every consumer whose versions are strings.
   */
  releases: Changelog01Release[]
  /**
   * Whether each record carries its kind mark.
   *
   * @defaultValue true
   *
   * On by default because a reader scanning a page of releases is usually looking
   * for one kind and not reading all of them. Pass `false` where the release's own
   * summary already says what kind of release it was, or where the records are
   * written so that the title alone identifies them, which is the case for a
   * product that publishes two records per release and no more.
   */
  showKinds?: boolean
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A dated record of what changed, grouped by release, each record carrying a
 * version, a kind, a line about what changed, and the sentence under it.
 *
 * **The five kinds and their tones are stated out loud in the `KIND_TONE` note
 * above, and `security` takes `warning` rather than `destructive`, and the reason
 * is the one thing a Block cannot know.** Severity is the reader's judgement, not
 * the record's property. A `security` entry is the only one of the five that
 * carries an implied claim about urgency, and a design system that coloured it
 * destructively would be making that claim for every consumer in every release
 * for ever. The concrete cost is easy to name: a product that publishes a routine
 * dependency bump under `security` would have a red dot on it, and a reader
 * trained by that page would learn to skip the red, and the day the product had a
 * real advisory there would be nothing louder left to spend. The other side of
 * that is the cost of `warning` and it is worth naming too: a consumer who needs a
 * genuinely serious advisory to be unmistakable has no louder mark available to
 * them, because the tone is fixed by the kind. The answer is that a serious
 * advisory is a sentence, and the sentence is the `title` and the `body` the
 * caller wrote. A design system has no standing to decide how alarming a
 * consumer's release history is.
 *
 * **The kind is the taxonomy and the tones are the Block's, and neither is the
 * caller's words.** The five kinds are closed because they are a vocabulary of
  change that a reader learns once and then scans by, and a per-product vocabulary
 * would be a column no reader could scan. What the caller owns is the tone's
 * absence or presence and the sentence beside the mark, which is why the mark is
 * `Status` and not a `Badge`: `Status` takes a tone and a label, its dot is
  `aria-hidden`, and the label carries the meaning, so a reader who cannot separate
  * `warning` from `neutral` still hears which kind each record is. The five words
  * themselves are rendered from the value the caller passed, which is what a tier
  * is: a machine value in a closed set, drawn as it was given, exactly as a
 * version, a file name or a tier in any other Block is drawn.
 *
 * **The outline is section, then release, then record, and all three levels are
 * derived.** A release is a heading one step below the section and a record is a
 * heading one step below the release, which is `childLevel` applied twice rather
 * than a literal `h3` in either place. The reason the record is not a sibling of
 * the release is the shape of the data: a changelog is a set of groups, and a
 * reader who navigates by heading is looking for a version, and then for a record
 * inside it. A changelog with forty records directly under the section is an
 * outline of forty peers and no grouping, which is a list of flat entries and not
 * a record of releases. The cost is real: a reader on a page with a hundred
  * releases meets a hundred headings before any record, which is the price of a
 * structure they can jump through and the price a `Story01` already pays.
 *
 * **A release with no records draws its version and its date and no list.** An
 * empty array is a legitimate state rather than a gap: a release that was cut
  before anything landed, a release whose records were all withdrawn, a milestone
  with a name and nothing under it. What it must not draw is a frame. A bordered
  empty group under a version reads as content that failed to load, which is the
 * one thing a changelog must never suggest about a release, and a
 * "no changes" line would be a sentence Prism does not have the standing to
 * write, because whether an empty release is a mistake or a policy is the
 * product's business. So the list element is not drawn at all, and the release
  * reads as a version with nothing under it, which is what it is.
 *
 * **A release is one `section`-less group of the section it sits in, and the
 * versions are a list.** The releases are drawn in a `div` rather than a nested
 * `<section>` because a `<section>` is a landmark and forty landmarks with no
 * accessible name is forty announcements of nothing; the version is the heading and
 * the heading is the name. The records inside a release are one `ul`, so a reader
 * hears one list per release rather than one list for the page, and a list that
 * spans a group boundary is a list whose items are not all the same kind of thing.
 *
 * **A record with no link draws no link, and one with a link carries the caller's
 * words.** The pair is checked before anything is drawn, the same refusal
 * `ContentGrid01` makes and for the same reason, and the message names the field.
 * A per-record link is the difference between a changelog and a set of titles: it
 * is where a reader goes for the migration steps, the diff, or the issue, and a
 * changelog that cannot link out is a list of assertions.
 *
 * It is a server Component: no hook, no state and no client code. A consumer that
 * wants a record's body to hold a control composes the control itself in `body`,
 * which is the arrangement a `ReactNode` slot exists for.
 */
export function Changelog01({
  eyebrow,
  title,
  description,
  releases,
  showKinds = true,
  headingLevel = 'h2',
  className,
}: Changelog01Props) {
  // Two derived levels rather than one. The release names a group of records and
  // the record is one thing inside it, so the release is a heading under the
  // section and the record is a heading under the release. Both follow the section
  // when the Block is composed one level deeper than it was authored for.
  const Release = childLevel(headingLevel)
  const Entry = childLevel(childLevel(headingLevel))

  for (const release of releases) {
    for (const entry of release.entries) {
      if (entry.href !== undefined && entry.hrefLabel === undefined) {
        throw new Error(
          `Changelog01: the record "${entry.title}" in ${release.version} passed an href with no hrefLabel, so ` +
            'the entry would carry a link with no words on it, and a link a reader cannot name is a control they ' +
            'cannot act on with confidence. Pass the words that say what following it does, or omit the href.',
        )
      }
    }
  }

  if (releases.length === 0) return null

  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      <div data-slot="changelog-01" className={cn('flex flex-col gap-12', className)}>
        {releases.map((release) => (
          <div key={release.id} data-slot="changelog-01-release" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Release
                data-slot="changelog-01-version"
                className="font-mono text-sm font-semibold tracking-tight"
              >
                {release.version}
              </Release>
              {release.at ? (
                <span data-slot="changelog-01-at" className="text-muted-foreground font-mono text-xs">
                  {release.at}
                </span>
              ) : null}
            </div>

            {release.summary ? (
              <div
                data-slot="changelog-01-summary"
                className="text-muted-foreground text-pretty text-sm"
              >
                {release.summary}
              </div>
            ) : null}

            {/*
              A release with no records draws no list. The element is not drawn at
              all rather than drawn empty, because a bordered group with nothing in
              it reads as a release whose contents failed to load, and a "no
              changes" line would be a sentence this Block is not entitled to
              write: whether an empty release is a mistake or a policy is the
              product's business.
            */}
            {release.entries.length === 0 ? null : (
              <ul data-slot="changelog-01-entries" className="flex flex-col gap-4">
                {release.entries.map((entry) => (
                  <li
                    key={entry.id}
                    data-slot="changelog-01-entry"
                    data-kind={entry.kind}
                    className={cn('flex flex-col gap-1.5', TRACKS[showKinds ? 'kinds' : 'plain'])}
                  >
                    {showKinds ? (
                      <Status
                        data-slot="changelog-01-kind"
                        tone={KIND_TONE[entry.kind]}
                        label={entry.kind}
                        size="sm"
                      />
                    ) : null}
                    <div data-slot="changelog-01-record" className="flex min-w-0 flex-col gap-1.5">
                      <Entry className="text-sm font-semibold tracking-tight">{entry.title}</Entry>
                      {entry.body ? (
                        <div
                          data-slot="changelog-01-body"
                          className="text-muted-foreground text-pretty text-sm"
                        >
                          {entry.body}
                        </div>
                      ) : null}
                      {entry.href !== undefined && entry.hrefLabel !== undefined ? (
                        <CtaLink
                          href={entry.href}
                          variant="ghost"
                          size="sm"
                          className="self-start"
                        >
                          {entry.hrefLabel}
                        </CtaLink>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}

export default Changelog01
