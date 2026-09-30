import { Team01 } from '@nanisoft/prism-ui/blocks/team-01'

/**
 * Four invented people, two of them with a portrait that never loads.
 *
 * **The names are invented and the photographs are URLs that resolve to
 * nothing.** A team section is a set of claims about people, and this
 * documentation site publishes every demo it holds, so a real name under a real
 * portrait would be a claim this repository cannot make about a person who has
 * not agreed to it.
 *
 * The portraits are the part worth seeing: passing a `src` that fails is what
 * exercises the initials fallback, and the first person has no `avatar` at all,
 * which is the fourth state a team page has to render and the one a hand-written
 * grid usually cannot. One person is highlighted by id and one is linked with a
 * label, so both of the Block's refusals and both of its links are visible.
 */
export default function Team01Demo() {
  return (
    <Team01
      headingLevel="h3"
      eyebrow="Operations"
      title="Who watches a pipeline"
      description="Cards or rows, with a portrait where there is one. A failed photograph falls back to initials."
      variant="cards"
      highlight={['p-raman']}
      people={[
        {
          id: 'p-raman',
          name: 'Priya Raman',
          role: 'Pipeline operations',
          bio: 'Reads the runs that stopped early and the ones that finished suspiciously fast. Writes the note either way.',
          avatar: { src: 'https://portraits.example/p-raman.png', name: 'Priya Raman' },
        },
        {
          id: 't-oyelaran',
          name: 'Tunde Oyelaran',
          role: 'Market reading',
          bio: 'Decides which series are worth capturing, and argues about the ones that are not.',
          avatar: { src: 'https://portraits.example/t-oyelaran.png', name: 'Tunde Oyelaran' },
          href: 'https://people.example/t-oyelaran',
          hrefLabel: 'Profile',
        },
        {
          id: 'm-haldorsdottir',
          name: 'Margret Haldorsdottir',
          role: 'Estate observation',
          bio: 'Keeps the instrumented estate observed, and keeps the observations that mattered.',
          avatar: { name: 'Margret Haldorsdottir' },
        },
        {
          id: 'j-abara',
          name: 'Jide Abara',
          role: 'Settlement engineering',
        },
      ]}
    />
  )
}