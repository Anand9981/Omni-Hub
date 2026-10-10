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
    apiKey: {
      type: String,
      default: '',
    },
    primaryColor: {
      type: String,
      default: '#3478e5',
    },
    secondaryColor: {
      type: String,
      default: '#f1f5ff',
    },
    textColor: {
      type: String,
      default: '#1f2e44',
    },
    size: {
      type: String,
      default: 'medium',
    },
    language: {
      type: String,
      default: 'English',
    },
    welcomeMessage: {
      type: String,
      default: 'Hi! How can we help you today?',
    },
    offlineMessage: {
      type: String,
      default: "We're offline right now. Leave a message and our team will get back to you.",
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    soundNotification: {
      type: Boolean,
      default: false,
    },
    offlineMode: {
      type: Boolean,
      default: false,
    },
    businessHours: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    analytics: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        opens: 0,
        messages: 0,
        leads: 0,
        totalSessionSeconds: 0,
        completedSessions: 0,
      }),
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const WidgetConfig = mongoose.model('WidgetConfig', widgetConfigSchema);
export default WidgetConfig;
