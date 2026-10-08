import { sessionService } from '../../../src/services/sessionService.js';

describe('SessionService Unit Tests', () => {
  it('should export sessionService object', () => {
    expect(sessionService).toBeDefined();
    expect(typeof sessionService.createSession).toBe('function');
  });
});
