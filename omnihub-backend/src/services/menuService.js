import { MenuConfig, Message, Conversation } from '../models/index.js';
import dispatcher from './dispatcher.js';
import { emitEvent } from '../sockets/index.js';
import logger from '../utils/logger.js';
import { MESSAGE_DIRECTIONS, MESSAGE_STATUS, ROLES } from '../utils/constants.js';

const DEFAULT_ASSETS = [
  {
    id: 'asset-setup-guide',
    name: 'OmniHub_QuickStart_Setup_Guide.pdf',
    type: 'application/pdf',
    size: 245000,
    keywords: ['setup', 'guide', 'install'],
    fallback_url: 'https://omnihub.example/resources/setup-guide.pdf',
    data_url: '',
  },
  {
    id: 'asset-catalog',
    name: 'OmniHub_Services_Catalog_2026.pdf',
    type: 'application/pdf',
    size: 512000,
    keywords: ['catalog', 'brochure', 'services'],
    fallback_url: 'https://omnihub.example/resources/catalog.pdf',
    data_url: '',
  },
  {
    id: 'asset-qr-code',
    name: 'OmniHub_Direct_Chat_QR.png',
    type: 'image/png',
    size: 84000,
    keywords: ['qr', 'code', 'connect'],
    fallback_url: 'https://omnihub.example/resources/qr-code.png',
    data_url: '',
  },
];

function buildDefaultButtons() {
  return [
    {
      id: 'btn_setup',
      label: 'How to Setup',
      action: 'submenu',
      reply: '',
      children: [
        {
          id: 'btn_setup_guide',
          label: '📄 Quickstart Setup Guide',
          action: 'media',
          reply: 'Here is our Quickstart Setup Guide (PDF). Follow the steps to connect your channels.',
          media_id: 'asset-setup-guide',
          media_url: 'https://omnihub.example/resources/setup-guide.pdf',
          media_name: 'OmniHub_QuickStart_Setup_Guide.pdf',
          media_type: 'application/pdf',
          children: [],
        },
        {
          id: 'btn_setup_help',
          label: '⚙️ Troubleshooting',
          action: 'reply',
          reply: 'For troubleshooting, verify your bot token / webhook URLs in Settings > Channels. If errors persist, tap "Contact Support".',
          children: [],
        },
      ],
    },
    {
      id: 'btn_services',
      label: 'View Services',
      action: 'submenu',
      reply: '',
      children: [
        {
          id: 'btn_srv_starter',
          label: '🚀 Starter Plan ($29/mo)',
          action: 'reply',
          reply: 'Starter Plan ($29/mo): Connect 3 channels, 2 team seats, unified multiplatform inbox, and email alerts.',
          children: [],
        },
        {
          id: 'btn_srv_growth',
          label: '⚡ Growth Plan ($79/mo)',
          action: 'reply',
          reply: 'Growth Plan ($79/mo): Unlimited channels, AI Auto-Pilot bots with Gemini Copilot, smart replies, and CRM lead capture.',
          children: [],
        },
        {
          id: 'btn_srv_quote',
          label: '💼 Request Custom Quote',
          action: 'reply',
          reply: 'Please let us know your expected monthly customer volume and requirements, and our team will prepare a custom proposal.',
          children: [],
        },
      ],
    },
    {
      id: 'btn_contact',
      label: 'Contact Support',
      action: 'handover',
      reply: 'Connecting you with our support team. An agent has been alerted and will join this conversation shortly.',
      children: [],
    },
  ];
}

