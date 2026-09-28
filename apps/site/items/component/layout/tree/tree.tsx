import { Tree, type TreeNode } from '@nanisoft/prism-ui/components/tree'

/**
 * A project tree, and the four shapes a node arrives in: a group with an index
 * (a destination), a group without one (a label), a page, and a rule. The
 * unindexed group is the case the Component reasons about hardest, so the Demo
 * includes one rather than only the shapes that are convenient.
 */
const NODES: TreeNode[] = [
  {
    type: 'group',
    title: 'Nexus',
    href: '/nexus',
    items: [
      { type: 'group', title: 'agents', items: [
        { type: 'page', title: 'orchestrator.ts', href: '/nexus/agents/orchestrator' },
        { type: 'page', title: 'merge-pipeline.ts', href: '/nexus/agents/merge' },
      ] },
      { type: 'page', title: 'package.json', href: '/nexus/package' },
    ],
  },
  { type: 'divider', title: 'Shared' },
  { type: 'page', title: 'README.md', href: '/nexus/readme' },
]

/** The tree with one node marked current, which is what a reader is at. */
export default function TreeDemo() {
  return (
    <div className="max-w-measure-narrow">
      <Tree nodes={NODES} label="Project files" currentHref="/nexus/agents/merge" />
    </div>
  )
}
