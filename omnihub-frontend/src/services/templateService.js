import api from '../api/axios.js';

const STORAGE_KEY = 'omnihub.demo.whatsappTemplates';
export const TEMPLATE_CATEGORIES = ['Marketing', 'Utility', 'Authentication', 'Service'];
export const TEMPLATE_LANGUAGES = ['English', 'Hindi', 'Hinglish', 'Spanish', 'French'];
export const TEMPLATE_VARIABLES = ['customer_name', 'order_id', 'amount', 'date', 'business_name'];

const SEED_TEMPLATES = [
  {
    id: 'tpl-order-confirmation-en',
    name: 'order_confirmation',
    category: 'Utility',
    language: 'English',
    body: 'Hi {{customer_name}}, your order {{order_id}} is confirmed. Total: {{amount}}.',
    status: 'APPROVED',
    version: 2,
    versions: [{ version: 1, body: 'Your order {{order_id}} is confirmed.', updatedAt: '2026-08-10T10:00:00.000Z' }],
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
    submittedAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'tpl-delivery-update-en',
    name: 'delivery_update',
    category: 'Utility',
    language: 'English',
    body: 'Your order {{order_id}} is out for delivery. Expected by {{date}}.',
    status: 'PENDING',
    version: 1,
    versions: [],
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    submittedAt: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'tpl-payment-reminder-hi',
    name: 'payment_reminder',
    category: 'Utility',
    language: 'Hindi',
    body: 'Namaste {{customer_name}}, aapka {{amount}} ka payment due hai. Kripya samay par jama karein.',
    status: 'REJECTED',
    rejectionReason: 'Please clarify the payment due date in the message.',
    version: 1,
    versions: [],
    createdAt: '2026-09-25T10:00:00.000Z',
    updatedAt: '2026-09-26T10:00:00.000Z',
    submittedAt: '2026-09-25T10:00:00.000Z',
  },
];

function readTemplates() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TEMPLATES));
    return SEED_TEMPLATES;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error('WhatsApp templates must be a list.');
    return parsed;
  } catch (error) {
    console.error('Could not read WhatsApp templates.', error);
    return SEED_TEMPLATES;
  }
}

