import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ExternalLink, Globe2, Instagram, MessageCircle, Radio, ShieldCheck, UsersRound, X } from 'lucide-react';
import HelpTooltip from '../../components/onboarding/HelpTooltip.jsx';
import { widgetService } from '../../services/widgetService.js';

const CHANNEL_DEFINITIONS = [
  { id: 'telegram', name: 'Telegram', detail: 'Create a bot with @BotFather and connect the bot token.', icon: MessageCircle, setup: 'Telegram bot token', placeholder: 'Paste token for this one-time demo check', docs: 'https://t.me/BotFather' },
  { id: 'discord', name: 'Discord', detail: 'Create an app and invite its bot to your server.', icon: UsersRound, setup: 'Discord bot token', placeholder: 'Paste token for this one-time demo check', docs: 'https://discord.com/developers/applications' },
  { id: 'whatsapp', name: 'WhatsApp', detail: 'Connect a Meta app and WhatsApp Business test number.', icon: MessageCircle, setup: 'Meta app connection', placeholder: 'Test number and app connection are simulated', docs: 'https://developers.facebook.com/' },
  { id: 'instagram', name: 'Instagram', detail: 'Connect an Instagram Business account through Meta.', icon: Instagram, setup: 'Meta business connection', placeholder: 'Business account connection is simulated', docs: 'https://developers.facebook.com/' },
  { id: 'webchat', name: 'Website chat', detail: 'Use your embeddable OmniHub website widget.', icon: Globe2, setup: 'Widget embed ready', placeholder: 'Website widget configured locally', docs: '/widget-settings' },
  { id: 'linkedin', name: 'LinkedIn', detail: 'Partner approval is required; PRD marks this channel as future scope.', icon: Radio, setup: 'Not available during trial', placeholder: 'Skipped for this trial', docs: '' },
];

export default function ChannelConnect({ channels, onChange, disabled = false }) {
  const [activeChannel, setActiveChannel] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [widgetKey, setWidgetKey] = useState('');

  const openConnect = (channel) => {
    setError('');
    setNotice('');
    setToken('');
    setActiveChannel(channel.id);
    if (channel.id === 'webchat') {
      try {
        setWidgetKey(widgetService.getConfig().apiKey);
      } catch (configError) {
        setError(configError.message || 'Widget setup is not available yet.');
      }
    }
  };

  const connect = (event) => {
    event.preventDefault();
    const channel = CHANNEL_DEFINITIONS.find((item) => item.id === activeChannel);
    if (!channel || disabled) return;
    if (['telegram', 'discord'].includes(channel.id) && token.trim().length < 8) {
      setError('Enter a token with at least 8 characters to run the local connection check.');
      return;
    }
    const next = {
      ...channels,
      [channel.id]: {
        connected: true,
        connectedAt: new Date().toISOString(),
        connectionType: channel.id === 'webchat' ? 'local_widget' : 'demo_check',
      },
    };
    onChange(next);
    setError('');
    setNotice(`${channel.name} marked ready in this browser demo.`);
    setActiveChannel('');
    setToken('');
  };

  const disconnect = (channelId) => {
    onChange({ ...channels, [channelId]: { connected: false } });
    setNotice(`${CHANNEL_DEFINITIONS.find((channel) => channel.id === channelId)?.name} removed from this setup.`);
  };

  return (
    <div className="onboarding-channel-page">
      <div className="onboarding-channel-intro"><ShieldCheck size={18} /><span>Connect only channels you can configure now. Nothing is sent to a platform in this frontend demo.</span><Link to="/channels">View detailed setup guides <ExternalLink size={12} /></Link><HelpTooltip>Telegram/Discord tokens are checked in memory only and never stored. Meta connections require OAuth/backend support; website widget uses its local generated key.</HelpTooltip></div>
      <div className="onboarding-channel-grid">
        {CHANNEL_DEFINITIONS.map(({ id, name, detail, icon: Icon, setup, docs }) => {
          const connected = Boolean(channels[id]?.connected);
          const skipped = id === 'linkedin';
          return (
            <article className={`onboarding-channel-card${connected ? ' is-connected' : ''}${skipped ? ' is-skipped' : ''}`} key={id}>
              <header><span className={`onboarding-channel-icon channel-${id}`}><Icon size={18} /></span><span className={`onboarding-channel-state${connected ? ' is-ready' : ''}`}>{connected ? <><Check size={12} /> Ready</> : skipped ? 'Future scope' : 'Not connected'}</span></header>
              <h3>{name}</h3>
              <p>{detail}</p>
              <small>{setup}</small>
              <footer>
                {connected
                  ? <button className="onboarding-connected-button" disabled={disabled} onClick={() => disconnect(id)} type="button"><X size={13} /> Remove</button>
                  : skipped
                    ? <button className="onboarding-connected-button" disabled type="button">Skipped for trial</button>
                    : <button className="onboarding-connect-button" disabled={disabled} onClick={() => openConnect(CHANNEL_DEFINITIONS.find((channel) => channel.id === id))} type="button">Connect <ExternalLink size={13} /></button>}
                {docs && docs.startsWith('https:') && <a href={docs} rel="noreferrer" target="_blank">Setup guide <ExternalLink size={11} /></a>}
                {docs && docs.startsWith('/') && <a href={docs}>Widget settings <ExternalLink size={11} /></a>}
              </footer>
            </article>
          );
        })}
      </div>
      {notice && <p className="onboarding-inline-success" role="status">{notice}</p>}
      {activeChannel && (
        <div className="onboarding-connect-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setActiveChannel('')} role="presentation">
          <section aria-labelledby="channel-connect-title" aria-modal="true" className="onboarding-connect-dialog" role="dialog">
            <header><span><ShieldCheck size={18} /></span><div><h3 id="channel-connect-title">Connect {CHANNEL_DEFINITIONS.find((channel) => channel.id === activeChannel)?.name}</h3><p>Demo check only · credentials are never saved</p></div><button aria-label="Close channel connection" onClick={() => setActiveChannel('')} type="button"><X size={15} /></button></header>
            <form onSubmit={connect}>
              {['telegram', 'discord'].includes(activeChannel) ? (
                <label>Bot token<input autoComplete="off" onChange={(event) => setToken(event.target.value)} placeholder="Token is used only for this local check" type="password" value={token} /></label>
              ) : activeChannel === 'webchat' ? (
                <div className="onboarding-widget-key"><Globe2 size={16} /><span><strong>Website widget ready</strong><small>{widgetKey || 'Open Website widget settings to configure the embed.'}</small></span></div>
              ) : (
                <div className="onboarding-meta-notice"><p>Meta OAuth and platform verification require the production backend. This action only records your setup intent locally; it does not connect an account.</p><a href={CHANNEL_DEFINITIONS.find((channel) => channel.id === activeChannel)?.docs} rel="noreferrer" target="_blank">Open Meta developer guide <ExternalLink size={12} /></a></div>
              )}
              {error && <p className="onboarding-inline-error" role="alert">{error}</p>}
              <footer><button className="onboarding-secondary-button" onClick={() => setActiveChannel('')} type="button">Cancel</button><button className="onboarding-connect-button" type="submit">Mark ready <Check size={13} /></button></footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
