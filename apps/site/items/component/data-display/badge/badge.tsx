import { Badge } from '@nanisoft/prism-ui/components/badge'

/** Badge at each variant, paired with the word that carries the status. */
export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>New</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="outline">Internal</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Past due</Badge>
      <Badge variant="destructive">Failed</Badge>
    </div>
  )
}
