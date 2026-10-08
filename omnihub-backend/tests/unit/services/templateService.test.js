import { templateService } from '../../../src/services/templateService.js';

describe('TemplateService Unit Tests', () => {
  it('should export templateService object', () => {
    expect(templateService).toBeDefined();
    expect(typeof templateService.list).toBe('function');
  });
});
