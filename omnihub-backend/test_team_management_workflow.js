import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Conversation, TeamInvite } from './src/models/index.js';
import teamService from './src/services/teamService.js';
import { ROLES } from './src/utils/constants.js';

dotenv.config();

async function runTest() {
  console.log('--- STARTING TEAM MANAGEMENT & MULTI-TENANT WORKFLOW TEST ---');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Missing MONGODB_URI in environment!');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
  console.log('[1/7] Connected to MongoDB Atlas.');

  try {
    // 1. Get or create an Admin user for inviting
    let admin = await User.findOne({ role: ROLES.SUPER_ADMIN });
    if (!admin) {
      admin = await User.create({
        name: 'Super Admin Test',
        email: `admin_${Date.now()}@omnihub.test`,
        password: 'hashed_password_123',
        role: ROLES.SUPER_ADMIN,
        email_verified: true,
        status: 'active',
      });
    }
    console.log(`[2/7] Workspace admin identified: ${admin.email}`);

    // 2. List initial members
    const initialMembers = await teamService.listMembers();
    console.log(`[3/7] Current active team members count: ${initialMembers.length}`);

    // 3. Invite a new agent
    const testAgentEmail = `agent_${Date.now()}@omnihub.test`;
    const inviteResult = await teamService.inviteMember({
      email: testAgentEmail,
      role: ROLES.AGENT,
      invitedById: admin._id,
    });
    console.log(`[4/7] Sent invite to ${testAgentEmail}. Token: ${inviteResult.inviteToken}`);
    if (!inviteResult.inviteToken || !inviteResult.inviteLink) {
      throw new Error('Invite failed to generate token or link!');
    }

    // 4. Verify invite in list
    const pendingInvites = await teamService.listInvites();
    const foundInvite = pendingInvites.find((i) => i.email === testAgentEmail);
    if (!foundInvite) {
      throw new Error('Pending invite was not found in listInvites!');
    }
    console.log('[5/7] Pending invite verified in database queue.');

    // 5. Accept the invitation
    const newMember = await teamService.acceptInvite({
      token: inviteResult.inviteToken,
      name: 'Agent Maverick',
      password: 'SecurePassword123!',
    });
    console.log(`[6/7] Invitation accepted! User created with ID: ${newMember.id}, Role: ${newMember.role}`);

    const createdUser = await User.findById(newMember.id);
    if (!createdUser || createdUser.role !== ROLES.AGENT) {
      throw new Error('Created user does not match accepted invite specifications!');
    }

    // 6. Update role to Admin
    const promotedUser = await teamService.updateMemberRole(newMember.id, ROLES.ADMIN);
    console.log(`[7/7] Member role updated: ${promotedUser.role}`);
    if (promotedUser.role !== ROLES.ADMIN) {
      throw new Error('Role update failed!');
    }

    // Cleanup test data
    await User.findByIdAndDelete(newMember.id);
    await TeamInvite.deleteOne({ email: testAgentEmail });
    console.log('Cleanup completed successfully.');

    console.log('\n=============================================');
    console.log('SUCCESS: ALL MULTI-TENANT TEAM MANAGEMENT TESTS PASSED!');
    console.log('=============================================\n');
    process.exit(0);
  } catch (err) {
    console.error('TEST ERROR:', err);
    process.exit(1);
  }
}

runTest();

