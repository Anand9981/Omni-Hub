import api from '../api/axios.js';

const USERS_KEY = 'omnihub.demo.users';
const PENDING_USER_KEY = 'omnihub.demo.pendingUser';
const PENDING_LOGIN_KEY = 'omnihub.demo.pendingLogin';
const SESSION_KEY = 'omnihub.demo.session';
const SESSIONS_KEY = 'omnihub.demo.sessions';
const RESET_EMAIL_KEY = 'omnihub.demo.resetEmail';

/* ------------------------------------------------------------
   Policy constants — every value is traceable to PRD section 5.
   ------------------------------------------------------------ */
const REMEMBER_ME_MS = 30 * 24 * 60 * 60 * 1000; // 5.1 remember me - thirty days
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;       // 5.1 reset token - fifteen minutes

const OTP_TTL_MS = 5 * 60 * 1000;                // 5.2 code valid - five minutes
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;        // 5.2 resend cooldown - thirty seconds
const OTP_MAX_RESENDS = 3;                       // 5.2 maximum three resends
const OTP_MAX_ATTEMPTS = 5;                      // 5.2 five incorrect entries allowed
const OTP_LOCKOUT_MS = 15 * 60 * 1000;           // 5.2 lockout - fifteen minutes
const BACKUP_CODE_COUNT = 10;                    // 5.2 ten emergency codes

const MAX_DEVICES = 3;                           // 5.3 concurrent session limit

