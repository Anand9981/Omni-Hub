import { signToken, verifyToken, signRefreshToken, verifyRefreshToken } from '../../../src/utils/jwt.js';

describe('JWT Utility Unit Tests', () => {
  const payload = { userId: 'user123', role: 'ADMIN' };

  it('should sign and verify access tokens', () => {
    const token = signToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).toBeDefined();
    expect(decoded.userId).toBe('user123');
    expect(decoded.role).toBe('ADMIN');
  });

  it('should sign and verify refresh tokens', () => {
    const refreshToken = signRefreshToken(payload);
    expect(refreshToken).toBeDefined();
    expect(typeof refreshToken).toBe('string');

    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded).toBeDefined();
    expect(decoded.userId).toBe('user123');
  });

  it('should return null for invalid token verification', () => {
    const invalidResult = verifyToken('invalid.token.string');
    expect(invalidResult).toBeNull();
  });
});
