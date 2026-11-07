import { DSVideo } from '@nanisoft/prism-ui/components/ds-video'

/** A hero-ratio surface with caption tracks. */
export default function DsVideoDemo() {
  return (
    <DSVideo
      src="https://www.w3schools.com/html/mov_bbb.mp4"
      label="Walkthrough"
      captions={[{ src: '/en.vtt', srcLang: 'en', label: 'English', kind: 'captions' }]}
      variant="hero"
    />
  )
}
