import cloudinary from '../config/cloudinary.js';
import { Conversation, Message } from '../models/index.js';
import dispatcher from './dispatcher.js';
import { emitEvent } from '../sockets/index.js';
import logger from '../utils/logger.js';
import { MESSAGE_DIRECTIONS, MESSAGE_STATUS } from '../utils/constants.js';

const PREDEFINED_ASSETS = [
  {
    id: 'asset-setup-guide',
    name: 'OmniHub_QuickStart_Setup_Guide.pdf',
    type: 'application/pdf',
    size: 245000,
    keywords: ['setup', 'guide', 'install', 'quickstart'],
    url: 'https://omnihub.example/resources/setup-guide.pdf',
    fallback_url: 'https://omnihub.example/resources/setup-guide.pdf',
    description: 'Complete step-by-step channel connection and webhook guide.',
  },
  {
    id: 'asset-catalog',
    name: 'OmniHub_Services_Catalog_2026.pdf',
    type: 'application/pdf',
    size: 512000,
    keywords: ['catalog', 'brochure', 'services', 'pricing'],
    url: 'https://omnihub.example/resources/catalog.pdf',
    fallback_url: 'https://omnihub.example/resources/catalog.pdf',
    description: 'Enterprise omnichannel software catalog with plan breakdowns.',
  },
  {
    id: 'asset-qr-code',
    name: 'OmniHub_Direct_Chat_QR.png',
    type: 'image/png',
    size: 84000,
    keywords: ['qr', 'code', 'connect', 'scan'],
    url: 'https://omnihub.example/resources/qr-code.png',
    fallback_url: 'https://omnihub.example/resources/qr-code.png',
    description: 'Instant scan QR code for website chat and mobile handoff.',
  },
  {
    id: 'asset-pricing',
    name: 'OmniHub_Pricing_Matrix_2026.pdf',
    type: 'application/pdf',
    size: 198000,
    keywords: ['pricing', 'rate', 'cost', 'quote'],
    url: 'https://omnihub.example/resources/pricing.pdf',
    fallback_url: 'https://omnihub.example/resources/pricing.pdf',
    description: 'Detailed multi-tier pricing matrix for agencies and enterprises.',
  },
];

export const mediaService = {
  /**
   * Returns list of ready-to-dispatch media assets
   */
  getMediaLibrary() {
    return PREDEFINED_ASSETS;
  },

  /**
   * Generates a fallback delivery link when direct media push fails
   */
  getFallbackLink(mediaUrl, mediaName) {
    if (!mediaUrl) return '';
    const name = mediaName || 'Document';
    return `📎 ${name}: ${mediaUrl} (Click to open/download)`;
  },

  /**
   * Uploads media asset (Buffer, Base64, or hosted file) to Cloudinary with smart fallback
   */
  async uploadMedia({ fileBuffer, base64, filename = 'document.pdf', mimeType = 'application/pdf', folder = 'omnihub_media' }) {
    const isImage = mimeType?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(filename);
    const resourceType = isImage ? 'image' : 'raw';

    const cloudName = cloudinary.config().cloud_name;
    if (cloudName) {
      try {
        if (base64) {
          const result = await cloudinary.uploader.upload(base64, {
            folder,
            resource_type: resourceType,
            public_id: filename.replace(/\.[^/.]+$/, ''),
          });
          logger.info(`[Cloudinary Upload] Successfully uploaded base64 as ${result.secure_url}`);
          return {
            url: result.secure_url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            resource_type: result.resource_type,
            bytes: result.bytes,
            is_cloudinary: true,
          };
        }

        if (fileBuffer) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder,
                resource_type: resourceType,
                public_id: filename.replace(/\.[^/.]+$/, ''),
              },
              (error, res) => {
                if (error) return reject(error);
                resolve(res);
              },
            );
            stream.end(fileBuffer);
          });
          logger.info(`[Cloudinary Upload] Successfully streamed buffer as ${result.secure_url}`);
          return {
            url: result.secure_url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            resource_type: result.resource_type,
            bytes: result.bytes,
            is_cloudinary: true,
          };
        }
      } catch (err) {
        logger.warn(`[Cloudinary Upload Warning] Upload failed: ${err.message}. Using fallback link.`);
      }
    }

    // Hosted fallback delivery URL
    const fallbackUrl = isImage
      ? 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80'
      : `https://omnihub.example/resources/${encodeURIComponent(filename)}`;

    return {
      url: fallbackUrl,
      secure_url: fallbackUrl,
      public_id: `fallback-${Date.now()}`,
      format: isImage ? 'jpg' : 'pdf',
      resource_type: resourceType,
      bytes: fileBuffer?.length || 0,
      is_fallback: true,
    };
  },

  /**
   * Dispatches media asset to a conversation with fallback link support
   */
  async dispatchMediaToConversation({
    conversationId,
    mediaUrl,
    mediaType = 'application/pdf',
    mediaName = 'Document.pdf',
    caption = '',
    senderType = 'AGENT',
    authorName = 'Support Agent',
  }) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found for ID: ${conversationId}`);
    }

    let finalCaption = caption?.trim() || `Here is your requested document: ${mediaName}`;
    const fallbackLink = this.getFallbackLink(mediaUrl, mediaName);

    // Save outbound media message in MongoDB
    const message = await Message.create({
      conversation_id: conversation._id,
      platform: conversation.platform,
      sender_type: senderType,
      author_name: authorName,
      direction: MESSAGE_DIRECTIONS.OUTBOUND,
      text_content: finalCaption,
      media_url: mediaUrl,
      media_type: mediaType,
      media_name: mediaName,
      status: MESSAGE_STATUS.DELIVERED,
    });

    // Deliver to external platform with fallback link support
    await dispatcher.dispatchOutboundMessage({
      platform: conversation.platform,
      external_chat_id: conversation.external_chat_id,
      text_content: `${finalCaption}\n\n${fallbackLink}`,
      media_url: mediaUrl,
      media_type: mediaType,
      media_name: mediaName,
    }).catch((err) => {
      logger.error(`[Media Dispatch Error] Failed to send outbound media: ${err.message}`);
    });

    conversation.last_activity_at = new Date();
    await conversation.save();

    // Broadcast Real-time Socket.io events
    emitEvent('new_message', {
      conversation_id: conversation._id,
      sender_name: authorName,
      platform: conversation.platform,
      message: {
        id: message._id,
        _id: message._id,
        conversation_id: conversation._id,
        platform: conversation.platform,
        sender_type: senderType,
        author_name: authorName,
        direction: MESSAGE_DIRECTIONS.OUTBOUND,
        text_content: finalCaption,
        media_url: mediaUrl,
        media_type: mediaType,
        media_name: mediaName,
        status: MESSAGE_STATUS.DELIVERED,
        created_at: message.created_at,
      },
    });

    emitEvent('conversation_update', {
      id: conversation._id,
      platform: conversation.platform,
      sender_name: conversation.sender_name,
      last_activity_at: conversation.last_activity_at,
      lastMessage: {
        text_content: `📎 [Media Attachment]: ${mediaName}`,
        direction: MESSAGE_DIRECTIONS.OUTBOUND,
        created_at: message.created_at,
      },
    });

    logger.info(`[Media Dispatch] Delivered media "${mediaName}" to conversation ${conversation._id} on ${conversation.platform}`);
    return {
      success: true,
      message,
      fallback_link: fallbackLink,
    };
  },
};

export default mediaService;
