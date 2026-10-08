import { AlertCircle, LockKeyhole, Paperclip, Plus, Users } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import NoteCard from './NoteCard.jsx';
import MentionInput from './MentionInput.jsx';

const NOTE_TYPES = ['General note', 'Follow-up', 'Issue', 'Resolution', 'Escalation'];
const MAX_FILE_SIZE = 1024 * 1024;

function encodeFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
    reader.onerror = () => reject(new Error(`Could not read ${file.name}. Please choose it again.`));
    reader.readAsDataURL(file);
  });
}

export default function NotesList({
  notes, agents, currentAgentId, notifications, error, readOnly,
  onAddNote, onDeleteNote,
}) {
  const [text, setText] = useState('');
  const [type, setType] = useState('General note');
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [mentions, setMentions] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInput = useRef(null);
  const notifiedNotes = useMemo(() => new Set(notifications.map((item) => item.note_id)), [notifications]);

  const handleFiles = async (event) => {
    const selected = [...event.target.files];
    event.target.value = '';
    setFileError('');
    if (files.length + selected.length > 3) {
      setFileError('Attach up to 3 files per note.');
      return;
    }
    if (selected.some((file) => file.size > MAX_FILE_SIZE)) {
      setFileError('Each attachment must be 1 MB or smaller.');
      return;
    }
    try {
      const encoded = await Promise.all(selected.map(encodeFile));
      setFiles((current) => [...current, ...encoded]);
    } catch (readError) {
      setFileError(readError.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await onAddNote({
        text: text.trim(),
        type,
        assignedAgentId,
        mentions,
        attachments: files,
      });
      setText('');
      setType('General note');
      setAssignedAgentId('');
      setMentions([]);
      setFiles([]);
      setFileError('');
    } catch (submitError) {
      setFileError(submitError.message || 'The note could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="lead-notes notes-module" aria-label="Internal notes">
      <div className="lead-notes-head notes-module-head">
        <div>
          <span className="lead-block-title"><Users size={15} /> Team notes</span>
          <p>Private context, shared with your workspace</p>
        </div>
        <span className="note-count">{notes.length}</span>
      </div>
      <div className="note-privacy-banner"><LockKeyhole size={13} /> Internal only · Never visible to customers</div>
      {notifications.length > 0 && (
        <div className="note-notification-banner"><span className="note-notification-dot" /> You’re mentioned in {notifications.length} {notifications.length === 1 ? 'note' : 'notes'}</div>
      )}

      {!readOnly && (
        <form className="note-composer" onSubmit={handleSubmit}>
          <div className="note-composer-meta">
            <label className="note-field-label" htmlFor="note-type">Type</label>
            <select id="note-type" className="note-select" onChange={(event) => setType(event.target.value)} value={type}>
              {NOTE_TYPES.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <MentionInput
            agents={agents}
            onChange={setText}
            onMention={(agent) => setMentions((current) => current.some((item) => item.id === agent.id) ? current : [...current, { id: agent.id, name: agent.name }])}
            value={text}
          />
          <div className="note-composer-meta note-assignee-row">
            <label className="note-field-label" htmlFor="note-assignee">Assign follow-up</label>
            <select id="note-assignee" className="note-select" onChange={(event) => setAssignedAgentId(event.target.value)} value={assignedAgentId}>
              <option value="">No assignment</option>
              {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
            </select>
          </div>
          {files.length > 0 && (
            <div className="note-file-list">
              {files.map((file, index) => (
                <span key={`${file.name}-${index}`}><Paperclip size={12} /> {file.name}
                  <button aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} type="button">×</button>
                </span>
              ))}
            </div>
          )}
          {fileError && <p className="note-form-error" role="alert">{fileError}</p>}
          {error && <p className="note-form-error" role="alert">{error}</p>}
          <div className="note-composer-actions">
            <input accept="image/*,.pdf,.txt,.doc,.docx" aria-label="Attach files to note" className="note-file-input" multiple onChange={handleFiles} ref={fileInput} type="file" />
            <button className="note-attach-btn" onClick={() => fileInput.current?.click()} type="button"><Paperclip size={14} /> Attach</button>
            <span className="note-character-count">{text.length}/2000</span>
            <button className="lead-note-add-btn note-submit-btn" disabled={!text.trim() || saving} type="submit">
              <Plus size={14} /> {saving ? 'Saving…' : 'Add note'}
            </button>
          </div>
        </form>
      )}

      <div className="lead-notes-list notes-timeline">
        {notes.length === 0 ? (
          <div className="notes-empty-state">
            <span><AlertCircle size={17} /></span>
            <strong>No notes yet</strong>
            <p>Capture useful context for the next teammate who picks up this conversation.</p>
          </div>
        ) : notes.map((note) => (
          <div className={notifiedNotes.has(note.id) ? 'note-timeline-item note-timeline-item--mentioned' : 'note-timeline-item'} key={note.id}>
            {notifiedNotes.has(note.id) && <span className="note-mentioned-indicator">Mention notification</span>}
            <NoteCard
              agents={agents}
              note={note}
              onDelete={(noteId) => onDeleteNote(noteId)}
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
