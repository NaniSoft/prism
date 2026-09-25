import { DocsShell } from '@nanisoft/prism-ui/pages/docs-shell';

export default function DocsShellDemo() {
  return (
    <DocsShell
      title="Button"
      description="Triggers an action or navigates to a destination."
      nav={[{ id: 'components', title: 'Components', url: '#components' }, { id: 'button', title: 'Button', url: '#button' }]}
      toc={[{ id: 'usage', title: 'Usage', url: '#usage' }, { id: 'api', title: 'API', url: '#api' }]}
    >
      <h2 id="usage">Usage</h2>
      <p>Choose a variant by the consequence of the action, then keep the label specific.</p>
    </DocsShell>
  );
}
