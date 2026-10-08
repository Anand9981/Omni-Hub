import { authController } from '../../../src/controllers/authController.js';

describe('AuthController Unit Tests', () => {
  it('should export authController object with expected handlers', () => {
    expect(authController).toBeDefined();
    expect(typeof authController.register).toBe('function');
    expect(typeof authController.login).toBe('function');
    expect(typeof authController.getCurrentUser).toBe('function');
  });
});
