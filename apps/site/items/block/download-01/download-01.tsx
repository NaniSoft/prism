import { Download01, type Download01File } from '@nanisoft/prism-ui/blocks/download-01'
import { RelativeTime } from '@nanisoft/prism-ui/components/relative-time'

/** A fixed moment, so the preview reads the same on every visit. */
const PUBLISHED = '2026-09-30T11:20:00.000Z'

/**
 * A size sentence for the Demo, in the runtime's own locale.
 *
 * The Block carries no default on purpose, so a consumer writes this or passes
 * the one `FileUpload` carries. This is the same three rungs in one function, and
 * it is here because a Demo is the documentation site's own content.
 *
 * **`Intl` is asked for the unit and not for the abbreviation, and the cast below
 * is the whole of the mistake this file first shipped.** `style: 'unit'` takes a
 * name from a sanctioned list, so `'kilobyte'` and not `'kB'`: passing the
 * abbreviation throws a `RangeError` at construction, which means a byte ladder
 * written with the abbreviations a reader expects is a ladder that crashes on the
 * first file over a kilobyte. `'kB'` is what `Intl` PRINTS, and it prints it
 * because the platform knows the reader's language. A Demo is where that lesson
 * belongs, since a consumer copying the first version would have shipped the
 * crash to their whole file list.
 */
function formatSize(bytes: number): string {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const
  let value = bytes
  let rung = 0
  while (value >= 1024 && rung < units.length - 1) {
    value /= 1024
    rung += 1
  }
  return new Intl.NumberFormat(undefined, {
    style: 'unit',
    unit: units[rung] as 'byte',
    unitDisplay: 'short',
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value)
}

/** Five artefacts over the two variants, and every state the type has. */
const FILES: Download01File[] = [
  {
    id: 'tarball',
    name: 'prism-ui-1.5.0.tgz',
    format: 'gz',
    size: 412_338,
    formatSize,
    checksum: 'sha512:9f2c1ab4...41ab',
    href: '/downloads/prism-ui-1.5.0.tgz',
    hrefLabel: 'Download the package',
    note: 'Regenerated on every publish. The digest is the one the publish printed.',
  },
  {
    id: 'tokens',
    name: 'prism-tokens-1.5.0.tgz',
    format: 'gz',
    size: 88_120,
    formatSize,
    checksum: 'sha512:5c07d3e1...9f20',
    href: '/downloads/prism-tokens-1.5.0.tgz',
    hrefLabel: 'Download the tokens',
  },
  {
    id: 'contract',
    name: 'token-contract.css',
    format: 'CSS',
    size: 41_002,
    formatSize,
    checksum: 'sha512:0d41b7aa...c3e8',
    href: '/downloads/token-contract.css',
    hrefLabel: 'Download the contract',
    note: (
      <span className="flex flex-wrap items-baseline gap-x-2">
        <span>Emitted from the token source, not written by hand.</span>
        <RelativeTime date={PUBLISHED} dateStyle="medium" />
      </span>
    ),
  },
  {
    id: 'guide',
    name: 'writing-a-pack.pdf',
    format: 'PDF',
    size: 2_411_776,
    formatSize,
    href: '/downloads/writing-a-pack.pdf',
    hrefLabel: 'Download the guide',
  },
  {
    id: 'fixtures',
    name: 'token-fixtures.json',
    format: 'JSON',
    size: 6_144,
    formatSize,
    href: '/downloads/token-fixtures.json',
    hrefLabel: 'Download the fixtures',
  },
]

/** Both variants on one set, so the rows and the cards are comparable. */
export default function Download01Demo() {
  return (
    <>
      <Download01
        headingLevel="h3"
        eyebrow="Preview"
        title="What is in the build"
        description="Five artefacts. Four carry a digest, one does not, one carries a note with a RelativeTime in it, and every one has its own words on its control."
        files={FILES}
      />

      <Download01
        headingLevel="h3"
        title="The same set as cards"
        variant="cards"
        columns={2}
        files={FILES.slice(0, 2)}
      />
    </>
  )
}
