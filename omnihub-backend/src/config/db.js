import mongoose from 'mongoose';
import env from './env.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Warning: Could not connect to MongoDB at ${env.MONGODB_URI}.`);
    console.warn(`[Database] Details: ${error.message}`);
    console.warn('[Database] Backend will operate in fallback/mock state until MongoDB is running.');
    return null;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (error) {
    console.warn(`[Database] Error disconnecting: ${error.message}`);
  }
}

export default connectDB;
