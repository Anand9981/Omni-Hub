import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Smile, Meh, Frown, HelpCircle, Flame, Tag, Check } from 'lucide-react';
import { aiService } from '../../services/aiService.js';

export default function AISuggestionsBar({
  conversation,
  messages = [],
  onSelectSuggestion,
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [intent, setIntent] = useState(null);
  const [urgency, setUrgency] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Sync with conversation props or fetch if not present
  useEffect(() => {
    if (conversation?.ai_suggestions?.length > 0) {
      setSuggestions(conversation.ai_suggestions);
      setSentiment(conversation.sentiment);
      setIntent(conversation.intent);
      setUrgency(conversation.urgency);
    } else {
      // Find last inbound message to generate suggestions
      const lastInbound = [...messages].reverse().find((m) => m.direction === 'INBOUND' || m.sender_type === 'USER');
      if (lastInbound && (lastInbound.text_content || lastInbound.text)) {
        handleGenerate(lastInbound.text_content || lastInbound.text);
      }
    }
  }, [conversation?.id, conversation?.ai_suggestions, messages.length]);

  const handleGenerate = async (customText = null) => {
    const lastInbound = [...messages].reverse().find((m) => m.direction === 'INBOUND' || m.sender_type === 'USER');
    const textToAnalyze = customText || lastInbound?.text_content || lastInbound?.text || '';
    if (!textToAnalyze.trim()) return;

    setLoading(true);
    try {
      const res = await aiService.getSuggestions({
        text: textToAnalyze,
        history: messages.slice(-5),
        channel: conversation?.platform || 'chat',
      });

      if (res) {
        setSuggestions(res.suggestions || []);
        setSentiment(res.sentiment || null);
        setIntent(res.intent || null);
        setUrgency(res.urgency || null);
      }
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSentimentIcon = (sent) => {
    const s = (sent || '').toLowerCase();
    if (s.includes('happy') || s.includes('pos')) return <Smile size={13} className="text-emerald-500" />;
    if (s.includes('ang') || s.includes('frust')) return <Frown size={13} className="text-rose-500" />;
    if (s.includes('curious')) return <HelpCircle size={13} className="text-blue-500" />;
    return <Meh size={13} className="text-amber-500" />;
  };

  const getSentimentBadgeClass = (sent) => {
    const s = (sent || '').toLowerCase();
    if (s.includes('happy') || s.includes('pos')) return 'ai-pill--positive';
    if (s.includes('ang') || s.includes('frust')) return 'ai-pill--negative';
    if (s.includes('curious')) return 'ai-pill--curious';
    return 'ai-pill--neutral';
  };

  if (!suggestions.length && !loading) {
    return (
      <div className="ai-suggestions-bar ai-suggestions-bar--empty">
        <button
          type="button"
          onClick={() => handleGenerate()}
          className="ai-suggestions-trigger"
          disabled={loading}
        >
          <Sparkles size={14} />
          <span>Generate Gemini Smart Replies</span>
        </button>
      </div>
    );
  }

  return (
    <div className="ai-suggestions-bar">
      <div className="ai-suggestions-header">
        <div className="ai-suggestions-meta">
          <span className="ai-suggestions-title">
            <Sparkles size={14} className="sparkle-anim" />
            <strong>AI Copilot</strong>
          </span>

          {sentiment && (
            <span className={`ai-pill ${getSentimentBadgeClass(sentiment)}`} title={`Customer Sentiment: ${sentiment}`}>
              {renderSentimentIcon(sentiment)}
              <span>{sentiment}</span>
            </span>
          )}

          {intent && (
            <span className="ai-pill ai-pill--intent" title={`Detected Intent: ${intent}`}>
              <Tag size={11} />
              <span>{intent}</span>
            </span>
          )}

          {urgency === 'High' && (
            <span className="ai-pill ai-pill--urgent" title="High Urgency">
              <Flame size={12} />
              <span>Urgent</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={loading}
          className="ai-reload-btn"
          title="Refresh AI suggestions"
        >
          <RefreshCw size={13} className={loading ? 'spin-anim' : ''} />
          <span>{loading ? 'Thinking…' : 'Refresh'}</span>
        </button>
      </div>

      <div className="ai-suggestions-cards">
        {suggestions.map((sug, idx) => (
          <button
            key={sug.id || idx}
            type="button"
            className="ai-suggestion-card"
            onClick={() => {
              onSelectSuggestion(sug.text);
              setCopiedIndex(idx);
              setTimeout(() => setCopiedIndex(null), 2000);
            }}
            title="Click to insert into reply"
          >
            <div className="ai-suggestion-type">
              <span>{sug.type || 'Draft'}</span>
              {copiedIndex === idx && <Check size={12} className="text-emerald-500" />}
            </div>
            <p className="ai-suggestion-text">{sug.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
