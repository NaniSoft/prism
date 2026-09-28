import { BlogPostPage } from '@nanisoft/prism-ui/pages/blog-post-page'

/** A post: the title, the standfirst, both dates, tags, the body and the trail. */
export default function BlogPostPageDemo() {
  return (
    <BlogPostPage
      title="Every minute, the whole chain"
      description="What live full-chain capture at index scale actually takes: the spike, then production, then Kubernetes."
      date="21 September 2026"
      dateTime="2026-09-21"
      author="NaniSoft"
      readingTime="6 min read"
      tags={[{ label: 'market-data' }, { label: 'collector' }]}
      trailLabels={{ previous: 'Previous', next: 'Next' }}
      trailLabel="More posts"
      previous={{ title: 'One feed to research them all', href: '#one-feed' }}
      next={{ title: 'Multi-agent research, mapped', href: '#multi-agent' }}
      indexLink={{ title: 'All posts', href: '#all' }}
    >
      <p>
        The claim sounds like a feature. It is a measurement with a timestamp on
        it, and it started as a suspicion that it was impossible.
      </p>
      <h2>The assumption that was backwards</h2>
      <p>
        Going in, full-chain-per-minute looked like a streaming problem. It was a
        counting problem, and the count had to fit in a minute.
      </p>
      <ul>
        <li>Every strike, call and put.</li>
        <li>Open interest, implied volatility and the Greeks.</li>
        <li>Index futures, index spot and the volatility index.</li>
      </ul>
    </BlogPostPage>
  )
}