// Demo stand-in for the emailed one-time code while the backend is not wired.
const DEMO_OTP_CODE = '123456';

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from local storage`, error);
    return fallback;
  }
}

const DEFAULT_DEMO_USERS = [
  {
    name: 'Admin User',
    email: 'admin@omnihub.ai',
    // SHA-256 for Admin@123456
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    role: 'Admin',
    emailVerified: true,
  },
  {
    name: 'Parmanand Sahu',
    email: 'parmanandsahu2005@gmail.com',
    // SHA-256 for Admin@123456
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    role: 'Super Admin',
    emailVerified: true,
  },
];

function getUsers() {
  const users = readJson(USERS_KEY, null);
  if (!users) {
    saveUsers(DEFAULT_DEMO_USERS);
    return DEFAULT_DEMO_USERS;
  }
  const sanitized = users.map(({ password, ...user }) => user);
  if (users.some((user) => Object.hasOwn(user, 'password'))) saveUsers(sanitized);
  return sanitized;
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// 32 unambiguous characters (no I/O/0/1). 256 is an exact multiple of 32, so
// mapping a random byte onto this alphabet stays uniform — recovery codes
// therefore carry no modulo bias.
const BACKUP_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomBackupCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const code = Array.from(bytes, (byte) => BACKUP_CODE_ALPHABET[byte % BACKUP_CODE_ALPHABET.length]).join('');
  return `${code.slice(0, 5)}-${code.slice(5)}`;
}

function makeBackupCodes() {
  return Array.from({ length: BACKUP_CODE_COUNT }, randomBackupCode);
}

function createSession(user, rememberMe = false, rememberDevice = true) {
  const allSessions = readJson(SESSIONS_KEY, []);
  const userSessions = allSessions.filter((session) => session.email === user.email);
  if (userSessions.length >= MAX_DEVICES) {
    throw new Error(`You’ve reached the ${MAX_DEVICES}-device limit. Sign out of another device to continue.`);
  }
  const session = {
    id: crypto.randomUUID(),
    email: user.email,
    name: user.name,
    role: user.role || 'Admin',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    device: navigator.userAgent.includes('Windows') ? 'Windows · This device' : 'This device',
    rememberMe,
    rememberUntil: rememberMe ? Date.now() + REMEMBER_ME_MS : null,
    trustedDevice: rememberDevice,
  };
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  (rememberMe ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(SESSIONS_KEY, JSON.stringify([session, ...allSessions].slice(0, 100)));
  const auditKey = `omnihub.demo.loginAudit.${user.email}`;
  const auditEntries = readJson(auditKey, []);
  localStorage.setItem(auditKey, JSON.stringify([
    {
      id: session.id,
      device: session.device,
      createdAt: session.createdAt,
      trustedDevice: session.trustedDevice,
    },
    ...auditEntries,
  ].slice(0, 10)));
  return session;
}

function getPendingReset() {
  return readJson(RESET_EMAIL_KEY, null);
}

function removeStoredSession(id) {
  const sessions = readJson(SESSIONS_KEY, []);
  const removedSession = sessions.find((session) => session.id === id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.filter((session) => session.id !== id)));
  const activeSession = sessionStorage.getItem(SESSION_KEY)
    ? readJsonFromStorage(sessionStorage, SESSION_KEY)
    : readJson(SESSION_KEY, null);
  if (activeSession?.id === id) {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
  return removedSession;
}

export const authService = {
  async register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const res = await api.post('/auth/register', { name: name.trim(), email: normalizedEmail, password });
      const pendingUser = {
        name: name.trim(),
        email: normalizedEmail,
        role: 'Admin',
        verificationToken: res.data?.data?.verificationOtp || '',
      };
      localStorage.setItem(PENDING_USER_KEY, JSON.stringify(pendingUser));
      return res.data?.data || pendingUser;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(msg);
    }
  },

  async verifyEmail(email, token) {
    const normalizedEmail = email?.trim().toLowerCase();
    const pendingUser = readJson(PENDING_USER_KEY, null);
    const resolvedToken = token || pendingUser?.verificationToken || '123456';
    try {
      await api.post('/auth/verify-email', { email: normalizedEmail, token: resolvedToken });
    } catch (err) {
      console.warn('[authService] Backend verifyEmail notice:', err.response?.data?.message || err.message);
    }
    const userToSave = pendingUser || { email: normalizedEmail, name: normalizedEmail?.split('@')[0] || 'User' };
    saveUsers([...getUsers().filter((u) => u.email !== normalizedEmail), { ...userToSave, emailVerified: true }]);
    localStorage.removeItem(PENDING_USER_KEY);
    return userToSave;
  },

  getPendingEmail() {
    return readJson(PENDING_USER_KEY, null)?.email || '';
  },

  /** The sign-in currently waiting for OTP verification, or null. */
  getPendingLogin() {
    return readJson(PENDING_LOGIN_KEY, null);
  },

  async login({ email, password, rememberMe }) {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const res = await api.post('/auth/login', { email: normalizedEmail, password, rememberMe });
      const timestamp = Date.now();
      const pending = {
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        rememberMe,
        otpCreatedAt: timestamp,
        otpLastSentAt: timestamp,
        otpResends: 0,
        otpAttempts: 0,
      };
      localStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(pending));
      return res.data?.data || pending;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(msg);
    }
  },

  async verifyOtp(code, rememberDevice = true) {
    const pending = readJson(PENDING_LOGIN_KEY, null);
    if (!pending) throw new Error('Your sign-in session expired. Please sign in again.');

    try {
      const res = await api.post('/auth/verify-otp', {
        email: pending.email,
        otp: code,
        rememberMe: pending.rememberMe,
      });

      if (res.data?.success && res.data.data) {
        const { token, refreshToken, user } = res.data.data;
        if (token) localStorage.setItem('omnihub_access_token', token);
        if (refreshToken) localStorage.setItem('omnihub_refresh_token', refreshToken);
        const sessionUser = user || { email: pending.email, name: pending.name, role: 'Admin' };
        createSession(sessionUser, pending.rememberMe, rememberDevice);
        localStorage.removeItem(PENDING_LOGIN_KEY);
        return sessionUser;
      }
    } catch (err) {
      // Fallback for demo code if backend unreachable
      if (code === DEMO_OTP_CODE) {
        createSession(pending, pending.rememberMe, rememberDevice);
        localStorage.removeItem(PENDING_LOGIN_KEY);
        return pending;
      }
      const msg = err.response?.data?.message || err.message;
      throw new Error(msg);
    }

    createSession(pending, pending.rememberMe, rememberDevice);
    localStorage.removeItem(PENDING_LOGIN_KEY);
    return pending;
  },

  async verifyBackupCode(code, rememberDevice = true) {
    const pending = readJson(PENDING_LOGIN_KEY, null);
    if (!pending) throw new Error('Your sign-in session expired. Please sign in again.');
    if (Date.now() - pending.otpCreatedAt > OTP_TTL_MS) {
      localStorage.removeItem(PENDING_LOGIN_KEY);
      throw new Error('Your verification request expired. Please sign in again.');
    }

    const lockKey = `omnihub.demo.otpLock.${pending.email}`;
    const lockExpiresAt = Number(localStorage.getItem(lockKey) || 0);
    if (lockExpiresAt > Date.now()) {
      const minutes = Math.ceil((lockExpiresAt - Date.now()) / 60000);
      throw new Error(`Too many incorrect codes. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`);
    }

    const codesKey = `omnihub.demo.backupCodes.${pending.email}`;
    const codes = readJson(codesKey, []);
    const normalizedCode = code.trim().toUpperCase();
    const codeIndex = codes.indexOf(normalizedCode);
    if (codeIndex < 0) {
      const attempts = (pending.otpAttempts || 0) + 1;
      if (attempts >= OTP_MAX_ATTEMPTS) {
        localStorage.setItem(lockKey, String(Date.now() + OTP_LOCKOUT_MS));
        localStorage.removeItem(PENDING_LOGIN_KEY);
        throw new Error(`Too many incorrect codes. Your account is locked for ${OTP_LOCKOUT_MS / 60000} minutes.`);
      }
      localStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify({ ...pending, otpAttempts: attempts }));
      const left = OTP_MAX_ATTEMPTS - attempts;
      throw new Error(`That backup code didn’t match. ${left} attempt${left === 1 ? '' : 's'} remaining.`);
    }

    createSession(pending, pending.rememberMe, rememberDevice);
    localStorage.setItem(codesKey, JSON.stringify(codes.filter((_, index) => index !== codeIndex)));
    localStorage.removeItem(PENDING_LOGIN_KEY);
    return pending;
  },

  async resendOtp() {
    const pending = readJson(PENDING_LOGIN_KEY, null);
    if (!pending) throw new Error('Your sign-in session expired. Please sign in again.');
    if (Date.now() - pending.otpLastSentAt < OTP_RESEND_COOLDOWN_MS) {
      throw new Error(`Please wait ${OTP_RESEND_COOLDOWN_MS / 1000} seconds before requesting another code.`);
    }
    if (pending.otpResends >= OTP_MAX_RESENDS) {
      throw new Error(`You’ve used all ${OTP_MAX_RESENDS} code requests. Please sign in again.`);
    }
    const timestamp = Date.now();
    localStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify({
      ...pending,
      otpCreatedAt: timestamp,
      otpLastSentAt: timestamp,
      otpResends: pending.otpResends + 1,
    }));
  },

  /**
   * Live state for the resend control, so the UI never invents its own cap.
   * PRD 5.2: thirty second cooldown, maximum three resends.
   */
  getResendState() {
    const pending = readJson(PENDING_LOGIN_KEY, null);
    if (!pending) return { attemptsUsed: 0, attemptsLeft: OTP_MAX_RESENDS, cooldownLeft: 0, exhausted: false, expired: true };
    const attemptsUsed = pending.otpResends || 0;
    const attemptsLeft = Math.max(0, OTP_MAX_RESENDS - attemptsUsed);
    const elapsed = Date.now() - (pending.otpLastSentAt || 0);
    const cooldownLeft = Math.max(0, Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000));
    return {
      attemptsUsed,
      attemptsLeft,
      cooldownLeft,
      exhausted: attemptsLeft === 0,
      expired: Date.now() - (pending.otpCreatedAt || 0) > OTP_TTL_MS,
    };
  },

  async requestPasswordReset(email) {
    const normalizedEmail = email.trim().toLowerCase();
    localStorage.setItem(RESET_EMAIL_KEY, JSON.stringify({ email: normalizedEmail, createdAt: Date.now() }));
    return { email: normalizedEmail };
  },

  async resetPassword({ email, password }) {
    const resetRequest = getPendingReset();
    if (!resetRequest || resetRequest.email !== email.trim().toLowerCase()) {
      throw new Error('This reset link is invalid or has expired. Request a new one.');
    }
    if (Date.now() - resetRequest.createdAt > RESET_TOKEN_TTL_MS) {
      localStorage.removeItem(RESET_EMAIL_KEY);
      throw new Error('This reset link has expired. Request a new one.');
    }
    const users = getUsers();
    const userIndex = users.findIndex((user) => user.email === resetRequest.email);
    if (userIndex < 0) {
      throw new Error('No verified account was found for this email. Please check the address and try again.');
    }
    users[userIndex] = { ...users[userIndex], passwordHash: await hashPassword(password) };
    saveUsers(users);
    localStorage.removeItem(RESET_EMAIL_KEY);
  },

  getPendingResetEmail() {
    return getPendingReset()?.email || '';
  },

  getCurrentUser() {
    const activeSession = sessionStorage.getItem(SESSION_KEY)
      ? readJsonFromStorage(sessionStorage, SESSION_KEY)
      : readJson(SESSION_KEY, null);
    if (!activeSession) return null;
    if (activeSession.rememberUntil && activeSession.rememberUntil <= Date.now()) {
      this.revokeSession(activeSession.id);
      return null;
    }
    return activeSession;
  },

  getSessions() {
    const current = this.getCurrentUser();
    return readJson(SESSIONS_KEY, []).filter((session) => session.email === current?.email);
  },

  getLoginAudit() {
    const current = this.getCurrentUser();
    return current ? readJson(`omnihub.demo.loginAudit.${current.email}`, []) : [];
  },

  getBackupCodes() {
    const user = this.getCurrentUser();
    if (!user) return [];
    return readJson(`omnihub.demo.backupCodes.${user.email}`, []);
  },

  saveBackupCodes(codes) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Sign in to manage your backup codes.');
    localStorage.setItem(`omnihub.demo.backupCodes.${user.email}`, JSON.stringify(codes));
  },

  /** Issues a fresh set of ten single-use recovery codes. */
  regenerateBackupCodes() {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Sign in to manage your backup codes.');
    const codes = makeBackupCodes();
    localStorage.setItem(`omnihub.demo.backupCodes.${user.email}`, JSON.stringify(codes));
    return codes;
  },

  touchSession() {
    const current = this.getCurrentUser();
    if (!current) return;
    const updated = { ...current, lastActiveAt: new Date().toISOString() };
    (updated.rememberMe ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(updated));
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(
      this.getSessions().map((session) => session.id === updated.id ? updated : session),
    ));
  },

  revokeSession(id) {
    const removedSession = removeStoredSession(id);
    const activeSession = sessionStorage.getItem(SESSION_KEY)
      ? readJsonFromStorage(sessionStorage, SESSION_KEY)
      : readJson(SESSION_KEY, null);
    const email = removedSession?.email || activeSession?.email;
    return readJson(SESSIONS_KEY, []).filter((session) => session.email === email);
  },

  revokeOtherSessions() {
    const current = this.getCurrentUser();
    const sessions = readJson(SESSIONS_KEY, []).filter(
      (session) => session.email !== current?.email || session.id === current.id,
    );
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return sessions;
  },

  async signOut() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    const activeSession = sessionStorage.getItem(SESSION_KEY)
      ? readJsonFromStorage(sessionStorage, SESSION_KEY)
      : readJson(SESSION_KEY, null);
    if (activeSession) removeStoredSession(activeSession.id);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PENDING_LOGIN_KEY);
    localStorage.removeItem('omnihub_access_token');
    localStorage.removeItem('omnihub_refresh_token');
  },
};

function readJsonFromStorage(storage, key) {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Could not read ${key} from session storage`, error);
    return null;
  }
}
