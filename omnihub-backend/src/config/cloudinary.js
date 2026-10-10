import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';
import logger from '../utils/logger.js';

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  logger.info(`[Cloudinary] Media storage ready (cloud: ${env.CLOUDINARY_CLOUD_NAME})`);
}

export default cloudinary;

