import env from './env.js';

let redisClient = null;

export async function connectRedis() {
  if (env.REDIS_URL && env.REDIS_URL.includes('upstash')) {
    try {
      const { Redis } = await import('@upstash/redis');
      
      // Parse UPSTASH REST URL and Token from rediss:// standard connection string
      const match = env.REDIS_URL.match(/rediss:\/\/default:([^@]+)@([^:]+)/);
      if (match) {
        const token = match[1];
        const host = match[2];
        redisClient = new Redis({
          url: `https://${host}`,
          token: token,
        });
      } else {
        redisClient = Redis.fromEnv();
      }

      // Test ping
      await redisClient.ping();
      console.log('[Redis] Upstash Redis Cloud Connected & Verified! 🚀');
      return redisClient;
    } catch (err) {
      console.warn('[Redis] Warning: Upstash Redis connection error:', err.message);
    }
  }
  console.log('[Redis] Operating in memory cache mode (Local fallback)');
  return null;
}

export function getRedisClient() {
  return redisClient;
}

export default connectRedis;
