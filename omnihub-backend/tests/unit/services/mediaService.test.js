import { mediaService } from '../../../src/services/mediaService.js';

describe('MediaService Unit Tests', () => {
  it('should export mediaService object', () => {
    expect(mediaService).toBeDefined();
    expect(typeof mediaService.uploadMedia).toBe('function');
  });
});
