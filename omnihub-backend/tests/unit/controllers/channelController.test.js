import { channelController } from '../../../src/controllers/channelController.js';

describe('ChannelController Unit Tests', () => {
  it('should export channelController object', () => {
    expect(channelController).toBeDefined();
    expect(typeof channelController.getAll).toBe('function');
    expect(typeof channelController.testConnection).toBe('function');
  });
});
