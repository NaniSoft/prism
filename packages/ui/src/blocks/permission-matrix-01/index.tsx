export { PermissionMatrix01, default } from './permission-matrix'
// Four named types, and the reason each is on the surface rather than inferred is
// the reason the catalogue says the same about every Block: a consumer assembling a
// permission model in its own module has to be able to declare the shape once and
// hand the same object to the Block, and a caller writing a `switch` over a cell's
// three answers has to be able to name the union.
export type {
  PermissionMatrix01Props,
  PermissionMatrixColumn,
  PermissionMatrixGroup,
  PermissionMatrixLegend,
  PermissionMatrixPermission,
  PermissionMatrixRole,
} from './permission-matrix'
