import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrismPlaceholder } from '../src/index';

describe('PrismPlaceholder', () => {
  it('renders its label', () => {
    render(<PrismPlaceholder label="hello prism" />);
    expect(screen.getByText('hello prism').tagName).toBe('SPAN');
  });
});
