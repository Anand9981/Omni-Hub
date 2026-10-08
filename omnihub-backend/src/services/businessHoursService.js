import { BusinessHours } from '../models/index.js';
import logger from '../utils/logger.js';

export const businessHoursService = {
  async getHours() {
    let hours = await BusinessHours.findOne().lean();
    if (!hours) {
      const created = await BusinessHours.create({});
      hours = created.toObject();
    }
    return hours;
  },

  async updateHours(data) {
    let hours = await BusinessHours.findOne();
    if (!hours) {
      hours = new BusinessHours(data);
    } else {
      Object.assign(hours, data);
    }
    await hours.save();
    logger.info('[BusinessHoursService] Business hours configuration updated');
    return hours;
  },

  async checkIsOpen(date = new Date()) {
    const hours = await this.getHours();

    if (hours.holiday_mode) {
      return { isOpen: false, reason: 'holiday', message: hours.holiday_message };
    }

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[date.getDay()];
    const daySchedule = hours.weekly_schedule?.[currentDay];

    if (!daySchedule || !daySchedule.is_enabled) {
      return { isOpen: false, reason: 'closed_day', message: hours.away_message };
    }

    const currentTimeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const isOpen = currentTimeStr >= daySchedule.open && currentTimeStr <= daySchedule.close;

    return {
      isOpen,
      reason: isOpen ? 'open' : 'outside_hours',
      message: isOpen ? '' : hours.away_message,
    };
  },
};

export default businessHoursService;
