export { OfferingCategories01, default } from './offering-categories'
// The category shape, the two arrangements and the two control labels are part of
// the surface rather than internal: a consumer building the strip outside JSX, from
// a generated list of kinds, names all of them to type the array it passes in.
export type {
  OfferingCategories01Category,
  OfferingCategories01Form,
  OfferingCategories01Labels,
  OfferingCategories01Props,
} from './offering-categories'
