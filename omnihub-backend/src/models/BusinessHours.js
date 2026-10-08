import mongoose from 'mongoose';

const dayScheduleSchema = new mongoose.Schema(
  {
    is_enabled: { type: Boolean, default: true },
    open: { type: String, default: '09:00' },
    close: { type: String, default: '18:00' },
  },
  { _id: false },
);

const businessHoursSchema = new mongoose.Schema(
  {
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    weekly_schedule: {
      monday: { type: dayScheduleSchema, default: () => ({ is_enabled: true, open: '09:00', close: '18:00' }) },
      tuesday: { type: dayScheduleSchema, default: () => ({ is_enabled: true, open: '09:00', close: '18:00' }) },
      wednesday: { type: dayScheduleSchema, default: () => ({ is_enabled: true, open: '09:00', close: '18:00' }) },
      thursday: { type: dayScheduleSchema, default: () => ({ is_enabled: true, open: '09:00', close: '18:00' }) },
      friday: { type: dayScheduleSchema, default: () => ({ is_enabled: true, open: '09:00', close: '18:00' }) },
      saturday: { type: dayScheduleSchema, default: () => ({ is_enabled: false, open: '10:00', close: '16:00' }) },
      sunday: { type: dayScheduleSchema, default: () => ({ is_enabled: false, open: '10:00', close: '16:00' }) },
    },
    holiday_mode: {
      type: Boolean,
      default: false,
    },
    holiday_message: {
      type: String,
      default: 'Our team is currently away celebrating a public holiday. We will get back to you on our next business day!',
    },
    away_message: {
      type: String,
      default: 'Thanks for reaching out! We are currently closed and will respond as soon as we reopen.',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const BusinessHours = mongoose.model('BusinessHours', businessHoursSchema);
export default BusinessHours;
