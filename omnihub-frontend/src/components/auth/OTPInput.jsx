import { useRef } from 'react';

export default function OTPInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || '');

  function updateDigit(index, digit) {
    const next = digits.slice();
    next[index] = digit.replace(/\D/g, '').slice(-1);
    onChange(next.join(''));
    if (digit && index < 5) refs.current[index + 1]?.focus();
  }
  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) refs.current[index - 1]?.focus();
    if (event.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < 5) refs.current[index + 1]?.focus();
  }
  function handlePaste(event) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      event.preventDefault();
      onChange(pasted);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
  }
  return (
    <div className="otp-inputs" role="group" aria-label="Six-digit verification code">
      {digits.map((digit, index) => (
        <input aria-label={`Digit ${index + 1}`} autoComplete={index === 0 ? 'one-time-code' : 'off'} className="otp-digit" inputMode="numeric" key={index} maxLength={1} onChange={(event) => updateDigit(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)} onPaste={handlePaste} ref={(element) => { refs.current[index] = element; }} value={digit} />
      ))}
    </div>
  );
}