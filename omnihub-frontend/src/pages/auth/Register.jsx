import { ArrowRight, UserRoundPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/auth/PasswordInput.jsx';
import PasswordStrength from '../../components/auth/PasswordStrength.jsx';
import { authService } from '../../services/authDemoService.js';
import { isStrongPassword } from '../../utils/validators.js';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!isStrongPassword(password)) {
      setError('Please meet all password requirements before continuing.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Your passwords don’t match yet.');
      return;
    }
    setSubmitting(true);
    try {
      await authService.register({ name, email, password });
      navigate('/verify-email', { state: { email } });
    } catch (issue) {
      setError(issue.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="auth-card-content">
      <div className="eyebrow"><span className="eyebrow-icon"><UserRoundPlus size={15} /></span> A BETTER WAY TO CONNECT</div>
      <h2>Create your workspace</h2><p className="auth-subtitle">Start bringing all your customer conversations together.</p>
      {error && <div className="alert alert--error" role="alert">{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field"><label htmlFor="name">Your name</label><input autoComplete="name" id="name" onChange={(event) => setName(event.target.value)} placeholder="e.g. Aanya Sharma" required value={name} /></div>
        <div className="field"><label htmlFor="email">Work email</label><input autoComplete="email" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required type="email" value={email} /></div>
        <PasswordInput autoComplete="new-password" id="password" label="Create a password" onChange={(event) => setPassword(event.target.value)} placeholder="Create a strong password" required value={password} />
        <PasswordStrength password={password} />
        <PasswordInput autoComplete="new-password" id="confirm-password" label="Confirm password" onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" required value={confirmPassword} />
        <button className="primary-button" disabled={submitting} type="submit">{submitting ? 'Creating your account…' : 'Create account'} <ArrowRight size={17} /></button>
      </form>
      <p className="legal-copy">By creating an account, you agree to our <a href="mailto:hello@omnihub.app">Terms of Service</a> and <a href="mailto:hello@omnihub.app">Privacy Policy</a>.</p>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </div>
  );
}