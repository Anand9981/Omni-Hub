import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runApprovalWorkflowTests() {
  console.log('====================================================');
  console.log('🛡️ Starting OmniHub Approval Workflow Test Suite');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI missing in .env');
  await mongoose.connect(mongoUri);

  // 1. Get Auth Token for Admin
  console.log('--- [Step 1: Admin Authentication] ---');
  let token = '';

  // Login with existing admin or test user
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test@1234',
    }),
  });
  const loginJson = await loginRes.json();

  if (loginJson.success) {
    const otpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
      }),
    });
    const otpJson = await otpRes.json();
    token = otpJson.data?.token;
  }

  if (!token) {
    throw new Error('Failed to obtain JWT token for testing approvals');
  }
  console.log('✅ Admin Authenticated! Token acquired.');

  const testChatId = `approval_test_customer_${Date.now()}`;

  // 2. Trigger an incoming message with MANUAL approval mode
  console.log('\n--- [Step 2: Triggering Inbound Message in MANUAL Mode] ---');
  // First create or find conversation with approval_mode: 'MANUAL'
  const initRes = await fetch(`${BASE_URL}/webhooks/website`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: testChatId,
      sender_name: 'Pooja Verma',
      text: 'Hello, what are your agency pricing plans for ecommerce apps?',
    }),
  });
  await initRes.json();

  // Set conversation to MANUAL approval mode
  const convDoc = await mongoose.connection.collection('conversations').findOne({ external_chat_id: testChatId });
  await mongoose.connection.collection('conversations').updateOne(
    { _id: convDoc._id },
    { $set: { approval_mode: 'MANUAL', auto_pilot: 'ON' } },
  );

  // Now send customer message that will be held by Auto-Pilot
  const webhookRes = await fetch(`${BASE_URL}/webhooks/website`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: testChatId,
      sender_name: 'Pooja Verma',
      text: 'Please send me the quote for an ecommerce mobile app.',
    }),
  });
  const webhookJson = await webhookRes.json();
  console.log('Inbound message delivered, Auto-Pilot queued draft:', webhookJson.data?.autoPilot?.action);

  // Wait 1.5s for async queue creation
  await new Promise((r) => setTimeout(r, 1500));

  // 3. Test GET /api/dashboard/approvals/pending
  console.log('\n--- [Step 3: GET /api/dashboard/approvals/pending] ---');
  const pendingRes = await fetch(`${BASE_URL}/dashboard/approvals/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const pendingJson = await pendingRes.json();
  console.log(`Status: ${pendingRes.status} ${pendingRes.statusText}`);
  console.log(`Pending drafts count: ${pendingJson.data?.length}`);

  if (!pendingRes.ok || !pendingJson.success || !Array.isArray(pendingJson.data) || pendingJson.data.length === 0) {
    throw new Error('Expected pending approvals list with at least 1 draft!');
  }

  const targetDraft = pendingJson.data.find(
    (d) => String(d.conversation_id?._id || d.conversation_id) === String(convDoc._id),
  );
  if (!targetDraft) throw new Error('Target draft for test conversation not found in pending queue!');
  console.log(`✅ Step 3 Passed! Found Draft ID: ${targetDraft._id}`);
  console.log(`   Proposed Text: "${targetDraft.proposed_text}"`);

  // 4. Test POST /api/dashboard/approvals/:id/edit (Save Draft Edit)
  console.log('\n--- [Step 4: POST /api/dashboard/approvals/:id/edit (Edit Draft)] ---');
  const editedContent = 'Namaste Pooja! Ecommerce app development quotes start from Rs. 49,999. Team will contact you shortly.';
  const editRes = await fetch(`${BASE_URL}/dashboard/approvals/${targetDraft._id}/edit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      text: editedContent,
      sendImmediately: false,
    }),
  });
  const editJson = await editRes.json();
  console.log(`Status: ${editRes.status} ${editRes.statusText}`);
  console.log('Edit Response:', JSON.stringify(editJson, null, 2));

  if (!editRes.ok || !editJson.success) {
    throw new Error(`Edit draft failed: ${editJson.message}`);
  }
  console.log('✅ Step 4 Passed! Draft successfully edited.');

  // 5. Test POST /api/dashboard/approvals/:id/approve (Approve & Dispatch)
  console.log('\n--- [Step 5: POST /api/dashboard/approvals/:id/approve (Approve & Dispatch)] ---');
  const approveRes = await fetch(`${BASE_URL}/dashboard/approvals/${targetDraft._id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const approveJson = await approveRes.json();
  console.log(`Status: ${approveRes.status} ${approveRes.statusText}`);
  console.log('Approve Response:', JSON.stringify(approveJson, null, 2));

  if (!approveRes.ok || !approveJson.success) {
    throw new Error(`Approve draft failed: ${approveJson.message}`);
  }

  // Verify BOT message created in DB
  const approvedMsg = await mongoose.connection.collection('messages').findOne({
    conversation_id: convDoc._id,
    sender_type: 'BOT',
  });
  if (!approvedMsg) throw new Error('Approved message was not found in messages collection!');
  console.log(`✅ Step 5 Passed! Draft approved, dispatched to customer: "${approvedMsg.text_content}"`);

  // 6. Test POST /api/dashboard/approvals/:id/reject (Reject Draft)
  console.log('\n--- [Step 6: POST /api/dashboard/approvals/:id/reject (Reject Draft)] ---');
  // Create another draft to test rejection
  await fetch(`${BASE_URL}/webhooks/website`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: testChatId,
      sender_name: 'Pooja Verma',
      text: 'Can I get 90% discount right now?',
    }),
  });

  await new Promise((r) => setTimeout(r, 1500));

  const secondDraftDoc = await mongoose.connection.collection('pendingapprovals').findOne({
    conversation_id: convDoc._id,
    status: 'PENDING',
  });
  if (!secondDraftDoc) throw new Error('Second draft for reject test was not created!');

  const rejectRes = await fetch(`${BASE_URL}/dashboard/approvals/${secondDraftDoc._id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reason: 'Unrealistic discount request — manual review declined.',
    }),
  });
  const rejectJson = await rejectRes.json();
  console.log(`Status: ${rejectRes.status} ${rejectRes.statusText}`);
  console.log('Reject Response:', JSON.stringify(rejectJson, null, 2));

  if (!rejectRes.ok || !rejectJson.success) {
    throw new Error(`Reject draft failed: ${rejectJson.message}`);
  }
  console.log('✅ Step 6 Passed! Draft rejected and removed from pending queue.');

  // 7. Test GET /api/dashboard/approvals/resolved (Resolved History)
  console.log('\n--- [Step 7: GET /api/dashboard/approvals/resolved] ---');
  const resolvedRes = await fetch(`${BASE_URL}/dashboard/approvals/resolved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const resolvedJson = await resolvedRes.json();
  console.log(`Status: ${resolvedRes.status} ${resolvedRes.statusText}`);
  console.log(`Resolved drafts count: ${resolvedJson.data?.length}`);

  if (!resolvedRes.ok || !resolvedJson.success || !Array.isArray(resolvedJson.data)) {
    throw new Error('Failed to retrieve resolved approvals history!');
  }
  console.log('✅ Step 7 Passed! Resolved approvals history verified.');

  // Clean up
  await mongoose.connection.collection('conversations').deleteOne({ _id: convDoc._id });
  await mongoose.connection.collection('messages').deleteMany({ conversation_id: convDoc._id });
  await mongoose.connection.collection('pendingapprovals').deleteMany({ conversation_id: convDoc._id });
  console.log('\n🧹 Cleaned up temporary test data.');

  console.log('\n====================================================');
  console.log('🎉 ALL APPROVAL WORKFLOW ENDPOINTS TESTED & PASSED 100%!');
  console.log('====================================================\n');

  await mongoose.disconnect();
}

runApprovalWorkflowTests().catch((err) => {
  console.error('\n❌ APPROVAL WORKFLOW TEST FAILED:', err.message);
  process.exit(1);
});

