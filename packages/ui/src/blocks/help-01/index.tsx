export { Help01, default } from './help'
// The two data shapes a caller builds its index from are part of the surface rather
// than internal: a consumer assembling a help index outside JSX, from a build step or
// out of a CMS response, names both of them to type the array it passes in.
export type {
  Help01Article,
  Help01Category,
  Help01Props,
} from './help'
