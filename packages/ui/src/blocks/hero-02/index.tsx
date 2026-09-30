export { Hero02, default } from './hero-02'
// `Hero02Action` is a union, and a caller that builds its actions separately
// rather than inline has to name it to do so. It is the type that makes the two
// elements tellable apart, so it is part of the surface rather than an internal.
export type { Hero02Action, Hero02Props } from './hero-02'