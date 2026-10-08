import { User } from '../models/index.js';
import { ROLES } from '../utils/constants.js';
import logger from '../utils/logger.js';

export const agentService = {
  async getAllAgents(query = {}) {
    const filter = { role: { $in: [ROLES.ADMIN, ROLES.AGENT] } };
    if (query.status) filter.status = query.status;
    return User.find(filter).select('-password').sort({ name: 1 }).lean();
  },

  async getAgentById(agentId) {
    return User.findById(agentId).select('-password').lean();
  },

  async updateAgentStatus(agentId, status) {
    const agent = await User.findByIdAndUpdate(
      agentId,
      { $set: { status } },
      { new: true },
    ).select('-password');
    logger.info(`[AgentService] Updated agent ${agentId} status to ${status}`);
    return agent;
  },

  async assignRole(agentId, role) {
    const agent = await User.findByIdAndUpdate(
      agentId,
      { $set: { role } },
      { new: true },
    ).select('-password');
    return agent;
  },
};

export default agentService;
