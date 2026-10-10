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
      default: '',
    },
    working_hours: {
      type: String,
      default: '',
    },
    pricing: {
      type: String,
      default: '',
    },
    asset_links: {
      type: String,
      default: '',
    },
    system_instructions: {
      type: String,
      default: 'You are an intelligent support assistant for Northstar Studio. Provide helpful, accurate, and polite assistance in English, Hindi, or Hinglish based on the customer language.',
    },
    faqs: {
      type: [faqSchema],
      default: [
        {
          question: 'What are your working hours?',
          answer: 'We are open Monday to Friday from 9:00 AM to 6:00 PM IST.',
        },
        {
          question: 'How long does delivery take?',
          answer: 'Standard shipping takes 3-5 business days across major cities.',
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
