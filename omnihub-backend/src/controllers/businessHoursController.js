import { BusinessHours } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const businessHoursController = {
  async get(req, res) {
    try {
      let hours = await BusinessHours.findOne();
      if (!hours) {
        hours = await BusinessHours.create({});
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, hours, 'Business hours retrieved.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async update(req, res) {
    try {
      let hours = await BusinessHours.findOne();
      if (!hours) {
        hours = new BusinessHours(req.body);
      } else {
        Object.assign(hours, req.body);
      }
      await hours.save();
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, hours, 'Business hours updated successfully.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },
};

export default businessHoursController;
