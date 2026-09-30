export { ResourceList01, default } from './resource-list'
// The four cells, the column type, the resource type and the grouping are all on
// the surface rather than internal, because a consumer that builds its columns
// from a configuration file and its resources from a data layer has to name every
// one of them to do so, and the closed cell set is the thing that tells them
// which columns this Block can draw.
export type {
  ResourceList01Props,
  ResourceList01Resource,
  ResourceList01GroupBy,
  ResourceListColumn,
  ResourceListCell,
} from './resource-list'
