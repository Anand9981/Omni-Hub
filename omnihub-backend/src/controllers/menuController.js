import menuService from '../services/menuService.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';
import logger from '../utils/logger.js';

export const menuController = {
  /**
   * GET /api/dashboard/menus/:platform?
   * Fetches interactive menu configuration for specified platform
   */
  async getMenu(req, res, next) {
    try {
      const platform = req.params.platform || req.query.platform || 'default';
      const menu = await menuService.getMenuForPlatform(platform);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, menu, `Interactive menu retrieved for platform [${platform}]`),
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/dashboard/menus
   * Saves or updates interactive menu configuration
   */
  async saveMenu(req, res, next) {
    try {
      const { platform = 'default', welcome_message, welcomeMessage, buttons, media_assets, mediaAssets, is_active = true } = req.body;
      const targetPlatform = req.params.platform || platform || 'default';
      const finalWelcome = welcome_message || welcomeMessage || 'Thank you! Choose an option below:';
      const finalButtons = buttons || [];
      const finalAssets = media_assets || mediaAssets || [];

      const saved = await menuService.saveMenuConfig(targetPlatform, {
        welcome_message: finalWelcome,
        buttons: finalButtons,
        media_assets: finalAssets,
        is_active,
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, saved, `Menu configuration saved for platform [${targetPlatform}]`),
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/dashboard/menus/send
   * Dispatches the interactive welcome menu directly to a conversation
   */
  async sendMenu(req, res, next) {
    try {
      const { conversationId, platform, welcomeMessage } = req.body;
      if (!conversationId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'conversationId is required to send menu'),
        );
      }

      const result = await menuService.sendInteractiveMenu({
        conversationId,
        platform,
        welcomeMessage,
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Interactive menu sent successfully to conversation'),
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/dashboard/menus/click
   * Handles user clicking an interactive button
   */
  async handleClick(req, res, next) {
    try {
      const { conversationId, buttonId, payload, platform } = req.body;
      if (!conversationId || (!buttonId && !payload)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'conversationId and buttonId/payload are required'),
        );
      }

      const result = await menuService.handleButtonClick({
        conversationId,
        buttonId: buttonId || payload,
        payload,
        platform,
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Button interaction processed successfully'),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default menuController;

