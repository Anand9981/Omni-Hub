const STORAGE_KEY = 'omnihub.demo.billingPreferences';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: null,
    channels: 1,
    messages: 1000,
    features: ['1 connected channel', '1,000 messages per month', 'Shared inbox', 'Email support'],
  },
  {
    id: 'standard',
    name: 'Standard',
    monthlyPrice: null,
    channels: 3,
    messages: 10000,
    features: ['3 connected channels', '10,000 messages per month', 'AI tools & approvals', 'Priority support'],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: null,
    channels: 'Unlimited',
    messages: 'Unlimited',
    features: ['All channels', 'Unlimited messages', 'Advanced analytics', 'Dedicated support'],
  },
  {
    id: 'custom',
    name: 'Custom',
    monthlyPrice: null,
    channels: 'Flexible',
    messages: 'Flexible',
    features: ['Enterprise channel mix', 'Custom usage limits', 'Tailored onboarding', 'Contact sales'],
  },
];

export const BILLING_CYCLES = [
  { id: 'monthly', label: 'Monthly', discount: 0 },
  { id: 'quarterly', label: 'Quarterly', discount: 10 },
  { id: 'yearly', label: 'Yearly', discount: 20 },
];

export const PAYMENT_GATEWAYS = [
  { id: 'razorpay', label: 'Razorpay', region: 'India' },
  { id: 'stripe', label: 'Stripe', region: 'International' },
  { id: 'fonepay', label: 'Fonepay', region: 'Nepal' },
  { id: 'upi', label: 'UPI', region: 'India' },
];

export const GRACE_PERIOD_DAYS = 7;

const DEFAULT_PREFERENCES = {
  selectedPlan: 'basic',
  billingCycle: 'monthly',
  autoRenew: false,
  paymentGateway: '',
};

function readPreferences() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULT_PREFERENCES };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Billing preferences must be an object.');
    }
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (error) {
    console.error('Could not read billing preferences.', error);
    throw new Error('Billing preferences could not be loaded. Refresh the page to retry.');
  }
}

export const billingService = {
  getPreferences() {
    return readPreferences();
  },

  savePreferences(preferences) {
    const current = readPreferences();
    const next = { ...current, ...preferences };
    if (!SUBSCRIPTION_PLANS.some((plan) => plan.id === next.selectedPlan)) {
      throw new Error('Choose a valid subscription plan.');
    }
    if (!BILLING_CYCLES.some((cycle) => cycle.id === next.billingCycle)) {
      throw new Error('Choose a valid billing cycle.');
    }
    if (next.paymentGateway && !PAYMENT_GATEWAYS.some((gateway) => gateway.id === next.paymentGateway)) {
      throw new Error('Choose a supported payment gateway.');
    }
    const saved = { ...next, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return saved;
  },
};
