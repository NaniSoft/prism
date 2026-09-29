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
import { FeatureGrid01 } from '../src/blocks/feature-grid-01'
import { Pricing01 } from '../src/blocks/pricing-01'
import { SettingsPanel01 } from '../src/blocks/settings-panel-01'
import { StackGrid01 } from '../src/blocks/stack-grid-01'
import { AuthPage } from '../src/pages/auth-page'
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
    plans={[{ name: 'First plan', price: '$0', features: ['One line'], cta: 'Choose' }]}
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
    fields={[{ id: 'email', label: 'Email', type: 'email' }]}
  />
)

const settingsPanel = (headingLevel?: HeadingLevel) => (
  <SettingsPanel01
    {...(headingLevel ? { headingLevel } : {})}
    title="Workspace settings"
    sections={[
      { id: 'general', title: 'General', fields: [{ id: 'name', label: 'Name', kind: 'text' }] },
    ]}
  />
)

const authPage = (headingLevel?: HeadingLevel) => (
  <AuthPage
    {...(headingLevel ? { headingLevel } : {})}
    form={{
      title: 'Sign in',
      submitLabel: 'Sign in',
      fields: [{ id: 'email', label: 'Email', type: 'email' }],
    }}
    aside={{ title: 'New here', description: 'An account takes a moment.' }}
  />
)

/* -- Every Item that draws a titled card --------------------------------------- */

/**
 * The whole list, in one array, because the consistency *is* the assertion. A new
 * Block that draws a titled card is added here, and adding it here is what makes
 * the suite notice when it answers the question differently from the other five.
 *
 * `offset` is the one thing the two answers disagree about, and it is carried in the
 * table rather than assumed for all of them. A Block that opens with a Section
 * heading puts its card titles *below* that heading, one step down. A Block that
 * draws no Section heading has nothing to nest under, so its card title is the one
 * heading it renders and takes the level directly. Both answers are right; a test
 * that assumed one of them for all six would be asserting a rule the catalogue does
 * not have, and the first version of this did exactly that and failed on the three
 * Blocks that answer the other way.
 */
const TITLED_CARDS: Array<{
  item: string
  /** The element whose level is derived from the section it sits in. */
  cardTitle: string
  /**
   * `1` when the Block opens with a Section heading and the card title nests below
   * it; `0` when the card title is the Block's one heading and takes the level as
   * given.
   */
  offset: 0 | 1
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
]

/**
 * The numeric level a card title must render at, given the Block's own level.
 *
 * `offset === 1` means the Block opens with a Section heading and the card title
 * nests below it, so it is `childLevel(at)`. `offset === 0` means the card title is
 * the Block's one heading and there is nothing to nest under, so it is `at` itself.
 */
const expected = (at: HeadingLevel, offset: 0 | 1) =>
  Number((offset === 1 ? childLevel(at) : at).slice(1))

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
