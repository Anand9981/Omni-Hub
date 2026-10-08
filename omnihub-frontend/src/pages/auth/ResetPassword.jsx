import { ArrowLeft, Check, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/auth/PasswordInput.jsx';
import PasswordStrength from '../../components/auth/PasswordStrength.jsx';
import { authService } from '../../services/authDemoService.js';
import { isStrongPassword } from '../../utils/validators.js';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const email = authService.getPendingResetEmail();
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!isStrongPassword(password)) {
      setError('Please meet all password requirements.');
      return;
    }
    if (password !== confirm) {
      setError('Your passwords don’t match yet.');
      return;
    }
    try {
      await authService.resetPassword({ email, password });
      setDone(true);
    } catch (issue) {
      setError(issue.message);
    }
  }
  if (done) return (
    <div className="auth-card-content auth-card-content--center">
      <div className="illustration-icon illustration-icon--success"><Check size={27} /></div>
      <div className="eyebrow eyebrow--center">ALL SECURED</div>
      <h2>Password updated</h2>
      <p className="auth-subtitle auth-subtitle--center">Your new password is ready. Sign in to get back to your workspace.</p>
      <button className="primary-button" onClick={() => navigate('/login')}>Back to sign in <ArrowLeft size={16} /></button>
    </div>
  );
  return (
    <div className="auth-card-content">
      <div className="eyebrow"><span className="eyebrow-icon"><KeyRound size={15} /></span> CREATE A NEW PASSWORD</div>
      <h2>Make it a strong one</h2><p className="auth-subtitle">Choose a new password for <strong className="inline-email">{email || 'your account'}</strong>.</p>
      {error && <div className="alert alert--error" role="alert">{error}</div>}
      <form className="auth-form auth-form--spaced" onSubmit={handleSubmit}>
        <PasswordInput autoComplete="new-password" id="password" label="New password" onChange={(event) => setPassword(event.target.value)} placeholder="Create a strong password" required value={password} />
        <PasswordStrength password={password} />
        <PasswordInput autoComplete="new-password" id="confirm-password" label="Confirm new password" onChange={(event) => setConfirm(event.target.value)} placeholder="Enter your password again" required value={confirm} />
        <button className="primary-button" type="submit">Save new password <Check size={17} /></button>
      </form>
      <Link className="back-link" to="/login"><ArrowLeft size={15} /> Back to sign in</Link>
    </div>
  );
}