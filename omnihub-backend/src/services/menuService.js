export const menuService = {
  /**
   * Generates interactive post-service menus (PRD 7.1).
   */
  getMainMenu(platform) {
    return {
      title: 'How can we help you today?',
      buttons: [
        { id: 'btn_catalog', label: '📖 View Catalog & Pricing', action: 'submenu' },
        { id: 'btn_support', label: '🎧 Connect with Agent', action: 'input' },
        { id: 'btn_hours', label: '⏰ Working Hours', action: 'input' },
      ],
    };
  },

  getCatalogSubmenu() {
    return {
      title: 'Select a product category:',
      buttons: [
        { id: 'btn_cat_branding', label: '🎨 Branding Packages', action: 'input' },
        { id: 'btn_cat_web', label: '💻 Web Development', action: 'input' },
        { id: 'btn_cat_brochure', label: '📄 Download PDF Brochure', action: 'media' },
      ],
    };
  },

  handleButtonClick(buttonId) {
    if (buttonId === 'btn_catalog') {
      return this.getCatalogSubmenu();
    }
    if (buttonId === 'btn_cat_brochure') {
      return {
        replyText: 'Here is our latest 2026 Services Brochure (PDF):',
        media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        media_type: 'application/pdf',
        media_name: 'OmniHub_Studio_Brochure_2026.pdf',
      };
    }
    if (buttonId === 'btn_hours') {
      return {
        replyText: 'We are open Monday to Friday, 9:00 AM - 6:00 PM IST.',
      };
    }
    return {
      replyText: 'Thank you! An agent will review your request shortly.',
    };
  },
};

export default menuService;
