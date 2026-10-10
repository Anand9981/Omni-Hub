import api from '../api/axios.js';

const STORAGE_KEY = 'omnihub.demo.clientOnboarding';
const CHANNELS = ['telegram', 'discord', 'whatsapp', 'instagram', 'webchat', 'linkedin'];

const DEFAULT_ONBOARDING = {
  status: 'not_started',
  currentStep: 3,
  business: {
    name: '',
    industry: '',
    hours: '',
  },
  channels: Object.fromEntries(CHANNELS.map((channel) => [channel, { connected: false }])),
  knowledge: {
    text: '',
    language: 'English',
    websiteUrl: '',
    files: [],
    faqs: [],
  },
  invitedAgents: [],
  tests: {
    message: false,
    aiReply: false,
    menu: false,
    approval: false,
    analytics: false,
  },
  updatedAt: null,
  completedAt: null,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return clone(DEFAULT_ONBOARDING);
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Onboarding state must be an object.');
    }
    return {
      ...clone(DEFAULT_ONBOARDING),
      ...parsed,
      business: { ...DEFAULT_ONBOARDING.business, ...parsed.business },
      channels: { ...DEFAULT_ONBOARDING.channels, ...parsed.channels },
      knowledge: { ...DEFAULT_ONBOARDING.knowledge, ...parsed.knowledge },
      tests: { ...DEFAULT_ONBOARDING.tests, ...parsed.tests },
      invitedAgents: Array.isArray(parsed.invitedAgents) ? parsed.invitedAgents : [],
    };
  } catch (error) {
    console.error('Could not read client onboarding progress.', error);
    return clone(DEFAULT_ONBOARDING);
  }
}

function persist(next) {
  const state = { ...next, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  api.put('/dashboard/onboarding', {
    status: state.status,
    currentStep: state.currentStep,
    business: state.business,
    channels: state.channels,
    knowledge: state.knowledge,
    invitedAgents: state.invitedAgents,
    tests: state.tests,
  }).catch((err) => {
    console.warn('[onboardingService] Sync onboarding warning:', err.message);
  });

  return clone(state);
}

function validateFaqs(faqs) {
  if (!Array.isArray(faqs) || faqs.length > 100) throw new Error('Add no more than 100 frequently asked questions.');
  faqs.forEach((faq) => {
    if (!faq.question?.trim() || !faq.answer?.trim()
      || faq.question.length > 300 || faq.answer.length > 1200) {
      throw new Error('Each FAQ needs a question and answer within the character limits.');
    }
  });
}

export const onboardingService = {
  getProgress() {
    return readState();
  },

  async fetchProgress() {
    try {
      const res = await api.get('/dashboard/onboarding');
      const data = res.data?.data;
      if (data) {
        const local = readState();
        const merged = {
          ...local,
          status: data.status || local.status,
          currentStep: data.current_step || local.currentStep || 3,
          business: { ...local.business, ...(data.business || {}) },
          channels: { ...local.channels, ...(data.channels || {}) },
          knowledge: { ...local.knowledge, ...(data.knowledge || {}) },
          invitedAgents: Array.isArray(data.invited_agents) && data.invited_agents.length ? data.invited_agents : local.invitedAgents,
          tests: { ...local.tests, ...(data.tests || {}) },
          updatedAt: data.updated_at || local.updatedAt,
          completedAt: data.completed_at || local.completedAt,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('[onboardingService] Fallback to cached onboarding progress:', err.message);
    }
    return readState();
  },

  updateProgress(updates) {
    const current = readState();
    const next = {
      ...current,
      ...updates,
      business: updates.business ? { ...current.business, ...updates.business } : current.business,
      channels: updates.channels ? { ...current.channels, ...updates.channels } : current.channels,
      knowledge: updates.knowledge ? { ...current.knowledge, ...updates.knowledge } : current.knowledge,
      tests: updates.tests ? { ...current.tests, ...updates.tests } : current.tests,
    };
    if (!['not_started', 'in_progress', 'skipped', 'completed'].includes(next.status)) {
      throw new Error('Choose a valid onboarding status.');
    }
    if (!Number.isInteger(next.currentStep) || next.currentStep < 1 || next.currentStep > 8) {
      throw new Error('Choose a valid onboarding step.');
    }
    if (!['English', 'Hindi', 'Hinglish'].includes(next.knowledge.language)) {
      throw new Error('Choose a supported knowledge-base language.');
    }
    validateFaqs(next.knowledge.faqs);
    if (!Array.isArray(next.knowledge.files) || next.knowledge.files.length > 20) {
      throw new Error('Upload no more than 20 knowledge-base files.');
    }
    next.knowledge.files.forEach((file) => {
      if (!file.name || !['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
        || file.size > 2 * 1024 * 1024 || !file.dataUrl?.startsWith('data:')) {
        throw new Error('A knowledge-base file is invalid or exceeds the 2 MB demo limit.');
      }
    });
    if (!Array.isArray(next.invitedAgents) || next.invitedAgents.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      throw new Error('Check the invited team member email addresses.');
    }
    if (next.status === 'completed') next.completedAt = new Date().toISOString();
    return persist(next);
  },

  skip() {
    return this.updateProgress({ status: 'skipped' });
  },

  finish() {
    return this.updateProgress({ status: 'completed', currentStep: 8 });
  },
};

export { CHANNELS as ONBOARDING_CHANNEL_IDS };
