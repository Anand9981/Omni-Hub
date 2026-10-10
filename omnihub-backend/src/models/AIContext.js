import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const aiContextSchema = new mongoose.Schema(
  {
    business_name: {
      type: String,
      default: 'Northstar Studio',
    },
    business_type: {
      type: String,
      default: 'E-commerce & Creative Agency',
    },
    tone: {
      type: String,
      default: 'Professional, friendly, and helpful',
    },
    services: {
      type: String,
      default: 'Omnichannel Inbox (WhatsApp, Telegram, Discord, Instagram, LinkedIn, WebChat), AI Auto-Pilot, Smart Copilot, Lead CRM.',
    },
    working_hours: {
      type: String,
      default: 'Monday to Friday, 9:00 AM to 6:00 PM IST (24/7 AI Auto-Pilot active)',
    },
    pricing: {
      type: String,
      default: 'Starter Plan: $29/month (3 channels, 2 seats) | Growth Plan: $79/month (Unlimited channels, AI Auto-Pilot, Lead CRM) | Enterprise Plan: Custom quote.',
    },
    asset_links: {
      type: String,
      default: 'https://omnihub.example/resources/catalog.pdf',
    },
    system_instructions: {
      type: String,
      default: 'You are an intelligent support assistant for OmniHub. Provide helpful, accurate, and polite assistance in English, Hindi, or Hinglish based on the customer language.',
    },
    faqs: {
      type: [faqSchema],
      default: [
        {
          question: 'What are your pricing plans?',
          answer: 'Our Starter Plan is $29/month (3 channels, 2 seats), Growth Plan is $79/month (unlimited channels + AI Auto-Pilot + Lead CRM), and Enterprise Plan offers custom SLA & pricing.',
        },
        {
          question: 'What are your working hours?',
          answer: 'We are open Monday to Friday from 9:00 AM to 6:00 PM IST.',
        },
        {
          question: 'How long does setup take?',
          answer: 'Standard channel onboarding takes less than 10 minutes using our Quickstart Setup Guide.',
        },
      ],
    },
    forbidden_topics: {
      type: [String],
      default: ['competitor pricing', 'confidential internal data', 'unauthorized discounts'],
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0.0,
      max: 1.0,
    },
    max_output_tokens: {
      type: Number,
      default: 1024,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const AIContext = mongoose.model('AIContext', aiContextSchema);
export default AIContext;
