import { Check, Circle } from 'lucide-react';
import { passwordRequirements } from '../../utils/validators.js';

export default function PasswordStrength({ password }) {
  const completed = passwordRequirements.filter((item) => item.test(password)).length;
  return (
    <div className="password-strength" aria-live="polite">
      <div className="strength-bars" aria-label={`${completed} of 4 password requirements met`}>
        {passwordRequirements.map((item, index) => <span className={index < completed ? 'is-filled' : ''} key={item.label} />)}
      </div>
      <div className="strength-list">
        {passwordRequirements.map((item) => {
          const done = item.test(password);
          return <span className={done ? 'requirement is-met' : 'requirement'} key={item.label}>{done ? <Check size={13} /> : <Circle size={11} />}{item.label}</span>;
        })}
      </div>
    </div>
  );
}