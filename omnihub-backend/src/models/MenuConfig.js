import mongoose from 'mongoose';
import { PLATFORMS } from '../utils/constants.js';

const buttonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    action: {
      type: String,
      enum: ['submenu', 'reply', 'input', 'handover', 'media'],
      default: 'reply',
    },
    reply: { type: String, default: '' },
    media_id: { type: String, default: '' },
    media_url: { type: String, default: '' },
    media_name: { type: String, default: '' },
    media_type: { type: String, default: '' },
    children: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false },
);

const mediaAssetSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, default: 'application/pdf' },
    size: { type: Number, default: 0 },
    keywords: { type: [String], default: [] },
    fallback_url: { type: String, default: '' },
    data_url: { type: String, default: '' },
  },
  { _id: false },
);

const menuConfigSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: [...Object.values(PLATFORMS), 'default', 'all'],
      default: 'default',
      index: true,
    },
    welcome_message: {
      type: String,
      default: 'Thank you for choosing OmniHub! How can we help you today?',
    },
    buttons: {
      type: [buttonSchema],
      default: [],
    },
    media_assets: {
      type: [mediaAssetSchema],
      default: [],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const MenuConfig = mongoose.model('MenuConfig', menuConfigSchema);
export default MenuConfig;

