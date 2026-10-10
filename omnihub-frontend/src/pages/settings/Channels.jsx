import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Bot, Check, ChevronDown, CircleHelp, Code2, ExternalLink,
  Globe2, Instagram, KeyRound, MessageCircle, MessageSquare, Radio,
  ShieldCheck, Sparkles, UsersRound, Webhook,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useDebounce } from '../../hooks/useDebounce.js';

const CHANNEL_GUIDES = [
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'Messaging',
    icon: MessageCircle,
    accent: 'telegram',
    availability: 'Free · easiest setup',
    source: '@BotFather on Telegram',
    sourceUrl: 'https://t.me/BotFather',
    credentials: 'Telegram bot token',
    steps: [
      'Open @BotFather in Telegram and send /newbot.',
      'Choose a display name, then a unique username ending in “bot”.',
      'Copy the bot token from BotFather and store it in your backend secret manager.',
      'Deploy a public HTTPS webhook receiver, then register its URL with Telegram setWebhook.',
    ],
    webhook: '/api/webhooks/telegram',
    note: 'The actual setWebhook URL needs your deployed backend origin. This frontend demo has no webhook server and does not accept or store bot tokens.',
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'Messaging',
    icon: UsersRound,
    accent: 'discord',
    availability: 'Free · unlimited',
    source: 'Discord Developer Portal',
    sourceUrl: 'https://discord.com/developers/applications',
    credentials: 'Bot token and Application ID',
    steps: [
      'Create a New Application in the Discord Developer Portal.',
      'Open the Bot section, add a bot, and create its token.',
      'Configure the bot permissions and privileged intents required by your use case.',
      'Create an OAuth2 installation URL, select the target server, and invite the bot.',
      'Keep the token server-side; receive and verify Discord events through your deployed Gateway/webhook handler.',
    ],
    webhook: '/api/webhooks/discord',
    note: 'Never paste a Discord token into a browser page or commit it to source control. A live bot needs a backend service.',
  },
  {
    id: 'website',
    name: 'Website chat',
    category: 'Web',
    icon: Globe2,
    accent: 'website',
    availability: 'Free · self-built',
    source: 'No third-party account required',
    sourceUrl: '',
    credentials: 'Public widget key only',
    steps: [
      'Configure the chat appearance, launcher, welcome message, and availability in Website widget settings.',
      'Copy the generated embed snippet and add it before the closing body tag on your site.',
      'Deploy the Socket.IO backend endpoint and serve the widget script over HTTPS.',
      'Open your site and send a test message after the backend is connected.',
    ],
    actionLabel: 'Open widget settings',
    actionTo: '/widget-settings',
    technical: 'React widget · Socket.IO',
    note: 'The current frontend preview is browser-local. A working cross-device chat needs a deployed Socket.IO server and message API.',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'Meta',
    icon: MessageSquare,
    accent: 'whatsapp',
    availability: 'Trial · Meta test number',
    source: 'Meta for Developers',
    sourceUrl: 'https://developers.facebook.com/',
    credentials: 'Meta app, WhatsApp Business account, phone number ID and access token',
    steps: [
      'Create or select a Meta Developer app and add the WhatsApp product.',
      'Use the Cloud API test number first; add up to five verified recipient numbers for trial testing.',
      'Configure the callback URL and verify token in your deployed backend webhook settings.',
      'Subscribe the app to message events and send a test message from the backend.',
      'Move to a production business number only after Meta business verification and permissions are ready.',
    ],
    webhook: '/api/webhooks/whatsapp',
    allowance: 'PRD trial reference: up to 1,000 conversations per month; confirm current Meta terms before launch.',
    note: 'Meta access tokens and webhook verify tokens belong in server-side secrets. No OAuth or live WhatsApp connection is active in this demo.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Meta',
    icon: Instagram,
    accent: 'instagram',
    availability: 'Limited · sandbox or mock data',
    source: 'Meta for Developers',
    sourceUrl: 'https://developers.facebook.com/',
    credentials: 'Meta Developer app and Instagram Business account',
    steps: [
      'Use the same Meta Developer app where possible and add the Instagram messaging product.',
      'Switch the Instagram profile to a Business account and connect it to the relevant Facebook Page.',
      'Request the permissions required for messaging and complete app review where required.',
      'Configure your deployed webhook callback and subscribe to Instagram messaging events.',
      'Exercise the integration with sandbox or mock data before enabling production access.',
    ],
    webhook: '/api/webhooks/instagram',
    note: 'Eligibility, permissions, and free-tier limits depend on Meta’s current policies. The demo does not connect an account or receive Instagram messages.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'Future scope',
    icon: Radio,
    accent: 'linkedin',
    availability: 'Skipped in trial',
    source: 'LinkedIn Developer Portal',
    sourceUrl: 'https://developer.linkedin.com/',
    credentials: 'Partner Program approval',
    steps: [
      'Skip this channel during the trial; messaging API access is not generally available.',
      'For a future rollout, request the relevant LinkedIn Partner Program approval.',
      'After approval, provision an organization integration and implement the approved API scopes.',
      'Add the backend messaging receiver only after access and compliance requirements are confirmed.',
    ],
    webhook: '/api/webhooks/linkedin',
    note: 'LinkedIn messaging is intentionally unavailable in this trial. Do not treat the placeholder endpoint as a live integration.',
  },
  {
    id: 'gemini',
    name: 'Gemini AI',
    category: 'AI',
    icon: Sparkles,
    accent: 'gemini',
    availability: 'Free tier · provider account required',
    source: 'Google AI Studio',
    sourceUrl: 'https://aistudio.google.com/',
    credentials: 'Gemini API key',
    steps: [
      'Sign in to Google AI Studio and review the current terms, model availability, and quota for your region.',
      'Create an API key for the intended project and keep it in a backend secret manager.',
      'Connect the key from a server-side AI service; never expose it in frontend code or browser storage.',
      'Set request limits, safety rules, and human approval behavior before enabling customer-facing replies.',
      'Test against approved business context and review responses before go-live.',
    ],
    allowance: 'PRD trial reference: 15 requests per minute and 1 million tokens per day. Provider quotas and pricing can change; check Google AI Studio for current limits.',
    note: 'The existing AI tools are deterministic local demos. No Gemini key is requested or stored by this page.',
    actionLabel: 'Open AI context',
    actionTo: '/ai-context',
  },
];

