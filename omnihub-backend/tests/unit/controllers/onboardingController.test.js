import { onboardingController } from '../../../src/controllers/onboardingController.js';

describe('OnboardingController Unit Tests', () => {
  it('should export onboardingController object', () => {
    expect(onboardingController).toBeDefined();
    expect(typeof onboardingController.getProgress).toBe('function');
  });
});
