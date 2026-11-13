---
'@nanisoft/prism-ui': minor
---

The `links` and `pack-boundary` gates accept a `basePath`, so a consumer whose
export is mounted at a sub-path can run its gate chain.

The file a build writes is `out/pricing.html` while the address a reader uses at
a sub-path host is `/team/pricing`, so a gate that derived routes from files
alone reported every internal link in a working export as broken. A consumer now
declares `"basePath": "/team"` once per route-derived gate and every derived
route carries the prefix, while the routes its configuration names (`landing`,
`knownBroken`) stay app-internal, because where an app is hosted is not a fact
about its pages.

The same gate's reader-handled scheme test also misread `mailto:` and `tel:`
addresses as unclassified destinations, because its pattern asked for a second
colon neither scheme carries, so a consumer with an email link was a finding on
a working page. The pattern now names the two schemes as they are written.
