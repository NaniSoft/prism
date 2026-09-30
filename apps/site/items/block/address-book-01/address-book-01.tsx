'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'

import { AddressBook01, type AddressBook01Record } from '@nanisoft/prism-ui/blocks/address-book-01'

/**
 * Six records with every field in one of its states, so the type's unions are
 * visible on the page rather than only in a signature.
 *
 * The first two carry both contact links, the third carries only a telephone link, the
 * fourth carries only an email link, and the last two carry neither. A Demo with all
 * six shaped alike would prove nothing about the refusal that matters most here,
 * which is that a telephone link without a sentence is a run of characters read one at
 * a time.
 */
const RECORDS: AddressBook01Record[] = [
  {
    id: 'settlements',
    name: 'NaniSoft settlements',
    organisation: 'NaniSoft',
    lines: ['Unit 4, Kiln Wharf', 'Bristol BS1 6QH'],
    tag: 'Bristol',
    phone: '+441173000100',
    phoneLabel: 'Call the settlements desk',
    email: 'settlements@example.com',
    emailLabel: 'Write to settlements',
    actions: <Button size="sm" variant="ghost">Edit</Button>,
  },
  {
    id: 'observatory',
    name: 'The observatory',
    organisation: 'NaniSoft',
    lines: ['Second floor, 41 Corn Street', 'Bristol BS1 1HT'],
    tag: 'Bristol',
    phone: '+441173000200',
    phoneLabel: 'Call the observatory',
    email: 'observatory@example.com',
    emailLabel: 'Write to the observatory',
    actions: <Button size="sm" variant="ghost">Edit</Button>,
  },
  {
    id: 'kiln-wharf',
    name: 'Kiln Wharf stores',
    lines: ['Unit 9, Kiln Wharf', 'Bristol BS1 6QH'],
    tag: 'Bristol',
    phone: '+441173000300',
    phoneLabel: 'Call the stores',
    actions: <Button size="sm" variant="ghost">Edit</Button>,
  },
  {
    id: 'london-desk',
    name: 'The London desk',
    organisation: 'NaniSoft',
    lines: ['18 Rivington Street', 'London EC2A 3DU'],
    tag: 'London',
    email: 'london@example.com',
    emailLabel: 'Write to the London desk',
    actions: <Button size="sm" variant="ghost">Edit</Button>,
  },
  {
    id: 'cardiff-unit',
    name: 'The Cardiff unit',
    organisation: 'NaniSoft',
    lines: ['Third floor, 14 Womanby Street', 'Cardiff CF10 1BR'],
    tag: 'Cardiff',
    actions: <Button size="sm" variant="ghost">Edit</Button>,
  },
  {
    id: 'rotterdam',
    name: 'Rotterdam',
    organisation: 'NaniSoft Europe',
    lines: ['Scheepmakershaven 42', '3011 VB Rotterdam'],
    tag: 'Rotterdam',
    phone: '+31103400000',
    phoneLabel: 'Call the Rotterdam office',
    actions: <Button size="sm" variant="ghost">Edit</Button>,
  },
]

/**
 * The result line, written the way four products write it.
 *
 * It returns null for a count of zero, so the live region is in the document from the
 * first paint with nothing in it and a sentence the moment there is something to say.
 * The plural is the caller's too: the Block hands over a number because the noun it
 * goes with inflects, and the inflection belongs to this sentence.
 */
function summary(matches: number): React.ReactNode {
  if (matches === 0) return null
  return matches === 1 ? '1 record' : `${matches} records`
}

export default function AddressBook01Demo() {
  const [query, setQuery] = useState('')

  return (
    <div className="flex flex-col gap-16">
      <div className="flex max-w-measure-narrow flex-col gap-6">
        <p className="text-muted-foreground text-sm">
          Try <strong>Bristol</strong>, which is a tag rather than a name, or{' '}
          <strong>kiln</strong>, which is in one postal line and in the name of
          another. Or type something that is not here at all, which is the one line
          this Block refuses to write.
        </p>

        <AddressBook01
          headingLevel="h3"
          eyebrow="Preview"
          title="Where we are"
          description="Six places, in three shapes. The first two carry both contact links, the next two carry one each, and the last two carry neither."
          value={query}
          onValueChange={setQuery}
          label="Search the address book"
          clearLabel="Clear the search"
          records={RECORDS}
          empty="Nothing here matches that. Try a street, a firm, or a label such as Bristol."
          summary={summary}
        />
      </div>

      <AddressBook01
        headingLevel="h3"
        eyebrow="Preview"
        title="The same records as rows"
        description="One set of data and two arrangements. The postal lines want to wrap under the name here, and a three column grid would put four columns of address in a phone's width."
        value=""
        onValueChange={() => {}}
        label="Search the address book"
        clearLabel="Clear the search"
        variant="rows"
        records={RECORDS.slice(0, 4)}
        empty="Nothing here matches that."
      />

      <AddressBook01
        headingLevel="h3"
        eyebrow="Preview"
        title="A book that has been searched away"
        description="The empty sentence is yours, because the two honest answers are opposites: nothing is in the book, or the reader's own query removed everything that was."
        value=""
        onValueChange={() => {}}
        label="Search the address book"
        clearLabel="Clear the search"
        records={[]}
        empty="There are no places in this book yet. The first address you add is the first row here."
      />
    </div>
  )
}
