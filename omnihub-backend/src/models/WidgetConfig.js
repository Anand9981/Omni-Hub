import mongoose from 'mongoose';

const widgetConfigSchema = new mongoose.Schema(
  {
    workspace_name: {
      type: String,
      default: 'Northstar Support',
    },
    primary_color: {
      type: String,
      default: '#3478e5',
    },
    position: {
      type: String,
      enum: ['bottom-right', 'bottom-left'],
      default: 'bottom-right',
    },
    greeting_message: {
      type: String,
      default: 'Hi there! How can we help you today?',
    },
    placeholder: {
      type: String,
      default: 'Type your message...',
    },
    launcher_icon: {
      type: String,
      default: 'chat',
    },
    allowed_domains: {
      type: [String],
      default: ['*'],
    },
    is_enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const WidgetConfig = mongoose.model('WidgetConfig', widgetConfigSchema);
export default WidgetConfig;
