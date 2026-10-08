import teamService from '../services/teamService.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { formatResponse } from '../utils/helpers.js';

export const teamController = {
  async listMembers(_req, res, next) {
    try {
      const members = await teamService.listMembers();
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, members, 'Team members retrieved.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async listInvites(_req, res, next) {
    try {
      const invites = await teamService.listInvites();
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, invites, 'Team invites retrieved.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async inviteMember(req, res, next) {
    try {
      const { email, role } = req.body;
      const result = await teamService.inviteMember({
        email,
        role,
        invitedById: req.user._id,
      });

      return res.status(HTTP_STATUS.CREATED).json(
        formatResponse(true, result, 'Team invitation sent successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async acceptInvite(req, res, next) {
    try {
      const { token, name, password } = req.body;
      const user = await teamService.acceptInvite({ token, name, password });
      return res.status(HTTP_STATUS.CREATED).json(
        formatResponse(true, user, 'Invitation accepted! Account activated.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async revokeInvite(req, res, next) {
    try {
      const { id } = req.params;
      const invite = await teamService.revokeInvite(id);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, invite, 'Team invitation revoked.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async updateMemberRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const updated = await teamService.updateMemberRole(id, role);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, updated, 'Member role updated successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async removeMember(req, res, next) {
    try {
      const { id } = req.params;
      const result = await teamService.removeMember(id);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Team member removed from active workspace.'),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default teamController;

