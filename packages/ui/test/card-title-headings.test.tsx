/**
 * A card title is a heading, at a level the Block derives rather than guesses.
 *
 * **The defect this was written for.** A grid of features drew five card titles as
 * plain text. A card's title is a `div` by design, because four cards in a grid are
 * four titles under one section heading, but that reasoning is about the *element*
 * and it was being read as a reason for the *outline* too. The page kept its `h2`
 * and lost every heading below it, so it was unreadable by heading navigation while
 * looking identical. Found while migrating the company site, whose feature section
 * had five `h4`s before the migration.
 *
 * **Why one file for six Blocks.** The ticket's third criterion is that the same
 * question is answered for every Item that draws a titled card, so the consistency
 * is the thing under test. Five files with one case each would let a future Block
 * answer it differently and still pass, which is the failure this was filed about.
 * So every site is asserted here, in one place, and the list is the assertion.
 *
 * **The level is derived, and that is the part worth asserting.** Not "is a
 * heading" but "is a heading one step below the section that introduces it, at
 * whatever level that section is at". A Block that hardcoded `h3` would pass the
 * first test and fail the second, and would be right exactly once, at the nesting
 * depth it was written for.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AuthForm01 } from '../src/blocks/auth-form-01'
import { Bento01 } from '../src/blocks/bento-01'
import { Changelog01 } from '../src/blocks/changelog-01'
import { ContentGrid01 } from '../src/blocks/content-grid-01'
import { Download01 } from '../src/blocks/download-01'
import { FeatureGrid01 } from '../src/blocks/feature-grid-01'
import { FeatureRows01 } from '../src/blocks/feature-rows-01'
import { Hero03 } from '../src/blocks/hero-03'
import { Pricing01 } from '../src/blocks/pricing-01'
import { SettingsPanel01 } from '../src/blocks/settings-panel-01'
import { StackGrid01 } from '../src/blocks/stack-grid-01'
import { AuthPage } from '../src/pages/auth-page'
import { AddressBook01 } from '../src/blocks/address-book-01'
import { ChartCard01 } from '../src/blocks/chart-card-01'
import { Dashboard01 } from '../src/blocks/dashboard-01'
import { Directory01 } from '../src/blocks/directory-01'
import { Intake01 } from '../src/blocks/intake-01'
import { Kanban01 } from '../src/blocks/kanban-01'
import { OpsChecklist01 } from '../src/blocks/ops-checklist-01'
import { OfferingCategories01 } from '../src/blocks/offering-categories-01'
import { OfferingList01 } from '../src/blocks/offering-list-01'
import { ProjectDashboard01 } from '../src/blocks/project-dashboard-01'
import { Provisioning01 } from '../src/blocks/provisioning-01'
import { Shortlist01 } from '../src/blocks/shortlist-01'
import { ContactPage } from '../src/pages/contact-page'
import { PricingPage } from '../src/pages/pricing-page'
import { childLevel, type HeadingLevel } from '../src/components/ui/section'

/* -- The derivation itself ---------------------------------------------------- */

describe('childLevel', () => {
  it('steps one level down, so a title inside a section nests under it', () => {
    expect(childLevel('h1')).toBe('h2')
    expect(childLevel('h2')).toBe('h3')
    expect(childLevel('h3')).toBe('h4')
    expect(childLevel('h4')).toBe('h5')
    expect(childLevel('h5')).toBe('h6')
  })

  it('holds at h6 rather than wrapping, and the reason is worth stating', () => {
    // Wrapping would put a card title above the section that introduces it, which a
    // reader navigating by heading meets first. A repeated level is announced as the
    // same depth; a wrap is announced as a break in the outline.
    expect(childLevel('h6')).toBe('h6')
  })

  it('is total over the six levels, which is what makes it usable as a tag name', () => {
    const levels: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    for (const level of levels) {
      expect(levels).toContain(childLevel(level))
    }
  })
})

/* -- Fixtures, taken from each Item's own Demo -------------------------------- */

