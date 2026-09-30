export { Careers01, default } from './careers'
// The role, its link union and the props are named exports. The link union is the
// one a consumer has to be able to build, because a role that goes somewhere and a
// role that does not are different shapes and a caller with a content model for
// its postings cannot declare one against a Block that will not name the
// difference.
export type { Careers01Props, CareersRole, CareersRoleLink } from './careers'
