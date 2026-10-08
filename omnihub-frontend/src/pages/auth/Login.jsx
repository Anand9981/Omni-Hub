import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/auth/PasswordInput.jsx';
import { authService } from '../../services/authDemoService.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authService.login({ email, password, rememberMe });
      navigate('/verify-otp');
    } catch (issue) {
      setError(issue.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="auth-card-content">
      <div className="eyebrow"><span className="eyebrow-icon"><LockKeyhole size={15} /></span> YOUR WORKSPACE AWAITS</div>
      <h2>Welcome back</h2><p className="auth-subtitle">Sign in to pick up right where you left off.</p>
      {location.state?.registered && <div className="alert alert--success">Email verified. Your account is ready—sign in to continue.</div>}
      {location.state?.sessionExpired && <div className="alert alert--error" role="alert">You were signed out after 40 hours of inactivity. Please sign in again.</div>}
      {error && <div className="alert alert--error" role="alert">{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field"><label htmlFor="email">Work email</label><input autoComplete="email" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required type="email" value={email} /></div>
        <PasswordInput id="password" label="Password" onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required value={password} />
        <div className="form-between"><label className="checkbox-label"><input checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} type="checkbox" /> <span>Remember me for 30 days</span></label><Link className="subtle-link" to="/forgot-password">Forgot password?</Link></div>
        <button className="primary-button" disabled={submitting} type="submit">{submitting ? 'Signing you in…' : 'Sign in'} <ArrowRight size={17} /></button>
      </form>
      <p className="auth-switch">New to OmniHub? <Link to="/register">Create an account</Link></p>
      <div className="demo-note"><span className="demo-note-dot" /> Frontend demo · Register and verify an account first. Demo OTP: <strong>123456</strong>.</div>
    </div>
  );
}