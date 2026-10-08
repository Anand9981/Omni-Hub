import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // MongoDB Atlas Connection
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/omnihub',
  
  // Redis (Upstash / Local)
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'omnihub_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '40h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'omnihub_super_secret_refresh_jwt_key_2026',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Gemini AI Key
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  
  // Cloudinary Storage
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  
  // Nodemailer SMTP Settings
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'OmniHub Support <noreply@omnihub.ai>',
  
  // Webhook Tokens & Bot Tokens
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
  
  // WhatsApp Meta Cloud API
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || '',
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'my_secret_token_omni_26',
  WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET || '',
  
  // Instagram Meta Graph API
  INSTAGRAM_VERIFY_TOKEN: process.env.INSTAGRAM_VERIFY_TOKEN || 'omnihub_instagram_verify_token',
  INSTAGRAM_APP_SECRET: process.env.INSTAGRAM_APP_SECRET || '',

  // Sentry Error Tracking
  SENTRY_DSN: process.env.SENTRY_DSN || '',
};

export default env;
