export { Services01, default } from './services'
// The engagement, its link union and the props are named exports. The link union is
// the one a consumer has to be able to build, because an engagement that goes
// somewhere and one that does not are different shapes and a caller with a content
// model for its services cannot declare one against a Block that will not name the
// difference.
export type { Services01Props, Service, ServiceLink } from './services'
