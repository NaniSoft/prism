export { Hero02, default } from './hero-02'
// `Hero02Action` is a union, and a caller that builds its actions separately
// rather than inline has to name it to do so. It is the type that makes the two
// arms tellable apart, and each arm is named so a caller can say which of the two
// it is building rather than reaching into the union. All three are part of the
// surface rather than internals.
export type { Hero02Action, Hero02LinkAction, Hero02SlotAction, Hero02Props } from './hero-02'