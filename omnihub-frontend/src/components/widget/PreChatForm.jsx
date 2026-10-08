import { useState } from 'react';
import { ArrowRight, Mail, Phone, UserRound } from 'lucide-react';

export default function PreChatForm({ language, offline, offlineMessage, onSubmit }) {
  const copy = language === 'Hindi'
    ? { title: 'बातचीत शुरू करें', name: 'आपका नाम', email: 'ईमेल (वैकल्पिक)', phone: 'फ़ोन (वैकल्पिक)', submit: 'चैट शुरू करें', offlineSubmit: 'संदेश छोड़ें', offline: 'अभी ऑफ़लाइन' }
    : language === 'Hinglish'
      ? { title: 'Chat shuru karein', name: 'Aapka naam', email: 'Email (optional)', phone: 'Phone (optional)', submit: 'Start chat', offlineSubmit: 'Message chhodein', offline: 'Abhi offline' }
      : { title: 'Start a conversation', name: 'Your name', email: 'Email (optional)', phone: 'Phone (optional)', submit: 'Start chatting', offlineSubmit: 'Leave a message', offline: 'Currently offline' };
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError(language === 'Hindi' ? 'अपना नाम दर्ज करें।' : language === 'Hinglish' ? 'Apna naam enter karein.' : 'Enter your name to continue.');
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address, or leave it blank.');
      return;
    }
    onSubmit({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
  };

  return (
    <form className="omni-widget-prechat" onSubmit={submit}>
      <div className="omni-widget-prechat-intro">
        <span className="omni-widget-prechat-mark"><UserRound size={18} /></span>
        <h3>{offline ? copy.offline : copy.title}</h3>
        {offline && <p>{offlineMessage}</p>}
      </div>
      <label>
        <span>{copy.name} <i>*</i></span>
        <div><UserRound size={15} /><input autoComplete="name" maxLength={100} onChange={(event) => update('name', event.target.value)} placeholder={copy.name} required value={form.name} /></div>
      </label>
      <label>
        <span>{copy.email}</span>
        <div><Mail size={15} /><input autoComplete="email" maxLength={254} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" type="email" value={form.email} /></div>
      </label>
      <label>
        <span>{copy.phone}</span>
        <div><Phone size={15} /><input autoComplete="tel" maxLength={30} onChange={(event) => update('phone', event.target.value)} placeholder="+1 (555) 000-0000" type="tel" value={form.phone} /></div>
      </label>
      {error && <p className="omni-widget-error" role="alert">{error}</p>}
      <button className="omni-widget-prechat-submit" type="submit">{offline ? copy.offlineSubmit : copy.submit}<ArrowRight size={15} /></button>
      <small className="omni-widget-privacy">Your details are used only to follow up on this conversation.</small>
    </form>
  );
}
