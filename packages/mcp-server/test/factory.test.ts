// The factory's own contract: it validates the corpus at the door, builds
// lookups per call (never module scope), and stays pure — the same docs can
// back independent servers.

import { describe, expect, it } from 'vitest';

import { createPrismMcpServer } from '../src/factory.js';
import { FIXTURE } from './fixture.js';
import { harness } from './helpers.js';

describe('createPrismMcpServer', () => {
  it('rejects a store that violates the corpus contract with a precise error', () => {
    expect(() => createPrismMcpServer({ ...FIXTURE, prismVersion: 42 as unknown as string })).toThrow(
      /prismVersion must be a string/,
    );
    expect(() => createPrismMcpServer({ ...FIXTURE, items: [{ ...FIXTURE.items[0]!, kind: 'widget' as never }] })).toThrow(
      /items\[0\]\.kind/,
    );
  });

  it('produces independent servers over the same docs', async () => {
    const first = await harness();
    const second = await harness(FIXTURE);
    try {
      const [one, two] = await Promise.all([first.text('list_items'), second.text('list_items')]);
      expect(one).toBe(two);
    } finally {
      await first.close();
      await second.close();
    }
  });
});
