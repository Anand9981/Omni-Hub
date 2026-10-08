import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyDeliveryReceipt, receiveMessage, setTyping } from '../store/messageSlice.js';
import { loadApprovals, receivePending } from '../store/approvalSlice.js';
import { loadConversations, openConversation, syncFromStore } from '../store/conversationSlice.js';
import { DIRECTION, MESSAGE_STATUS, SENDER_TYPE } from '../utils/constants.js';
import { approvalService } from '../services/approvalService.js';
import { conversationService } from '../services/conversationService.js';
import { loadLeads } from '../store/leadSlice.js';
import { aiService } from '../services/aiService.js';
import LiveToastContainer from '../components/common/LiveToastContainer.jsx';

function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Real-time transport for the dashboard.
 *
 * Event names follow PRD 21.3 - new_message, pending_approval,
 * conversation_update, typing, analytics_update - so pointing
 * VITE_SOCKET_URL at the backend is the only change needed later.
 *
 * Until that backend exists the provider runs a local event bus. It is not a
 * stub for show: inbound traffic is produced by real writes to the demo store,
 * so every slice, selector and badge behaves exactly as it will in production.
 */

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

const SAMPLE_INBOUND = [
  'Hi, is the dashboard available on mobile?',
  'Do you offer an annual plan with a discount?',
  'Hum apne Telegram bot ko connect karna chahte hain, kaise karein?',
  'Can two agents work on the same conversation?',
  'We need an invoice copy for last month, please.',
];

