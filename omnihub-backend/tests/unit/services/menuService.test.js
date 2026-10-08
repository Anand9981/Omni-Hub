import { menuService } from '../../../src/services/menuService.js';

describe('MenuService Unit Tests', () => {
  it('should return main menu structure', () => {
    expect(menuService).toBeDefined();
    const menu = menuService.getMainMenu('telegram');
    expect(menu.title).toBeDefined();
    expect(Array.isArray(menu.buttons)).toBe(true);
  });
});
