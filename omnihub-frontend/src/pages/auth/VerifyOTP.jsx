import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OTPInput from '../../components/auth/OTPInput.jsx';
import ResendTimer from '../../components/auth/ResendTimer.jsx';
import { authService } from '../../services/authDemoService.js';

export default function VerifyOTP() {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendState, setResendState] = useState(() => authService.getResendState());
  const navigate = useNavigate();
  const pending = authService.getPendingLogin();
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (useBackupCode) await authService.verifyBackupCode(code, rememberDevice);
      else await authService.verifyOtp(code, rememberDevice);
      navigate('/dashboard');
    } catch (issue) {
      setError(issue.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="auth-card-content auth-card-content--center">
      <div className="illustration-icon"><ShieldCheck size={27} /></div>
      <div className="eyebrow eyebrow--center">A QUICK SECURITY CHECK</div>
      <h2>Verify it’s you</h2>
      <p className="auth-subtitle auth-subtitle--center">Enter the 6-digit code we sent to <strong className="inline-email">{pending?.email || 'your email'}</strong>.</p>
      {error && <div className="alert alert--error" role="alert">{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        {useBackupCode ? (
          <div className="field">
            <label htmlFor="backup-code">Backup code</label>
            <input
              autoComplete="one-time-code"
              id="backup-code"
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="XXXXX-XXXXX"
              required
              value={code}
            />
          </div>
        ) : (
          <>
            <OTPInput onChange={setCode} value={code} />
            <button
              type="button"
              onClick={() => setCode('123456')}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                fontSize: '12px',
                background: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                alignSelf: 'center',
              }}
            >
              ⚡ Auto-fill Demo OTP (123456)
            </button>
          </>
        )}
        <label className="checkbox-label otp-trust-device">
          <input checked={rememberDevice} onChange={(event) => setRememberDevice(event.target.checked)} type="checkbox" />
          <span>Remember this device after verification</span>
        </label>
        <button className="primary-button" disabled={submitting || (useBackupCode ? !code.trim() : code.length !== 6)} type="submit">{submitting ? 'Verifying…' : 'Verify & continue'}</button>
      </form>
      <ResendTimer
        initialSeconds={resendState.cooldownLeft}
        key={resendState.attemptsUsed}
        attemptsLeft={resendState.attemptsLeft}
        exhausted={resendState.exhausted}
        onResend={async () => {
          try {
            await authService.resendOtp();
            setResendState(authService.getResendState());
            setError('Demo mode: email delivery isn’t connected. Use the code 123456.');
          } catch (issue) {
            setError(issue.message);
          }
        }}
      />
      <button
        className="text-button"
        onClick={() => {
          setUseBackupCode((current) => !current);
          setCode('');
          setError('');
        }}
        type="button"
      >
        {useBackupCode ? 'Use an email code instead' : 'Use a backup code'}
      </button>
      <Link className="back-link" to="/login"><ArrowLeft size={15} /> Back to sign in</Link>
      <div className="demo-note demo-note--center"><span className="demo-note-dot" /> Demo mode · Your one-time code is <strong>123456</strong>. Backup codes are single-use.</div>
    </div>
  );
}