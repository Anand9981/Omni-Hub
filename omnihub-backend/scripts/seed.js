import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import { User, Plan, BusinessHours, AIContext, WidgetConfig } from '../src/models/index.js';
import { ROLES } from '../src/utils/constants.js';
import logger from '../src/utils/logger.js';
import { generateBackupCodes } from '../src/utils/security.js';

async function seedDatabase() {
  logger.info('[Seeder] Starting OmniHub database seed...');
  await connectDB();

  try {
    // 1. Seed Super Admin & Default Demo Admin
    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      logger.info('[Seeder] Creating default Admin and Super Admin users...');

      await User.create([
        {
          name: 'Super Admin',
          email: 'admin@omnihub.io',
          password: 'Password@123',
          role: ROLES.SUPER_ADMIN,
          status: 'active',
          is_2fa_enabled: false,
          backup_codes: generateBackupCodes(10),
        },
        {
          name: 'Sarah Connor',
          email: 'agent@omnihub.io',
          password: 'Password@123',
          role: ROLES.AGENT,
          status: 'active',
          is_2fa_enabled: false,
          backup_codes: generateBackupCodes(10),
        },
        {
          name: 'Auditor Viewer',
          email: 'viewer@omnihub.io',
          password: 'Password@123',
          role: ROLES.VIEWER,
          status: 'active',
          is_2fa_enabled: false,
          backup_codes: generateBackupCodes(10),
        },
      ]);
      logger.info('[Seeder] Default users seeded successfully.');
    }

    // 2. Seed Default Plans
    const plansCount = await Plan.countDocuments();
    if (plansCount === 0) {
      logger.info('[Seeder] Seeding default pricing plans...');
      await Plan.create([
        {
          plan_id: 'starter',
          name: 'Starter Tier',
          price: 29,
          currency: 'USD',
          billing_interval: 'month',
          features: ['Up to 3 Channels', '1,000 Messages/mo', '1 Agent seat', 'AI Auto-replies'],
          limits: { messages_per_month: 1000, agents_count: 1, channels_count: 3 },
        },
        {
          plan_id: 'growth',
          name: 'Growth Business',
          price: 79,
          currency: 'USD',
          billing_interval: 'month',
          features: ['All 6 Channels', '10,000 Messages/mo', '5 Agent seats', 'Human-in-the-Loop Approvals', 'CRM Sync'],
          limits: { messages_per_month: 10000, agents_count: 5, channels_count: 6 },
        },
        {
          plan_id: 'enterprise',
          name: 'Enterprise Hub',
          price: 199,
          currency: 'USD',
          billing_interval: 'month',
          features: ['Unlimited Channels', '100,000 Messages/mo', 'Unlimited Agents', 'Dedicated Gemini Fine-tuning', '24/7 SLA'],
          limits: { messages_per_month: 100000, agents_count: 100, channels_count: 20 },
        },
      ]);
      logger.info('[Seeder] Pricing plans seeded.');
    }

    // 3. Seed Default Business Hours & AI Context if missing
    const bhCount = await BusinessHours.countDocuments();
    if (bhCount === 0) {
      await BusinessHours.create({});
      logger.info('[Seeder] Default Business Hours initialized.');
    }

    const aiCount = await AIContext.countDocuments();
    if (aiCount === 0) {
      await AIContext.create({});
      logger.info('[Seeder] Default AI Context initialized.');
    }

    const widgetCount = await WidgetConfig.countDocuments();
    if (widgetCount === 0) {
      await WidgetConfig.create({});
      logger.info('[Seeder] Default Widget configuration initialized.');
    }

    logger.info('[Seeder] Database seeding completed successfully.');
  } catch (error) {
    logger.error(`[Seeder Error] ${error.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();
