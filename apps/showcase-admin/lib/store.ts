/**
 * The console's own figures: invented, named, and held in one data module so no
 * page carries a number in its markup that a reader cannot trace to a list.
 *
 * The dates are fixed strings rather than the clock, so the export is the same
 * document on every build and the relative readings underneath them are honest
 * about the morning they were written.
 */

/** Orders by month, in thousands, the series behind the revenue figure. */
export const REVENUE_SERIES: readonly { name: string; values: readonly number[]; tone: 'chart-1' | 'chart-2' }[] = [
  {
    name: 'The shop',
    tone: 'chart-1',
    values: [31, 33, 32, 35, 36, 38, 37, 40, 39, 42, 41, 44],
  },
  {
    name: 'The marketplaces',
    tone: 'chart-2',
    values: [12, 13, 13, 14, 15, 15, 16, 16, 17, 18, 18, 19],
  },
]

/** The months the revenue series is drawn against. */
export const REVENUE_MONTHS: readonly string[] = [
  'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov',
]

/** Orders by channel last month, the series behind the channel figure. */
export const CHANNEL_SERIES: readonly { name: string; values: readonly number[]; tone: 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' }[] = [
  { name: 'The shop', tone: 'chart-1', values: [512] },
  { name: 'Marketplace A', tone: 'chart-2', values: [344] },
  { name: 'Marketplace B', tone: 'chart-3', values: [238] },
  { name: 'The till', tone: 'chart-4', values: [110] },
]

/** One order in the ledger. */
export type Order = {
  id: string
  customer: string
  channel: string
  items: number
  status: { tone: 'neutral' | 'info' | 'success' | 'warning' | 'destructive'; label: string }
  total: { amount: number; currency: string; locale: string }
  placed: string
}

