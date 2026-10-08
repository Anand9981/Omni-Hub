import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Clock, Smile, Frown, Meh, Tag, Copy, Check } from 'lucide-react';
import { aiService } from '../../services/aiService.js';

export default function AISummarizeModal({ isOpen, onClose, conversation, messages = [] }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
    }
  }, [isOpen, conversation?.id]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await aiService.summarize({
        conversationId: conversation?.id,
        messages,
        customerName: conversation?.sender_name || 'Customer',
      });
      setData(res);
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!data?.summary) return;
    const text = `Conversation Summary (${conversation?.sender_name || 'Customer'}):\n${data.summary}\n\nKey Points:\n${(data.keyPoints || []).map((k) => `• ${k}`).join('\n')}\n\nRecommended Next Step: ${data.nextStep || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  const renderSentiment = (sentiment) => {
    const s = (sentiment || '').toLowerCase();
    if (s.includes('pos') || s.includes('happy')) {
      return <span className="ai-modal-badge ai-modal-badge--green"><Smile size={14} /> Positive / Happy</span>;
    }
    if (s.includes('ang') || s.includes('frust')) {
      return <span className="ai-modal-badge ai-modal-badge--red"><Frown size={14} /> Frustrated / Angry</span>;
    }
    return <span className="ai-modal-badge ai-modal-badge--gray"><Meh size={14} /> Neutral</span>;
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <div className="ai-modal-title">
            <Sparkles size={18} className="text-primary sparkle-anim" />
            <h3>AI Conversation Summary</h3>
            <span className="ai-modal-model">Gemini 3.8</span>
          </div>
          <button type="button" className="ai-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="ai-modal-loading">
            <div className="ai-spinner" />
            <p>Analyzing conversation history with Gemini AI…</p>
          </div>
        ) : data ? (
          <div className="ai-modal-body">
            <div className="ai-meta-grid">
              <div>
                <span className="ai-meta-label">Customer Sentiment</span>
                {renderSentiment(data.customerSentiment)}
              </div>
              <div>
                <span className="ai-meta-label">Primary Intent</span>
                <span className="ai-modal-badge ai-modal-badge--purple">
                  <Tag size={13} /> {data.intent || 'General Support'}
                </span>
              </div>
              <div>
                <span className="ai-meta-label">Status</span>
                <span className="ai-modal-badge ai-modal-badge--blue">
                  <Clock size={13} /> {data.resolutionStatus || 'Pending'}
                </span>
              </div>
            </div>

            <div className="ai-summary-section">
              <h4>Executive Summary</h4>
              <p className="ai-summary-text">{data.summary}</p>
            </div>

            {data.keyPoints && data.keyPoints.length > 0 && (
              <div className="ai-keypoints-section">
                <h4>Key Discussion Points</h4>
                <ul className="ai-keypoints-list">
                  {data.keyPoints.map((point, index) => (
                    <li key={index}>
                      <CheckCircle2 size={14} className="ai-bullet-icon" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.nextStep && (
              <div className="ai-nextstep-box">
                <AlertCircle size={16} className="text-amber-500" />
                <div>
                  <strong>Recommended Next Step:</strong>
                  <p>{data.nextStep}</p>
                </div>
              </div>
            )}

            <div className="ai-modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={copyToClipboard}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
              </button>
              <button type="button" className="primary-button" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="ai-modal-empty">
            <p>Could not load summary. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
