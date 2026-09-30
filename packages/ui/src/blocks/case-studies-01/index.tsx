export { CaseStudies01, default } from './case-studies'
// The study, its results, its link union and its column count are all named
// exports. The link union in particular is the thing a consumer has to be able to
// build: a study that goes somewhere and a study that does not are different
// shapes, and a caller with a content model for its studies cannot declare one
// against a Block that will not name the difference.
export type {
  CaseStudies01Props,
  CaseStudy,
  CaseStudyColumns,
  CaseStudyLink,
  CaseStudyResult,
} from './case-studies'
