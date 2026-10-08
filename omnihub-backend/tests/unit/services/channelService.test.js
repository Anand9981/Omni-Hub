import { channelService } from '../../../src/services/channelService.js';

describe('ChannelService Unit Tests', () => {
  it('should export channelService object', () => {
    expect(channelService).toBeDefined();
    expect(typeof channelService.getAllChannels).toBe('function');
  });
});
