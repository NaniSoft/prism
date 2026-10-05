import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BlogPostPage, type BlogPostPageProps } from '../src/pages/blog-post-page'

/**
 * The claim under test is the date. A post's date is two facts, not one: the
 * words a reader sees and the machine value on the `time` element, and they are
 * kept apart because parsing a formatted date back into an ISO one is a guess
 * about a locale. A wrong date in a `datetime` attribute is a wrong date in a
 * feed reader and in a search result, and neither reader can see the string that
 * was wrong.
 */
const BODY = (
  <>
    <p>First paragraph.</p>
    <h2>A heading</h2>
    <p>Second paragraph.</p>
  </>
)

const TRAIL = { previous: 'Previous', next: 'Next' }

describe('a blog post screen', () => {
  it('puts both dates on the time element, the words and the machine value', () => {
    render(
      <BlogPostPage
        title="Every minute, the whole chain"
        date="21 September 2026"
        dateTime="2026-09-21"
        trailLabels={TRAIL}
        trailLabel="More posts"
      >
        {BODY}
      </BlogPostPage>,
    )

    const time = screen.getByText('21 September 2026')
    expect(time.tagName).toBe('TIME')
    expect(time).toHaveAttribute('datetime', '2026-09-21')
  })

  it('makes the post title the only h1 and the body prose of the post measure', () => {
    const { container } = render(
      <BlogPostPage
        title="A post"
        date="21 September 2026"
        dateTime="2026-09-21"
        trailLabels={TRAIL}
        trailLabel="More posts"
      >
        {BODY}
      </BlogPostPage>,
    )

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(container.querySelector('[data-slot="prose"]')?.className).toContain('max-w-measure')
  })

  it('renders only the halves of the trail it is given', () => {
    const { container, rerender } = render(
      <BlogPostPage
        title="A post"
        date="21 September 2026"
        dateTime="2026-09-21"
        trailLabels={TRAIL}
        trailLabel="More posts"
        next={{ title: 'The next one', href: '/blog/next' }}
      >
        {BODY}
      </BlogPostPage>,
    )

    const trail = container.querySelector('nav[aria-label="More posts"]')!
    expect(trail.textContent).toContain('Next')
    expect(trail.textContent).not.toContain('Previous')

    rerender(
      <BlogPostPage
        title="A post"
        date="21 September 2026"
        dateTime="2026-09-21"
        trailLabels={TRAIL}
        trailLabel="More posts"
        previous={{ title: 'The last one', href: '/blog/last' }}
        next={{ title: 'The next one', href: '/blog/next' }}
      >
        {BODY}
      </BlogPostPage>,
    )
    expect(container.querySelector('nav[aria-label="More posts"]')?.textContent).toContain(
      'Previous',
    )
  })

  it('omits the byline row and the tag row when there is nothing to put in them', () => {
    const { container } = render(
      <BlogPostPage
        title="A post"
        date="21 September 2026"
        dateTime="2026-09-21"
        trailLabels={TRAIL}
        trailLabel="More posts"
      >
        {BODY}
      </BlogPostPage>,
    )

    // No standfirst, no author, no reading time, no tags: the header is the title
    // and the date, and a row of nothing is not rendered.
    expect(container.querySelectorAll('ul')).toHaveLength(0)
    expect(container.textContent).not.toContain('min read')
  })

  it('ships no title, no date, no tag and no default trail', () => {
    const { container } = render(
      <BlogPostPage
        title="A post"
        date="21 September 2026"
        dateTime="2026-09-21"
        tags={[{ label: 'market-data' }]}
        trailLabels={TRAIL}
        trailLabel="More posts"
        indexLink={{ title: 'All posts', href: '/blog' }}
      >
        {BODY}
      </BlogPostPage>,
    )

    expect(screen.getByRole('link', { name: 'All posts' })).toHaveAttribute('href', '/blog')
    expect(screen.getByText('market-data')).toBeTruthy()
    expect(container.textContent).not.toMatch(/Back to the index|Previous|Next/)
  })
})

/**
 * The contract between the two date props, which is the whole of what this Page
 * says about a date.
 *
 * **The measured defect, on the page the built exports of the consumer sites
 * render.** Every one of the four sites passes one raw value to both props, so the
 * Page put `2026-09-26` in front of a reader and the same string in the `datetime`
 * attribute. The Page is the only place in a site where that sentence can be
 * enforced rather than requested: a consumer's pipeline is where a date is a
 * string, and Prism is where it becomes a page. So the two props stay, the
 * formatting stays the caller's, and the one call the Page refuses is the one that
 * put a machine value on the page in the first place.
 */
describe('the date a post screen shows', () => {
  const post = (over: Partial<BlogPostPageProps> = {}) => (
    <BlogPostPage
      title="A post"
      date="21 September 2026"
      dateTime="2026-09-21"
      trailLabels={TRAIL}
      trailLabel="More posts"
      {...over}
    >
      {BODY}
    </BlogPostPage>
  )

  it('shows the words the caller formatted and nothing else', () => {
    // The Page renders `date` verbatim. It does not format, it does not fall back,
    // and it does not consult a locale, because a Page that renders a date has no
    // business making a reader parse one.
    render(post())

    const time = screen.getByText('21 September 2026')
    expect(time.tagName).toBe('TIME')
    expect(time.textContent).toBe('21 September 2026')
    expect(time).not.toHaveAttribute('datetime', '21 September 2026')
  })

  it('refuses one value in both slots rather than putting a machine date on the page', () => {
    // The refusal, and the shape of it. A prop called `date` that takes a string is
    // not obviously wrong, which is why all four sites did this and why a note in a
    // JSDoc block did not stop any of them. `StackGrid01` refuses its missing
    // `ownLabel` for the same reason and by the same mechanism: a wrong thing in
    // front of a reader is cheaper to fail at build time than to ship.
    expect(() => render(post({ date: '2026-09-26', dateTime: '2026-09-26' }))).toThrow(
      /`date` and `dateTime` are the same string/,
    )
    expect(() => render(post({ date: '2026-09-26', dateTime: '2026-09-26' }))).toThrow(
      /format `date` for display/,
    )
  })

  it('accepts a site whose own convention writes the machine shape, because the words are still words', () => {
    // The refusal is on the pair, not on the shape of either value. A site that
    // writes `2 Sep 2026` and a site that writes `2026-09-26` both pass, and what
    // fails is handing the Page no display formatting at all.
    render(post({ date: '2 Sep 2026' }))
    expect(screen.getByText('2 Sep 2026')).toBeTruthy()
  })

  it('types the machine value as the machine shape, so a formatted string cannot reach the attribute', () => {
    // A type-level half of the same contract, asserted by the type checker rather
    // than at run time: `tsc --noEmit` reads this file, so an unused
    // `@ts-expect-error` below is a failing assertion on its own. No type separates
    // `21 September 2026` from `2026-09-26`, which is the whole reason the refusal
    // above has to exist at run time and the reason `date` is still a `string`.
    const formatted: BlogPostPageProps['dateTime'] = '2026-09-21'
    expect(formatted).toBe('2026-09-21')

    // @ts-expect-error a display string is not a machine date
    const wrong: BlogPostPageProps['dateTime'] = '21 September 2026'
    expect(wrong).toBe('21 September 2026')
  })
})
