import { menuService } from '../../../src/services/menuService.js';

describe('menuService Real Unit Tests', () => {
  it('should return main menu with 3 standard options', () => {
    const menu = menuService.getMainMenu('telegram');
    expect(menu).toHaveProperty('title');
    expect(menu.buttons).toHaveLength(3);
    expect(menu.buttons[0].id).toBe('btn_catalog');
    expect(menu.buttons[1].id).toBe('btn_support');
    expect(menu.buttons[2].id).toBe('btn_hours');
  });

  it('should return catalog submenu when btn_catalog clicked', async () => {
    const submenu = await menuService.handleButtonClick('btn_catalog');
    expect(submenu.buttons).toHaveLength(3);
    expect(submenu.buttons[2].id).toBe('btn_cat_brochure');
  });

  it('should return PDF brochure attachment when btn_cat_brochure clicked', async () => {
    const res = await menuService.handleButtonClick('btn_cat_brochure');
    expect(res).toHaveProperty('media_url');
    expect(res.media_type).toBe('application/pdf');
    expect(res.media_name).toContain('.pdf');
  });

  it('should return working hours text when btn_hours clicked', async () => {
    const res = await menuService.handleButtonClick('btn_hours');
    expect(res.replyText).toContain('Monday to Friday');
  });

  it('should return default fallback text for unknown button', async () => {
    const res = await menuService.handleButtonClick('btn_unknown');
    expect(res.replyText).toContain('An agent will review');
  });
});
