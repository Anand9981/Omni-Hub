export default function TypingIndicator({ label = 'Agent is typing…' }) {
  return (
    <div aria-label={label} className="omni-widget-typing" role="status">
      <span><i /><i /><i /></span>
      <small>{label}</small>
    </div>
  );
}
