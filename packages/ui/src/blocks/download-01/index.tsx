export { Download01, default } from './download'
// The file type is on the surface because a caller that reads its artefacts out of
// a build manifest has to name it, and because the required `hrefLabel` beside the
// required `href` is a rule the caller needs to read in their own editor rather
// than in a console message.
export type { Download01Props, Download01File, Download01Form, Download01Columns } from './download'
