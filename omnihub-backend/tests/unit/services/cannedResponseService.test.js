import { cannedResponseService } from '../../../src/services/cannedResponseService.js';

describe('CannedResponseService Unit Tests', () => {
  it('should export cannedResponseService object', () => {
    expect(cannedResponseService).toBeDefined();
    expect(typeof cannedResponseService.list).toBe('function');
  });
});