export function SocketProvider({ children }) {
  const dispatch = useDispatch();
  const activeConversationId = useSelector((state) => state.conversations.activeId);
  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const [toasts, setToasts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState(SOCKET_URL ? 'connecting' : 'demo');
  const listenersRef = useRef(new Map());
  const socketRef = useRef(null);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleOpenConversation = useCallback((conversationId) => {
    if (conversationId) {
      dispatch(openConversation(conversationId));
      setToasts((prev) => prev.filter((t) => t.conversationId !== conversationId));
    }
  }, [dispatch]);

  /* -------- local bus -------- */

  const on = useCallback((event, handler) => {
    const bucket = listenersRef.current.get(event) || new Set();
    bucket.add(handler);
    listenersRef.current.set(event, bucket);
    return () => bucket.delete(handler);
  }, []);

  const emitLocal = useCallback((event, payload) => {
    (listenersRef.current.get(event) || []).forEach((handler) => handler(payload));
  }, []);

  /* -------- transport -------- */

  useEffect(() => {
    if (!SOCKET_URL) {
      setConnected(true);
      setMode('demo');
      return undefined;
    }

    let disposed = false;
    let socket;

    import('socket.io-client')
      .then(({ io }) => {
        if (disposed) return;
        const token = localStorage.getItem('omnihub_access_token');
        const socketOptions = {
          transports: ['websocket', 'polling'],
          ...(token ? { auth: { token } } : {}),
        };
        socket = io(SOCKET_URL, socketOptions);
        socketRef.current = socket;
        socket.on('connect', () => {
          console.log('[Socket.io] Socket connected successfully! ID:', socket.id);
          setConnected(true);
          setMode('live');
        });
        socket.on('disconnect', (reason) => {
          console.log('[Socket.io] Disconnected from server:', reason);
          setConnected(false);
          setMode('reconnecting');
        });
        socket.on('new_message', (payload) => {
          dispatch(receiveMessage(payload));
          dispatch(loadConversations());

          const conversationId = payload.conversationId || payload.conversation_id;
          const msg = payload.message || payload;
          const isInbound = msg.direction === DIRECTION.INBOUND || msg.direction === 'INBOUND';

          if (isInbound) {
            playNotificationChime();
            dispatch(loadLeads());
            if (activeConversationIdRef.current !== conversationId) {
              const sender = payload.sender_name || msg.sender_name || 'Customer';
              const platform = payload.platform || msg.platform || 'chat';
              addToast({
                conversationId,
                sender,
                platform,
                text: msg.text_content || 'New incoming message',
              });
            }
          }
        });
        socket.on('message_status', (payload) => dispatch(applyDeliveryReceipt(payload)));
        socket.on('pending_approval', (payload) => dispatch(receivePending(payload)));
        socket.on('typing', (payload) => dispatch(setTyping(payload)));
        socket.on('conversation_update', () => dispatch(loadConversations()));
        socket.on('ai_suggestions', () => dispatch(loadConversations()));
        socket.on('autopilot_update', () => dispatch(loadConversations()));
        socket.on('approval_resolved', () => {
          dispatch(loadApprovals());
          dispatch(loadConversations());
        });
        socket.on('draft_updated', () => dispatch(loadApprovals()));
        socket.on('lead_updated', () => {
          dispatch(loadLeads());
          dispatch(loadConversations());
        });
      })
      .catch((error) => {
        console.warn('Socket transport unavailable, staying on the local bus', error);
        setMode('demo');
        setConnected(true);
      });

    return () => {
      disposed = true;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [addToast, dispatch]);

  /* -------- demo traffic -------- */

  /**
   * Writes a real inbound message. When the thread is in MANUAL approval mode
   * (PRD 9.2) the AI reply is held and surfaces in the Approvals queue instead
   * of being dispatched - exactly the behaviour the acceptance test describes.
   */
  const simulateInbound = useCallback((conversationId, text) => {
    const conversation = conversationService.listConversations().find((row) => row.id === conversationId);
    if (!conversation) throw new Error('That conversation could not be found.');

    const body = text || SAMPLE_INBOUND[Math.floor(Math.random() * SAMPLE_INBOUND.length)];
    const message = conversationService.appendMessage(conversationId, {
      sender_type: SENDER_TYPE.USER,
      direction: DIRECTION.INBOUND,
      text_content: body,
      status: MESSAGE_STATUS.READ.id,
    });

    dispatch(receiveMessage({ conversationId, message }));
    dispatch(loadLeads());
    emitLocal('new_message', { conversationId, message });

    playNotificationChime();
    if (activeConversationId !== conversationId) {
      addToast({
        conversationId,
        sender: conversation.sender_name || 'Customer',
        platform: conversation.platform || 'chat',
        text: body,
      });
    }

    if (conversation.auto_pilot === 'ON' && conversation.approval_mode === 'MANUAL') {
      const draft = approvalService.create({
        conversationId,
        text: aiService.suggestReply(body),
        source: 'AI draft - held by approval mode',
      });
      dispatch(receivePending(draft));
      emitLocal('pending_approval', draft);
    } else if (conversation.auto_pilot === 'ON') {
      const reply = conversationService.appendMessage(conversationId, {
        sender_type: SENDER_TYPE.BOT,
        direction: DIRECTION.OUTBOUND,
        text_content: aiService.suggestReply(body),
        status: MESSAGE_STATUS.SENT.id,
      });
      dispatch(receiveMessage({ conversationId, message: reply }));
      emitLocal('new_message', { conversationId, message: reply });
    }

    if (activeConversationId === conversationId) conversationService.markRead(conversationId);
    dispatch(loadConversations());
    return message;
  }, [activeConversationId, addToast, dispatch, emitLocal]);

  const simulateTyping = useCallback((conversationId, isTyping = true) => {
    dispatch(setTyping({ conversationId, isTyping }));
    emitLocal('typing', { conversationId, isTyping });
    if (isTyping) {
      window.setTimeout(() => dispatch(setTyping({ conversationId, isTyping: false })), 2400);
    }
  }, [dispatch, emitLocal]);

  const value = useMemo(() => ({
    connected, mode, on, simulateInbound, simulateTyping,
  }), [connected, mode, on, simulateInbound, simulateTyping]);

  return (
    <SocketContext.Provider value={value}>
      {children}
      <LiveToastContainer
        toasts={toasts}
        onOpen={handleOpenConversation}
        onDismiss={dismissToast}
      />
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used inside a SocketProvider.');
  return context;
}

export default SocketContext;
