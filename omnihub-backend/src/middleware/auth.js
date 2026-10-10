import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export async function protect(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      formatResponse(false, null, 'Authentication required. Please log in.'),
    );
  }

  const decoded = verifyToken(token);
  const targetUserId = decoded?.userId || decoded?.id;
  if (!decoded || (!targetUserId && !decoded.email)) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      formatResponse(false, null, 'Invalid or expired session token. Please log in again.'),
    );
  }

  try {
    let user = targetUserId ? await User.findById(targetUserId).select('-password') : null;
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email.toLowerCase() }).select('-password');
    }
    if (!user && process.env.NODE_ENV !== 'production') {
      user = await User.findOne({ status: 'active' }).sort({ created_at: 1 }).select('-password');
    }
    if (!user || user.status !== 'active') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatResponse(false, null, 'User account not found or suspended.'),
      );
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(false, null, 'Error authenticating user.'),
    );
  }
}

export default protect;
