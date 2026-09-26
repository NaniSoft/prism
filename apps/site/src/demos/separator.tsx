import { Separator } from '@nanisoft/prism-ui/components/separator'

/** A horizontal rule between rows, and vertical rules inside one row. */
export default function SeparatorDemo() {
  return (
    <div className="flex max-w-measure flex-col gap-4">
      <p className="text-muted-foreground text-sm">Account</p>
      <Separator />
      <p className="text-muted-foreground text-sm">Notifications</p>
      <div className="flex h-5 items-center gap-4">
        <span className="text-sm">Draft</span>
        <Separator orientation="vertical" />
        <span className="text-sm">Review</span>
        <Separator orientation="vertical" />
        <span className="text-sm">Published</span>
      </div>
    </div>
  )
}
