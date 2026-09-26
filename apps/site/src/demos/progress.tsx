import { Progress } from '@nanisoft/prism-ui/components/progress'

/** Progress at a known value, an unknown length, and complete. */
export default function ProgressDemo() {
  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Uploading assets</span>
          <span className="text-muted-foreground">68%</span>
        </div>
        <Progress value={68} aria-label="Uploading assets" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">Preparing preview</span>
        <Progress value={null} aria-label="Preparing preview" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">Build complete</span>
        <Progress value={100} aria-label="Build complete" />
      </div>
    </div>
  )
}
