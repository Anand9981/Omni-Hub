import { onboardingService } from '../../../src/services/onboardingService.js';

describe('OnboardingService Unit Tests', () => {
  it('should export onboardingService object', () => {
    expect(onboardingService).toBeDefined();
    expect(typeof onboardingService.getProgress).toBe('function');
  });
});
