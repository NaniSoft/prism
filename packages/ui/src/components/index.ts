/**
 * Every Prism component, one export list.
 *
 * Consumers who want a single item import `@nanisoft/prism-ui/components/<name>`;
 * this barrel is the convenience entry for an app that uses most of the set.
 * Compound parts stay inside their parent module (ticket 07): `Card` ships its
 * header, title, description, content and footer here, and there is no
 * `components/card-header` subpath.
 */
export { Button } from './ui/button'
export { Badge } from './ui/badge'
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './ui/card'
export { Section, SectionHeading } from './ui/section'
export type { HeadingLevel } from './ui/section'
