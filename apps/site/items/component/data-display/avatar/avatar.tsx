import { Avatar, AvatarFallback, AvatarImage } from '@nanisoft/prism-ui/components/avatar'

const portrait =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%23111827'/><circle cx='40' cy='30' r='14' fill='%2394a3b8'/><rect x='16' y='50' width='48' height='40' rx='20' fill='%2394a3b8'/></svg>"

/** Avatars with an image, initials fallbacks and a smaller size. */
export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={portrait} alt="" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>PR</AvatarFallback>
      </Avatar>
      <Avatar className="size-8">
        <AvatarFallback className="text-xs">SM</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarImage src={portrait} alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    </div>
  )
}
