---
'@nanisoft/prism-ui': patch
---

The catalogue is a set comparison between three lists, not a count

A module on disk with no catalogue entry left every count correct. It shipped,
`shadcn add` installed it, and `registry.json` listed it, so it was absent from
the corpus, the documentation site and every agent-facing tool with a fully
green gate run. The two lists a reader trusts, the catalogue and the registry,
were on the wrong side of that hole, and the checks that believed they covered it
compared lengths or compared a file against something derived from itself.
`validate-registry.mjs` holds the registry against the disk and the manifest and
never reads the catalogue. `sync-registry.mjs` reads the disk, so it cannot
disagree with the disk about what is on it. The site's
`test/catalogue-order.test.ts` holds the catalogue against the generated
ordering and the documentation tree, and both are built from the catalogue, so a
disagreement there is impossible by construction.

`scripts/check-catalogue.mjs` reads the three sets independently and compares
them in both directions, name for name, with one printed line per offending
item. A length assertion cannot report which item is wrong, so nothing in the
run reports a length on its own: the three set sizes print as supplementary
coverage underneath the findings that carry the detail. All six directions a
three-set comparison implies are implemented, plus the kind of an item in each
pair of sets, the three naming rules that reconcile the three conventions, and a
claim that a canonical key is held by only one entry in each set.

The registry generator deliberately keeps reading the disk. Deriving the
registry from the catalogue is the obvious way to remove the second list, and it
would delete the disagreement the check exists to see, because the generator
would then agree with the catalogue by construction.

The version and the roster are two claims on two labelled lines, so a version
bump and a roster error cannot produce the same output. The run states its
coverage every time: roots resolved, files walked, files actually read, and how
many comparisons passed. Roots resolve from the script's own location and never
from the working directory, and a root that resolves to nothing fails the run
naming both causes.

`PRISM_CATALOGUE_ROOT` points a run at another package root. It changes which
directory is read and nothing else, which is what lets the tests run the real
command over a fixture tree and read the real output. The gate fails on a
catalogue it cannot read, including an empty one: a roster that cannot be read
and a roster with nothing in it are different facts, and only one of them is a
green run.
