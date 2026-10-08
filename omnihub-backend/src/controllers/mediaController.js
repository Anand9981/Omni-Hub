import mediaService from '../services/mediaService.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const mediaController = {
  /**
   * GET /api/dashboard/media/library
   * Returns list of predefined company media assets
   */
  async getLibrary(req, res, next) {
    try {
      const assets = mediaService.getMediaLibrary();
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, assets, 'Media library assets retrieved'),
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/dashboard/media/upload
   * Uploads base64 or binary media to Cloudinary / storage
   */
  async upload(req, res, next) {
    try {
      const { base64, filename, mimeType, folder } = req.body;
      if (!base64 && !req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'base64 data or uploaded file is required'),
        );
      }

      const fileBuffer = req.file?.buffer;
      const finalName = filename || req.file?.originalname || 'upload.pdf';
      const finalMime = mimeType || req.file?.mimetype || 'application/pdf';

      const result = await mediaService.uploadMedia({
        fileBuffer,
        base64,
        filename: finalName,
        mimeType: finalMime,
        folder,
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Media uploaded successfully'),
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/dashboard/media/dispatch
   * Dispatches media document/image to active conversation
   */
  async dispatchMedia(req, res, next) {
    try {
      const { conversationId, mediaUrl, mediaType, mediaName, caption } = req.body;
      if (!conversationId || !mediaUrl) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'conversationId and mediaUrl are required'),
        );
      }

      const authorName = req.user?.name || 'Agent';

      const result = await mediaService.dispatchMediaToConversation({
        conversationId,
        mediaUrl,
        mediaType,
        mediaName,
        caption,
        authorName,
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Media dispatched to conversation successfully'),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default mediaController;

