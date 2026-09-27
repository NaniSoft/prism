import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section'

/** A section band with a heading, at a heading level the demo owns. */
export default function SectionDemo() {
  return (
    <Section className="bg-muted/30 rounded-xl">
      <SectionHeading
        as="h3"
        eyebrow="Release 2.4"
        title="What changed"
        description="Three fixes and one new block. No token changes."
        align="left"
        className="mb-6"
      />
      <p className="text-muted-foreground text-sm">
        The section owns the container width and the vertical rhythm, so this
        band keeps the page&apos;s spacing without re-declaring it.
      </p>
    </Section>
  )
}
