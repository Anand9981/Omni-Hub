import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS, PLATFORMS } from '../utils/constants.js';

export function validateChannel(req, res, next) {
  const { platform } = req.body;

  if (platform && !Object.values(PLATFORMS).includes(platform)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, `Invalid platform. Must be one of: ${Object.values(PLATFORMS).join(', ')}`),
    );
  }

  next();
}

export default validateChannel;
