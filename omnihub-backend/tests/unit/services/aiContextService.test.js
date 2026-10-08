import { aiContextService } from '../../../src/services/aiContextService.js';

describe('AIContextService Unit Tests', () => {
  it('should export aiContextService object', () => {
    expect(aiContextService).toBeDefined();
    expect(typeof aiContextService.getContext).toBe('function');
    expect(typeof aiContextService.updateContext).toBe('function');
  });
});
