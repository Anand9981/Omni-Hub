import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { register, login, verify2FA, refreshAuthToken, authService } from '../../../src/services/authService.js';
import { connectDB, disconnectDB } from '../../../src/config/db.js';
import { User } from '../../../src/models/index.js';

describe('authService Real Unit Tests', () => {
  const testEmail = `test-unit-${Date.now()}@example.com`;
  let registeredUserId = null;
  let userRefreshToken = null;

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({ email: /test-unit-/i });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test-unit-/i });
    await disconnectDB();
  });

  it('should export authService object and named methods', () => {
    expect(authService).toBeDefined();
    expect(typeof register).toBe('function');
    expect(typeof login).toBe('function');
  });

  it('should register a new user with valid credentials', async () => {
    const result = await register({
      name: 'Unit Test User',
      email: testEmail,
      password: 'Password@123',
    });

    expect(result).toHaveProperty('user');
    expect(result.user).toHaveProperty('id');
    expect(result.user.email).toBe(testEmail);
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('refreshToken');
    expect(result.backupCodes).toHaveLength(10);

    registeredUserId = result.user.id;
    userRefreshToken = result.refreshToken;
  });

  it('should reject registration if email is already taken', async () => {
    await expect(
      register({
        name: 'Duplicate User',
        email: testEmail,
        password: 'Password@123',
      })
    ).rejects.toThrow('already exists');
  });

  it('should reject weak password shorter than 6 characters', async () => {
    await expect(
      register({
        name: 'Weak Pass User',
        email: `weak-${Date.now()}@example.com`,
        password: '123',
      })
    ).rejects.toThrow();
  });

  it('should login successfully with correct credentials and complete 2FA', async () => {
    const result = await login({
      email: testEmail,
      password: 'Password@123',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest-Test-Agent',
    });

    expect(result.requires2FA).toBe(true);
    expect(result.email).toBe(testEmail);

    const verified = await verify2FA({
      email: testEmail,
      otp: '123456',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest-Test-Agent',
    });

    expect(verified).toHaveProperty('token');
    expect(verified).toHaveProperty('refreshToken');
    expect(verified.user.email).toBe(testEmail);
  });

  it('should reject login with wrong password', async () => {
    await expect(
      login({
        email: testEmail,
        password: 'WrongPassword!',
        ipAddress: '127.0.0.1',
        userAgent: 'Jest-Test-Agent',
      })
    ).rejects.toThrow('Invalid email or password');
  });

  it('should refresh auth token with a valid refresh token', async () => {
    const refreshed = await refreshAuthToken(userRefreshToken);
    expect(refreshed).toHaveProperty('token');
    expect(typeof refreshed.token).toBe('string');
  });
});
