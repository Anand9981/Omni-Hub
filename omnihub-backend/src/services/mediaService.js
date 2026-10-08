import cloudinary from '../config/cloudinary.js';
import logger from '../utils/logger.js';

export const mediaService = {
  /**
   * Uploads media asset (image / PDF) to Cloudinary or returns hosted URL.
   */
  async uploadMedia(fileBuffer, options = {}) {
    if (cloudinary.config().cloud_name) {
      try {
        return await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }).end(fileBuffer);
        });
      } catch (err) {
        logger.warn(`[Media Upload] Cloudinary upload error: ${err.message}`);
      }
    }
    // Fallback URL
    return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80';
  },
};

export default mediaService;
