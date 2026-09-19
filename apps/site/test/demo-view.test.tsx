// The ComponentDemo wire (ticket 12 §2): live preview through prism-ui's
// data-in block, the copy/expand action bar, and the collapsed-by-default code
// panel.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JSX } from 'react';

import { DemoView } from '../components/DemoView.js';

function Source(): JSX.Element {
  return <span data-testid="live-preview">live</span>;
}

async function stubClipboard(): Promise<{ writeText: ReturnType<typeof vi.fn> }> {
  const writeText = vi.fn(async () => undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return { writeText };
}

describe('DemoView', () => {
  it('renders the live preview and the verbatim code panel, collapsed by default', async () => {
    await stubClipboard();
    render(
      <DemoView code="export default () => 1;">
        <Source />
      </DemoView>,
    );

    expect(screen.getByTestId('live-preview')).toBeTruthy();
    const figure = document.querySelector('.prism-component-demo');
    expect(figure?.getAttribute('data-prism')).toBe('component-demo');
    expect(figure?.textContent).toContain('export default () => 1;');

    // Collapsed: the open-state class is absent until Code is toggled (the
    // display flip itself is the site stylesheet's `.site-demo--open` rule).
    expect(document.querySelector('.site-demo--open')).toBeNull();
    expect(document.querySelector('.prism-component-demo__code')?.textContent).toContain(
      'export default () => 1;',
    );

    fireEvent.click(screen.getByRole('button', { name: /Code/ }));
    expect(document.querySelector('.site-demo--open')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Hide code/ })).toBeTruthy();
  });

  it('copies the demo source and shows feedback', async () => {
    const { writeText } = await stubClipboard();
    render(
      <DemoView code={'const x = 1;\nexport default () => x;'}>
        <Source />
      </DemoView>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(writeText).toHaveBeenCalledWith('const x = 1;\nexport default () => x;');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy());
  });

  it('stays quiet when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    render(
      <DemoView code="x">
        <Source />
      </DemoView>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy(); // no false feedback
  });
});
