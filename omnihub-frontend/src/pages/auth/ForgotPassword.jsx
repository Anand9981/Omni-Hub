import { ArrowLeft, Check, KeyRound, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authDemoService.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await authService.requestPasswordReset(email);
      setSubmitted(true);
    } catch (issue) {
      setError(issue.message);
    }
  }
  return (
    <div className="auth-card-content">
      <div className="eyebrow"><span className="eyebrow-icon"><KeyRound size={15} /></span> ACCOUNT RECOVERY</div>
      {!submitted ? (
        <>
          <h2>Forgot your password?</h2>
          <p className="auth-subtitle">No worries. Enter the email linked to your workspace and we’ll send you a reset link.</p>
          {error && <div className="alert alert--error" role="alert">{error}</div>}
          <form className="auth-form auth-form--spaced" onSubmit={handleSubmit}>
            <div className="field"><label htmlFor="email">Work email</label><div className="input-wrap"><Mail className="input-leading-icon" size={17} /><input autoComplete="email" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required type="email" value={email} /></div></div>
            <button className="primary-button" type="submit">Send reset link <KeyRound size={16} /></button>
          </form>
        </>
      ) : (
        <div className="success-state">
          <div className="illustration-icon illustration-icon--success"><Check size={27} /></div>
          <h2>Check your email</h2>
          <p className="auth-subtitle">If an account exists for <strong className="inline-email">{email}</strong>, a password reset link is on its way.</p>
          <Link className="secondary-button secondary-button--link" to="/reset-password">Continue to reset password <KeyRound size={16} /></Link>
          <p className="demo-note demo-note--center"><span className="demo-note-dot" /> Frontend demo · No email is sent. Reset links expire in 15 minutes.</p>
        </div>
      )}
      <Link className="back-link" to="/login"><ArrowLeft size={15} /> Back to sign in</Link>
    </div>
  );
}