import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BlogPostPage } from '../src/pages/blog-post-page'

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
