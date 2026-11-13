/**
 * The about route's team. Invented people with initials avatars, because a
 * showcase makes no claim about a real person.
 */
export const PEOPLE: readonly {
  id: string
  name: string
  role: string
  bio: string
  avatar: { name: string }
}[] = [
  {
    id: 'fo',
    name: 'Farah Osman',
    role: 'Co-founder, shops',
    bio: 'Ran a flower shop for nine years and kept the books in a notebook nobody else could read. Writes the morning page she always wanted.',
    avatar: { name: 'FO' },
  },
  {
    id: 'ds',
    name: 'Dmitri Sala',
    role: 'Co-founder, operations',
    bio: 'Managed three stores and every courier they ever argued with. Owns the courier comparison and the returns path.',
    avatar: { name: 'DS' },
  },
  {
    id: 'jn',
    name: 'June Nakamura',
    role: 'Engineering',
    bio: 'Built the ledger that every figure on every page opens into, and refuses to let a number exist without its orders.',
    avatar: { name: 'JN' },
  },
  {
    id: 'at',
    name: 'Aya Traore',
    role: 'Support',
    bio: 'Answers the four-hours promise on Fleet, and sends the ones that are not bugs straight to the people who can fix the shop.',
    avatar: { name: 'AT' },
  },
]
