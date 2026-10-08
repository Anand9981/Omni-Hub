import { widgetService } from '../../../src/services/widgetService.js';

describe('WidgetService Unit Tests', () => {
  it('should export widgetService object', () => {
    expect(widgetService).toBeDefined();
    expect(typeof widgetService.getWidgetConfig).toBe('function');
  });
});
