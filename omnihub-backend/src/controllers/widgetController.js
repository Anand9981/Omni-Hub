import { widgetService } from '../services/widgetService.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const widgetController = {
  async get(req, res) {
    try {
      const config = await widgetService.getWidgetConfig();
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, config, 'Widget configuration.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async update(req, res) {
    try {
      const config = await widgetService.updateWidgetConfig(req.body);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, config, 'Widget configuration updated.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },
};

export default widgetController;
