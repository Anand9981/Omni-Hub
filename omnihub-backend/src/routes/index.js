import { Router } from 'express';
import authRoutes from './auth.js';
import aiRoutes from './ai.js';

// Multiplatform Inbound Webhooks
import telegramWebhook from './webhooks/telegram.js';
import discordWebhook from './webhooks/discord.js';
import whatsappWebhook from './webhooks/whatsapp.js';
import instagramWebhook from './webhooks/instagram.js';
import linkedinWebhook from './webhooks/linkedin.js';
import websiteWebhook from './webhooks/website.js';

// Dashboard Operational & Settings Routes
import conversationRoutes from './dashboard/conversations.js';
import messageRoutes from './dashboard/messages.js';
import approvalRoutes from './dashboard/approvals.js';
import leadRoutes from './dashboard/leads.js';
import agentRoutes from './dashboard/agents.js';
import analyticsRoutes from './dashboard/analytics.js';
import noteRoutes from './dashboard/notes.js';
import aiContextRoutes from './dashboard/aiContext.js';
import cannedResponsesRoutes from './dashboard/cannedResponses.js';
import templatesRoutes from './dashboard/templates.js';
import businessHoursRoutes from './dashboard/businessHours.js';
import channelRoutes from './dashboard/channels.js';
import billingRoutes from './dashboard/billing.js';
import subscriptionRoutes from './dashboard/subscription.js';
import widgetRoutes from './dashboard/widget.js';
import onboardingRoutes from './dashboard/onboarding.js';

const router = Router();

// Authentication Routes
router.use('/auth', authRoutes);

// Gemini AI Routes
router.use('/ai', aiRoutes);

// Multiplatform Inbound Webhooks
router.use('/webhooks/telegram', telegramWebhook);
router.use('/webhooks/discord', discordWebhook);
router.use('/webhooks/whatsapp', whatsappWebhook);
router.use('/webhooks/instagram', instagramWebhook);
router.use('/webhooks/linkedin', linkedinWebhook);
router.use('/webhooks/website', websiteWebhook);

// Dashboard Operations Endpoints
router.use('/dashboard/conversations', conversationRoutes);
router.use('/dashboard/messages', messageRoutes);
router.use('/dashboard/approvals', approvalRoutes);
router.use('/dashboard/leads', leadRoutes);
router.use('/dashboard/agents', agentRoutes);
router.use('/dashboard/analytics', analyticsRoutes);
router.use('/dashboard/notes', noteRoutes);
router.use('/dashboard/ai-context', aiContextRoutes);
router.use('/dashboard/canned-responses', cannedResponsesRoutes);
router.use('/dashboard/templates', templatesRoutes);
router.use('/dashboard/business-hours', businessHoursRoutes);
router.use('/dashboard/channels', channelRoutes);
router.use('/dashboard/billing', billingRoutes);
router.use('/dashboard/subscription', subscriptionRoutes);
router.use('/dashboard/widget', widgetRoutes);
router.use('/dashboard/onboarding', onboardingRoutes);

// Direct Aliases for Frontend Compatibility
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/approvals', approvalRoutes);
router.use('/leads', leadRoutes);
router.use('/agents', agentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notes', noteRoutes);
router.use('/ai-context', aiContextRoutes);
router.use('/canned-responses', cannedResponsesRoutes);
router.use('/templates', templatesRoutes);
router.use('/business-hours', businessHoursRoutes);
router.use('/channels', channelRoutes);
router.use('/billing', billingRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/widget', widgetRoutes);
router.use('/onboarding', onboardingRoutes);

export default router;