/*
 * The props are the Demos' own, trimmed to the minimum that renders the thing under
 * test. Using the published example rather than a hand-written one means a change
 * that breaks a Block's real usage breaks this too, which a private fixture would
 * not.
 */
const featureGrid = (headingLevel?: HeadingLevel) => (
  <FeatureGrid01
    {...(headingLevel ? { headingLevel } : {})}
    variant="bare"
    title="Section heading"
    features={[
      { title: 'First item', body: 'A sentence about the first thing.' },
      { title: 'Second item', body: 'A sentence about the second thing.' },
    ]}
  />
)

const pricing = (headingLevel?: HeadingLevel) => (
  <Pricing01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    plans={[{ id: 'first', name: 'First plan', price: '$0', features: ['One line'], action: { label: 'Choose', href: '/choose' } }]}
  />
)

const stackGrid = (headingLevel?: HeadingLevel) => (
  <StackGrid01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    parts={[{ name: 'Bedrock', role: 'The data lake' }]}
  />
)

const authForm = (headingLevel?: HeadingLevel) => (
  <AuthForm01
    {...(headingLevel ? { headingLevel } : {})}
    title="Sign in"
    submitLabel="Sign in"
    groups={[{ fields: [{ key: 'email', label: 'Email', kind: 'Input' }] }]}
  />
)

const settingsPanel = (headingLevel?: HeadingLevel) => (
  <SettingsPanel01
    {...(headingLevel ? { headingLevel } : {})}
    title="Workspace settings"
    groups={[
      { id: 'general', label: 'General', fields: [{ key: 'name', label: 'Name', kind: 'Input' }] },
    ]}
    values={{}}
    onValueChange={() => {}}
  />
)

const authPage = (headingLevel?: HeadingLevel) => (
  <AuthPage
    {...(headingLevel ? { headingLevel } : {})}
    form={{
      title: 'Sign in',
      submitLabel: 'Sign in',
      groups: [{ fields: [{ key: 'email', label: 'Email', kind: 'Input' }] }],
    }}
    aside={{ title: 'New here', description: 'An account takes a moment.' }}
  />
)

/*
 * The 2026-09 roster expansion. Six more Blocks that draw a titled card, and the
 * sixth is why `offset` is a three-member set rather than two.
 *
 * Five of them answer the question the first way: the Block opens with a section
 * heading and each card title nests one level below it, so `offset: 1`.
 * `Changelog01` answers with a third answer that is neither of the two the header
 * describes, and refusing to encode it would have meant either lying in the table
 * or leaving the Block out of the file that exists to hold the consistency. A
 * release is a group and a record is a member of that group, so a record's title
 * nests two levels below the section: `h4` under an `h2`. That is `offset: 2`.
 */
const hero03 = (headingLevel?: HeadingLevel) => (
  <Hero03
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    points={[{ title: 'First point', body: 'A sentence about it.' }]}
    proof={[{ label: 'One label', value: '1' }]}
  />
)

const featureRows = (headingLevel?: HeadingLevel) => (
  <FeatureRows01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    rows={[{ title: 'First row', body: 'A sentence about it.' }]}
  />
)

const bento = (headingLevel?: HeadingLevel) => (
  <Bento01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    cells={[{ id: 'first', span: 'md', title: 'First cell' }]}
  />
)

const contentGrid = (headingLevel?: HeadingLevel) => (
  <ContentGrid01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    entries={[{ id: 'first', title: 'First entry', summary: 'A sentence about it.' }]}
  />
)

const download = (headingLevel?: HeadingLevel) => (
  <Download01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    files={[
      { id: 'first', name: 'artifact.zip', href: '/a.zip', hrefLabel: 'Download the archive' },
    ]}
  />
)

const changelog = (headingLevel?: HeadingLevel) => (
  <Changelog01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    releases={[
      {
        id: 'r1',
        version: '1.0.0',
        entries: [{ id: 'e1', kind: 'added', title: 'First record' }],
      },
    ]}
  />
)


