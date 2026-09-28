---
'@nanisoft/prism-ui': minor
---

Add `Tree`, so a file browser, a category tree and an outline have something to build from

Prism had a working tree and could not reach it. The implementation existed as
two private renderers inside the documentation Page, with its depth rule, its
current-item marking and its rule that a group with no index renders a label.
What was missing was that it was unreachable, and that its data type was bound to
documentation navigation rather than being a tree's own vocabulary, so a file
tree, a category tree, an outline and a knowledge base all had nothing to build
from.

```tsx
<Tree
  label="Documentation"
  currentHref="/foundation/colors"
  nodes={[
    { type: 'group', title: 'Foundation', items: [
      { type: 'page', title: 'Colors', href: '/foundation/colors' },
    ] },
    { type: 'divider', title: '' },
    { type: 'page', title: 'Overview', href: '/overview' },
  ]}
/>
```

**It is navigable by the arrow keys**, which is the part a consumer cannot
assemble for themselves. A tree is one Tab stop and the arrows move inside it.
Composing the markup gives the Tab order of the document instead, which is every
node in the tree and none of the arrows. The flat order is collected from the DOM
rather than computed from the node data, so there is no second list to fall behind
the first, and a label is skipped rather than focused and doing nothing.

**A flat list renders a flat tree.** An outline is a tree of depth one, so a caller
passes leaves and gets leaves. A Component that required nesting to express a flat
structure would make the common case the awkward one.

**A group with no index is a label, not a link.** This is the rule the
documentation Page already reasoned at length and it is carried across rather than
reinvented: a group with an index is a destination and renders an anchor, a group
without one renders a span that carries no `href`, is not focusable, and cannot be
reached by Tab. Inventing a route for it would publish an address that resolves to
nothing. The empty case is authored too, because a tree that renders nothing is a
control with nothing in it.

The documentation Page keeps its own renderers and does not change. Its two rules
are specific to a documentation rail, which is one shape a tree takes rather than
the shape. Whether the Page later composes this Component is a separate decision
this does not make.
