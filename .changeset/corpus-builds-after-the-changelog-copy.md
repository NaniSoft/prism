---
'@nanisoft/prism-llms': patch
---

Build the corpus after the changelog routes are copied, and declare what it reads

The corpus asserts that every published package shipping a changelog has a route
in the site's content tree, and those routes are written by a copy step that
belongs to the site package. The copy ran after this package was built, so on a
cold machine the build failed with a message that read like a changelog file had
been deleted, and a warm machine never saw the failure at all.

The copy is now the task `@nanisoft/site#copy-changelogs`, which this build
depends on in the task graph, and this build declares the content tree, the Item
documentation tree, the two site script modules the builder imports, the
workspace globs, the published manifests and the changelogs as its inputs, so a
change to any of them rebuilds the corpus instead of replaying a cached one.

The assertion is unchanged and still fails a published package the site does not
publish, which is how a changelog path the corpus advertised while the site
returned 404 for it was found. Its message now says which of the two causes it
is. No corpus byte changes: the emitted corpus is the same.