export default function Channels() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('telegram');
  const [liveStatusMap, setLiveStatusMap] = useState({});

  useEffect(() => {
    api.get('/dashboard/channels').then((res) => {
      const list = res.data?.data;
      if (Array.isArray(list)) {
        const map = {};
        list.forEach((ch) => {
          map[ch.platform] = Boolean(ch.is_connected);
        });
        setLiveStatusMap(map);
      }
    }).catch(() => {});
  }, []);

  const debouncedQuery = useDebounce(query, 150);

  const filteredGuides = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    if (!normalizedQuery) return CHANNEL_GUIDES;
    return CHANNEL_GUIDES.filter((guide) => [
      guide.name, guide.category, guide.availability, guide.source,
      guide.credentials, guide.steps.join(' '), guide.webhook || '',
    ].join(' ').toLowerCase().includes(normalizedQuery));
  }, [debouncedQuery]);
  const selectedGuide = filteredGuides.find((guide) => guide.id === selectedId) || filteredGuides[0];
  const SelectedGuideIcon = selectedGuide?.icon;

  return (
    <div className="channel-guide-page">
      <header className="channel-guide-hero">
        <div>
          <span><Webhook size={14} /> CHANNEL-WISE API SETUP GUIDE</span>
          <h2>Connect your channels,<br /><em>one clear step at a time.</em></h2>
          <p>Find platform setup steps, prerequisites and webhook references. This guide never asks for secret keys or claims a live connection.</p>
        </div>
        <div className="channel-guide-hero-mark"><ShieldCheck size={28} /><strong>Secrets stay<br />server-side</strong></div>
      </header>

      <div className="channel-guide-safety" role="note">
        <KeyRound size={16} />
        <span><strong>Security first:</strong> never paste bot tokens, Meta access tokens or Gemini API keys into this demo or frontend source. Configure credentials only in your deployed backend’s secret manager.</span>
        <CircleHelp size={15} />
      </div>

      <section aria-label="Channel setup guide" className="channel-guide-layout">
        <aside className="channel-guide-list">
          <div className="channel-guide-search">
            <label htmlFor="channel-guide-search">Find a setup guide</label>
            <input id="channel-guide-search" onChange={(event) => setQuery(event.target.value)} placeholder="Search channels, steps, webhook…" value={query} />
          </div>
          <div className="channel-guide-items">
            {filteredGuides.map((guide) => {
              const Icon = guide.icon;
              const isConnected = liveStatusMap[guide.id] || guide.id === 'gemini';
              return (
                <button aria-current={selectedGuide?.id === guide.id ? 'page' : undefined} className={`channel-guide-item${selectedGuide?.id === guide.id ? ' is-active' : ''}`} key={guide.id} onClick={() => setSelectedId(guide.id)} type="button">
                  <span className={`channel-guide-icon channel-guide-icon--${guide.accent}`}><Icon size={17} /></span>
                  <span><strong>{guide.name}</strong><small>{isConnected ? `🟢 Connected · ${guide.availability}` : guide.availability}</small></span>
                  <ChevronDown size={14} />
                </button>
              );
            })}
            {filteredGuides.length === 0 && <div className="channel-guide-empty">No channel guide matches “{query}”. Try a platform name or setup term.</div>}
          </div>
          <small className="channel-guide-count">{filteredGuides.length} setup guides · PRD Module 31</small>
        </aside>

        {selectedGuide && (
          <article className="channel-guide-detail">
            <header>
              <span className={`channel-guide-icon channel-guide-icon--${selectedGuide.accent}`}><SelectedGuideIcon size={20} /></span>
              <div><span className="channel-guide-eyebrow">{selectedGuide.category} · SETUP GUIDE</span><h3>{selectedGuide.name}</h3></div>
              <span className={`channel-guide-status${selectedGuide.id === 'linkedin' ? ' is-future' : ''}`}>{(liveStatusMap[selectedGuide.id] || selectedGuide.id === 'gemini') ? `Connected · ${selectedGuide.availability}` : selectedGuide.availability}</span>
            </header>

            <div className="channel-guide-facts">
              <div><small>SETUP PORTAL</small>{selectedGuide.sourceUrl ? <a href={selectedGuide.sourceUrl} rel="noreferrer" target="_blank">{selectedGuide.source} <ExternalLink size={12} /></a> : <strong>{selectedGuide.source}</strong>}</div>
              <div><small>WHAT YOU NEED</small><strong>{selectedGuide.credentials}</strong></div>
              {selectedGuide.technical && <div><small>TECH</small><strong>{selectedGuide.technical}</strong></div>}
            </div>

            <section className="channel-guide-steps">
              <h4><Code2 size={15} /> Setup steps</h4>
              <ol>{selectedGuide.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
            </section>

            {selectedGuide.webhook && (
              <div className="channel-guide-webhook">
                <span><Webhook size={15} /></span>
                <div><small>BACKEND WEBHOOK REFERENCE</small><code>{selectedGuide.webhook}</code><p>Relative endpoint from the PRD · requires your own deployed HTTPS backend base URL.</p></div>
              </div>
            )}
            {selectedGuide.allowance && <p className="channel-guide-allowance"><Bot size={14} />{selectedGuide.allowance}</p>}
            <p className="channel-guide-note"><ShieldCheck size={14} />{selectedGuide.note}</p>

            <footer className="channel-guide-actions">
              {selectedGuide.actionTo && <Link className="channel-guide-primary" to={selectedGuide.actionTo}>{selectedGuide.actionLabel} <ArrowRight size={14} /></Link>}
              {selectedGuide.sourceUrl && <a className="channel-guide-secondary" href={selectedGuide.sourceUrl} rel="noreferrer" target="_blank">Open official portal <ExternalLink size={12} /></a>}
              {selectedGuide.id === 'website' && <Link className="channel-guide-secondary" to="/widget-settings">Configure widget <ArrowRight size={12} /></Link>}
            </footer>
          </article>
        )}
      </section>

      <footer className="channel-guide-footnote"><Check size={14} /><span>Setup documentation only. This page does not save credentials, configure webhooks, connect external accounts, or send messages.</span></footer>
    </div>
  );
}
