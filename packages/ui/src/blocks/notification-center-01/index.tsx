export { NotificationCenter01, default } from './notification-center-01'
// The notification is a shape a caller builds a typed list of, and the props type is
// the intersection of three unions, so a caller that stores the props in a variable
// of its own has to name it to do so.
export type {
  NotificationCenter01Notification,
  NotificationCenter01Props,
} from './notification-center-01'
