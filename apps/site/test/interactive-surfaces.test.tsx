import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LandingSpecimen } from '../components/LandingSpecimen.js';
import { ThemeControls } from '../components/ThemeControls.js';

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

describe('interactive site surfaces', () => {
  it('filters the component catalog and previews local control state', () => {
    render(
      <LandingSpecimen
        catalog={[
          { title: 'Button', url: '/components/button', description: 'A command.' },
          { title: 'Input', url: '/components/input', description: 'A value.' },
        ]}
      />,
    );

    const search = screen.getByRole('textbox', { name: 'Search the owned catalog' });
    fireEvent.change(search, { target: { value: 'but' } });
    expect(screen.getByRole('link', { name: /Button/ })).toBeTruthy();

    fireEvent.click(screen.getByRole('switch', { name: 'Live behavior' }));
    expect(screen.getByText(/Resting specimen/)).toBeTruthy();
  });

  it('makes theme island controls local and announced', () => {
    render(<ThemeControls pack="blue" mode="dark" />);

    fireEvent.click(screen.getByRole('button', { name: 'ghost' }));
    expect(screen.getByRole('status', { name: 'Theme specimen status' }).textContent).toContain('ghost button');

    fireEvent.change(screen.getByRole('textbox', { name: 'Filter the blue dark theme specimen' }), {
      target: { value: 'ghost' },
    });
    expect(screen.getByRole('status', { name: 'Theme specimen status' }).textContent).toContain('Matches: ghost');
  });
});
