import api from '../api/axios.js';

const CONFIG_KEY = 'omnihub.demo.websiteWidget';
const ANALYTICS_KEY = 'omnihub.demo.websiteWidgetAnalytics';

export const WIDGET_LANGUAGES = ['English', 'Hindi', 'Hinglish'];
export const WIDGET_POSITIONS = [
  { id: 'bottom-right', label: 'Bottom right' },
  { id: 'bottom-left', label: 'Bottom left' },
];
export const WIDGET_SIZES = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

const DEFAULT_CONFIG = {
  apiKey: '',
  primaryColor: '#3478e5',
  secondaryColor: '#f1f5ff',
  textColor: '#1f2e44',
  position: 'bottom-right',
  size: 'medium',
  language: 'English',
  welcomeMessage: 'Hi! How can we help you today?',
  offlineMessage: "We're offline right now. Leave a message and our team will get back to you.",
  avatarUrl: '',
  soundNotification: false,
  offlineMode: false,
  businessHours: null,
};

const DEFAULT_ANALYTICS = {
  opens: 0,
  messages: 0,
  leads: 0,
  totalSessionSeconds: 0,
  completedSessions: 0,
};

function readStored(key, fallback, description) {
  const raw = localStorage.getItem(key);
  if (!raw) return structuredClone(fallback);
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(`${description} has an invalid shape.`);
    }
    return { ...structuredClone(fallback), ...parsed };
  } catch (error) {
    console.error(`Could not read ${description}.`, error);
    return structuredClone(fallback);
  }
}

