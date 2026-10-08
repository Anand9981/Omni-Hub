import { ArrowLeft, Check, Mail, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authDemoService.js';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  
  const searchParams = new URLSearchParams(location.search);
  const tokenFromUrl = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const email = emailFromUrl || location.state?.email || authService.getPendingEmail() || 'your inbox';

  async function handleVerify() {
    setError('');
    try {
      await authService.verifyEmail(email, tokenFromUrl);
      navigate('/login', { state: { registered: true } });
    } catch (issue) {
      setError(issue.message);
    }
  }
  return (
    <div className="auth-card-content auth-card-content--center">
      <div className="illustration-icon illustration-icon--mail"><Mail size={27} /></div>
      <div className="eyebrow eyebrow--center">ONE LAST THING</div>
      <h2>Check your inbox</h2>
      <p className="auth-subtitle auth-subtitle--center">We sent a verification link to <strong className="inline-email">{email}</strong>. Confirm your email to secure your workspace.</p>
      {error && <div className="alert alert--error" role="alert">{error}</div>}
      {sent && <div className="alert alert--success"><Check size={16} /> Demo mode: email delivery isn’t connected. Continue with “I’ve verified my email”.</div>}
      <button className="primary-button" onClick={handleVerify} type="button">I’ve verified my email <Check size={17} /></button>
      <button className="secondary-button" onClick={() => setSent(true)} type="button"><RefreshCw size={15} /> Resend verification email</button>
      <p className="quiet-note">Can’t find the email? Check your spam folder.</p>
      <Link className="back-link" to="/register"><ArrowLeft size={15} /> Back to sign up</Link>
      <div className="demo-note demo-note--center"><span className="demo-note-dot" /> Frontend demo · Email delivery isn’t connected yet.</div>
    </div>
  );
}