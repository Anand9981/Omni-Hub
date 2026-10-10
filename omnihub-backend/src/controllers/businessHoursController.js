import { BusinessHours } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatHours(doc) {
  const plain = doc?.toObject ? doc.toObject() : (doc || {});
  const weeklySchedule = Array.isArray(plain.weeklySchedule) && plain.weeklySchedule.length === 7
    ? plain.weeklySchedule
    : DAYS.map((day, idx) => {
        const key = day.toLowerCase();
        const entry = plain.weekly_schedule?.[key];
        const enabled = entry ? Boolean(entry.is_enabled) : idx < 6;
        return {
          day,
          enabled,
          shifts: enabled ? [{ start: entry?.open || '10:00', end: entry?.close || '19:00' }] : [],
        };
      });

  return {
    ...plain,
    timezone: plain.timezone || 'Asia/Kolkata',
    weeklySchedule,
    holidays: Array.isArray(plain.holidays) ? plain.holidays : [],
    specialHours: Array.isArray(plain.specialHours) ? plain.specialHours : [],
    awayMessage: plain.awayMessage || {
      enabled: true,
      language: 'English',
      messages: {
        English: plain.away_message || 'We are currently offline. We will reply within twenty-four hours.',
        Hindi: 'Filhaal hum offline hain. Hamari team 24 ghanton ke andar aapse sampark karegi.',
        Hinglish: 'Abhi hum offline hain. Hamari team 24 hours ke andar aapse connect karegi.',
      },
      expectedResponse: 'within twenty-four hours',
      emergencyContact: '',
    },
    holidayMode: plain.holidayMode || {
      enabled: Boolean(plain.holiday_mode),
      startDate: '',
      endDate: '',
      autoResume: true,
      message: plain.holiday_message || 'We are away for a holiday and will be back soon. Thank you for your patience.',
    },
  };
}

export const businessHoursController = {
  async get(req, res) {
    try {
      let hours = await BusinessHours.findOne();
      if (!hours) {
        hours = await BusinessHours.create({});
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, formatHours(hours), 'Business hours retrieved.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async update(req, res) {
    try {
      let hours = await BusinessHours.findOne();
      const payload = { ...req.body };

      if (Array.isArray(payload.weeklySchedule)) {
        const mapped = {};
        payload.weeklySchedule.forEach((d) => {
          const key = String(d.day || '').toLowerCase();
          if (key) {
            mapped[key] = {
              is_enabled: Boolean(d.enabled),
              open: d.shifts?.[0]?.start || '09:00',
              close: d.shifts?.[0]?.end || '18:00',
            };
          }
        });
        payload.weekly_schedule = mapped;
      }

      if (payload.holidayMode && typeof payload.holidayMode === 'object') {
        payload.holiday_mode = Boolean(payload.holidayMode.enabled);
        if (payload.holidayMode.message) payload.holiday_message = payload.holidayMode.message;
      }

      if (payload.awayMessage && typeof payload.awayMessage === 'object') {
        const lang = payload.awayMessage.language || 'English';
        if (payload.awayMessage.messages?.[lang]) {
          payload.away_message = payload.awayMessage.messages[lang];
        }
      }

      if (!hours) {
        hours = new BusinessHours(payload);
      } else {
        Object.assign(hours, payload);
      }
      await hours.save();
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, formatHours(hours), 'Business hours updated successfully.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },
};

export default businessHoursController;
