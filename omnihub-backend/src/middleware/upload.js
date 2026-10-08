import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateMediaUpload(req, res, next) {
  const { media_url } = req.body;
  if (media_url && !media_url.startsWith('http') && !media_url.startsWith('data:') && !media_url.startsWith('telegram') && !media_url.startsWith('whatsapp')) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Invalid media URL format.'),
    );
  }
  next();
}

export default validateMediaUpload;
