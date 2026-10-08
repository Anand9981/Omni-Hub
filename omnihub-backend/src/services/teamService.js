import bcrypt from 'bcryptjs';
import { User, Conversation, TeamInvite } from '../models/index.js';
import emailService from './emailService.js';
import { emitEvent } from '../sockets/index.js';
import logger from '../utils/logger.js';
import { ROLES } from '../utils/constants.js';

export const teamService = {
  /**
   * Lists all team members with active chat counts and workload metrics
   */
  async listMembers() {
    const users = await User.find({ status: 'active' })
      .select('name email role status last_login created_at')
      .lean();

    const enriched = await Promise.all(
      users.map(async (user) => {
        const activeChats = await Conversation.countDocuments({
          assigned_agent_id: user._id,
          status: 'ACTIVE',
        });

        const maxConcurrent = 5;
        let availability = 'online';
        if (activeChats >= maxConcurrent) {
          availability = 'busy';
        }

        return {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.role === ROLES.SUPER_ADMIN ? 'Workspace Owner' : user.role === ROLES.ADMIN ? 'Team Lead' : 'Support Specialist',
          team: user.role === ROLES.SUPER_ADMIN ? 'Executive' : 'Customer Experience',
          status: availability,
          activeChats,
          maxConcurrentChats: maxConcurrent,
          satisfaction: 4.9,
          last_login: user.last_login,
          created_at: user.created_at,
        };
      }),
    );

    return enriched;
  },

  /**
   * Invites a new team member with designated role
   */
  async inviteMember({ email, role = ROLES.AGENT, invitedById }) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      throw new Error('Please provide a valid email address.');
    }

    if (!Object.values(ROLES).includes(role)) {
      throw new Error(`Invalid team role: ${role}`);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      throw new Error(`A user with email ${cleanEmail} already exists in this workspace.`);
    }

    // Check existing pending invite
    let invite = await TeamInvite.findOne({ email: cleanEmail, status: 'pending' });
    if (invite) {
      invite.role = role;
      invite.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await invite.save();
    } else {
      invite = await TeamInvite.create({
        email: cleanEmail,
        role,
        invited_by: invitedById,
      });
    }

    const inviteLink = `http://localhost:5173/accept-invite?token=${invite.invite_token}`;

    // Send invitation email via SMTP
    try {
      await emailService.sendEmail({
        to: cleanEmail,
        subject: `You've been invited to join OmniHub as ${role}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Welcome to OmniHub!</h2>
            <p>You have been invited to collaborate as <strong>${role}</strong> on the OmniHub unified inbox platform.</p>
            <p>Click the link below to accept your invitation and create your account password:</p>
            <p><a href="${inviteLink}" style="display:inline-block; padding:10px 20px; background:#2563eb; color:#fff; text-decoration:none; border-radius:5px;">Accept Invitation</a></p>
            <p style="color:#777; font-size:12px;">This invitation link will expire in 7 days.</p>
          </div>
        `,
      });
    } catch (err) {
      logger.warn(`[Team Invite Email Warning] ${err.message}`);
    }

    logger.info(`[TeamService] Issued invite to ${cleanEmail} with role: ${role}`);

    emitEvent('team_updated', {
      action: 'INVITE_CREATED',
      email: cleanEmail,
      role,
    });

    return {
      inviteToken: invite.invite_token,
      inviteLink,
      invite,
    };
  },

  /**
   * Accepts invitation and creates user account
   */
  async acceptInvite({ token, name, password }) {
    if (!token) throw new Error('Invitation token is required.');
    if (!name?.trim()) throw new Error('Name is required.');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');

    const invite = await TeamInvite.findOne({
      invite_token: token,
      status: 'pending',
      expires_at: { $gt: new Date() },
    });

    if (!invite) {
      throw new Error('This invitation link is invalid or has expired.');
    }

    // Check if user exists
    const existing = await User.findOne({ email: invite.email });
    if (existing) {
      invite.status = 'accepted';
      await invite.save();
      throw new Error('An account already exists for this email.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: invite.email,
      password: hashedPassword,
      role: invite.role,
      email_verified: true,
      status: 'active',
    });

    invite.status = 'accepted';
    invite.accepted_at = new Date();
    await invite.save();

    logger.info(`[TeamService] Invite accepted by ${user.email} (Role: ${user.role})`);

    emitEvent('team_updated', {
      action: 'MEMBER_JOINED',
      userId: user._id,
      name: user.name,
      role: user.role,
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },

  /**
   * List pending invitations
   */
  async listInvites() {
    return TeamInvite.find({ status: 'pending' })
      .populate('invited_by', 'name email')
      .sort({ created_at: -1 })
      .lean();
  },

  /**
   * Revoke pending invitation
   */
  async revokeInvite(inviteId) {
    const invite = await TeamInvite.findByIdAndUpdate(
      inviteId,
      { status: 'revoked' },
      { new: true },
    );
    if (!invite) throw new Error('Invite not found');
    return invite;
  },

  /**
   * Updates an existing team member's role
   */
  async updateMemberRole(userId, newRole) {
    if (!Object.values(ROLES).includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true },
    ).select('name email role');

    if (!user) throw new Error('User not found');

    emitEvent('team_updated', {
      action: 'ROLE_UPDATED',
      userId: user._id,
      role: user.role,
    });

    return user;
  },

  /**
   * Removes or deactivates a team member
   */
  async removeMember(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'inactive' },
      { new: true },
    );

    if (!user) throw new Error('User not found');

    // Unassign pending/active conversations from this agent
    await Conversation.updateMany(
      { assigned_agent_id: userId },
      { $set: { assigned_agent_id: null } },
    );

    emitEvent('team_updated', {
      action: 'MEMBER_REMOVED',
      userId: user._id,
    });

    return { success: true, message: `Member ${user.name} removed from active team.` };
  },
};

export default teamService;

