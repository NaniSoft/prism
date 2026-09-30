export { Delivery01, default } from './delivery'
// `DeliveryState` and `DeliveryStageState` are the two unions a caller picks from
// when it declares where a thing and a stage stand, `DeliveryItem` is the shape of
// the one thing in transit, and `DeliveryStage` is the shape a caller builds each
// stage from. All four are part of the surface rather than internal, because a
// caller assembling a delivery outside JSX names every one of them.
export type {
  Delivery01Props,
  DeliveryItem,
  DeliveryStage,
  DeliveryStageState,
  DeliveryState,
} from './delivery'
