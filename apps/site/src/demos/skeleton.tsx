import { Skeleton } from '@nanisoft/prism-ui/components/skeleton'

/** A card-shaped placeholder: title, two body lines and an action. */
export default function SkeletonDemo() {
  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <Skeleton className="h-5 w-40" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="h-9 w-28" />
    </div>
  )
}
