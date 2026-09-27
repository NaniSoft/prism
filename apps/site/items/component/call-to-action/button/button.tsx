import { Button } from '@nanisoft/prism-ui/components/button'

/**
 * Buttons at each variant and size.
 *
 * Self-contained: the only import is from the package, and it has a default
 * export. The file is the source for the live preview, the copy control and the
 * corpus.
 */
export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Save changes</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete project</Button>
      <Button variant="link">Read the guide</Button>
    </div>
  )
}