/*
 * The operate tier's nine Blocks that draw a titled card, and the two that draw
 * one two levels down.
 *
 * The three at offset 2 are the ones worth stopping on. A directory member sits
 * under a category, a runbook check under a group of checks, and a record in a
 * changelog under its release. Each is a member of a collection the Block also
 * draws a heading for, so the outline has to say so rather than flattening a group
 * and its members onto the same depth, and each is two levels below the section
 * rather than one. That is the third answer the
 * `offset` column now carries, and it is why the column is a three-member set.
 *
 * The Blocks that are deliberately absent each drew no card title: a table's
 * column heads are not headings, a row is not a card, a list of forty queue items
 * would put forty entries in the outline a reader has to walk past, and a
 * profile's one heading is the person. Those absences are the point of the file.
 */
const dashboard = (headingLevel?: HeadingLevel) => (
  <Dashboard01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    metrics={[{ key: 'one', label: 'One label', value: '1' }]}
    panels={[{ id: 'first', title: 'First panel', children: <p>One sentence.</p> }]}
  />
)

const chartCard = (headingLevel?: HeadingLevel) => (
  <ChartCard01 {...(headingLevel ? { headingLevel } : {})} title="First panel" figure={<p>One figure.</p>} />
)

const projectDashboard = (headingLevel?: HeadingLevel) => (
  <ProjectDashboard01
    {...(headingLevel ? { headingLevel } : {})}
    name="Section heading"
    panels={[{ id: 'first', title: 'First panel', children: 'One thing in the panel.' }]}
  />
)

const addressBook = (headingLevel?: HeadingLevel) => (
  <AddressBook01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    value=""
    onValueChange={() => {}}
    label="Search"
    clearLabel="Clear"
    records={[{ id: 'first', name: 'First record', lines: ['One line'] }]}
    empty="No record matches that."
  />
)

const intake = (headingLevel?: HeadingLevel) => (
  <Intake01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    items={[{ id: 'first', source: 'a.feed', subject: 'First subject', at: '2026-01-01' }]}
    empty="Nothing has arrived."
  />
)

const directory = (headingLevel?: HeadingLevel) => (
  <Directory01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    value=""
    onValueChange={() => {}}
    label="Search"
    clearLabel="Clear"
    categories={[
      {
        id: 'first',
        title: 'First category',
        members: [{ id: 'first', name: 'First member', href: '/first', hrefLabel: 'Go there' }],
      },
    ]}
    empty="Nothing matches that."
  />
)

const opsChecklist = (headingLevel?: HeadingLevel) => (
  <OpsChecklist01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    groups={[{ id: 'first', title: 'First group', checks: [{ id: 'first', name: 'First check' }] }]}
    empty="Nothing checked."
  />
)

const kanban = (headingLevel?: HeadingLevel) => (
  <Kanban01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    columns={[
      { id: 'now', label: 'Now', cards: [{ id: 'first', title: 'First card' }] },
    ]}
  />
)



/*
 * The translated tier's four Blocks that draw a titled part, all of them at one
 * level below the section.
 *
 * The twenty Blocks beside them in this wave that draw no titled card are the
 * point, not the omission. A credential screen puts a Card around a form and no
 * CardTitle in it, a table's column head is not a heading, and a row in a list of
 * billing sources is a row a reader scans rather than a candidate they navigate
 * to. Bundle01 is the fourth absence here and the easiest to get wrong: its two
 * headings are the section heading and the summary heading, and an item name in a
 * selection list is a list item's content rather than a candidate a reader navigates
 * to. Adding a row with a wrong offset would put a false claim in the one file
 * that exists to hold the consistency, so each absence is deliberate and the JSDoc on
 * the Block argues it in its own words.
 */

const offeringList = (headingLevel?: HeadingLevel) => (
  <OfferingList01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    offerings={[{ id: 'first', name: 'First capability' }]}
    empty="Nothing here matches that."
  />
)

const offeringCategories = (headingLevel?: HeadingLevel) => (
  <OfferingCategories01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    categories={[{ id: 'first', name: 'First kind', description: 'A sentence about it.' }]}
    empty="Nothing here matches that."
  />
)