/** The recent orders, newest first, the overview's table and the orders route. */
export const ORDERS: readonly Order[] = [
  {
    id: 'M-10482',
    customer: 'Farah Osman',
    channel: 'The shop',
    items: 3,
    status: { tone: 'success', label: 'Dispatched' },
    total: { amount: 8440, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-08T08:41:00Z',
  },
  {
    id: 'M-10481',
    customer: 'Dmitri Sala',
    channel: 'Marketplace A',
    items: 1,
    status: { tone: 'info', label: 'Packing' },
    total: { amount: 2995, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-08T08:12:00Z',
  },
  {
    id: 'M-10480',
    customer: 'June Nakamura',
    channel: 'The till',
    items: 4,
    status: { tone: 'success', label: 'Collected' },
    total: { amount: 5120, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-08T07:55:00Z',
  },
  {
    id: 'M-10479',
    customer: 'Aya Traore',
    channel: 'The shop',
    items: 2,
    status: { tone: 'warning', label: 'Held, address' },
    total: { amount: 6180, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-07T18:20:00Z',
  },
  {
    id: 'M-10478',
    customer: 'Ravi Chandran',
    channel: 'Marketplace B',
    items: 6,
    status: { tone: 'destructive', label: 'Lost in transit' },
    total: { amount: 15440, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-05T09:03:00Z',
  },
  {
    id: 'M-10477',
    customer: 'Marta Wilk',
    channel: 'Marketplace A',
    items: 1,
    status: { tone: 'neutral', label: 'Refunded' },
    total: { amount: 1800, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-04T15:47:00Z',
  },
  {
    id: 'M-10476',
    customer: 'Tom Aldous',
    channel: 'The shop',
    items: 2,
    status: { tone: 'success', label: 'Dispatched' },
    total: { amount: 4775, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-04T11:26:00Z',
  },
  {
    id: 'M-10475',
    customer: 'Sara Nowak',
    channel: 'Marketplace B',
    items: 3,
    status: { tone: 'info', label: 'Packing' },
    total: { amount: 9320, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-03T16:09:00Z',
  },
  {
    id: 'M-10474',
    customer: 'Leo Brandt',
    channel: 'The till',
    items: 1,
    status: { tone: 'success', label: 'Collected' },
    total: { amount: 2250, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-03T10:31:00Z',
  },
  {
    id: 'M-10473',
    customer: 'Ana Reis',
    channel: 'The shop',
    items: 5,
    status: { tone: 'success', label: 'Dispatched' },
    total: { amount: 12680, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-02T14:58:00Z',
  },
  {
    id: 'M-10472',
    customer: 'Kofi Mensah',
    channel: 'Marketplace A',
    items: 2,
    status: { tone: 'neutral', label: 'Cancelled' },
    total: { amount: 3600, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-01T19:44:00Z',
  },
  {
    id: 'M-10471',
    customer: 'Iris Falk',
    channel: 'The shop',
    items: 1,
    status: { tone: 'success', label: 'Dispatched' },
    total: { amount: 5425, currency: 'USD', locale: 'en-US' },
    placed: '2026-11-01T09:17:00Z',
  },
]

/** One product on the shelf. */
export type Product = {
  id: string
  name: string
  category: string
  price: { amount: number; currency: string; locale: string }
  stock: number
  status: { tone: 'neutral' | 'info' | 'success' | 'warning' | 'destructive'; label: string }
}

/** The shelf, as the products route reads it. */
export const PRODUCTS: readonly Product[] = [
  {
    id: 'p-01',
    name: 'Brass counter bell',
    category: 'Counter',
    price: { amount: 3400, currency: 'USD', locale: 'en-US' },
    stock: 24,
    status: { tone: 'success', label: 'Live' },
  },
  {
    id: 'p-02',
    name: 'Kraft mailer, small',
    category: 'Packaging',
    price: { amount: 65, currency: 'USD', locale: 'en-US' },
    stock: 1840,
    status: { tone: 'success', label: 'Live' },
  },
  {
    id: 'p-03',
    name: 'Linen apron, forest',
    category: 'Wear',
    price: { amount: 4200, currency: 'USD', locale: 'en-US' },
    stock: 6,
    status: { tone: 'warning', label: 'Low' },
  },
  {
    id: 'p-04',
    name: 'Enamel mug, cream',
    category: 'Table',
    price: { amount: 1800, currency: 'USD', locale: 'en-US' },
    stock: 61,
    status: { tone: 'success', label: 'Live' },
  },
  {
    id: 'p-05',
    name: 'Wax food wraps, set of six',
    category: 'Kitchen',
    price: { amount: 2600, currency: 'USD', locale: 'en-US' },
    stock: 0,
    status: { tone: 'destructive', label: 'Out' },
  },
  {
    id: 'p-06',
    name: 'Copper pouring kettle',
    category: 'Kitchen',
    price: { amount: 8900, currency: 'USD', locale: 'en-US' },
    stock: 12,
    status: { tone: 'success', label: 'Live' },
  },
  {
    id: 'p-07',
    name: 'Cedar plant label, ten',
    category: 'Garden',
    price: { amount: 1200, currency: 'USD', locale: 'en-US' },
    stock: 148,
    status: { tone: 'success', label: 'Live' },
  },
  {
    id: 'p-08',
    name: 'Glass storage jar, two litre',
    category: 'Kitchen',
    price: { amount: 2150, currency: 'USD', locale: 'en-US' },
    stock: 3,
    status: { tone: 'warning', label: 'Low' },
  },
]

/** One customer of the shop. */
export type Customer = {
  id: string
  name: string
  initials: string
  city: string
  orders: number
  spend: { amount: number; currency: string; locale: string }
  since: string
  tier: string
}

/** The customers, as the customers route reads them. */
export const CUSTOMERS: readonly Customer[] = [
  {
    id: 'c-01',
    name: 'Farah Osman',
    initials: 'FO',
    city: 'Leicester',
    orders: 41,
    spend: { amount: 184200, currency: 'USD', locale: 'en-US' },
    since: '2024-03-11T10:00:00Z',
    tier: 'Fleet',
  },
  {
    id: 'c-02',
    name: 'Dmitri Sala',
    initials: 'DS',
    city: 'Leeds',
    orders: 28,
    spend: { amount: 121400, currency: 'USD', locale: 'en-US' },
    since: '2024-07-02T10:00:00Z',
    tier: 'Shopfront',
  },
  {
    id: 'c-03',
    name: 'June Nakamura',
    initials: 'JN',
    city: 'Bristol',
    orders: 19,
    spend: { amount: 96800, currency: 'USD', locale: 'en-US' },
    since: '2025-01-20T10:00:00Z',
    tier: 'Shopfront',
  },
  {
    id: 'c-04',
    name: 'Aya Traore',
    initials: 'AT',
    city: 'Manchester',
    orders: 15,
    spend: { amount: 73300, currency: 'USD', locale: 'en-US' },
    since: '2025-04-14T10:00:00Z',
    tier: 'Shopfront',
  },
  {
    id: 'c-05',
    name: 'Ravi Chandran',
    initials: 'RC',
    city: 'Coventry',
    orders: 9,
    spend: { amount: 42750, currency: 'USD', locale: 'en-US' },
    since: '2025-06-30T10:00:00Z',
    tier: 'Counter',
  },
  {
    id: 'c-06',
    name: 'Marta Wilk',
    initials: 'MW',
    city: 'Nottingham',
    orders: 7,
    spend: { amount: 28910, currency: 'USD', locale: 'en-US' },
    since: '2025-09-08T10:00:00Z',
    tier: 'Counter',
  },
  {
    id: 'c-07',
    name: 'Tom Aldous',
    initials: 'TA',
    city: 'Derby',
    orders: 5,
    spend: { amount: 19620, currency: 'USD', locale: 'en-US' },
    since: '2026-01-05T10:00:00Z',
    tier: 'Counter',
  },
  {
    id: 'c-08',
    name: 'Iris Falk',
    initials: 'IF',
    city: 'Sheffield',
    orders: 3,
    spend: { amount: 11005, currency: 'USD', locale: 'en-US' },
    since: '2026-05-17T10:00:00Z',
    tier: 'Counter',
  },
]
