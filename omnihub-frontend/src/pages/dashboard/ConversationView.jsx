import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CenterPanel from '../../components/dashboard/CenterPanel.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import {
  changeApprovalMode,
  loadConversations,
  selectActiveConversation,
  toggleAutoPilot,
} from '../../store/conversationSlice.js';
import {
  approveDraft,
  loadApprovals,
  rejectDraft,
} from '../../store/approvalSlice.js';
import {
  loadMessages,
  selectIsTyping,
  selectMessages,
  sendMessage,
  retryFailedMessage,
  activateMenuButton,
  clearMenuActionError,
} from '../../store/messageSlice.js';
import { assignConversation, autoAssignConversation, clearAgentError } from '../../store/agentSlice.js';
import { loadLeads } from '../../store/leadSlice.js';

/**
 * PRD 9.1 - the active chat window.
 *
 * Container for the center panel: reads the selected thread from the store,
 * keeps its history loaded, wires the per-thread controls, and handles
 * inline approvals directly from the conversation.
 */
export default function ConversationView({ canApprove = true, canAssign = true, readOnly = false }) {
  const dispatch = useDispatch();
  const conversation = useSelector(selectActiveConversation);
  const conversationId = conversation?.id;
  const messages = useSelector(selectMessages(conversationId || '_none'));
  const typing = useSelector(selectIsTyping(conversationId || '_none'));
  const sending = useSelector((state) => state.messages.sending);
  const retryingMessageId = useSelector((state) => state.messages.retryingMessageId);
  const retryError = useSelector((state) => state.messages.retryError);
  const retryErrorMessageId = useSelector((state) => state.messages.retryErrorMessageId);
  const menuActionError = useSelector((state) => state.messages.menuActionError);
  const agents = useSelector((state) => state.agents.items);
  const assignmentStatus = useSelector((state) => state.agents.assignmentStatus);
  const assignmentError = useSelector((state) => state.agents.error);
  const { simulateInbound, mode } = useSocket();

  useEffect(() => {
    if (conversationId) dispatch(loadMessages(conversationId));
  }, [conversationId, dispatch]);

  const refreshState = () => {
    dispatch(loadConversations());
    dispatch(loadApprovals());
    if (conversationId) dispatch(loadMessages(conversationId));
  };

  const handleApproveDraft = (approvalId) => {
    dispatch(approveDraft({ approvalId })).then(refreshState);
  };

  const handleRejectDraft = (approvalId) => {
    dispatch(rejectDraft({ approvalId })).then(refreshState);
  };

  const handleSaveDraftEdit = (approvalId, text) => {
    dispatch(approveDraft({ approvalId, text })).then(refreshState);
  };

  return (
    <CenterPanel
      conversation={conversation}
      canApprove={canApprove}
      canAssign={canAssign}
      agents={agents}
      assignmentError={assignmentError}
      assignmentLoading={assignmentStatus === 'loading'}
      onAssignAgent={(agentId) => dispatch(assignConversation({ conversationId, agentId })).unwrap()
        .then(() => dispatch(loadConversations()))}
      onAutoAssignAgent={(strategy) => dispatch(autoAssignConversation({ conversationId, strategy })).unwrap()
        .then(() => dispatch(loadConversations()))}
      onClearAgentError={() => dispatch(clearAgentError())}
      messages={messages}
      onApproveDraft={handleApproveDraft}
      onChangeApprovalMode={(next) => dispatch(changeApprovalMode({ conversationId, mode: next }))}
      onRejectDraft={handleRejectDraft}
      onSaveDraftEdit={handleSaveDraftEdit}
      onSend={(text) => dispatch(sendMessage({ conversationId, text }))}
      onSendMenu={(menu) => dispatch(sendMessage({
        conversationId,
        text: menu.welcomeMessage,
        buttons: menu.buttons,
      })).unwrap().then(() => dispatch(loadConversations()))}
      menuActionError={menuActionError}
      onClearMenuActionError={() => dispatch(clearMenuActionError())}
      onMenuButton={(button) => dispatch(activateMenuButton({
        conversationId,
        platform: conversation?.platform,
        button,
      })).unwrap().then(() => dispatch(loadConversations()))}
      onRetryMessage={(messageId) => dispatch(retryFailedMessage({ conversationId, messageId }))}
      retryingMessageId={retryingMessageId}
      retryError={retryError}
      retryErrorMessageId={retryErrorMessageId}
      onSimulate={() => {
        if (!conversationId) return;
        simulateInbound(conversationId);
        dispatch(loadLeads());
      }}
      onToggleAutoPilot={(enabled) => dispatch(toggleAutoPilot({ conversationId, enabled }))}
      sending={sending}
      readOnly={readOnly}
      socketMode={mode}
      typing={typing}
    />
  );
}