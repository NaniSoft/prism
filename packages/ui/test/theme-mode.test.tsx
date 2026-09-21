// PrismThemeModeProvider (ADR-0006 §4): the chrome's one context — runtime
// state only. Static identity (pack) travels as props; mode is the one
// stateful thing, so it is the one context. The boot script set the class
// pre-paint; the provider syncs React onto it after mount and drives the swap.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { PRISM_THEME_MODE_STORAGE_KEY } from '../src/theming/index.js';
import { PrismThemeModeProvider, usePrismThemeMode } from '../src/provider/index.js';

function ModeProbe(): React.ReactElement {
  const { mode, setMode, toggleMode } = usePrismThemeMode();
  return (
    <>
      <span data-testid="mode">{mode}</span>
      <button data-testid="toggle" onClick={toggleMode}>toggle</button>
      <button data-testid="to-light" onClick={() => setMode('light')}>light</button>
    </>
  );
}

function htmlPrismClasses(): string[] {
  return Array.from(document.documentElement.classList).filter((c) => c.startsWith('prism-'));
}

afterEach(() => {
  cleanup(); // vitest runs without globals, so RTL's auto-cleanup never registers
  localStorage.clear();
  document.documentElement.className = '';
});

describe('PrismThemeModeProvider', () => {
  it('renders children through PrismProvider', () => {
    render(
      <PrismThemeModeProvider pack="lavender">
        <p data-testid="kid">hello</p>
      </PrismThemeModeProvider>,
    );
    expect(screen.getByTestId('kid').textContent).toBe('hello');
  });

  it('defaults to the pack’s beam-dark mode (the standing site default)', () => {
    render(
      <PrismThemeModeProvider pack="lavender">
        <ModeProbe />
      </PrismThemeModeProvider>,
    );
    expect(screen.getByTestId('mode').textContent).toBe('dark');
  });

  it('honours defaultMode="light"', () => {
    render(
      <PrismThemeModeProvider pack="green" defaultMode="light">
        <ModeProbe />
      </PrismThemeModeProvider>,
    );
    expect(screen.getByTestId('mode').textContent).toBe('light');
  });

  it('syncs onto a stored mode after mount (the boot script’s choice)', () => {
    localStorage.setItem(PRISM_THEME_MODE_STORAGE_KEY, 'light');
    render(
      <PrismThemeModeProvider pack="lavender">
        <ModeProbe />
      </PrismThemeModeProvider>,
    );
    expect(screen.getByTestId('mode').textContent).toBe('light');
  });

  it('toggleMode swaps the html class and persists', () => {
    render(
      <PrismThemeModeProvider pack="lavender">
        <ModeProbe />
      </PrismThemeModeProvider>,
    );
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('mode').textContent).toBe('light');
    expect(htmlPrismClasses()).toEqual(['prism-lavender-light']);
    expect(localStorage.getItem(PRISM_THEME_MODE_STORAGE_KEY)).toBe('light');
    fireEvent.click(screen.getByTestId('toggle'));
    expect(htmlPrismClasses()).toEqual(['prism-lavender-dark']);
    expect(localStorage.getItem(PRISM_THEME_MODE_STORAGE_KEY)).toBe('dark');
  });

  it('the class swap replaces stale prism classes and keeps foreign ones', () => {
    document.documentElement.classList.add('prism-green-light', 'other');
    render(
      <PrismThemeModeProvider pack="blue">
        <ModeProbe />
      </PrismThemeModeProvider>,
    );
    fireEvent.click(screen.getByTestId('to-light'));
    expect(Array.from(document.documentElement.classList).sort()).toEqual(['other', 'prism-blue-light']);
  });

  it('survives blocked storage — the session keeps the in-memory choice', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked');
      },
    });
    try {
      render(
        <PrismThemeModeProvider pack="rose">
          <ModeProbe />
        </PrismThemeModeProvider>,
      );
      fireEvent.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('mode').textContent).toBe('light');
    } finally {
      if (original) Object.defineProperty(window, 'localStorage', original);
    }
  });
});

describe('usePrismThemeMode', () => {
  it('throws outside the provider', () => {
    expect(() => render(<ModeProbe />)).toThrow(/PrismThemeModeProvider/);
  });
});