function createApiKey() {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Secure key generation is unavailable in this browser.');
  const bytes = new Uint8Array(24);
  globalThis.crypto.getRandomValues(bytes);
  return `ohw_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

function validate(config) {
  const next = { ...DEFAULT_CONFIG, ...config };
  if (!/^ohw_[a-f0-9]{48}$/.test(next.apiKey)) throw new Error('Generate a valid widget API key before saving.');
  if (!/^#[0-9a-f]{6}$/i.test(next.primaryColor)
    || !/^#[0-9a-f]{6}$/i.test(next.secondaryColor)
    || !/^#[0-9a-f]{6}$/i.test(next.textColor)) {
    throw new Error('Choose valid six-digit hex values for all widget colors.');
  }
  if (!WIDGET_POSITIONS.some(({ id }) => id === next.position)) throw new Error('Choose a supported widget position.');
  if (!WIDGET_SIZES.some(({ id }) => id === next.size)) throw new Error('Choose a supported widget size.');
  if (!WIDGET_LANGUAGES.includes(next.language)) throw new Error('Choose a supported widget language.');
  if (!next.welcomeMessage.trim() || next.welcomeMessage.length > 180) {
    throw new Error('The welcome message is required and must be 180 characters or fewer.');
  }
  if (!next.offlineMessage.trim() || next.offlineMessage.length > 240) {
    throw new Error('The offline message is required and must be 240 characters or fewer.');
  }
  if (next.avatarUrl && !/^https:\/\//i.test(next.avatarUrl)) {
    throw new Error('The agent avatar must use a secure HTTPS URL.');
  }
  if (next.businessHours) {
    const schedule = next.businessHours;
    if (!schedule.timezone || !Array.isArray(schedule.weeklySchedule) || schedule.weeklySchedule.length !== 7
      || !Array.isArray(schedule.holidays) || !Array.isArray(schedule.specialHours)) {
      throw new Error('Configure valid business hours before embedding the chat widget.');
    }
    try {
      new Intl.DateTimeFormat('en', { timeZone: schedule.timezone });
    } catch {
      throw new Error('Choose a valid business-hours time zone before embedding the widget.');
    }
    schedule.weeklySchedule.forEach((day) => {
      if (!day || !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(day.day)
        || typeof day.enabled !== 'boolean' || !Array.isArray(day.shifts)) {
        throw new Error('Each weekly business-hours entry needs a valid day and shift list.');
      }
    });
    [...schedule.weeklySchedule, ...schedule.specialHours].forEach((day) => {
      if (!day || !Array.isArray(day.shifts)) throw new Error('Each business-hours entry needs a valid shift list.');
      day.shifts.forEach((shift) => {
        if (!shift || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.start)
          || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.end)
          || shift.start >= shift.end) {
          throw new Error('Business-hour shifts need valid start and end times.');
        }
      });
    });
    schedule.specialHours.forEach((special) => {
      if (!special.date || !/^\d{4}-\d{2}-\d{2}$/.test(special.date)
        || typeof special.closed !== 'boolean') throw new Error('Special business hours need a date and valid availability.');
    });
    schedule.holidays.forEach((holiday) => {
      if (!holiday || !/^\d{4}-\d{2}-\d{2}$/.test(holiday.date)) throw new Error('Business holidays need valid dates.');
    });
  }
  return {
    ...next,
    welcomeMessage: next.welcomeMessage.trim(),
    offlineMessage: next.offlineMessage.trim(),
    avatarUrl: next.avatarUrl.trim(),
    soundNotification: Boolean(next.soundNotification),
    offlineMode: Boolean(next.offlineMode),
  };
}

function readConfig() {
  const config = readStored(CONFIG_KEY, DEFAULT_CONFIG, 'Website widget settings');
  if (!config.apiKey || !/^ohw_[a-f0-9]{48}$/.test(config.apiKey)) {
    config.apiKey = createApiKey();
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
  return validate(config);
}

function syncToBackend(payload) {
  api.put('/dashboard/widget', payload).catch((err) => {
    console.warn('[widgetService] Background sync warning:', err.message);
  });
}

function saveAnalytics(analytics) {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  syncToBackend({ analytics });
  return analytics;
}

function isWithinBusinessHours(schedule, at = new Date()) {
  if (!schedule) return true;
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: schedule.timezone,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at).reduce((values, part) => ({ ...values, [part.type]: part.value }), {});
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  if (schedule.holidayMode?.enabled
    && (!schedule.holidayMode.startDate || date >= schedule.holidayMode.startDate)
    && (!schedule.holidayMode.endDate || date <= schedule.holidayMode.endDate)) return false;
  if (schedule.holidays.some((holiday) => holiday.date === date)) return false;

  const specialHours = schedule.specialHours.find((item) => item.date === date);
  if (specialHours?.closed) return false;
  const weekday = schedule.weeklySchedule.find((item) => item.day === parts.weekday);
  const shifts = specialHours ? specialHours.shifts : weekday?.enabled ? weekday.shifts : [];
  const currentTime = `${parts.hour}:${parts.minute}`;
  return shifts.some((shift) => currentTime >= shift.start && currentTime < shift.end);
}

export const widgetService = {
  async loadFromBackend() {
    try {
      const res = await api.get('/dashboard/widget');
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        const merged = {
          ...readConfig(),
          apiKey: /^ohw_[a-f0-9]{48}$/.test(d.apiKey || '') ? d.apiKey : readConfig().apiKey,
          primaryColor: d.primaryColor || d.primary_color || '#3478e5',
          secondaryColor: d.secondaryColor || '#f1f5ff',
          textColor: d.textColor || '#1f2e44',
          position: d.position || 'bottom-right',
          size: d.size || 'medium',
          language: d.language || 'English',
          welcomeMessage: d.welcomeMessage || d.greeting_message || DEFAULT_CONFIG.welcomeMessage,
          offlineMessage: d.offlineMessage || DEFAULT_CONFIG.offlineMessage,
          avatarUrl: d.avatarUrl || '',
          soundNotification: Boolean(d.soundNotification),
          offlineMode: Boolean(d.offlineMode),
          businessHours: d.businessHours || null,
        };
        const validated = validate(merged);
        localStorage.setItem(CONFIG_KEY, JSON.stringify(validated));
        if (d.analytics && typeof d.analytics === 'object') {
          localStorage.setItem(ANALYTICS_KEY, JSON.stringify({ ...DEFAULT_ANALYTICS, ...d.analytics }));
        }
        return validated;
      }
    } catch (err) {
      console.warn('[widgetService] Backend load fallback:', err.message);
    }
    return this.getConfig();
  },

  getConfig() {
    return structuredClone(readConfig());
  },

  saveConfig(config) {
    const next = validate(config);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
    syncToBackend({
      ...next,
      primary_color: next.primaryColor,
      greeting_message: next.welcomeMessage,
    });
    return structuredClone(next);
  },

  rotateApiKey(overrides = {}) {
    const next = validate({ ...readConfig(), ...overrides, apiKey: createApiKey() });
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
    syncToBackend({
      ...next,
      primary_color: next.primaryColor,
      greeting_message: next.welcomeMessage,
    });
    return structuredClone(next);
  },

  isValidApiKey(apiKey) {
    return Boolean(apiKey && apiKey === readConfig().apiKey);
  },

  isWithinBusinessHours,

  getAnalytics() {
    return readStored(ANALYTICS_KEY, DEFAULT_ANALYTICS, 'Widget analytics');
  },

  recordOpen() {
    const analytics = this.getAnalytics();
    return saveAnalytics({ ...analytics, opens: analytics.opens + 1 });
  },

  recordMessage() {
    const analytics = this.getAnalytics();
    return saveAnalytics({ ...analytics, messages: analytics.messages + 1 });
  },

  recordLead() {
    const analytics = this.getAnalytics();
    return saveAnalytics({ ...analytics, leads: analytics.leads + 1 });
  },

  recordSession(seconds) {
    const analytics = this.getAnalytics();
    return saveAnalytics({
      ...analytics,
      totalSessionSeconds: analytics.totalSessionSeconds + Math.max(0, Math.round(seconds)),
      completedSessions: analytics.completedSessions + 1,
    });
  },
};