const provisioning = (headingLevel?: HeadingLevel) => (
  <Provisioning01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    steps={[
      { id: 'first', name: 'First step', fields: [{ key: 'name', label: 'Name', kind: 'Input', required: true }] },
      { id: 'second', name: 'Second step', fields: [] },
    ]}
    backLabel="Back"
    nextLabel="Continue"
    confirmLabel="Create it"
    onConfirm={() => {}}
  />
)

const shortlist = (headingLevel?: HeadingLevel) => (
  <Shortlist01
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    items={[{ id: 'first', name: 'SFTP ingest' }]}
    empty="Nothing here."
  />
)


/*
 * The two Pages that draw a titled card, and they are the two answers in this
 * file that only a Page can give.
 *
 * `PricingPage` is a plan card one level below the page heading, which is the
 * ordinary answer. `ContactPage` is an office name TWO levels down, because an
 * office nests under the offices band heading, which itself nests under the page
 * heading, and flattening the two would put an address at the same depth as the
 * band that introduces it. The other eight Pages need no row: a Page that
 * composes Blocks draws the titled cards those Blocks already carry, and those
 * Blocks are already rows in this file. `ErrorPage` draws no card at all.
 */
const pricingPage = (headingLevel?: HeadingLevel) => (
  <PricingPage
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    plans={[{ id: 'first', name: 'First plan', price: { amount: 0, currency: 'GBP' } }]}
  />
)

const contactPage = (headingLevel?: HeadingLevel) => (
  <ContactPage
    {...(headingLevel ? { headingLevel } : {})}
    title="Section heading"
    form={{ title: 'Write to the desk' }}
    fields={[{ id: 'name', label: 'Name', type: 'text', required: true }]}
    onSubmit={() => {}}
    submitLabel="Send"
    officesLabel="Where we are"
    offices={[{ id: 'london', name: 'London', lines: ['One street'] }]}
  />
)

/* -- Every Item that draws a titled card --------------------------------------- */

/**
 * The whole list, in one array, because the consistency *is* the assertion. A new
 * Block that draws a titled card is added here, and adding it here is what makes
 * the suite notice when it answers the question differently from the other five.
 *
 * `offset` is the one thing the answers disagree about, and it is carried in the
 * table rather than assumed for all of them. A Block that opens with a Section
 * heading puts its card titles *below* that heading, one step down. A Block that
 * draws no Section heading has nothing to nest under, so its card title is the one
 * heading it renders and takes the level directly. Both answers are right; a test
 * that assumed one of them for all six would be asserting a rule the catalogue does
 * not have, and the first version of this did exactly that and failed on the three
 * Blocks that answer the other way.
 *
 * A third answer exists and has a row. `Changelog01` nests a group heading one
 * level below the section and each record's title one level below the group, so a
 * record's title is two levels down. A release IS a group, and a record IS a
 * member of it, so the outline has to say so rather than flattening both onto the
 * same depth. `offset: 2` is that answer, and widening the set from two to three
 * is the honest response to it rather than a special case bolted on the side.
 */
