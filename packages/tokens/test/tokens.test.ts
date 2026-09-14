import { describe, expect, it } from 'vitest';
import { prismTokensBootstrap } from '../src/index';

describe('prismTokensBootstrap', () => {
  it('marks the pre-spec placeholder era', () => {
    expect(prismTokensBootstrap.schema).toBe('placeholder');
  });

  it('lists the four Prism packages', () => {
    expect(prismTokensBootstrap.packages).toHaveLength(4);
  });
});
