import { templateController } from '../../../src/controllers/templateController.js';

describe('TemplateController Unit Tests', () => {
  it('should export templateController object', () => {
    expect(templateController).toBeDefined();
    expect(typeof templateController.getAll).toBe('function');
    expect(typeof templateController.create).toBe('function');
  });
});
