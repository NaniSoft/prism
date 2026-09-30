export { Backdrop01, default } from './backdrop'
// The cycle and the intensity are named because a caller that stores a backdrop's
// configuration in a typed object has to be able to say which one of each it
// chose, and because a caller's own type cannot name a union it has to see. The
// props type is here for the same reason it is on every other Block: a caller
// building the object separately from the JSX has to name it to do so.
export type { Backdrop01Field, Backdrop01Intensity, Backdrop01Props } from './backdrop'
