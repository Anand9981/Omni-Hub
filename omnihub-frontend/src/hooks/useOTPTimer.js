import { useCallback, useEffect, useState } from 'react';

/**
 * Countdown timer hook for OTP resend cooldown (PRD 5.2: 30s cooldown).
 */
export function useOTPTimer(initialSeconds = 30) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setTimeout(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const resetTimer = useCallback(
    (nextSeconds = initialSeconds) => {
      setSeconds(nextSeconds);
    },
    [initialSeconds],
  );

  const formattedTime = `0:${String(Math.max(0, seconds)).padStart(2, '0')}`;

  return {
    seconds,
    setSeconds,
    resetTimer,
    isCoolingDown: seconds > 0,
    formattedTime,
  };
}

export default useOTPTimer;