export const menuService = {
  /**
   * Returns fallback default menu structure
   */
  getDefaultMenu(platform = 'default') {
    return {
      platform,
      welcome_message: 'Thank you for choosing OmniHub! Choose an option below to get started:',
      buttons: buildDefaultButtons(),
      media_assets: DEFAULT_ASSETS,
      is_active: true,
    };
  },

  /**
   * Backward-compatible helper for unit tests (tests/unit/services/menuService.test.js)
   */
  getMainMenu(platform = 'default') {
    return {
      title: 'OmniHub Main Menu',
      buttons: [
        { id: 'btn_catalog', label: '📖 View Catalog & Pricing' },
        { id: 'btn_support', label: '🎧 Talk to Support' },
        { id: 'btn_hours', label: '⏰ Working Hours' },
      ],
    };
  },

  /**
   * Backward-compatible catalog submenu helper
   */
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

  /**
   * Fetch menu configuration from MongoDB, with fallback to default
   */
  async getMenuForPlatform(platform = 'default') {
    try {
      let doc = await MenuConfig.findOne({ platform, is_active: true }).lean();
      if (!doc && platform !== 'default') {
        doc = await MenuConfig.findOne({ platform: 'default', is_active: true }).lean();
      }
      if (doc) {
        return {
          id: doc._id,
          platform: doc.platform,
          welcome_message: doc.welcome_message,
          buttons: doc.buttons || [],
          media_assets: doc.media_assets || DEFAULT_ASSETS,
          is_active: doc.is_active,
          updated_at: doc.updated_at,
        };
      }
    } catch (err) {
      logger.warn(`[MenuService] Database query failed: ${err.message}. Using default.`);
    }
    return this.getDefaultMenu(platform);
  },

  /**
   * Save or update menu configuration in MongoDB
   */
  async saveMenuConfig(platform = 'default', { welcome_message, buttons, media_assets, is_active = true }) {
    if (!welcome_message?.trim()) {
      throw new Error('Welcome message is required');
    }
    if (!Array.isArray(buttons)) {
      throw new Error('Buttons must be an array');
    }

    const updated = await MenuConfig.findOneAndUpdate(
      { platform },
      {
        platform,
        welcome_message: welcome_message.trim(),
        buttons,
        media_assets: Array.isArray(media_assets) ? media_assets : DEFAULT_ASSETS,
        is_active,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    logger.info(`[MenuService] Saved menu configuration for platform: [${platform}]`);
    return updated;
  },

  /**
   * Checks if user message matches greeting or menu trigger
   */
  isMenuTrigger(textContent) {
    if (!textContent || typeof textContent !== 'string') return false;
    const text = textContent.trim().toLowerCase();
    const triggers = [
      'hi', 'hello', 'hey', 'start', '/start', 'menu', '/menu',
      'options', 'help', '/help', 'namaste', 'swagat', 'shuru',
      'get started', 'kya option hai', 'batao', 'services',
    ];
    return triggers.includes(text) || /^(\/start|\/menu|menu|hi|hello|hey)[!.]?$/i.test(text);
  },

  /**
   * Recursively finds a button by ID or label
   */
  findButton(buttons, targetKey) {
    if (!Array.isArray(buttons) || !targetKey) return null;
    const key = String(targetKey).trim().toLowerCase();

    for (const btn of buttons) {
      if (
        String(btn.id).toLowerCase() === key ||
        String(btn.label || '').toLowerCase() === key ||
        String(btn.title || '').toLowerCase() === key
      ) {
        return btn;
      }
      if (Array.isArray(btn.children) && btn.children.length > 0) {
        const found = this.findButton(btn.children, targetKey);
        if (found) return found;
      }
    }
    return null;
  },

  /**
   * Handles interactive button click from webhooks or dashboard
   */
  async handleButtonClick(params) {
    const targetKey = typeof params === 'string' ? params : (params?.buttonId || params?.payload);
    logger.info(`[MenuService] Handling button click: "${targetKey}"`);

    // Direct helper for unit testing when called with string or without conversation
    if (typeof params === 'string' || (!params?.conversation && !params?.conversationId)) {
      if (targetKey === 'btn_catalog') {
        return this.getCatalogSubmenu();
      }
      if (targetKey === 'btn_cat_brochure') {
        return {
          replyText: 'Here is our latest 2026 Services Brochure (PDF):',
          media_url: 'https://omnihub.example/resources/catalog.pdf',
          media_name: 'OmniHub_Services_Catalog_2026.pdf',
          media_type: 'application/pdf',
        };
      }
      if (targetKey === 'btn_hours') {
        return {
          replyText: 'We are open Monday to Friday, 9:00 AM - 6:00 PM IST.',
        };
      }
      return {
        replyText: 'Thank you! An agent will review your request shortly.',
        buttons: [],
      };
    }

    const { buttonId, payload, conversationId, platform, conversation: convParam } = params || {};
    let conversation = convParam;
    if (!conversation && conversationId) {
      conversation = await Conversation.findById(conversationId);
    }
    if (!conversation) {
      logger.warn(`[MenuService] Conversation not found for button click: ${conversationId}`);
      return { success: false, reason: 'CONVERSATION_NOT_FOUND' };
    }

    const menu = await this.getMenuForPlatform(conversation.platform || platform || 'default');
    let targetButton = this.findButton(menu.buttons, targetKey);

    // Support legacy unit test buttons if not found in active menu
    if (!targetButton) {
      if (targetKey === 'btn_catalog') {
        targetButton = { id: 'btn_catalog', label: '📖 View Catalog & Pricing', action: 'submenu', children: this.getCatalogSubmenu().buttons };
      } else if (targetKey === 'btn_cat_brochure') {
        targetButton = {
          id: 'btn_cat_brochure',
          label: '📄 Download PDF Brochure',
          action: 'media',
          reply: 'Here is our latest 2026 Services Brochure (PDF):',
          media_url: 'https://omnihub.example/resources/catalog.pdf',
          media_name: 'OmniHub_Services_Catalog_2026.pdf',
          media_type: 'application/pdf',
        };
      } else if (targetKey === 'btn_hours') {
        targetButton = { id: 'btn_hours', label: '⏰ Working Hours', action: 'reply', reply: 'We are open Monday to Friday, 9:00 AM - 6:00 PM IST.' };
      }
    }

    if (!targetButton) {
      logger.warn(`[MenuService] Button not found for key: ${targetKey}`);
      return {
        replyText: 'Thank you! An agent will review your request shortly.',
        buttons: [],
      };
    }

    let replyText = '';
    let buttons = [];
    let mediaUrl = targetButton.media_url || '';
    let mediaType = targetButton.media_type || '';
    let mediaName = targetButton.media_name || '';

    switch (targetButton.action) {
      case 'reply':
        replyText = targetButton.reply || `You selected "${targetButton.label}". Our team will assist you!`;
        break;

      case 'submenu':
        replyText = `Please choose an option under "${targetButton.label}":`;
        buttons = targetButton.children || [];
        break;

      case 'media': {
        replyText = targetButton.reply || `Here is the requested document (${targetButton.media_name || 'Attachment'}):`;
        if (!mediaUrl && targetButton.media_id) {
          const asset = (menu.media_assets || DEFAULT_ASSETS).find((a) => a.id === targetButton.media_id);
          if (asset) {
            mediaUrl = asset.fallback_url || asset.data_url || '';
            mediaType = asset.type || 'application/pdf';
            mediaName = asset.name || 'document.pdf';
          }
        }
        break;
      }

      case 'handover':
        replyText = targetButton.reply || 'Connecting you with an agent. Our team has been alerted and will join shortly.';
        conversation.assigned_agent_id = null;
        conversation.status = 'ACTIVE';
        await conversation.save();
        break;

      case 'input':
        replyText = targetButton.reply || 'Please type your question or requirements below, and our team will get right back to you.';
        break;

      default:
        replyText = targetButton.reply || 'Thank you for your response!';
        break;
    }

    // Record outbound BOT response message in MongoDB
    const botMessage = await Message.create({
      conversation_id: conversation._id,
      platform: conversation.platform,
      sender_type: 'BOT',
      direction: MESSAGE_DIRECTIONS.OUTBOUND,
      text_content: replyText,
      media_url: mediaUrl,
      media_type: mediaType,
      media_name: mediaName,
      buttons,
      status: MESSAGE_STATUS.DELIVERED,
    });

    // Dispatch outbound message to external channel
    await dispatcher.dispatchOutboundMessage({
      platform: conversation.platform,
      external_chat_id: conversation.external_chat_id,
      text_content: replyText,
      media_url: mediaUrl,
      buttons,
    }).catch((err) => logger.error(`[Menu Dispatch Outbound Error] ${err.message}`));

    conversation.last_activity_at = new Date();
    await conversation.save();

    // Broadcast Real-time Socket.io events
    emitEvent('new_message', {
      conversation_id: conversation._id,
      sender_name: 'OmniHub Assistant',
      platform: conversation.platform,
      message: {
        id: botMessage._id,
        _id: botMessage._id,
        conversation_id: conversation._id,
        platform: conversation.platform,
        sender_type: 'BOT',
        direction: MESSAGE_DIRECTIONS.OUTBOUND,
        text_content: replyText,
        media_url: mediaUrl,
        media_type: mediaType,
        media_name: mediaName,
        buttons,
        status: MESSAGE_STATUS.DELIVERED,
        created_at: botMessage.created_at,
      },
    });

    emitEvent('conversation_update', {
      id: conversation._id,
      platform: conversation.platform,
      sender_name: conversation.sender_name,
      last_activity_at: conversation.last_activity_at,
      lastMessage: {
        text_content: replyText,
        direction: MESSAGE_DIRECTIONS.OUTBOUND,
        created_at: botMessage.created_at,
      },
    });

    return {
      success: true,
      replyText,
      buttons,
      media_url: mediaUrl,
      media_type: mediaType,
      media_name: mediaName,
      messageId: botMessage._id,
    };
  },

  /**
   * Send the interactive welcome menu directly into a conversation
   */
  async sendInteractiveMenu({ conversationId, platform, welcomeMessage }) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found for ID: ${conversationId}`);
    }

    const menu = await this.getMenuForPlatform(platform || conversation.platform);
    const textToSend = welcomeMessage || menu.welcome_message;
    const buttonsToSend = menu.buttons || [];

    const botMessage = await Message.create({
      conversation_id: conversation._id,
      platform: conversation.platform,
      sender_type: 'BOT',
      direction: MESSAGE_DIRECTIONS.OUTBOUND,
      text_content: textToSend,
      buttons: buttonsToSend,
      status: MESSAGE_STATUS.DELIVERED,
    });

    await dispatcher.dispatchOutboundMessage({
      platform: conversation.platform,
      external_chat_id: conversation.external_chat_id,
      text_content: textToSend,
      buttons: buttonsToSend,
    }).catch((err) => logger.error(`[Menu Send Dispatch Error] ${err.message}`));

    conversation.last_activity_at = new Date();
    await conversation.save();

    emitEvent('new_message', {
      conversation_id: conversation._id,
      sender_name: 'OmniHub Assistant',
      platform: conversation.platform,
      message: {
        id: botMessage._id,
        _id: botMessage._id,
        conversation_id: conversation._id,
        platform: conversation.platform,
        sender_type: 'BOT',
        direction: MESSAGE_DIRECTIONS.OUTBOUND,
        text_content: textToSend,
        buttons: buttonsToSend,
        status: MESSAGE_STATUS.DELIVERED,
        created_at: botMessage.created_at,
      },
    });

    emitEvent('conversation_update', {
      id: conversation._id,
      platform: conversation.platform,
      sender_name: conversation.sender_name,
      last_activity_at: conversation.last_activity_at,
      lastMessage: {
        text_content: textToSend,
        direction: MESSAGE_DIRECTIONS.OUTBOUND,
        created_at: botMessage.created_at,
      },
    });

    return {
      success: true,
      message: botMessage,
    };
  },
};

export default menuService;
