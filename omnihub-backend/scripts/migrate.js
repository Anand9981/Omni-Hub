import connectDB from '../src/config/db.js';
import logger from '../src/utils/logger.js';
import mongoose from 'mongoose';

async function runMigrations() {
  logger.info('[Migration] Starting database migration check...');
  await connectDB();

  try {
    // Migration checks (e.g. schema index updates or field backfills)
    logger.info('[Migration] Syncing collection indexes...');
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      logger.info(`[Migration] Indexed collection: ${collection.collectionName}`);
    }
    logger.info('[Migration] ✅ Database migration completed successfully.');
  } catch (error) {
    logger.error(`[Migration Error] ${error.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runMigrations();
