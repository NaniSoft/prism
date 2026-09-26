import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@nanisoft/prism-ui/components/alert'

/** The neutral alert beside the destructive one. */
export default function AlertDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>
          Reads stay available on 3 October between 02:00 and 04:00.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Publish failed</AlertTitle>
        <AlertDescription>
          The build did not finish. Fix the type error and publish again.
        </AlertDescription>
      </Alert>
    </div>
  )
}