const TITLED_CARDS: Array<{
  item: string
  /** The element whose level is derived from the section it sits in. */
  cardTitle: string
  /**
   * `1` when the Block opens with a Section heading and the card title nests below
   * it; `0` when the card title is the Block's one heading and takes the level as
   * given; `2` when the card title nests below a group heading that itself nests
   * below the section.
   */
  offset: 0 | 1 | 2
  /** The level the Block defaults to, so the expected default level follows from it. */
  defaultLevel: HeadingLevel
  /** The element under test, at a given level. */
  render: (headingLevel?: HeadingLevel) => React.ReactElement
}> = [
  { item: 'FeatureGrid01', cardTitle: 'First item', offset: 1, defaultLevel: 'h2', render: featureGrid },
  { item: 'Pricing01', cardTitle: 'First plan', offset: 1, defaultLevel: 'h2', render: pricing },
  { item: 'StackGrid01', cardTitle: 'Bedrock', offset: 1, defaultLevel: 'h2', render: stackGrid },
  { item: 'AuthForm01', cardTitle: 'Sign in', offset: 0, defaultLevel: 'h2', render: authForm },
  { item: 'SettingsPanel01', cardTitle: 'Workspace settings', offset: 0, defaultLevel: 'h2', render: settingsPanel },
  { item: 'AuthPage', cardTitle: 'New here', offset: 0, defaultLevel: 'h2', render: authPage },
  { item: 'Hero03', cardTitle: 'First point', offset: 1, defaultLevel: 'h2', render: hero03 },
  { item: 'FeatureRows01', cardTitle: 'First row', offset: 1, defaultLevel: 'h2', render: featureRows },
  { item: 'Bento01', cardTitle: 'First cell', offset: 1, defaultLevel: 'h2', render: bento },
  { item: 'ContentGrid01', cardTitle: 'First entry', offset: 1, defaultLevel: 'h2', render: contentGrid },
  { item: 'Download01', cardTitle: 'artifact.zip', offset: 1, defaultLevel: 'h2', render: download },
  { item: 'Changelog01', cardTitle: 'First record', offset: 2, defaultLevel: 'h2', render: changelog },
  { item: 'OfferingList01', cardTitle: 'First capability', offset: 1, defaultLevel: 'h2', render: offeringList },
  { item: 'OfferingCategories01', cardTitle: 'First kind', offset: 1, defaultLevel: 'h2', render: offeringCategories },
  { item: 'Provisioning01', cardTitle: 'First step', offset: 1, defaultLevel: 'h2', render: provisioning },
  { item: 'Shortlist01', cardTitle: 'SFTP ingest', offset: 1, defaultLevel: 'h2', render: shortlist },
  { item: 'PricingPage', cardTitle: 'First plan', offset: 1, defaultLevel: 'h1', render: pricingPage },
  { item: 'ContactPage', cardTitle: 'London', offset: 2, defaultLevel: 'h1', render: contactPage },
  { item: 'Dashboard01', cardTitle: 'First panel', offset: 1, defaultLevel: 'h2', render: dashboard },
  { item: 'ChartCard01', cardTitle: 'First panel', offset: 1, defaultLevel: 'h2', render: chartCard },
  { item: 'ProjectDashboard01', cardTitle: 'First panel', offset: 1, defaultLevel: 'h2', render: projectDashboard },
  { item: 'AddressBook01', cardTitle: 'First record', offset: 1, defaultLevel: 'h2', render: addressBook },
  { item: 'Kanban01', cardTitle: 'First card', offset: 1, defaultLevel: 'h2', render: kanban },
  { item: 'Intake01', cardTitle: 'First subject', offset: 1, defaultLevel: 'h2', render: intake },
  { item: 'Directory01', cardTitle: 'First member', offset: 2, defaultLevel: 'h2', render: directory },
  { item: 'OpsChecklist01', cardTitle: 'First check', offset: 2, defaultLevel: 'h2', render: opsChecklist },
]

/**
 * The numeric level a card title must render at, given the Block's own level.
 *
 * `offset === 1` means the Block opens with a Section heading and the card title
 * nests below it, so it is `childLevel(at)`. `offset === 0` means the card title is
 * the Block's one heading and there is nothing to nest under, so it is `at` itself.
 * `offset === 2` means it nests below a group heading, so it is
 * `childLevel(childLevel(at))`.
 *
 * `childLevel` clamps at `h6` rather than wrapping, so the double step at `h5`
 * returns `h6` and not `h1`. That is the same answer the derivation itself gives
 * and the test uses the same function rather than a table of its own, which is what
 * makes this an assertion about the Block and not a restatement of the rule.
 */
const expected = (at: HeadingLevel, offset: 0 | 1 | 2) =>
  Number([at, childLevel(at), childLevel(childLevel(at))][offset].slice(1))

