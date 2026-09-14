import { describe, expect, it } from 'vitest';
import { createPrismMcpServer } from '../src/index';

describe('createPrismMcpServer', () => {
  it('names itself prism-mcp-server', () => {
    expect(createPrismMcpServer().name).toBe('prism-mcp-server');
  });

  it('registers no tools in the placeholder era', () => {
    expect(createPrismMcpServer({ components: ['Button'] }).tools).toEqual([]);
  });
});
