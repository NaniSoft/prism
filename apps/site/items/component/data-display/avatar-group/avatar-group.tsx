import { AvatarGroup } from '@nanisoft/prism-ui/components/avatar-group'
import { Button } from '@nanisoft/prism-ui/components/button'

const portrait =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%23111827'/><circle cx='40' cy='30' r='14' fill='%2394a3b8'/><rect x='16' y='50' width='48' height='40' rx='20' fill='%2394a3b8'/></svg>"

/** A team of eight, one photograph, the rest initials. */
const TEAM = [
  { name: 'Priya Raman', src: portrait },
  { name: 'Tomas Novak' },
  { name: 'Adaeze Okonkwo' },
  { name: 'Jae-won Park' },
  { name: 'Rowan Ellis' },
  { name: 'Ines Duarte' },
  { name: 'Sam Whitfield' },
  { name: 'Noor Haddad' },
]

/** The three sizes, the two ring orders, and the two cap ends. */
export default function AvatarGroupDemo() {
  return (
    <div className="flex max-w-page flex-col gap-6">
      <div className="flex flex-wrap items-center gap-6">
        <AvatarGroup avatars={TEAM} max={4} overflowLabel={(count) => `+${count}`} reverse />
        <AvatarGroup avatars={TEAM} max={4} overflowLabel={(count) => `+${count}`} />
        <AvatarGroup avatars={TEAM.slice(0, 3)} size="lg" />
        <AvatarGroup avatars={TEAM.slice(0, 3)} size="sm" />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <AvatarGroup
          avatars={TEAM}
          size="sm"
          max={2}
          overflowLabel={(count) => `${count} more`}
        >
          <Button size="sm" variant="ghost">
            Manage
          </Button>
        </AvatarGroup>

        <AvatarGroup avatars={TEAM.slice(0, 4)} max={8} overflowLabel={() => 'All eight'} />
      </div>
    </div>
  )
}
