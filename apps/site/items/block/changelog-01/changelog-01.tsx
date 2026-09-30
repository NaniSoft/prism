import { Changelog01, type Changelog01Release } from '@nanisoft/prism-ui/blocks/changelog-01'

/**
 * Four releases over the five kinds, including a release with no records at all
 * and a record with no body, so the states a reader actually meets are visible.
 */
const RELEASES: Changelog01Release[] = [
  {
    id: '1-5-0',
    version: '1.5.0',
    at: '2026-09-30',
    summary: 'The gate kit runs in a consumer repository, and the first three consumer repositories are on it.',
    entries: [
      {
        id: 'gates',
        kind: 'added',
        title: 'A consumer gate kit that runs in the consumer repository',
        body: 'Four laws, each one a failure message, so a change to one lands here once and reaches every consumer in one release.',
        href: '/changelog/1-5-0#gates',
        hrefLabel: 'Read the full record',
      },
      {
        id: 'client-budget',
        kind: 'added',
        title: 'A per-Component budget for the all-client bundle',
        href: '/changelog/1-5-0#client-budget',
        hrefLabel: 'Read the full record',
      },
      {
        id: 'duration-contract',
        kind: 'changed',
        title: 'Motion durations are named tokens rather than millisecond values',
        body: 'A component that wrote 160ms wrote a value the system already had a name for.',
      },
      {
        id: 'measure',
        kind: 'changed',
        title: 'The reading measure is an emitted token rather than a Tailwind keyword',
      },
      {
        id: 'pack-radius',
        kind: 'fixed',
        title: 'A pack whose declared radius did not match the scale it emitted',
        body: 'The contrast gate measured the ramp and passed, because contrast is not radius.',
        href: '/changelog/1-5-0#pack-radius',
        hrefLabel: 'Read the full record',
      },
      {
        id: 'icon-package',
        kind: 'removed',
        title: 'The custom icon package, in favour of the one icon lane',
      },
      {
        id: 'token-crypto',
        kind: 'security',
        title: 'A dependency in the token build was rebuilt on every publish',
        body: 'A build step resolved its own tree at install time. It now pins, and the pin is checked.',
        href: '/changelog/1-5-0#token-crypto',
        hrefLabel: 'Read the advisory',
      },
    ],
  },
  {
    id: '1-4-2',
    version: '1.4.2',
    at: '2026-09-16',
    summary: 'One fix, and one record withdrawn before it shipped.',
    entries: [
      {
        id: 'rail-ceiling',
        kind: 'fixed',
        title: 'A five-stage process rail drew a rail that was missing its last stage',
      },
    ],
  },
  {
    id: '1-4-1',
    version: '1.4.1',
    at: '2026-09-02',
    entries: [],
  },
]

/** The kind marks on, which is the default, and the same set with them off. */
export default function Changelog01Demo() {
  return (
    <>
      <Changelog01
        headingLevel="h3"
        eyebrow="Preview"
        title="What changed"
        description="Three releases. The second one is a single record, and the third has none at all, so the empty group is visible rather than described."
        releases={RELEASES}
      />

      <Changelog01
        headingLevel="h3"
        title="The same records with the marks off"
        showKinds={false}
        releases={RELEASES.slice(0, 1)}
      />
    </>
  )
}
