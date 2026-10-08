import { Paperclip, Trash2 } from 'lucide-react';

const TYPE_CLASS = {
  'General note': 'general',
  'Follow-up': 'follow-up',
  Issue: 'issue',
  Resolution: 'resolution',
  Escalation: 'escalation',
};

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Just now'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function NoteCard({ note, agents, onDelete, readOnly }) {
  const assignee = agents.find((agent) => agent.id === note.assigned_agent_id);
  return (
    <article className="note-card">
      <div className="note-card-topline">
        <span className={`note-type-pill note-type-pill--${TYPE_CLASS[note.type] || 'general'}`}>
          {note.type || 'General note'}
        </span>
        {!readOnly && (
          <button
            aria-label={`Delete note by ${note.author_name || 'Agent'}`}
            className="lead-note-delete-btn"
            onClick={() => onDelete(note.id)}
            title="Delete note"
            type="button"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <p className="note-card-content">{note.text}</p>
      {assignee && <div className="note-assignment"><span>Assigned to</span><strong>{assignee.name}</strong></div>}
      {note.mentions?.length > 0 && (
        <div className="note-mentions" aria-label="Mentioned team members">
          {note.mentions.map((mention) => <span key={mention.id}>@{mention.name}</span>)}
          <small>mentioned</small>
        </div>
      )}
      {note.attachments?.length > 0 && (
        <div className="note-attachments">
          {note.attachments.map((file, index) => (
            <a download={file.name} href={file.dataUrl} key={`${file.name}-${index}`}>
              <Paperclip size={12} /> {file.name}
            </a>
          ))}
        </div>
      )}
      <footer className="note-card-footer">
        <span className="note-author-avatar">{(note.author_name || 'A').charAt(0)}</span>
        <strong>{note.author_name || 'Agent'}</strong>
        <time dateTime={note.created_at}>{formatDate(note.created_at)}</time>
        <span className="note-private-label">Internal</span>
      </footer>
    </article>
  );
}
