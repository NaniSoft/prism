export { Industries01, default } from './industries'
// The sector, its link union and the props are named exports. The link union is the
// one a consumer has to be able to build, because a sector that goes somewhere and
// a sector that does not are different shapes and a caller with a content model
// for its sectors cannot declare one against a Block that will not name the
// difference.
export type { Industries01Props, Industry, IndustryLink } from './industries'
