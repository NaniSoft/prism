export { AddressBook01, default } from './address-book-01'
// The two data shapes a caller builds an address book out of are part of the
// surface rather than internal: a consumer assembling records outside JSX, from a
// store or a CRM response, names both of them to type the array it passes in, and
// the union on the contact pairs is the thing they have to narrow against.
export type {
  AddressBook01Form,
  AddressBook01Props,
  AddressBook01Record,
} from './address-book-01'
