/**
 * The pricing route's questions. Copy only, held beside the page that reads it.
 */
export const FAQ: readonly { id: string; question: string; answer: string }[] = [
  {
    id: 'marketplace',
    question: 'Does the price change with the number of marketplaces?',
    answer:
      'Counter includes one marketplace channel and Shopfront includes three, and the price is per shop rather than per channel, so connecting the third channel to a Shopfront plan changes nothing on the invoice.',
  },
  {
    id: 'locations',
    question: 'What counts as a location?',
    answer:
      'Anywhere stock is held in its own right: a shop, a stockroom with a door, a market stall with its own till. Two rooms in one building are one location, and the morning page treats them as one.',
  },
  {
    id: 'couriers',
    question: 'Which couriers does the comparison cover?',
    answer:
      'Every courier that offers a public rate card and a delivery record API, which today is eleven in the cities Meridian ships to. A courier with neither cannot be compared honestly, so it stays off the list.',
  },
  {
    id: 'leaving',
    question: 'What happens to the data if a shop leaves?',
    answer:
      'The whole ledger exports as plain files, orders first, and the export keeps working for ninety days after a plan ends. The numbers are the shop\u2019s, not Meridian\u2019s.',
  },
]
