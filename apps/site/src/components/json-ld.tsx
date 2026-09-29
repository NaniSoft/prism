/**
 * One JSON-LD document, rendered into the document rather than beside it.
 *
 * A crawler reads structured data out of the head or the body indifferently, so
 * the placement here is a convention rather than a requirement. What is not
 * optional is that the bytes are in the export: a JSON-LD block that arrives with
 * hydration is a block a crawler that does not execute scripts never sees, and a
 * crawler that sees no structured data reports no error.
 *
 * The component takes the object rather than a string so a caller cannot hand it
 * a half-written document, and serialises it here so every call site produces the
 * same shape. Nothing in it is escaped by hand: `JSON.stringify` is the whole of
 * the escaping, and the values that reach it are the catalogue's own words rather
 * than anything a reader typed.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
