import { formatResponse, generateUUID, sanitizeString } from '../../../src/utils/helpers.js';

describe('Helpers Utility Unit Tests', () => {
  it('should format standard API response', () => {
    const response = formatResponse(true, { id: 1 }, 'Success message');
    expect(response.success).toBe(true);
    expect(response.message).toBe('Success message');
    expect(response.data).toEqual({ id: 1 });
    expect(response.timestamp).toBeDefined();
  });

  it('should generate valid UUID v4', () => {
    const uuid = generateUUID();
    expect(uuid).toBeDefined();
    expect(typeof uuid).toBe('string');
  });

  it('should sanitize strings by trimming whitespace', () => {
    expect(sanitizeString('  hello world  ')).toBe('hello world');
    expect(sanitizeString(123)).toBe('');
  });
});
