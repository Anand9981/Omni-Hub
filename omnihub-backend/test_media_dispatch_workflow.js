import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runMediaDispatchTests() {
  console.log('====================================================');
  console.log('📎 Starting OmniHub Media Dispatch Test Suite (Module 4)');
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
  if (!token) throw new Error('Failed to obtain JWT token for testing media dispatch');
  console.log('✅ Admin Authenticated! Token acquired.');

  // 2. Test GET /api/dashboard/media/library
  console.log('\n--- [Step 2: GET /api/dashboard/media/library] ---');
  const libraryRes = await fetch(`${BASE_URL}/dashboard/media/library`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const libraryJson = await libraryRes.json();
  console.log(`Status: ${libraryRes.status} ${libraryRes.statusText}`);
  console.log(`Media Library Assets Count: ${libraryJson.data?.length}`);

  if (!libraryRes.ok || !libraryJson.success || !Array.isArray(libraryJson.data) || libraryJson.data.length < 3) {
    throw new Error('Expected media library with predefined company assets');
  }

  const assetNames = libraryJson.data.map((a) => a.name);
  console.log(`Available Library Assets: ${assetNames.join(', ')}`);
  console.log('✅ Step 2 Passed! Predefined media catalog verified.');

  // 3. Test POST /api/dashboard/media/upload (Base64 file upload with fallback)
  console.log('\n--- [Step 3: POST /api/dashboard/media/upload (Upload Media)] ---');
  const dummyPdfBase64 = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAErVAhUKC4pysxL5yoEAAAA1QPoCmVuZHN0cmVhbQplbmRvYmoK';

  const uploadRes = await fetch(`${BASE_URL}/dashboard/media/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      base64: dummyPdfBase64,
      filename: 'OmniHub_Product_Sheet_2026.pdf',
      mimeType: 'application/pdf',
      folder: 'omnihub_tests',
    }),
  });
  const uploadJson = await uploadRes.json();
  console.log(`Status: ${uploadRes.status} ${uploadRes.statusText}`);
  console.log('Uploaded Media URL:', uploadJson.data?.secure_url || uploadJson.data?.url);
  console.log('Resource Type:', uploadJson.data?.resource_type);
  console.log('Storage Mode:', uploadJson.data?.is_cloudinary ? 'Cloudinary Cloud Storage' : 'Hosted Resilient Storage');

  if (!uploadRes.ok || !uploadJson.success || (!uploadJson.data?.secure_url && !uploadJson.data?.url)) {
    throw new Error('POST /api/dashboard/media/upload failed to return media url');
  }
  console.log('✅ Step 3 Passed! Media asset uploaded successfully.');

  // 4. Test POST /api/dashboard/media/dispatch (Send PDF document into live conversation)
  console.log('\n--- [Step 4: POST /api/dashboard/media/dispatch (Dispatch to Chat)] ---');
  const testChatId = `media_customer_${Date.now()}`;
  // Create test conversation
  const initRes = await fetch(`${BASE_URL}/webhooks/website`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: testChatId,
      sender_name: 'Vikram Sethi',
      text: 'Please send me the agency portfolio and rate sheet.',
    }),
  });
  await initRes.json();

  const convDoc = await mongoose.connection.collection('conversations').findOne({ external_chat_id: testChatId });
  if (!convDoc) throw new Error('Test conversation document not created');

  const dispatchRes = await fetch(`${BASE_URL}/dashboard/media/dispatch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      conversationId: String(convDoc._id),
      mediaUrl: uploadJson.data?.secure_url || uploadJson.data?.url,
      mediaName: 'OmniHub_Product_Sheet_2026.pdf',
      mediaType: 'application/pdf',
      caption: 'Here is our requested 2026 Product Sheet and Enterprise Portfolio.',
    }),
  });
  const dispatchJson = await dispatchRes.json();
  console.log(`Status: ${dispatchRes.status} ${dispatchRes.statusText}`);
  console.log('Dispatch Message ID:', dispatchJson.data?.message?._id || dispatchJson.data?.message?.id);
  console.log('Fallback Link Formatted:', dispatchJson.data?.fallback_link);

  if (!dispatchRes.ok || !dispatchJson.success || !dispatchJson.data?.message) {
    throw new Error('Failed to dispatch media to conversation');
  }

  // 5. Verify Message Saved in DB with media properties
  console.log('\n--- [Step 5: Verifying Message in Database] ---');
  const savedMsg = await mongoose.connection.collection('messages').findOne({
    _id: new mongoose.Types.ObjectId(dispatchJson.data.message._id || dispatchJson.data.message.id),
  });

  if (!savedMsg || !savedMsg.media_url || savedMsg.media_type !== 'application/pdf') {
    throw new Error('Message in database is missing media_url or media_type');
  }
  console.log(`Saved Message Media URL: "${savedMsg.media_url}"`);
  console.log(`Saved Message Media Name: "${savedMsg.media_name}"`);
  console.log(`Saved Message Status: "${savedMsg.status}"`);
  console.log('✅ Step 5 Passed! Outbound media message successfully recorded.');

  // Cleanup temporary test data
  await mongoose.connection.collection('messages').deleteMany({ conversation_id: convDoc._id });
  await mongoose.connection.collection('conversations').deleteOne({ _id: convDoc._id });
  console.log('\n🧹 Cleaned up temporary test data.');

  console.log('\n====================================================');
  console.log('🎉 ALL MEDIA DISPATCH MODULE 4 TESTS PASSED 100%!');
  console.log('====================================================\n');
  await mongoose.disconnect();
}

runMediaDispatchTests().catch((err) => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});

