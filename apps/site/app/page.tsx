import { LandingPrototype } from '@nanisoft/prism-ui/prototype';

export default function HomePage() {
  // PROTOTYPE era (map ticket 11, resolved): the winning "Specimen" direction
  // stands in on `/`, imported from prism-ui so apps never touch antd directly.
  // The real prism-ui landing page is built in the site-build pass.
  return <LandingPrototype />;
}
