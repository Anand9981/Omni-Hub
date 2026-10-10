import { Template } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

const DEFAULT_TEMPLATES = [
  {
    name: 'order_confirmation',
    category: 'Utility',
    language: 'English',
    body: 'Hi {{customer_name}}, your order {{order_id}} is confirmed. Total: {{amount}}.',
    status: 'APPROVED',
    version: 2,
    versions: [{ version: 1, body: 'Your order {{order_id}} is confirmed.', updatedAt: '2026-08-10T10:00:00.000Z' }],
    submitted_at: new Date('2026-09-20T10:00:00.000Z'),
  },
  {
    name: 'delivery_update',
    category: 'Utility',
    language: 'English',
    body: 'Your order {{order_id}} is out for delivery. Expected by {{date}}.',
    status: 'PENDING',
    version: 1,
    versions: [],
    submitted_at: new Date('2026-09-28T10:00:00.000Z'),
  },
  {
    name: 'payment_reminder',
    category: 'Utility',
    language: 'Hindi',
    body: 'Namaste {{customer_name}}, aapka {{amount}} ka payment due hai. Kripya samay par jama karein.',
    status: 'REJECTED',
    rejection_reason: 'Please clarify the payment due date in the message.',
    version: 1,
    versions: [],
    submitted_at: new Date('2026-09-25T10:00:00.000Z'),
  },
];

function formatTemplate(doc) {
  const plain = doc?.toObject ? doc.toObject() : doc;
  if (!plain) return null;
  const catMap = { MARKETING: 'Marketing', UTILITY: 'Utility', AUTHENTICATION: 'Authentication', SERVICE: 'Service' };
  const langMap = { en_US: 'English', en: 'English', hi: 'Hindi' };
  return {
    ...plain,
    id: String(plain._id || plain.id),
    category: catMap[plain.category] || plain.category || 'Utility',
    language: langMap[plain.language] || plain.language || 'English',
    rejectionReason: plain.rejection_reason ?? plain.rejectionReason ?? '',
    version: Number(plain.version || 1),
    versions: Array.isArray(plain.versions) ? plain.versions : [],
    createdAt: plain.created_at || plain.createdAt || new Date().toISOString(),
    updatedAt: plain.updated_at || plain.updatedAt || new Date().toISOString(),
    submittedAt: plain.submitted_at || plain.submittedAt || null,
  };
}

export const templateController = {
  async getAll(req, res) {
    try {
      const count = await Template.countDocuments();
      if (count === 0) {
        await Template.insertMany(DEFAULT_TEMPLATES);
      }

      const { category, status } = req.query;
      const filter = {};
      if (category && category !== 'all') filter.category = category;
      if (status && status !== 'all') filter.status = status;

      const templates = await Template.find(filter).sort({ created_at: -1 }).lean();
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, templates.map(formatTemplate), 'Templates retrieved successfully.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async getById(req, res) {
    try {
      const template = await Template.findById(req.params.id);
      if (!template) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Template not found.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, formatTemplate(template)));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async create(req, res) {
    try {
      const { name, category, language, body, variables, status, version, versions } = req.body;

      const template = await Template.create({
        name,
        category: category || 'Utility',
        language: language || 'English',
        body,
        variables: variables || [],
        status: status || 'DRAFT',
        version: version || 1,
        versions: versions || [],
        created_by: req.user?._id,
      });

      return res.status(HTTP_STATUS.CREATED).json(formatResponse(true, formatTemplate(template), 'Template saved successfully.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async update(req, res) {
    try {
      const updates = { ...req.body };
      if (updates.rejectionReason !== undefined && updates.rejection_reason === undefined) {
        updates.rejection_reason = updates.rejectionReason;
      }
      if (updates.submittedAt !== undefined && updates.submitted_at === undefined) {
        updates.submitted_at = updates.submittedAt;
      }
      const template = await Template.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
      if (!template) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Template not found.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, formatTemplate(template), 'Template updated.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async delete(req, res) {
    try {
      const template = await Template.findByIdAndDelete(req.params.id);
      if (!template) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Template not found.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, { id: req.params.id }, 'Template deleted.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },
};

export default templateController;
