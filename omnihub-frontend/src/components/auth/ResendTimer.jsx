import { useEffect, useState } from 'react';

/**
 * Resend control for one-time codes.
 *
 * PRD 5.2: the code can be re-requested after a thirty second cooldown and a
 * sign-in allows at most three resends. The service owns both rules; this
 * component only renders them.
 */
export default function ResendTimer({ initialSeconds = 30, onResend, attemptsLeft, exhausted = false }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  async function resend() {
    if (seconds > 0 || sending) return;
    setSending(true);
    try {
      await onResend();
      setSeconds(initialSeconds);
    } finally {
      setSending(false);
    }
  }

  if (exhausted) {
    return (
      <span className="resend-note">
        You’ve used all three code requests. Sign in again to receive a new code.
      </span>
    );
  }

  return (
    <span className="resend-note">
      Didn’t receive a code?{' '}
      {seconds > 0 ? (
        <span>
          Resend in <strong>0:{String(seconds).padStart(2, '0')}</strong>
        </span>
      ) : (
        <button className="text-button" disabled={sending} onClick={resend} type="button">
          {sending ? 'Sending…' : 'Resend code'}
        </button>
      )}
      {typeof attemptsLeft === 'number' && (
        <span className="resend-attempts">{attemptsLeft} of 3 requests left</span>
      )}
    </span>
  );
}
