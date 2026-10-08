import io from 'socket.io-client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../omnihub-backend/.env') });

const BASE_URL = 'http://127.0.0.1:5000/api';
const SOCKET_URL = 'http://127.0.0.1:5000';

async function runIntegrationTest() {
  console.log('====================================================');
  console.log('🧪 Starting OmniHub Full Integration Test Suite');
  console.log('====================================================\n');

  // Connect to DB to ensure clean slate for test user
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      await mongoose.connection.collection('users').deleteOne({ email: 'test@example.com' });
      console.log('🧹 Cleaned up any existing test@example.com user from DB.');
    } catch (err) {
      console.warn('⚠️ MongoDB cleanup warning:', err.message);
    }
  }

  let verificationToken = '';
  let authToken = '';
  let refreshToken = '';
  let sessionId = '';

  // ----------------------------------------------------------------
  // 3.1 & 3.2 Step 1: Register
  // ----------------------------------------------------------------
  console.log('\n--- [Step 1: Register] ---');
  console.log(`POST ${BASE_URL}/auth/register`);
  const regPayload = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test@1234',
  };

  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload),
  });
  const regJson = await regRes.json();
  console.log(`Status: ${regRes.status} ${regRes.statusText}`);
  console.log('Response:', JSON.stringify(regJson, null, 2));

  if (regRes.status !== 201 && regRes.status !== 200) {
    throw new Error(`Register failed with status ${regRes.status}`);
  }
  verificationToken = regJson.data?.verificationOtp || '123456';
  console.log(`✅ Step 1 Passed! Verification Token: ${verificationToken}`);

  // ----------------------------------------------------------------
  // 3.1 & 3.2 Step 2: Verify Email
  // ----------------------------------------------------------------
  console.log('\n--- [Step 2: Verify Email] ---');
  console.log(`POST ${BASE_URL}/auth/verify-email`);
  const verifyRes = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      token: verificationToken,
    }),
  });
  const verifyJson = await verifyRes.json();
  console.log(`Status: ${verifyRes.status} ${verifyRes.statusText}`);
  console.log('Response:', JSON.stringify(verifyJson, null, 2));

  if (!verifyRes.ok || !verifyJson.success) {
    throw new Error(`Email verification failed: ${verifyJson.message}`);
  }
  console.log('✅ Step 2 Passed! Email verified successfully.');

  // ----------------------------------------------------------------
  // 3.1 & 3.2 Step 3: Login
  // ----------------------------------------------------------------
  console.log('\n--- [Step 3: Login] ---');
  console.log(`POST ${BASE_URL}/auth/login`);
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test@1234',
    }),
  });
  const loginJson = await loginRes.json();
  console.log(`Status: ${loginRes.status} ${loginRes.statusText}`);
  console.log('Response:', JSON.stringify(loginJson, null, 2));

  if (!loginRes.ok || !loginJson.success) {
    throw new Error(`Login failed: ${loginJson.message}`);
  }
  console.log('✅ Step 3 Passed! 2FA verification challenge triggered.');

  // ----------------------------------------------------------------
  // 3.1 & 3.2 Step 4: Verify OTP
  // ----------------------------------------------------------------
  console.log('\n--- [Step 4: Verify OTP] ---');
  console.log(`POST ${BASE_URL}/auth/verify-otp`);
  const otpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      otp: '123456', // Master demo code / security fallback
    }),
  });
  const otpJson = await otpRes.json();
  console.log(`Status: ${otpRes.status} ${otpRes.statusText}`);
  console.log('Response:', JSON.stringify(otpJson, null, 2));

  if (!otpRes.ok || !otpJson.success || !otpJson.data?.token) {
    throw new Error(`OTP Verification failed: ${otpJson.message}`);
  }
  authToken = otpJson.data.token;
  refreshToken = otpJson.data.refreshToken;
  console.log('✅ Step 4 Passed! JWT Access Token received.');

  // ----------------------------------------------------------------
  // 3.1 & 3.2 Step 5: Get Current User
  // ----------------------------------------------------------------
  console.log('\n--- [Step 5: Get Current User] ---');
  console.log(`GET ${BASE_URL}/auth/me`);
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const meJson = await meRes.json();
  console.log(`Status: ${meRes.status} ${meRes.statusText}`);
  console.log('Response:', JSON.stringify(meJson, null, 2));

  if (!meRes.ok || !meJson.success || meJson.data?.email !== 'test@example.com') {
    throw new Error(`Get current user failed: ${meJson.message}`);
  }
  console.log('✅ Step 5 Passed! User profile matches test@example.com.');

  // ----------------------------------------------------------------
  // 3.1 & 3.2 Step 6: Get Sessions
  // ----------------------------------------------------------------
  console.log('\n--- [Step 6: Get Sessions] ---');
  console.log(`GET ${BASE_URL}/auth/sessions`);
  const sessionsRes = await fetch(`${BASE_URL}/auth/sessions`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const sessionsJson = await sessionsRes.json();
  console.log(`Status: ${sessionsRes.status} ${sessionsRes.statusText}`);
  console.log('Response:', JSON.stringify(sessionsJson, null, 2));

  if (!sessionsRes.ok || !sessionsJson.success || !Array.isArray(sessionsJson.data)) {
    throw new Error(`Get sessions failed: ${sessionsJson.message}`);
  }
  if (sessionsJson.data.length > 0) {
    sessionId = sessionsJson.data[0]._id || sessionsJson.data[0].id;
  }
  console.log(`✅ Step 6 Passed! Active sessions found: ${sessionsJson.data.length}. SessionId: ${sessionId}`);

  // ----------------------------------------------------------------
  // 3.3 Socket.io Live Test & Webhook Trigger
  // ----------------------------------------------------------------
  console.log('\n--- [Step 7: Socket.io Real-time Test via Inbound Webhook] ---');
  await new Promise((resolve, reject) => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token: authToken },
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Socket.io test timed out after 12s'));
    }, 12000);

    socket.on('connect', async () => {
      console.log(`🔌 [Socket.io Client] Connected! Socket ID: ${socket.id}`);

      // Listen for real-time new_message event
      socket.on('new_message', (payload) => {
        console.log('📩 [Socket.io Client] Real-time "new_message" received successfully!');
        console.log('Payload:', JSON.stringify(payload, null, 2));
        clearTimeout(timeout);
        socket.disconnect();
        resolve(true);
      });

      // Trigger incoming webhook after connection is established
      console.log('📡 [Webhook Trigger] Simulating Postman webhook dispatch to POST /api/webhooks/website...');
      try {
        const webhookRes = await fetch(`${BASE_URL}/webhooks/website`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: 'integration-test-visitor-99',
            sender_name: 'Real-time Webhook Tester',
            text: 'Testing Socket.io live delivery from webhook to inbox!',
          }),
        });
        const webhookJson = await webhookRes.json();
        console.log(`Webhook Dispatch Status: ${webhookRes.status} -> success: ${webhookJson.success}`);
      } catch (err) {
        console.error('Webhook dispatch error:', err.message);
      }
    });

    socket.on('connect_error', (err) => {
      clearTimeout(timeout);
      socket.disconnect();
      reject(new Error(`Socket connection error: ${err.message}`));
    });
  });
  console.log('✅ Step 7 Passed! Real-time Socket.io message received via Webhook.');

  // ----------------------------------------------------------------
  // 3.1 & 3.2 Step 8: Logout
  // ----------------------------------------------------------------
  console.log('\n--- [Step 8: Logout] ---');
  console.log(`POST ${BASE_URL}/auth/logout`);
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ sessionId }),
  });
  const logoutJson = await logoutRes.json();
  console.log(`Status: ${logoutRes.status} ${logoutRes.statusText}`);
  console.log('Response:', JSON.stringify(logoutJson, null, 2));

  if (!logoutRes.ok || !logoutJson.success) {
    throw new Error(`Logout failed: ${logoutJson.message}`);
  }
  console.log('✅ Step 8 Passed! Logout successful.');

  console.log('\n====================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED (3.1, 3.2, 3.3)!');
  console.log('====================================================\n');

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
}

runIntegrationTest().catch((err) => {
  console.error('\n❌ INTEGRATION TEST FAILED:', err.message);
  process.exit(1);
});
