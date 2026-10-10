import { Check, Circle } from 'lucide-react';
import { usePasswordStrength } from '../../hooks/usePasswordStrength.js';

export default function PasswordStrength({ password }) {
  const { requirements, completed, total } = usePasswordStrength(password);
  return (
    <div className="password-strength" aria-live="polite">
      <div className="strength-bars" aria-label={`${completed} of ${total} password requirements met`}>
        {requirements.map((item, index) => <span className={index < completed ? 'is-filled' : ''} key={item.label} />)}
      </div>
      <div className="strength-list">
        {requirements.map((item) => (
          <span className={item.met ? 'requirement is-met' : 'requirement'} key={item.label}>
            {item.met ? <Check size={13} /> : <Circle size={11} />}
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}