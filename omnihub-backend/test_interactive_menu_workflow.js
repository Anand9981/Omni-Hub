import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runInteractiveMenuTests() {
  console.log('====================================================');
  console.log('🔘 Starting OmniHub Interactive Menu Test Suite (Module 3)');
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
  if (!token) throw new Error('Failed to obtain JWT token for testing interactive menus');
  console.log('✅ Admin Authenticated! Token acquired.');

  // 2. Test GET /api/dashboard/menus/default
  console.log('\n--- [Step 2: GET /api/dashboard/menus/default] ---');
  const getMenuRes = await fetch(`${BASE_URL}/dashboard/menus/default`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getMenuJson = await getMenuRes.json();
  console.log(`Status: ${getMenuRes.status} ${getMenuRes.statusText}`);
  console.log(`Menu Welcome: "${getMenuJson.data?.welcome_message || getMenuJson.data?.welcomeMessage}"`);
  console.log(`Root Buttons Count: ${getMenuJson.data?.buttons?.length}`);

  if (!getMenuRes.ok || !getMenuJson.success || !Array.isArray(getMenuJson.data?.buttons)) {
    throw new Error('GET /api/dashboard/menus/default failed or returned invalid format');
  }
  const rootLabels = getMenuJson.data.buttons.map((b) => b.label);
  console.log(`Root Button Options: [${rootLabels.join('] [')}]`);
  console.log('✅ Step 2 Passed! Menu schema retrieved successfully.');

  // 3. Test POST /api/dashboard/menus/default (Save custom menu)
  console.log('\n--- [Step 3: POST /api/dashboard/menus/default (Save Custom Menu)] ---');
  const customMenuPayload = {
    platform: 'default',
    welcome_message: 'Thank you! Choose an option below to get started:',
    buttons: [
      {
        id: 'btn_setup',
        label: 'How to Setup',
        action: 'submenu',
        children: [
          {
            id: 'btn_setup_guide',
            label: '📄 Quickstart Setup Guide',
            action: 'media',
            media_id: 'asset-setup-guide',
            media_url: 'https://omnihub.example/resources/setup-guide.pdf',
            media_name: 'OmniHub_QuickStart_Setup_Guide.pdf',
            media_type: 'application/pdf',
          },
          {
            id: 'btn_setup_help',
            label: '⚙️ Troubleshooting',
            action: 'reply',
            reply: 'For troubleshooting, verify your bot token / webhook URLs in Settings > Channels.',
          },
        ],
      },
      {
        id: 'btn_services',
        label: 'View Services',
        action: 'submenu',
        children: [
          {
            id: 'btn_srv_starter',
            label: '🚀 Starter Plan ($29/mo)',
            action: 'reply',
            reply: 'Starter Plan ($29/mo): Connect 3 channels, 2 team seats, unified multiplatform inbox.',
          },
          {
            id: 'btn_srv_growth',
            label: '⚡ Growth Plan ($79/mo)',
            action: 'reply',
            reply: 'Growth Plan ($79/mo): Unlimited channels, AI Auto-Pilot bots with Gemini Copilot, smart replies.',
          },
        ],
      },
      {
        id: 'btn_contact',
        label: 'Contact Support',
        action: 'handover',
        reply: 'Connecting you with our support team. An agent has been alerted and will join shortly.',
      },
    ],
  };

  const saveMenuRes = await fetch(`${BASE_URL}/dashboard/menus/default`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(customMenuPayload),
  });
  const saveMenuJson = await saveMenuRes.json();
  console.log(`Status: ${saveMenuRes.status} ${saveMenuRes.statusText}`);
  if (!saveMenuRes.ok || !saveMenuJson.success) {
    throw new Error('POST /api/dashboard/menus/default failed to save menu');
  }
  console.log('✅ Step 3 Passed! Custom interactive menu configuration saved to database.');

  // 4. Test User Inbound "Hi" -> Receives Welcome Menu with Buttons
  console.log('\n--- [Step 4: Flow Test: User says "Hi" -> Bot sends Interactive Menu] ---');
  const testChatId = `menu_customer_${Date.now()}`;
  const inboundHiRes = await fetch(`${BASE_URL}/webhooks/website`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: testChatId,
      sender_name: 'Ananya Sharma',
      text: 'Hi',
    }),
  });
  const inboundHiJson = await inboundHiRes.json();
  console.log(`Status: ${inboundHiRes.status} ${inboundHiRes.statusText}`);
  console.log('Auto-Pilot Action:', inboundHiJson.data?.autoPilot?.action);

  if (inboundHiJson.data?.autoPilot?.action !== 'SENT_MENU') {
    throw new Error(`Expected autoPilot.action to be SENT_MENU, got: ${inboundHiJson.data?.autoPilot?.action}`);
  }

  const convDoc = await mongoose.connection.collection('conversations').findOne({ external_chat_id: testChatId });
  const messagesAfterHi = await mongoose.connection.collection('messages')
    .find({ conversation_id: convDoc._id })
    .toArray();

  const botMenuMsg = messagesAfterHi.find((m) => m.sender_type === 'BOT');
  if (!botMenuMsg) throw new Error('Bot did not send menu message after "Hi"');
  console.log(`Bot Response: "${botMenuMsg.text_content}"`);
  console.log(`Buttons attached: ${botMenuMsg.buttons?.map((b) => `[${b.label}]`).join(' ')}`);
  console.log('✅ Step 4 Passed! User saying "Hi" successfully received interactive menu with options.');

  // 5. Test Button Click: "View Services" (Submenu action)
  console.log('\n--- [Step 5: Button Click Test: User clicks [View Services]] ---');
  const clickServicesRes = await fetch(`${BASE_URL}/dashboard/menus/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId: String(convDoc._id),
      buttonId: 'btn_services',
    }),
  });
  const clickServicesJson = await clickServicesRes.json();
  console.log(`Status: ${clickServicesRes.status} ${clickServicesRes.statusText}`);
  console.log(`Bot Reply: "${clickServicesJson.data?.replyText}"`);
  console.log(`Submenu Options: ${clickServicesJson.data?.buttons?.map((b) => `[${b.label}]`).join(' ')}`);

  if (!clickServicesJson.success || !Array.isArray(clickServicesJson.data?.buttons) || clickServicesJson.data.buttons.length < 2) {
    throw new Error('Clicking "View Services" did not return submenu buttons');
  }
  console.log('✅ Step 5 Passed! Submenu returned child options successfully.');

  // 6. Test Button Click: "⚡ Growth Plan ($79/mo)" (Reply action)
  console.log('\n--- [Step 6: Button Click Test: User clicks [⚡ Growth Plan ($79/mo)]] ---');
  const clickPlanRes = await fetch(`${BASE_URL}/dashboard/menus/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId: String(convDoc._id),
      buttonId: 'btn_srv_growth',
    }),
  });
  const clickPlanJson = await clickPlanRes.json();
  console.log(`Status: ${clickPlanRes.status} ${clickPlanRes.statusText}`);
  console.log(`Bot Reply: "${clickPlanJson.data?.replyText}"`);

  if (!clickPlanJson.success || !clickPlanJson.data?.replyText.includes('Growth Plan')) {
    throw new Error('Clicking Growth Plan button did not return appropriate plan reply');
  }
  console.log('✅ Step 6 Passed! Reply action dispatched plan description.');

  // 7. Test Button Click: "📄 Quickstart Setup Guide" (Media dispatch action)
  console.log('\n--- [Step 7: Button Click Test: User clicks [📄 Quickstart Setup Guide]] ---');
  const clickMediaRes = await fetch(`${BASE_URL}/dashboard/menus/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId: String(convDoc._id),
      buttonId: 'btn_setup_guide',
    }),
  });
  const clickMediaJson = await clickMediaRes.json();
  console.log(`Status: ${clickMediaRes.status} ${clickMediaRes.statusText}`);
  console.log(`Bot Media Name: "${clickMediaJson.data?.media_name}"`);
  console.log(`Bot Media URL: "${clickMediaJson.data?.media_url}"`);
  console.log(`Bot Media Type: "${clickMediaJson.data?.media_type}"`);

  if (!clickMediaJson.success || !clickMediaJson.data?.media_url) {
    throw new Error('Media button click did not return media asset');
  }
  console.log('✅ Step 7 Passed! Media dispatch successfully delivered PDF asset.');

  // 8. Test Button Click: "Contact Support" (Handover action)
  console.log('\n--- [Step 8: Button Click Test: User clicks [Contact Support]] ---');
  const clickContactRes = await fetch(`${BASE_URL}/dashboard/menus/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId: String(convDoc._id),
      buttonId: 'btn_contact',
    }),
  });
  const clickContactJson = await clickContactRes.json();
  console.log(`Status: ${clickContactRes.status} ${clickContactRes.statusText}`);
  console.log(`Bot Reply: "${clickContactJson.data?.replyText}"`);

  if (!clickContactJson.success || !clickContactJson.data?.replyText.includes('agent')) {
    throw new Error('Handover action failed to return agent handover response');
  }
  console.log('✅ Step 8 Passed! Handover initiated and support alert triggered.');

  // Cleanup temporary test data
  await mongoose.connection.collection('messages').deleteMany({ conversation_id: convDoc._id });
  await mongoose.connection.collection('conversations').deleteOne({ _id: convDoc._id });
  console.log('\n🧹 Cleaned up temporary test data.');

  console.log('\n====================================================');
  console.log('🎉 ALL INTERACTIVE MENU MODULE 3 TESTS PASSED 100%!');
  console.log('====================================================\n');
  await mongoose.disconnect();
}

runInteractiveMenuTests().catch((err) => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
