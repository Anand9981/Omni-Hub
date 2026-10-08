const STORAGE_KEY = 'omnihub.demo.interactiveMenus';
const PLATFORM_LIMITS = {
  telegram: Infinity,
  discord: Infinity,
  whatsapp: 3,
  instagram: 13,
  linkedin: Infinity,
  webchat: Infinity,
};
const PLATFORM_LABELS = {
  telegram: 'Telegram',
  discord: 'Discord',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  webchat: 'Website',
};
const ID = () => `menu-${crypto.randomUUID().slice(0, 8)}`;

function baseMenu(platform) {
  const children = [
    { id: ID(), label: 'Basic setup', action: 'media', reply: '', media_id: 'asset-setup-guide', children: [] },
    { id: ID(), label: 'Troubleshooting', action: 'reply', reply: 'Tell us what step you are stuck on and our team will help.', media_id: '', children: [] },
  ];
  const root = [
    { id: ID(), label: 'How to Setup', action: 'submenu', reply: '', media_id: '', children },
    {
      id: ID(), label: 'View Services', action: 'submenu', reply: '', media_id: '',
      children: [
        { id: ID(), label: 'Starter plan', action: 'reply', reply: 'Our Starter plan brings your essential channels into one shared inbox.', media_id: '', children: [] },
        { id: ID(), label: 'Growth plan', action: 'reply', reply: 'The Growth plan adds automation, team routing and detailed analytics.', media_id: '', children: [] },
        { id: ID(), label: 'Request pricing', action: 'reply', reply: 'Share your channels and team size, and we will prepare a tailored quote.', media_id: '', children: [] },
      ],
    },
    { id: ID(), label: 'Contact Support', action: 'input', reply: '', media_id: '', children: [] },
  ];
  if (platform !== 'whatsapp') {
    root.push({
      id: ID(), label: 'Talk to a human', action: 'submenu', reply: '', media_id: '',
      children: [
        { id: ID(), label: 'Request a call', action: 'handover', reply: 'A teammate will join this conversation shortly.', media_id: '', children: [] },
        { id: ID(), label: 'Leave a message', action: 'input', reply: '', media_id: '', children: [] },
      ],
    });
  } else {
    root[2].children = [
      { id: ID(), label: 'Ask a question', action: 'input', reply: '', media_id: '', children: [] },
      { id: ID(), label: 'Talk to a human', action: 'handover', reply: 'A teammate will join this conversation shortly.', media_id: '', children: [] },
    ];
    root[2].action = 'submenu';
  }
  return {
    platform,
    welcomeMessage: 'Thank you for choosing OmniHub! How can we help you today?',
    buttons: root,
    mediaAssets: [
      {
        id: 'asset-setup-guide',
        name: 'setup_guide.pdf',
        type: 'application/pdf',
        size: 0,
        keywords: ['setup', 'guide'],
        fallbackUrl: 'https://omnihub.example/resources/setup-guide',
        dataUrl: '',
      },
      {
        id: 'asset-catalog',
        name: 'product_catalog.pdf',
        type: 'application/pdf',
        size: 0,
        keywords: ['brochure', 'catalog'],
        fallbackUrl: 'https://omnihub.example/resources/catalog',
        dataUrl: '',
      },
      {
        id: 'asset-qr-code',
        name: 'product_qr_code.png',
        type: 'image/png',
        size: 0,
        keywords: ['qr code'],
        fallbackUrl: 'https://omnihub.example/resources/qr-code.png',
        dataUrl: '',
      },
      {
        id: 'asset-pricing',
        name: 'pricing_guide.pdf',
        type: 'application/pdf',
        size: 0,
        keywords: ['pricing'],
        fallbackUrl: 'https://omnihub.example/resources/pricing',
        dataUrl: '',
      },
    ],
    updatedAt: null,
  };
}

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Menu configuration must be an object.');
    return parsed;
  } catch (error) {
    console.error('Could not read interactive menu settings.', error);
    throw new Error('Menu settings could not be loaded. Refresh the page to retry.');
  }
}

function validateButtons(buttons, platform, mediaIds, depth = 1) {
  const limit = PLATFORM_LIMITS[platform];
  if (!Array.isArray(buttons)) throw new Error('Menu buttons must be a list.');
  if (Number.isFinite(limit) && buttons.length > limit) {
    throw new Error(`${PLATFORM_LABELS[platform]} supports up to ${limit} buttons at each menu level.`);
  }
  buttons.forEach((button) => {
    if (!button.label.trim() || button.label.length > 40) throw new Error('Button labels must be 1–40 characters.');
    if (!['submenu', 'reply', 'input', 'handover', 'media'].includes(button.action)) {
      throw new Error('Choose a valid button action.');
    }
    if (depth >= 3 && button.action === 'submenu') throw new Error('Interactive menus support up to three levels.');
    if (button.action === 'submenu' && !button.children.length) throw new Error(`Add an option inside “${button.label}” or change its action.`);
    if (button.action === 'reply' && !button.reply.trim()) throw new Error(`Add a reply for “${button.label}”.`);
    if (button.action === 'media' && !mediaIds.has(button.media_id)) throw new Error(`Choose an uploaded asset for “${button.label}”.`);
    validateButtons(button.children || [], platform, mediaIds, depth + 1);
  });
}

export const menuService = {
  platforms: Object.keys(PLATFORM_LIMITS).map((id) => ({ id, label: PLATFORM_LABELS[id] })),
  platformLimits: PLATFORM_LIMITS,

  getMenu(platform = 'whatsapp') {
    const menus = readAll();
    if (!menus[platform]) {
      menus[platform] = baseMenu(platform);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
    }
    return structuredClone(menus[platform]);
  },

  saveMenu(menu) {
    if (!PLATFORM_LIMITS[menu.platform]) throw new Error('Choose a supported messaging platform.');
    if (!menu.welcomeMessage?.trim() || menu.welcomeMessage.length > 500) {
      throw new Error('Welcome message is required and must be 500 characters or fewer.');
    }
    if (!Array.isArray(menu.mediaAssets)) throw new Error('Media assets must be a list.');
    menu.mediaAssets.forEach((asset) => {
      if (!asset.name || !Array.isArray(asset.keywords)) throw new Error('Each media asset needs a name and at least one keyword.');
      if (asset.dataUrl && asset.size > 1024 * 1024) throw new Error('Native demo uploads must be 1 MB or smaller; use a secure HTTPS link for larger files.');
      if (!asset.dataUrl && asset.fallbackUrl && !/^https:\/\//i.test(asset.fallbackUrl)) {
        throw new Error('Fallback media links must use HTTPS.');
      }
    });
    validateButtons(menu.buttons, menu.platform, new Set(menu.mediaAssets.map((asset) => asset.id)));
    const menus = readAll();
    const saved = { ...structuredClone(menu), updatedAt: new Date().toISOString() };
    menus[menu.platform] = saved;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
    return structuredClone(saved);
  },

  findMediaForText(platform, text) {
    const menu = this.getMenu(platform);
    const normalized = String(text || '').toLowerCase();
    const asset = menu.mediaAssets.find((item) => item.keywords.some((keyword) => (
      keyword && normalized.includes(keyword.toLowerCase())
    )));
    if (!asset) return null;
    return asset.dataUrl
      ? { media_url: asset.dataUrl, media_name: asset.name, media_type: asset.type }
      : asset.fallbackUrl
        ? { media_url: asset.fallbackUrl, media_name: asset.name, media_type: asset.type, media_is_fallback: true }
        : null;
  },
};
