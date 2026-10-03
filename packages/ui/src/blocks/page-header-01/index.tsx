export { PageHeader01, default } from './page-header'
// The props, the crumb record and the action union are all part of the surface. The
// action union is named per arm so a consumer assembling a header row from its own
// data can say which of the two arms each action is.
export type {
  PageHeader01Props,
  PageHeaderAction,
  PageHeaderLinkAction,
  PageHeaderSlotAction,
  PageHeaderCrumb,
} from './page-header'
