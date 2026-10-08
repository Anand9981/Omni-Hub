import { User, Conversation } from '../models/index.js';
import teamService from '../services/teamService.js';
import { ROLES, HTTP_STATUS } from '../utils/constants.js';
import { formatResponse } from '../utils/helpers.js';
import { emitEvent } from '../sockets/index.js';

export const agentController = {
  async listAgents(_req, res, next) {
    try {
      const enriched = await teamService.listMembers();
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, enriched, 'Agents list retrieved.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async assignConversation(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { agentId } = req.body;

      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { assigned_agent_id: agentId || null },
        { new: true },
      ).populate('assigned_agent_id', 'name email role');

      if (!conversation) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          formatResponse(false, null, 'Conversation not found.'),
        );
      }

      emitEvent('agent_assigned', {
        conversationId,
        assignedAgent: conversation.assigned_agent_id,
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, conversation, 'Agent assigned successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async autoAssign(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { strategy = 'least_busy' } = req.body;

      const agents = await User.find({
        role: { $in: [ROLES.AGENT, ROLES.ADMIN] },
        status: 'active',
      });

      if (agents.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'No active agents available for assignment.'),
        );
      }

      let selectedAgent = agents[0];
      let minCount = Infinity;

      for (const agent of agents) {
        const count = await Conversation.countDocuments({
          assigned_agent_id: agent._id,
          status: 'ACTIVE',
        });
        if (count < minCount) {
          minCount = count;
          selectedAgent = agent;
        }
      }

      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { assigned_agent_id: selectedAgent._id },
        { new: true },
      ).populate('assigned_agent_id', 'name email role');

      emitEvent('agent_assigned', {
        conversationId,
        assignedAgent: conversation.assigned_agent_id,
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, conversation, `Auto-assigned to ${selectedAgent.name} (${strategy}).`),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default agentController;
