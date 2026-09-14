import { PrismPlaceholder } from '@nanisoft/prism-ui';

export default function HomePage() {
  return (
    <main>
      <h1>Prism</h1>
      {/* Placeholder era: the real landing page is prototyped in the visual
          language (map ticket 11) and built from the landing blocks catalog. */}
      <PrismPlaceholder label="One design language, many expressions." />
    </main>
  );
}
