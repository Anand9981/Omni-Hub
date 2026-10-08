import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runLeadsCrmTests() {
  console.log('====================================================');
  console.log('👥 Starting OmniHub Leads CRM Test Suite (Module 5)');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI missing in .env');
  await mongoose.connect(mongoUri);

  // 1. Authenticate Admin
  console.log('--- [Step 1: Admin Authentication] ---');
  let token = '';
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'Test@1234' }),
  });
  const loginJson = await loginRes.json();
  if (loginJson.success) {
    const otpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', otp: '123456' }),
    });
    const otpJson = await otpRes.json();
    token = otpJson.data?.token;
  }
  if (!token) throw new Error('Failed to obtain JWT token for testing leads CRM');
  console.log('✅ Admin Authenticated! Token acquired.');

  // 2. Trigger Inbound Message with Contact & High-Intent Details
  console.log('\n--- [Step 2: Triggering Inbound Message with Contact Details] ---');
  const testChatId = `lead_customer_${Date.now()}`;
  const incomingText = 'Hello! I am Rakesh Gupta. We need pricing quotes for an enterprise ecommerce solution. You can reach me at rakesh.gupta@fintechlabs.in or +91 9820123456.';

  const inboundRes = await fetch(`${BASE_URL}/webhooks/website`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: testChatId,
      sender_name: 'Website Visitor',
      text: incomingText,
    }),
  });
  const inboundJson = await inboundRes.json();
  console.log(`Status: ${inboundRes.status} ${inboundRes.statusText}`);

  // Wait 1.5s for non-blocking extractor to complete
  await new Promise((r) => setTimeout(r, 1500));

  const convDoc = await mongoose.connection.collection('conversations').findOne({ external_chat_id: testChatId });
  if (!convDoc) throw new Error('Conversation document not found');

  // 3. Verify Extracted Lead Document in Database
  console.log('\n--- [Step 3: Verifying Automated Lead Extraction] ---');
  const leadDoc = await mongoose.connection.collection('leads').findOne({ conversation_id: convDoc._id });
  if (!leadDoc) throw new Error('Automated lead was not extracted for conversation!');

  console.log(`Extracted Name: "${leadDoc.full_name}"`);
  console.log(`Extracted Email: "${leadDoc.email_address}"`);
  console.log(`Extracted Phone: "${leadDoc.phone_number}"`);
  console.log(`Assigned Tags: [${leadDoc.lead_tags?.join(', ')}]`);
  console.log(`Lead Score: ${leadDoc.lead_score}/100`);
  console.log(`Pipeline Status: ${leadDoc.status}`);

  if (leadDoc.email_address !== 'rakesh.gupta@fintechlabs.in') {
    throw new Error(`Email extraction failed, expected rakesh.gupta@fintechlabs.in, got: ${leadDoc.email_address}`);
  }
  if (!leadDoc.phone_number.includes('9820123456')) {
    throw new Error(`Phone extraction failed, got: ${leadDoc.phone_number}`);
  }
  if (!leadDoc.lead_tags.includes('#PRICING_INQUIRY') || !leadDoc.lead_tags.includes('#HOT_LEAD')) {
    throw new Error('Auto-tagging failed to detect high-intent tags (#PRICING_INQUIRY, #HOT_LEAD)');
  }
  console.log('✅ Step 3 Passed! Contact information and high-intent tags successfully extracted.');

  // 4. Test GET /api/dashboard/leads/:conversationId
  console.log('\n--- [Step 4: GET /api/dashboard/leads/:conversationId] ---');
  const getLeadRes = await fetch(`${BASE_URL}/dashboard/leads/${convDoc._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getLeadJson = await getLeadRes.json();
  console.log(`Status: ${getLeadRes.status} ${getLeadRes.statusText}`);
  if (!getLeadRes.ok || !getLeadJson.success || !getLeadJson.data) {
    throw new Error('Failed to retrieve lead details via API');
  }
  console.log('✅ Step 4 Passed! Lead details retrieved via API.');

  // 5. Test PATCH /api/dashboard/leads/:conversationId (Agent updates pipeline status & tags)
  console.log('\n--- [Step 5: PATCH /api/dashboard/leads/:conversationId (Lead Update)] ---');
  const updateRes = await fetch(`${BASE_URL}/dashboard/leads/${convDoc._id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      company: 'Fintech Labs Pvt Ltd',
      status: 'QUALIFIED',
      lead_tags: [...leadDoc.lead_tags, '#DEMO_SCHEDULED'],
      notes: 'Customer scheduled for discovery call on Thursday 3 PM.',
    }),
  });
  const updateJson = await updateRes.json();
  console.log(`Status: ${updateRes.status} ${updateRes.statusText}`);
  console.log('Updated Company:', updateJson.data?.company);
  console.log('Updated Status:', updateJson.data?.status);
  console.log('Updated Tags:', updateJson.data?.lead_tags?.join(', '));

  if (!updateRes.ok || !updateJson.success || updateJson.data?.status !== 'QUALIFIED') {
    throw new Error('Failed to update lead details via PATCH');
  }
  console.log('✅ Step 5 Passed! Pipeline status and tags updated.');

  // 6. Test GET /api/dashboard/leads (List all leads)
  console.log('\n--- [Step 6: GET /api/dashboard/leads (List CRM Leads)] ---');
  const listRes = await fetch(`${BASE_URL}/dashboard/leads`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listJson = await listRes.json();
  console.log(`Status: ${listRes.status} ${listJson.data?.length} leads loaded.`);
  if (!listRes.ok || !listJson.success || !Array.isArray(listJson.data)) {
    throw new Error('Failed to list CRM leads');
  }
  console.log('✅ Step 6 Passed! CRM leads loaded.');

  // Cleanup temporary test data
  await mongoose.connection.collection('leads').deleteOne({ conversation_id: convDoc._id });
  await mongoose.connection.collection('messages').deleteMany({ conversation_id: convDoc._id });
  await mongoose.connection.collection('conversations').deleteOne({ _id: convDoc._id });
  console.log('\n🧹 Cleaned up temporary test data.');

  console.log('\n====================================================');
  console.log('🎉 ALL LEADS CRM MODULE 5 TESTS PASSED 100%!');
  console.log('====================================================\n');
  await mongoose.disconnect();
}

runLeadsCrmTests().catch((err) => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});

