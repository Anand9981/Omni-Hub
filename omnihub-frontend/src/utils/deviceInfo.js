/**
 * Browser & OS device metadata utility for session tracking and security audit logs.
 */

export function parseUserAgent(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  let os = 'Unknown OS';
  if (/windows nt/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = 'Chrome';
  else if (/firefox\//i.test(ua)) browser = 'Firefox';
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = 'Safari';

  const isMobile = /iphone|ipad|ipod|android|mobile/i.test(ua);
  const deviceType = isMobile ? 'mobile' : /mac|windows|linux/i.test(os) ? 'desktop' : 'laptop';

  return {
    os,
    browser,
    deviceType,
    isMobile,
    label: `${os} · ${browser}`,
    userAgent: ua,
  };
}

export function getDeviceLabel() {
  const info = parseUserAgent();
  return `${info.os} · This device`;
}

export function getDeviceMeta() {
  return parseUserAgent();
}

export function isMobileDevice(deviceString = '') {
  return /iphone|android|mobile|ios/i.test(deviceString);
}

export default {
  parseUserAgent,
  getDeviceLabel,
  getDeviceMeta,
  isMobileDevice,
};
