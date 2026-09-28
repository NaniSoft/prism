import { Prose } from '@nanisoft/prism-ui/components/prose'

/** A run of prose, with the block treatments applied to the caller's own elements. */
export default function ProseDemo() {
  return (
    <Prose>
      <h2>A heading</h2>
      <p>
        A paragraph of body copy, held to the reading measure. The measure is the
        emitted container-measure token, so a line stops growing at the same place
        in every pack and in both modes.
      </p>
      <ul>
        <li>Lists are styled as part of the run.</li>
        <li>So are code, quotations, tables and headings.</li>
      </ul>
      <blockquote>A quotation keeps the muted ink and a left rule.</blockquote>
    </Prose>
  )
}