describe('a card title is a heading', () => {
  for (const { item, cardTitle, offset, defaultLevel, render: at } of TITLED_CARDS) {
    it(`${item} renders "${cardTitle}" as a heading`, () => {
      render(at())
      // The role, not the tag: this is what a reader navigating by heading gets,
      // and a `div` with the right class would pass a tag-name assertion while
      // staying invisible to the outline.
      expect(screen.getByRole('heading', { name: cardTitle })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: cardTitle })).toHaveProperty(
        'tagName',
        `H${expected(defaultLevel, offset)}`,
      )
    })
  }
})

/* -- The level follows the document, not the Block ----------------------------- */

describe('the level is derived, so a Block follows the document it is composed in', () => {
  for (const { item, cardTitle, offset, render: at } of TITLED_CARDS) {
    it(`${item} moves its card title when its heading level moves`, () => {
      const { unmount } = render(at('h4'))
      expect(screen.getByRole('heading', { name: cardTitle })).toHaveProperty(
        'tagName',
        `H${expected('h4', offset)}`,
      )
      unmount()

      render(at('h2'))
      expect(screen.getByRole('heading', { name: cardTitle })).toHaveProperty(
        'tagName',
        `H${expected('h2', offset)}`,
      )
    })
  }
})

describe('a card title nests under the section that introduces it', () => {
  it('FeatureGrid01 puts its card titles one level below its own section heading', () => {
    render(featureGrid('h2'))
    // The section is `h2` and its five titles are `h3`s, not five more `h2`s,
    // which is what four-or-more sibling sections would be.
    expect(screen.getByRole('heading', { name: 'Section heading' })).toHaveProperty(
      'tagName',
      'H2',
    )
    expect(screen.getByRole('heading', { name: 'First item' })).toHaveProperty('tagName', 'H3')
    expect(screen.getByRole('heading', { name: 'Second item' })).toHaveProperty('tagName', 'H3')
  })

  it('and moves the whole set together, which is the point of deriving it', () => {
    // This is the company site's case: a feature section composed under an `h3`
    // wants `h4` card titles, and a Block that hardcoded `h3` would announce five
    // siblings of the section that introduces them.
    render(featureGrid('h3'))
    expect(screen.getByRole('heading', { name: 'Section heading' })).toHaveProperty(
      'tagName',
      'H3',
    )
    expect(screen.getByRole('heading', { name: 'First item' })).toHaveProperty('tagName', 'H4')
    expect(screen.getByRole('heading', { name: 'Second item' })).toHaveProperty('tagName', 'H4')
  })
})

describe('SettingsPanel01 nests its groups under its own title', () => {
  it('a group heading is one step below the panel title, not a hardcoded h3', () => {
    render(settingsPanel('h2'))
    // The groups were a literal `h3` regardless of where the panel was composed,
    // so a panel placed under an `h2` in a document whose sections are `h2` put a
    // group at the same depth as the panel that introduces it.
    expect(screen.getByRole('heading', { name: 'Workspace settings' })).toHaveProperty(
      'tagName',
      'H2',
    )
    expect(screen.getByRole('heading', { name: 'General' })).toHaveProperty('tagName', 'H3')
  })

  it('and the group moves with the panel', () => {
    render(settingsPanel('h4'))
    expect(screen.getByRole('heading', { name: 'Workspace settings' })).toHaveProperty(
      'tagName',
      'H4',
    )
    expect(screen.getByRole('heading', { name: 'General' })).toHaveProperty('tagName', 'H5')
  })
})

describe('AuthPage keeps its two regions at one depth', () => {
  it('the form and the aside are siblings, not a heading inside a heading', () => {
    render(authPage('h2'))
    const form = screen.getByRole('heading', { name: 'Sign in' })
    const aside = screen.getByRole('heading', { name: 'New here' })
    expect(form).toHaveProperty('tagName', 'H2')
    // Two regions that announced themselves at different depths would read as one
    // inside the other, and nothing in the two-column layout says so.
    expect(aside).toHaveProperty('tagName', 'H2')
  })
})

describe('a card with no title asked for renders no heading', () => {
  it('FeatureGrid01 with no features draws no empty heading', () => {
    render(<FeatureGrid01 title="Section heading" features={[]} />)
    expect(screen.queryAllByRole('heading')).toHaveLength(1)
  })
})
