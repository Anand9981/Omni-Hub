import { mediaService } from '../../../src/services/mediaService.js';

describe('mediaService Real Unit Tests', () => {
  it('should return fallback secure media URL when cloud storage is unset or in mock mode', async () => {
    const dummyBuffer = Buffer.from('fake-image-bytes');
    const res = await mediaService.uploadMedia(dummyBuffer);
    const url = typeof res === 'string' ? res : res?.secure_url || res?.url;

    expect(url).toBeDefined();
    expect(url).toMatch(/^https?:\/\//);
  });
});
