import { DSAvatar } from '@nanisoft/prism-ui/components/ds-avatar'

const portrait = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%23111827'/><circle cx='40' cy='30' r='14' fill='%2394a3b8'/><rect x='16' y='50' width='48' height='40' rx='20' fill='%2394a3b8'/></svg>"

/** With a picture, then initials at two sizes. */
export default function DsAvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      <DSAvatar name="Ada Lovelace" src={portrait} size="md" />
      <DSAvatar name="Priya Raman" size="md" />
      <DSAvatar name="Samu Osei" size="lg" />
    </div>
  )
}
