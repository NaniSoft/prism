import { Mark } from '@nanisoft/prism-ui/components/mark'

/** The three cases a result row has to survive: one match, several, and a query that hits nothing. */
const RESULTS = [
  { text: 'Design tokens and pack descriptors', match: 'pack' },
  { text: 'The one stylesheet a consumer imports', match: 'stylesheet' },
  { text: 'A hairline rule that divides content', match: 'hairline' },
]

const rangeOf = (text: string, needle: string) => {
  const start = text.toLowerCase().indexOf(needle.toLowerCase())
  return start === -1 ? [] : [{ start, end: start + needle.length }]
}

/** A result list where the matched characters are the only thing emphasised. */
export default function MarkDemo() {
  return (
    <ul className="flex max-w-measure-narrow flex-col gap-2 text-sm">
      {RESULTS.map((result) => (
        <li key={result.text} className="border-border border-b pb-2 last:border-b-0">
          <Mark text={result.text} ranges={rangeOf(result.text, result.match)} />
        </li>
      ))}
      {RESULTS.map((result) => (
        <li key={`${result.text}-unmatched`} className="text-muted-foreground">
          <Mark text={result.text} ranges={[]} />
        </li>
      ))}
    </ul>
  )
}
