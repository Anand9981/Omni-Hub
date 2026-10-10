import { useEffect } from 'react';
import { authService } from '../services/authDemoService.js';

// 30 minutes inactivity timeout
const IDLE_TIMEOUT = 30 * 60 * 1000;

export default function useIdleTimer(onIdle) {
  useEffect(() => {
    let timeout;
    let lastSavedAt = Date.now();
    const activityEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart'];

    function resetTimer() {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(onIdle, IDLE_TIMEOUT);
      if (Date.now() - lastSavedAt >= 30_000) {
        authService.touchSession();
        lastSavedAt = Date.now();
      }
    }

    resetTimer();
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    return () => {
      window.clearTimeout(timeout);
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [onIdle]);
}