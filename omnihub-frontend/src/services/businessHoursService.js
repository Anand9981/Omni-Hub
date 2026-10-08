const STORAGE_KEY = 'omnihub.demo.businessHours';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const LANGUAGES = ['English', 'Hindi', 'Hinglish'];
const DEFAULT_SETTINGS = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  weeklySchedule: DAYS.map((day, index) => ({
    day,
    enabled: index < 6,
    shifts: index < 6 ? [{ start: '10:00', end: '19:00' }] : [],
  })),
  holidays: [],
  specialHours: [],
  awayMessage: {
    enabled: true,
    language: 'English',
    messages: {
      English: 'We are currently offline. We will reply within twenty-four hours.',
      Hindi: 'Filhaal hum offline hain. Hamari team 24 ghanton ke andar aapse sampark karegi.',
      Hinglish: 'Abhi hum offline hain. Hamari team 24 hours ke andar aapse connect karegi.',
    },
    expectedResponse: 'within twenty-four hours',
    emergencyContact: '',
  },
  holidayMode: {
    enabled: false,
    startDate: '',
    endDate: '',
    autoResume: true,
    message: 'We are away for a holiday and will be back soon. Thank you for your patience.',
  },
};

function readSettings() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = structuredClone(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const settings = JSON.parse(stored);
    if (!settings || typeof settings !== 'object' || !Array.isArray(settings.weeklySchedule)) {
      throw new Error('Business hours settings have an invalid shape.');
    }
    return {
      ...structuredClone(DEFAULT_SETTINGS),
      ...settings,
      awayMessage: { ...DEFAULT_SETTINGS.awayMessage, ...settings.awayMessage },
      holidayMode: { ...DEFAULT_SETTINGS.holidayMode, ...settings.holidayMode },
    };
  } catch (error) {
    console.error('Could not read business hours settings.', error);
    throw new Error('Business hours could not be loaded. Refresh the page to retry.');
  }
}

function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function validate(settings) {
  if (!settings.timezone) throw new Error('Choose a workspace time zone.');
  try {
    new Intl.DateTimeFormat('en', { timeZone: settings.timezone });
  } catch {
    throw new Error('Choose a valid time zone.');
  }
  if (!Array.isArray(settings.specialHours) || !Array.isArray(settings.holidays)) {
    throw new Error('Calendar exceptions must be valid lists.');
  }
  if (!Array.isArray(settings.weeklySchedule) || settings.weeklySchedule.length !== 7) {
    throw new Error('Set business hours for all seven days.');
  }
  settings.weeklySchedule.forEach((day) => {
    if (!DAYS.includes(day.day) || !Array.isArray(day.shifts)) throw new Error('A weekly schedule entry is invalid.');
    if (day.enabled && !day.shifts.length) throw new Error(`${day.day} needs at least one shift or must be marked closed.`);
    const shifts = [...day.shifts].sort((a, b) => a.start.localeCompare(b.start));
    shifts.forEach((shift, index) => {
      if (!isValidTime(shift.start) || !isValidTime(shift.end) || shift.start >= shift.end) {
        throw new Error(`${day.day}: each shift needs a valid start time before its end time.`);
      }
      if (index && shifts[index - 1].end > shift.start) throw new Error(`${day.day}: shifts cannot overlap.`);
    });
    settings.specialHours.forEach((item) => {
      if (!item.date || !item.label.trim()) throw new Error('Each special-hours entry needs a date and a name.');
      if (!item.closed && !item.shifts.length) throw new Error(`${item.label} needs at least one shift or must be marked closed.`);
      const shifts = [...item.shifts].sort((a, b) => a.start.localeCompare(b.start));
      shifts.forEach((shift, index) => {
        if (!isValidTime(shift.start) || !isValidTime(shift.end) || shift.start >= shift.end) {
          throw new Error(`${item.label}: each shift needs a valid start time before its end time.`);
        }
        if (index && shifts[index - 1].end > shift.start) throw new Error(`${item.label}: shifts cannot overlap.`);
      });
    });
    settings.holidays.forEach((holiday) => {
      if (!holiday.date || !holiday.name.trim()) throw new Error('Each holiday needs a date and a name.');
    });
  });
  if (!LANGUAGES.includes(settings.awayMessage.language)) throw new Error('Choose a supported away-message language.');
  if (settings.awayMessage.expectedResponse.length > 100 || settings.awayMessage.emergencyContact.length > 100) {
    throw new Error('Away message details are too long.');
  }
  for (const language of LANGUAGES) {
    const message = settings.awayMessage.messages[language] || '';
    if (!message.trim() || message.length > 500) throw new Error(`${language} away message must be 1–500 characters.`);
  }
  if (settings.holidayMode.startDate && settings.holidayMode.endDate
    && settings.holidayMode.endDate < settings.holidayMode.startDate) {
    throw new Error('Holiday mode end date must be on or after the start date.');
  }
  if (settings.holidayMode.enabled && settings.holidayMode.autoResume && !settings.holidayMode.endDate) {
    throw new Error('Choose a resume date to automatically turn off holiday mode.');
  }
  if (!settings.holidayMode.message.trim() || settings.holidayMode.message.length > 500) {
    throw new Error('Holiday message is required and must be 500 characters or fewer.');
  }
  return settings;
}

export const businessHoursService = {
  getSettings() {
    return readSettings();
  },
  saveSettings(settings) {
    const next = validate(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },
};

export { DAYS as BUSINESS_DAYS, LANGUAGES as AWAY_MESSAGE_LANGUAGES };
