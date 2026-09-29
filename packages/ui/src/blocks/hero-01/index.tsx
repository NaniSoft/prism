export { Hero01, default } from './hero'
// `HeroAction` is a union now, and a caller that builds its actions separately
// rather than inline has to name it to do so. It is the type that makes the two
// elements tellable apart, so it is part of the surface rather than an internal.
export type { HeroAction, Hero01Props } from './hero'
