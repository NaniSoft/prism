import { Kbd } from '@nanisoft/prism-ui/components/kbd'

/** Shortcuts written with one element per key. */
export default function KbdDemo() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="flex items-center gap-1.5">
        Open the command menu <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
      </p>
      <p className="flex items-center gap-1.5">
        Save the draft <Kbd>Ctrl</Kbd> <Kbd>S</Kbd>
      </p>
      <p className="flex items-center gap-1.5">
        Close the dialog <Kbd>Esc</Kbd>
      </p>
    </div>
  )
}
