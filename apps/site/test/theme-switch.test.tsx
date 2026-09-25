import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SiteThemeProvider } from '../components/SiteThemeProvider.js';
import { ThemeSwitcher } from '../components/ThemeSwitcher.js';

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

afterEach(() => {
  localStorage.removeItem('prism-theme');
  document.documentElement.className = '';
});

describe('site theme switcher', () => {
  it('updates the provider scope and persisted document theme from the grouped trigger', async () => {
    render(
      <SiteThemeProvider>
        <ThemeSwitcher />
      </SiteThemeProvider>,
    );

    expect(screen.getByRole('status').textContent).toContain('Beam-dark');
    fireEvent.click(screen.getByRole('button', { name: /Change brand pack and mode/ }));
    fireEvent.click(await screen.findByRole('radio', { name: 'Light' }));

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toContain('Light');
      expect(document.querySelector('.prism-root')?.getAttribute('data-prism-theme')).toBe('blue-light');
      expect(document.documentElement.classList.contains('prism-blue-light')).toBe(true);
    });
  });

  it('restores the stored scope before the first client paint', () => {
    localStorage.setItem('prism-theme', 'green-light');

    render(
      <SiteThemeProvider>
        <ThemeSwitcher />
      </SiteThemeProvider>,
    );

    expect(screen.getByRole('status').textContent).toContain('Green · Light');
    expect(document.querySelector('.prism-root')?.getAttribute('data-prism-theme')).toBe('green-light');
    expect(document.documentElement.classList.contains('prism-green-light')).toBe(true);
  });
});
