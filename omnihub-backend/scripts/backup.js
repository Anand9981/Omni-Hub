import connectDB from '../src/config/db.js';
import logger from '../src/utils/logger.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

async function backupDatabase() {
  logger.info('[Backup] Starting database backup utility...');
  await connectDB();

  try {
    const collections = await mongoose.connection.db.collections();
    const backupDir = path.join(process.cwd(), 'backup_export');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    for (const collection of collections) {
      const data = await collection.find({}).toArray();
      const filePath = path.join(backupDir, `${collection.collectionName}_${timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      logger.info(`[Backup] Exported ${data.length} records from ${collection.collectionName}`);
    }

    logger.info(`[Backup] ✅ Database backup saved to ${backupDir}`);
  } catch (error) {
    logger.error(`[Backup Error] ${error.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

backupDatabase();
