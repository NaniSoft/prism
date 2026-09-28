import { NotFoundPage } from '@nanisoft/prism-ui/pages/not-found-page'

/** The not-found screen: the code as the h1, one sentence, and the ways out. */
export default function NotFoundPageDemo() {
  return (
    <NotFoundPage
      code="404"
      title="No node here."
      description="The estate is fully mapped. This URL is not in the graph."
      linksLabel="Ways out"
      links={[
        { label: 'Read the docs', href: '#docs' },
        { label: 'Back to the landing', href: '#landing' },
      ]}
    />
  )
}
