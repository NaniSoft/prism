import {
  Heading,
  Text,
} from '@nanisoft/prism-ui/components/typography'

/** The scale: a display heading, a subheading and both text tones. */
export default function TypographyDemo() {
  return (
    <div className="flex max-w-measure flex-col gap-3">
      <Heading as="h3" size="3xl">
        Release notes
      </Heading>
      <Text tone="muted">What shipped in the last two weeks, in reading order.</Text>
      <Heading as="h4" size="xl">
        Fixes
      </Heading>
      <Text>Three defects in the table toolbar and one in the theme switcher.</Text>
      <Text as="span" size="sm" tone="muted">
        Updated 12 August.
      </Text>
    </div>
  )
}
