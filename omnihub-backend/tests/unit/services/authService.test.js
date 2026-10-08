import { authService } from '../../../src/services/authService.js';

describe('AuthService Unit Tests', () => {
  it('should export authService object with expected methods', () => {
    expect(authService).toBeDefined();
    expect(typeof authService.register).toBe('function');
    expect(typeof authService.login).toBe('function');
    expect(typeof authService.verify2FA).toBe('function');
  });
});
