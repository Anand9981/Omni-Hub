import { widgetController } from '../../../src/controllers/widgetController.js';

describe('WidgetController Unit Tests', () => {
  it('should export widgetController object', () => {
    expect(widgetController).toBeDefined();
    expect(typeof widgetController.get).toBe('function');
    expect(typeof widgetController.update).toBe('function');
  });
});