function persist(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function sortTemplates(list) {
  return [...list].sort((a, b) => (
    String(a.name || '').localeCompare(String(b.name || ''))
    || String(a.language || '').localeCompare(String(b.language || ''))
  ));
}

function mapTemplate(doc) {
  return {
    ...doc,
    id: String(doc._id || doc.id),
    name: doc.name || '',
    category: TEMPLATE_CATEGORIES.includes(doc.category) ? doc.category : 'Utility',
    language: TEMPLATE_LANGUAGES.includes(doc.language) ? doc.language : 'English',
    body: doc.body || '',
    status: doc.status || 'DRAFT',
    rejectionReason: doc.rejectionReason ?? doc.rejection_reason ?? '',
    version: Number(doc.version || 1),
    versions: Array.isArray(doc.versions) ? doc.versions : [],
    createdAt: doc.createdAt || doc.created_at || new Date().toISOString(),
    updatedAt: doc.updatedAt || doc.updated_at || new Date().toISOString(),
    submittedAt: doc.submittedAt || doc.submitted_at || null,
  };
}

function validateTemplate(input) {
  const name = String(input.name || '').trim().toLowerCase();
  const body = String(input.body || '').trim();
  if (!/^[a-z0-9_]{1,512}$/.test(name)) {
    throw new Error('Template name must use lowercase letters, numbers, and underscores only.');
  }
  if (!TEMPLATE_CATEGORIES.includes(input.category)) throw new Error('Choose a valid WhatsApp template category.');
  if (!TEMPLATE_LANGUAGES.includes(input.language)) throw new Error('Choose a supported template language.');
  if (!body || body.length > 1024) throw new Error('Template body is required and must be 1,024 characters or fewer.');
  const variables = [...body.matchAll(/\{\{([^{}]+)\}\}/g)].map((match) => match[1].trim());
  const unknownVariables = variables.filter((variable) => !TEMPLATE_VARIABLES.includes(variable));
  if (unknownVariables.length) throw new Error(`Unsupported variable: {{${unknownVariables[0]}}}.`);
  return { name, body, category: input.category, language: input.language, variables };
}

export const templateService = {
  async listTemplates() {
    try {
      const res = await api.get('/dashboard/templates');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = sortTemplates(res.data.data.map(mapTemplate));
        persist(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('[templateService] Backend API fallback:', err.message);
    }
    return sortTemplates(readTemplates());
  },

  async saveTemplate(input) {
    const templates = readTemplates();
    const normalized = validateTemplate(input);
    const duplicate = templates.find((template) => (
      template.name === normalized.name && template.language === normalized.language && template.id !== input.id
    ));
    if (duplicate) throw new Error(`A ${normalized.language} version of “${normalized.name}” already exists.`);

    const now = new Date().toISOString();

    try {
      if (input.id && /^[0-9a-f]{24}$/i.test(String(input.id))) {
        const existing = templates.find((template) => template.id === input.id);
        const changed = !existing
          || existing.body !== normalized.body
          || existing.name !== normalized.name
          || existing.category !== normalized.category
          || existing.language !== normalized.language;

        await api.put(`/dashboard/templates/${input.id}`, {
          ...normalized,
          version: changed ? (existing?.version || 1) + 1 : (existing?.version || 1),
          versions: changed && existing
            ? [{ version: existing.version, body: existing.body, updatedAt: existing.updatedAt }, ...(existing.versions || [])]
            : (existing?.versions || []),
          status: changed ? 'DRAFT' : (existing?.status || 'DRAFT'),
          rejection_reason: changed ? '' : (existing?.rejectionReason || ''),
          submitted_at: changed ? null : (existing?.submittedAt || null),
        });
      } else {
        await api.post('/dashboard/templates', {
          ...normalized,
          status: 'DRAFT',
          version: 1,
          versions: [],
        });
      }
      return await this.listTemplates();
    } catch (err) {
      console.warn('[templateService] Save fallback:', err.message);
    }

    if (input.id) {
      const existing = templates.find((template) => template.id === input.id);
      if (!existing) throw new Error('That template could not be found.');
      const changed = existing.body !== normalized.body
        || existing.name !== normalized.name
        || existing.category !== normalized.category
        || existing.language !== normalized.language;
      const next = templates.map((template) => (template.id !== input.id ? template : ({
        ...template,
        ...normalized,
        version: changed ? template.version + 1 : template.version,
        versions: changed
          ? [{ version: template.version, body: template.body, updatedAt: template.updatedAt }, ...template.versions]
          : template.versions,
        status: changed ? 'DRAFT' : template.status,
        rejectionReason: changed ? '' : template.rejectionReason,
        submittedAt: changed ? null : template.submittedAt,
        updatedAt: now,
      })));
      persist(next);
      return sortTemplates(next);
    }

    const next = [{
      id: `tpl-${crypto.randomUUID().slice(0, 10)}`,
      ...normalized,
      status: 'DRAFT',
      version: 1,
      versions: [],
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
    }, ...templates];
    persist(next);
    return sortTemplates(next);
  },

  async submitTemplate(templateId) {
    const templates = readTemplates();
    const template = templates.find((item) => item.id === templateId);
    if (!template) throw new Error('That template could not be found.');
    if (template.status === 'PENDING') throw new Error('This template is already awaiting Meta review.');
    if (template.status === 'APPROVED') throw new Error('This template is already approved.');
    const now = new Date().toISOString();

    try {
      if (/^[0-9a-f]{24}$/i.test(String(templateId))) {
        await api.put(`/dashboard/templates/${templateId}`, {
          status: 'PENDING',
          submitted_at: now,
          rejection_reason: '',
        });
        return await this.listTemplates();
      }
    } catch (err) {
      console.warn('[templateService] Submit fallback:', err.message);
    }

    const next = templates.map((item) => (item.id === templateId
      ? { ...item, status: 'PENDING', submittedAt: now, updatedAt: now, rejectionReason: '' }
      : item));
    persist(next);
    return sortTemplates(next);
  },

  async deleteTemplate(templateId) {
    try {
      if (/^[0-9a-f]{24}$/i.test(String(templateId))) {
        await api.delete(`/dashboard/templates/${templateId}`);
        return await this.listTemplates();
      }
    } catch (err) {
      console.warn('[templateService] Delete fallback:', err.message);
    }

    const templates = readTemplates();
    const next = templates.filter((template) => template.id !== templateId);
    persist(next);
    return sortTemplates(next);
  },
};
