import { useEffect, useRef, useState } from 'react';
import { Bot, Check, MessageCircle, Paperclip, Send, ShieldCheck, X } from 'lucide-react';
import PreChatForm from './PreChatForm.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import WidgetLauncher from './WidgetLauncher.jsx';
import { widgetService } from '../../services/widgetService.js';

const DEFAULT_CONFIG = {
  apiKey: '',
  primaryColor: '#3478e5',
  secondaryColor: '#f1f5ff',
  textColor: '#1f2e44',
  position: 'bottom-right',
  size: 'medium',
  language: 'English',
  welcomeMessage: 'Hi! How can we help you today?',
  offlineMessage: "We're offline right now. Leave a message and our team will get back to you.",
  avatarUrl: '',
  soundNotification: false,
  offlineMode: false,
};
const MAX_ATTACHMENT_BYTES = 1024 * 1024;

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}. Please choose the file again.`));
    reader.readAsDataURL(file);
  });
}

function messageCopy(language) {
  if (language === 'Hindi') return { online: 'हमारी टीम यहाँ आपकी मदद के लिए है', offline: 'अभी ऑफ़लाइन', placeholder: 'अपना संदेश लिखें…', send: 'भेजें', typing: 'एजेंट लिख रहे हैं…', close: 'चैट बंद करें' };
  if (language === 'Hinglish') return { online: 'Hamari team aapki madad ke liye yahan hai', offline: 'Abhi offline', placeholder: 'Apna message likhein…', send: 'Bhejein', typing: 'Agent type kar rahe hain…', close: 'Chat band karein' };
  return { online: 'Our team is here to help', offline: 'Currently offline', placeholder: 'Write your message…', send: 'Send', typing: 'Agent is typing…', close: 'Close chat' };
}

function getParentOrigin() {
  try {
    const configuredOrigin = new URLSearchParams(window.location.search).get('parentOrigin');
    if (configuredOrigin) {
      const parsed = new URL(configuredOrigin);
      if (parsed.origin === configuredOrigin && ['https:', 'http:'].includes(parsed.protocol)) return parsed.origin;
    }
    return document.referrer ? new URL(document.referrer).origin : '';
  } catch (error) {
    console.error('Could not determine the widget parent origin.', error);
    return '';
  }
}

function safeConfig(config) {
  if (!config || typeof config !== 'object') return null;
  if (!/^ohw_[a-f0-9]{48}$/.test(config.apiKey || '')) return null;
  if (!/^#[0-9a-f]{6}$/i.test(config.primaryColor || '')
    || !/^#[0-9a-f]{6}$/i.test(config.secondaryColor || '')
    || !/^#[0-9a-f]{6}$/i.test(config.textColor || '')) return null;
  if (!['bottom-left', 'bottom-right'].includes(config.position)
    || !['small', 'medium', 'large'].includes(config.size)
    || !['English', 'Hindi', 'Hinglish'].includes(config.language)) return null;
  if (typeof config.welcomeMessage !== 'string' || !config.welcomeMessage.trim()
    || typeof config.offlineMessage !== 'string' || !config.offlineMessage.trim()
    || (config.avatarUrl && typeof config.avatarUrl !== 'string')) return null;
  if (config.avatarUrl && !/^https:\/\//i.test(config.avatarUrl)) return null;
  if (config.businessHours) {
    const schedule = config.businessHours;
    if (!schedule.timezone || !Array.isArray(schedule.weeklySchedule) || schedule.weeklySchedule.length !== 7
      || !Array.isArray(schedule.holidays) || !Array.isArray(schedule.specialHours)) return null;
    try {
      new Intl.DateTimeFormat('en', { timeZone: schedule.timezone });
    } catch {
      return null;
    }
    if (schedule.weeklySchedule.some((day) => (
      !day || !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(day.day)
      || typeof day.enabled !== 'boolean' || !Array.isArray(day.shifts)
    ))
      || schedule.holidays.some((holiday) => !holiday || typeof holiday.date !== 'string')
      || schedule.specialHours.some((item) => !item || typeof item.date !== 'string' || typeof item.closed !== 'boolean')
      || [...schedule.weeklySchedule, ...schedule.specialHours].some((day) => (
        !day || !Array.isArray(day.shifts) || day.shifts.some((shift) => (
          !shift || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.start)
          || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.end)
          || shift.start >= shift.end
        ))
      ))) return null;
  }
  return { ...DEFAULT_CONFIG, ...config };
}

export default function ChatWidget({ initialConfig, preview = false }) {
  const [config, setConfig] = useState(() => ({ ...DEFAULT_CONFIG, ...initialConfig }));
  const [configurationError, setConfigurationError] = useState('');
  const [open, setOpen] = useState(preview);
  const [visitor, setVisitor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [analyticsError, setAnalyticsError] = useState('');
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const sessionStarted = useRef(Date.now());
  const sessionRecorded = useRef(false);
  const copy = messageCopy(config.language);
  const offline = Boolean(config.offlineMode)
    || Boolean(config.businessHours && !widgetService.isWithinBusinessHours(config.businessHours, new Date(currentTime)));

  useEffect(() => {
    if (initialConfig) {
      setConfig({ ...DEFAULT_CONFIG, ...initialConfig });
      setConfigurationError('');
      return;
    }
    try {
      setConfig(widgetService.getConfig());
    } catch (loadError) {
      console.error('Could not initialize the website chat widget.', loadError);
      setConfigurationError(loadError.message || 'Widget settings could not be loaded.');
    }
  }, [initialConfig]);

  useEffect(() => {
    if (!config.businessHours) return undefined;
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => window.clearInterval(intervalId);
  }, [config.businessHours]);

  useEffect(() => {
    if (preview) return undefined;
    const parentOrigin = getParentOrigin();

    const sendToParent = (type, payload = {}) => {
      if (parentOrigin && window.parent !== window) {
        window.parent.postMessage({ source: 'omnihub-widget', type, ...payload }, parentOrigin);
      }
    };
    const onParentMessage = (event) => {
      if (event.source !== window.parent || !parentOrigin || event.origin !== parentOrigin) return;
      if (event.data?.source !== 'omnihub-embed' || event.data?.type !== 'configure') return;
      const next = safeConfig(event.data.config);
      if (!next) {
        setAnalyticsError('Widget configuration is invalid. Check the embed settings in OmniHub.');
        return;
      }
      setConfig(next);
      setConfigurationError('');
      setAnalyticsError('');
    };

    window.addEventListener('message', onParentMessage);
    sendToParent('ready');
    return () => window.removeEventListener('message', onParentMessage);
  }, [preview]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, typing, visitor]);

  useEffect(() => () => {
    if (!preview && visitor && !sessionRecorded.current) {
      try {
        widgetService.recordSession((Date.now() - sessionStarted.current) / 1000);
        sessionRecorded.current = true;
      } catch (sessionError) {
        console.error('Could not record the widget session duration.', sessionError);
      }
    }
  }, [preview, visitor]);

  const sendSize = (isOpen) => {
    if (preview || window.parent === window) return;
    const origin = getParentOrigin();
    if (!origin) return;
    window.parent.postMessage({
      source: 'omnihub-widget',
      type: 'resize',
      open: isOpen,
      size: config.size,
    }, origin);
  };

  const toggleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    sendSize(nextOpen);
    if (nextOpen && !open) {
      try {
        widgetService.recordOpen();
        setAnalyticsError('');
      } catch (analyticsFailure) {
        setAnalyticsError(analyticsFailure.message || 'Widget analytics could not be updated.');
      }
    }
  };

  const startChat = (details) => {
    sessionStarted.current = Date.now();
    sessionRecorded.current = false;
    setVisitor(details);
    setMessages([{
      id: `welcome-${Date.now()}`,
      sender: 'agent',
      text: offline ? config.offlineMessage : config.welcomeMessage,
      time: new Date().toISOString(),
    }]);
    setError('');
    if (details.email || details.phone) {
      try {
        widgetService.recordLead();
      } catch (analyticsFailure) {
        setAnalyticsError(analyticsFailure.message || 'Widget lead analytics could not be updated.');
      }
    }
  };

  const selectFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Choose a PDF or image file.');
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError('Attachments in this browser demo are limited to 1 MB.');
      return;
    }
    try {
      const dataUrl = await readFile(file);
      setAttachment({ name: file.name, type: file.type, dataUrl });
    } catch (fileError) {
      setError(fileError.message || 'The attachment could not be read.');
    }
  };

  const sendMessage = (event) => {
    event.preventDefault();
    if ((!draft.trim() && !attachment) || typing) return;
    const message = {
      id: `visitor-${Date.now()}`,
      sender: 'visitor',
      text: draft.trim(),
      attachment,
      time: new Date().toISOString(),
    };
    setMessages((current) => [...current, message]);
    setDraft('');
    setAttachment(null);
    setTyping(true);
    setError('');
    try {
      widgetService.recordMessage();
      setAnalyticsError('');
    } catch (analyticsFailure) {
      setAnalyticsError(analyticsFailure.message || 'Widget message analytics could not be updated.');
    }
    window.setTimeout(() => {
      setMessages((current) => [...current, {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: offline
          ? 'Thanks for your message. It is saved in this browser demo for the team to follow up.'
          : `Thanks, ${visitor.name}. Your message is noted. A team member will follow up here.`,
        time: new Date().toISOString(),
      }]);
      setTyping(false);
      if (config.soundNotification) {
        const origin = getParentOrigin();
        if (origin && !preview) window.parent.postMessage({ source: 'omnihub-widget', type: 'notify' }, origin);
      }
    }, 700);
  };

  const close = () => {
    if (visitor && !sessionRecorded.current) {
      try {
        widgetService.recordSession((Date.now() - sessionStarted.current) / 1000);
        sessionRecorded.current = true;
        setAnalyticsError('');
      } catch (sessionError) {
        setAnalyticsError(sessionError.message || 'Widget session analytics could not be updated.');
      }
    }
    setOpen(false);
    sendSize(false);
  };
  const visible = preview || open;
  const cssVariables = {
    '--widget-primary': config.primaryColor,
    '--widget-secondary': config.secondaryColor,
    '--widget-text': config.textColor,
  };

  return (
    <div
      className={`omni-widget-root widget-size-${config.size}${preview ? ' is-preview' : ''}${config.position === 'bottom-left' ? ' widget-position-left' : ' widget-position-right'}`}
      style={cssVariables}
    >
      {visible && (
        <section aria-label="Website chat" className={`omni-widget-panel${offline ? ' is-offline' : ''}`} role="region">
          <header className="omni-widget-header">
            <span className="omni-widget-avatar">
              {config.avatarUrl ? <img alt="" src={config.avatarUrl} /> : <Bot size={20} />}
              {!offline && <i />}
            </span>
            <div className="omni-widget-header-copy">
              <strong>{offline ? copy.offline : 'OmniHub support'}</strong>
              <small>{offline ? 'We’ll get back to you soon' : copy.online}</small>
            </div>
            {config.soundNotification && <span aria-label="Sound notifications enabled" className="omni-widget-sound">♪</span>}
            {!preview && <button aria-label={copy.close} className="omni-widget-close" onClick={close} type="button"><X size={17} /></button>}
          </header>

          {configurationError && <p className="omni-widget-config-error" role="alert">{configurationError}</p>}
          {!visitor ? (
            <PreChatForm
              language={config.language}
              offline={offline}
              offlineMessage={config.offlineMessage}
              onSubmit={startChat}
            />
          ) : (
            <>
              <div className="omni-widget-messages" ref={scrollRef}>
                <div className="omni-widget-day-divider"><span>Today</span></div>
                {messages.map((message) => (
                  <article className={`omni-widget-message is-${message.sender}`} key={message.id}>
                    {message.sender === 'agent' && <span className="omni-widget-message-avatar">{config.avatarUrl ? <img alt="" src={config.avatarUrl} /> : <Bot size={13} />}</span>}
                    <div className="omni-widget-message-content">
                      {message.text && <p>{message.text}</p>}
                      {message.attachment && (
                        message.attachment.type.startsWith('image/')
                          ? <a aria-label={`Download ${message.attachment.name}`} download={message.attachment.name} href={message.attachment.dataUrl}><img alt={message.attachment.name} src={message.attachment.dataUrl} /></a>
                          : <a download={message.attachment.name} href={message.attachment.dataUrl}><Paperclip size={13} /> {message.attachment.name}</a>
                      )}
                      <time>{new Date(message.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
                    </div>
                    {message.sender === 'visitor' && <Check aria-label="Sent" className="omni-widget-sent" size={13} />}
                  </article>
                ))}
                {typing && <TypingIndicator label={copy.typing} />}
              </div>
              {error && <div className="omni-widget-inline-error" role="alert">{error}</div>}
              {attachment && <div className="omni-widget-attachment-pending"><Paperclip size={13} /> {attachment.name}<button aria-label="Remove attachment" onClick={() => setAttachment(null)} type="button"><X size={12} /></button></div>}
              <form className="omni-widget-composer" onSubmit={sendMessage}>
                <input accept="image/*,application/pdf" aria-label="Attach a PDF or image" className="omni-widget-file-input" onChange={selectFile} ref={fileRef} type="file" />
                <button aria-label="Attach a PDF or image" disabled={typing} onClick={() => fileRef.current?.click()} type="button"><Paperclip size={17} /></button>
                <input aria-label={copy.placeholder} maxLength={1000} onChange={(event) => setDraft(event.target.value)} placeholder={copy.placeholder} value={draft} />
                <button aria-label={copy.send} className="omni-widget-send" disabled={typing || (!draft.trim() && !attachment)} type="submit"><Send size={16} /></button>
              </form>
            </>
          )}
          {analyticsError && <p className="omni-widget-analytics-error" role="status">{analyticsError}</p>}
          <footer className="omni-widget-footer"><ShieldCheck size={11} /> Powered by OmniHub <span>·</span> Local demo</footer>
        </section>
      )}
      {!preview && (
        <WidgetLauncher
          label={languageLauncherLabel(config.language)}
          onClick={toggleOpen}
          open={open}
          primaryColor={config.primaryColor}
        />
      )}
      {preview && <div className="omni-widget-preview-caption"><MessageCircle size={12} /> Interactive website preview</div>}
    </div>
  );
}

function languageLauncherLabel(language) {
  if (language === 'Hindi') return 'चैट खोलें';
  if (language === 'Hinglish') return 'Chat kholein';
  return 'Open chat';
}
