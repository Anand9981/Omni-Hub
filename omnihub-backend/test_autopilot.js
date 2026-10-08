import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runAutoPilotTests() {
  console.log('====================================================');
  console.log('🤖 Starting OmniHub Auto-Pilot Bot Test Suite');
  console.log('====================================================\n');

  // Connect to DB to inspect documents
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI missing in .env');
  await mongoose.connect(mongoUri);

  const testChatId = `autopilot_test_user_${Date.now()}`;

  // ----------------------------------------------------------------
  // Scenario 1: Auto-Pilot ON + Approval AUTO (Default Instant Reply)
  // ----------------------------------------------------------------
  console.log('--- [Test 1: Auto-Pilot ON & Approval AUTO (Instant AI Reply)] ---');
  console.log(`Sending inbound message from customer (${testChatId})...`);

  const inboundRes1 = await fetch(`${BASE_URL}/webhooks/website`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: testChatId,
      sender_name: 'Rahul Sharma',
      text: 'Namaste! OmniHub ke features kya hain aur pricing kaise work karti hai?',
    }),
  });

  const inboundJson1 = await inboundRes1.json();
  console.log('Webhook Response:', JSON.stringify(inboundJson1, null, 2));

  // Verify conversation and bot reply in MongoDB
  const conversation1 = await mongoose.connection.collection('conversations').findOne({
    external_chat_id: testChatId,
  });

  if (!conversation1) throw new Error('Conversation not found in database!');
  console.log(`✅ Conversation created: ID=${conversation1._id}, AutoPilot=${conversation1.auto_pilot}, ApprovalMode=${conversation1.approval_mode}`);

  // Wait 1.5s for async AI generation & delivery
  await new Promise((r) => setTimeout(r, 1500));

  const botMessages1 = await mongoose.connection.collection('messages').find({
    conversation_id: conversation1._id,
    sender_type: 'BOT',
  }).toArray();

  if (botMessages1.length === 0) {
    throw new Error('Expected automated BOT reply message, but none was found!');
  }

  console.log(`✅ Test 1 Passed! AI Auto-Pilot automatically replied to customer:`);
  console.log(`   Bot Message: "${botMessages1[0].text_content}"`);
  console.log(`   Status: ${botMessages1[0].status}`);

  // ----------------------------------------------------------------
  // Scenario 2: Auto-Pilot ON + Approval MANUAL (Queue Draft for Review)
  // ----------------------------------------------------------------
  console.log('\n--- [Test 2: Auto-Pilot ON & Approval MANUAL (Queue Draft for Review)] ---');
  console.log('Switching conversation approval mode to MANUAL...');

  await mongoose.connection.collection('conversations').updateOne(
    { _id: conversation1._id },
    { $set: { approval_mode: 'MANUAL' } },
  );

  const inboundRes2 = await fetch(`${BASE_URL}/webhooks/website`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: testChatId,
      sender_name: 'Rahul Sharma',
      text: 'Kya hum custom enterprise plan le sakte hain discount ke saath?',
    }),
  });

  const inboundJson2 = await inboundRes2.json();
  console.log('Webhook Response:', JSON.stringify(inboundJson2, null, 2));

  // Wait 1.5s for AI draft generation
  await new Promise((r) => setTimeout(r, 1500));

  const pendingApprovals = await mongoose.connection.collection('pendingapprovals').find({
    conversation_id: conversation1._id,
    status: 'PENDING',
  }).toArray();

  if (pendingApprovals.length === 0) {
    throw new Error('Expected draft to be queued in pendingapprovals, but none was found!');
  }

  console.log(`✅ Test 2 Passed! AI Auto-Pilot held reply in Approvals Queue:`);
  console.log(`   Draft ID: ${pendingApprovals[0]._id}`);
  console.log(`   Proposed Reply: "${pendingApprovals[0].proposed_text}"`);
  console.log(`   Status: ${pendingApprovals[0].status}`);

  // ----------------------------------------------------------------
  // Scenario 3: Auto-Pilot OFF (Human Takeover — No Automated Reply)
  // ----------------------------------------------------------------
  console.log('\n--- [Test 3: Auto-Pilot OFF (Human Takeover — Silence Bot)] ---');
  console.log('Switching Auto-Pilot to OFF...');

  await mongoose.connection.collection('conversations').updateOne(
    { _id: conversation1._id },
    { $set: { auto_pilot: 'OFF' } },
  );

  const prePendingCount = await mongoose.connection.collection('pendingapprovals').countDocuments({
    conversation_id: conversation1._id,
  });
  const preBotCount = await mongoose.connection.collection('messages').countDocuments({
    conversation_id: conversation1._id,
    sender_type: 'BOT',
  });

  const inboundRes3 = await fetch(`${BASE_URL}/webhooks/website`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: testChatId,
      sender_name: 'Rahul Sharma',
      text: 'Please connect me to an agent, human help only.',
    }),
  });

  const inboundJson3 = await inboundRes3.json();
  console.log('Webhook Response:', JSON.stringify(inboundJson3, null, 2));

  await new Promise((r) => setTimeout(r, 1500));

  const postPendingCount = await mongoose.connection.collection('pendingapprovals').countDocuments({
    conversation_id: conversation1._id,
  });
  const postBotCount = await mongoose.connection.collection('messages').countDocuments({
    conversation_id: conversation1._id,
    sender_type: 'BOT',
  });

  if (postPendingCount !== prePendingCount || postBotCount !== preBotCount) {
    throw new Error('Auto-Pilot fired when auto_pilot was set to OFF!');
  }

  console.log('✅ Test 3 Passed! Auto-Pilot respected human takeover (0 automated actions taken).');

  // Clean up test data
  await mongoose.connection.collection('conversations').deleteOne({ _id: conversation1._id });
  await mongoose.connection.collection('messages').deleteMany({ conversation_id: conversation1._id });
  await mongoose.connection.collection('pendingapprovals').deleteMany({ conversation_id: conversation1._id });
  console.log('🧹 Cleaned up temporary test data.');

  console.log('\n====================================================');
  console.log('🎉 ALL AUTO-PILOT BOT INTEGRATION TESTS PASSED 100%!');
  console.log('====================================================\n');

  await mongoose.disconnect();
}

runAutoPilotTests().catch((err) => {
  console.error('\n❌ AUTO-PILOT TEST FAILED:', err.message);
  process.exit(1);
});
