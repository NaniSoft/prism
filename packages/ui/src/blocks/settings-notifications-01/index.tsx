export { SettingsNotifications01, default } from './settings-notifications'
// The channel and the event are named types because a consumer holds its own
// notification policy in its own module and has to name the shape to declare it,
// and because the `required` flag is a decision rather than a formatting option
// and is easier to make deliberately when it is a named field.
export type {
  SettingsNotifications01Props,
  SettingsNotificationsChannel,
  SettingsNotificationsEvent,
} from './settings-notifications'
