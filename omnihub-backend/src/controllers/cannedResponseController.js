import { CannedResponse } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

const DEFAULT_CANNED_RESPONSES = [
  { title: 'Pricing overview', shortcut: '/pricing', category: 'Pricing', language: 'English', body: 'Hi {customer_name}, our pricing starts from a base rate and scales with the channels you connect. Would you like a detailed quote for {business_name}?', is_favorite: true, usage_count: 12 },
  { title: 'Business hours', shortcut: '/hours', category: 'FAQ', language: 'English', body: 'We are open Monday to Saturday, 10 AM to 7 PM. If you share a good time, our team at {business_name} will be happy to help.', is_favorite: true, usage_count: 9 },
  { title: 'Share location', shortcut: '/location', category: 'FAQ', language: 'English', body: 'We are located at our main office. Let me know if you would like directions or a map link.', is_favorite: false, usage_count: 4 },
  { title: 'Setup guide', shortcut: '/setup', category: 'Support', language: 'English', body: 'Here is your setup guide. If anything is unclear, reply here and the {business_name} team will walk you through it.', is_favorite: true, usage_count: 7 },
  { title: 'Support follow-up', shortcut: '/support', category: 'Support', language: 'English', body: 'Thanks for reaching out, {customer_name}. Our team will connect with you within twenty-four hours.', is_favorite: false, usage_count: 6 },
  { title: 'Book a walkthrough', shortcut: '/demo', category: 'Sales', language: 'English', body: 'We would love to show you around, {customer_name}. Which day and time works best for a quick product walkthrough?', is_favorite: false, usage_count: 5 },
  { title: 'Pricing overview', shortcut: '/pricing-hi', category: 'Pricing', language: 'Hindi', body: 'Namaste {customer_name}, hamare plans aapke connected channels ke hisaab se customize hote hain. Kya main {business_name} ke liye detailed quote share karun?', is_favorite: false, usage_count: 3 },
  { title: 'Support follow-up', shortcut: '/support-hi', category: 'Support', language: 'Hindi', body: 'Sampark karne ke liye dhanyavaad, {customer_name}. Hamari team 24 ghanton ke andar aapse connect karegi.', is_favorite: false, usage_count: 2 },
  { title: 'Business hours', shortcut: '/hours-hi', category: 'FAQ', language: 'Hindi', body: 'Hamare business hours Monday se Saturday, subah 10 baje se shaam 7 baje tak hain. Aapke liye kaunsa time sahi rahega?', is_favorite: false, usage_count: 1 },
  { title: 'Pricing overview', shortcut: '/pricing-hinglish', category: 'Pricing', language: 'Hinglish', body: 'Hi {customer_name}, pricing aapke connected channels ke according hoti hai. Kya main {business_name} ke liye ek detailed quote share karun?', is_favorite: true, usage_count: 8 },
  { title: 'Setup guide', shortcut: '/setup-hinglish', category: 'Support', language: 'Hinglish', body: 'Yeh raha aapka setup guide. Agar koi step confusing lage, bas yahin reply kariye — {business_name} team help karegi.', is_favorite: false, usage_count: 4 },
  { title: 'Book a walkthrough', shortcut: '/demo-hinglish', category: 'Sales', language: 'Hinglish', body: 'Bilkul {customer_name}, hum aapko product ka quick walkthrough de sakte hain. Aapke liye kaunsa din aur time convenient rahega?', is_favorite: false, usage_count: 3 },
];

function formatDoc(doc) {
  const plain = doc?.toObject ? doc.toObject() : doc;
  if (!plain) return null;
  return {
    ...plain,
    id: String(plain._id || plain.id),
    content: plain.body || plain.content || '',
    body: plain.body || plain.content || '',
    favorite: Boolean(plain.is_favorite ?? plain.favorite),
    is_favorite: Boolean(plain.is_favorite ?? plain.favorite),
    usageCount: Number(plain.usage_count ?? plain.usageCount ?? 0),
    usage_count: Number(plain.usage_count ?? plain.usageCount ?? 0),
    createdAt: plain.created_at || plain.createdAt,
    updatedAt: plain.updated_at || plain.updatedAt,
  };
}

export const cannedResponseController = {
  async getAll(req, res) {
    try {
      const count = await CannedResponse.countDocuments();
      if (count === 0) {
        await CannedResponse.insertMany(DEFAULT_CANNED_RESPONSES);
      }

      const { category, search } = req.query;
      const filter = {};

      if (category && category !== 'all') {
        filter.category = category;
      }

      if (search) {
        filter.$or = [
          { shortcut: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { body: { $regex: search, $options: 'i' } },
        ];
      }

      const items = await CannedResponse.find(filter).sort({ is_favorite: -1, usage_count: -1, shortcut: 1 }).lean();
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, items.map(formatDoc), 'Canned responses retrieved successfully.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async getById(req, res) {
    try {
      const item = await CannedResponse.findById(req.params.id);
      if (!item) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Canned response not found.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, formatDoc(item)));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async create(req, res) {
    try {
      const { shortcut, title, body, content, category, tags, language, favorite, is_favorite } = req.body;
      const formattedShortcut = shortcut.startsWith('/') ? shortcut : `/${shortcut}`;

      const existing = await CannedResponse.findOne({ shortcut: formattedShortcut });
      if (existing) {
        return res.status(HTTP_STATUS.CONFLICT).json(formatResponse(false, null, 'Shortcut already exists.'));
      }

      const item = await CannedResponse.create({
        shortcut: formattedShortcut,
        title,
        body: body || content,
        category: category || 'Support',
        tags: tags || [],
        language: language || 'English',
        is_favorite: Boolean(is_favorite ?? favorite ?? false),
        created_by: req.user?._id,
      });

      return res.status(HTTP_STATUS.CREATED).json(formatResponse(true, formatDoc(item), 'Canned response created successfully.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async update(req, res) {
    try {
      const updates = { ...req.body };
      if (updates.shortcut) {
        updates.shortcut = updates.shortcut.startsWith('/') ? updates.shortcut : `/${updates.shortcut}`;
      }
      if (updates.content !== undefined && updates.body === undefined) {
        updates.body = updates.content;
      }
      if (updates.favorite !== undefined && updates.is_favorite === undefined) {
        updates.is_favorite = Boolean(updates.favorite);
      }
      if (updates.usageCount !== undefined && updates.usage_count === undefined) {
        updates.usage_count = Number(updates.usageCount);
      }

      const item = await CannedResponse.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
      if (!item) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Canned response not found.'));
      }

      return res.status(HTTP_STATUS.OK).json(formatResponse(true, formatDoc(item), 'Canned response updated successfully.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async delete(req, res) {
    try {
      const item = await CannedResponse.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Canned response not found.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, { id: req.params.id }, 'Canned response deleted.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },
};

export default cannedResponseController;
