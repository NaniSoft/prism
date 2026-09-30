export { Consent01, default } from './consent'
// `Consent01Position` is the two arms a caller chooses between, and it is named here
// because a caller writing a wrapper over the notice has to be able to say which
// arm it is defaulting to. Everything else on the Block's surface is a prop.
export type { Consent01Position, Consent01Props } from './consent'
