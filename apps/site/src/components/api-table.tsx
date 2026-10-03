import api from '@/generated/api.json'

type Row = {
  name: string
  type: string
  required: boolean
  default: string
  description: string
}

type ExportEntry = { name: string; rows: Row[]; inherited: string[] }

const TABLE = api as Record<string, { exports: ExportEntry[] }>

/**
 * The mark that says a prop has to be passed.
 *
 * **It is `*` because that is already this system's mark, and a site that
 * documents the system is not free to invent a second one.** `Label` draws a
 * `*` for a required field and calls the character a default rather than a law
 * precisely because the convention belongs to the reader's locale; the site is a
 * reader, so it takes the default. It used to draw a bare `?` on an optional prop
 * instead, which was three problems wearing one glyph: nothing on the page said
 * what it meant, a screen reader announced it as "question mark", and it pointed
 * the opposite way from the `*` a reader meets in a Prism form, so a reader who
 * had learned the mark had to work out that here the same idea was drawn the other
 * way round.
 *
 * **Why the mark moved to the required prop rather than gaining a partner.** A
 * table of 2,520 rows across the catalogue is roughly three optional props for
 * every one required, so marking the required rows puts about 750 marks on the
 * page and marking the optional rows would put about 1,770 question marks on it.
 * `*` on required and nothing on optional is what TypeDoc, the npm docs and MDN
 * all do, and the legend below the table states the rule, so a sighted reader
 * loses nothing by the glyph leaving the optional rows. The type column still
 * carries the `?` a TypeScript reader expects, because the declaration says so.
 *
 * **The word is there for a reader who cannot see the mark, and the mark is
 * hidden from a reader who cannot need the word.** A `?` on its own announces as
 * punctuation; `required` and `optional` announce as English. So each cell carries
 * one visibly hidden word and, where there is a mark to hide, one hidden glyph.
 * The absence of the glyph is what stops `Label`'s mistake being repeated here:
 * `Label` hides its `*` because the control's own `required` is announced, and a
 * table cell has no such attribute, so the word is the only thing that reaches
 * either reader.
 */
const REQUIRED_MARK = '*'

/**
 * The generated API reference.
 *
 * Rows come from `src/generated/api.json`, which `scripts/generate-api.mjs`
 * extracts from the emitted `.d.ts`. A component whose props are all inherited
 * (for example `React.ComponentProps<'div'>`) reports that inheritance rather
 * than inventing rows, and a reported default is the declaration's own, never a
 * demo's value.
 *
 * **Every table is named, and the caption is the name.** `Table`'s own JSDoc asks
 * for a `TableCaption` unless an adjacent heading already names the table, and
 * the heading above this one is "API reference", which names the SECTION rather
 * than any one table: a reader listing the tables on an Item with five exports
 * would otherwise find five identical unnamed entries. So each caption names the
 * part the table is about, which is the one thing that tells `AccordionItem` from
 * `AccordionTrigger` in a list, and it is visually hidden rather than visible
 * because the `<h3>` above it already says the same word in the compound case and
 * the section heading says "API reference" in the simple one. A caption nobody
 * sees and a screen-reader table list carries is the one that is worth having; a
 * second visible heading saying "AccordionItem props" above a table headed
 * "AccordionItem" is noise.
 *
 * The name is not invented from the slug. `part.name` is the export the rows were
 * extracted from, so it is the same word the `<h3>` prints, and a slug such as
 * `data-display/table-sort` would have made a caption of it wrong.
 */
export function ApiTable({ slug }: { slug: string }) {
  const entry = TABLE[slug]
  if (!entry || entry.exports.length === 0) {
    return <p className="text-muted-foreground text-sm">No API reference is generated yet.</p>
  }

  const compound = entry.exports.length > 1
  /*
   * One legend for the whole section rather than one per table, because the rule is
   * one rule and a compound Item would otherwise print it five times.
   */
  const drawn = entry.exports.some((part) => part.rows.length > 0)

  return (
    <div className="flex flex-col gap-8">
      {entry.exports.map((part) => (
        <div key={part.name} className="flex flex-col gap-3">
          {compound ? (
            <h3 className="font-mono text-sm font-medium tracking-tight">{part.name}</h3>
          ) : null}

          {part.rows.length ? (
            <div className="border-border overflow-x-auto rounded-lg border">
              <table className="w-full border-collapse text-left text-sm">
                {/*
                  First child, as the element requires, and the table's name. It
                  carries the part name rather than the page's, because the page's
                  `<h1>` is already the Item and a table list that repeats it tells
                  a reader nothing; the part name is the one word that tells
                  `AccordionItem` from `AccordionTrigger` when they are listed
                  side by side.
                */}
                <caption className="sr-only">{part.name} props</caption>
                <thead className="bg-muted/40">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Prop</th>
                    <th scope="col" className="px-3 py-2 font-medium">Type</th>
                    <th scope="col" className="px-3 py-2 font-medium">Default</th>
                    <th scope="col" className="px-3 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {part.rows.map((row) => (
                    <tr key={row.name} className="border-border border-t align-top">
                      <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                        {row.name}
                        {row.required ? (
                          <>
                            {/*
                              The space is inside the hidden glyph so a sighted reader
                              sees "value *" and not "value*", and so the two halves
                              are one mark rather than a name followed by a stray
                              character.
                            */}
                            <span aria-hidden className="text-muted-foreground">
                              {' '}
                              {REQUIRED_MARK}
                            </span>
                            <span className="sr-only">, required</span>
                          </>
                        ) : (
                          <span className="sr-only">, optional</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{row.type}</td>
                      <td className="text-muted-foreground px-3 py-2 font-mono text-xs">
                        {row.default}
                      </td>
                      <td className="text-muted-foreground px-3 py-2">
                        {row.description || <span className="font-sans">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {part.inherited.length ? (
            <p className="text-muted-foreground text-sm">
              Inherits{' '}
              {part.inherited.map((type, index) => (
                <span key={type}>
                  {index > 0 ? ', ' : ''}
                  <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{type}</code>
                </span>
              ))}
              .
            </p>
          ) : null}

          {part.rows.length === 0 && part.inherited.length === 0 ? (
            <p className="text-muted-foreground text-sm">No documented props.</p>
          ) : null}
        </div>
      ))}

      {drawn ? (
        /*
         * The legend, stated once and in words rather than left to the glyph. It is
         * below the tables rather than above them because the mark is read in
         * context: a reader who meets a `*` four rows into a table and has been
         * told what it means has not had to guess, and a reader who reaches the end
         * of the section and meets it then has the same sentence. Its own `*` is
         * hidden for the same reason the cells' is.
         */
        <p className="text-muted-foreground text-sm">
          <span aria-hidden>{REQUIRED_MARK}</span> marks a prop you have to pass. Every
          other prop is optional.
        </p>
      ) : null}
    </div>
  )
}