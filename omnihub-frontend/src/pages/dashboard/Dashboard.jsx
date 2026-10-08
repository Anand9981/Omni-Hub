import { useEffect, useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRight, Rocket, X } from 'lucide-react';
import LeftPanel from '../../components/dashboard/LeftPanel.jsx';
import RightPanel from '../../components/dashboard/RightPanel.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import {
  loadConversations,
  openConversation,
  replaceFilters,
  selectActiveConversation,
  setFilter,
  toggleAutoPilot,
} from '../../store/conversationSlice.js';
import { loadApprovals } from '../../store/approvalSlice.js';
import { selectMessages } from '../../store/messageSlice.js';
import ConversationView from './ConversationView.jsx';
import { authService } from '../../services/authDemoService.js';
import { canManageApprovals, isReadOnly } from '../../utils/permissions.js';
import { loadAgents, setAgentScope } from '../../store/agentSlice.js';
import { loadLeads, updateConversationLead } from '../../store/leadSlice.js';
import { addNote, deleteNote, loadMentionNotifications, loadNotes } from '../../store/noteSlice.js';
import { onboardingService } from '../../services/onboardingService.js';

/**
 * PRD 9.1 - the main three-panel dashboard.
 *
 *   left   inbox list        (LeftPanel)
 *   centre active thread     (ConversationView -> CenterPanel)
 *   right  extracted lead    (RightPanel)
 */
export default function Dashboard() {
  const dispatch = useDispatch();
  const [onboardingReminder, setOnboardingReminder] = useState(false);
  const conversation = useSelector(selectActiveConversation);
  const conversations = useSelector((state) => state.conversations.items);
  const currentAgentId = useSelector((state) => state.agents.currentAgentId);
  const agents = useSelector((state) => state.agents.items);
  const notes = useSelector((state) => state.notes.items);
  const noteNotifications = useSelector((state) => state.notes.notifications);
  const noteError = useSelector((state) => state.notes.error);
  const leadError = useSelector((state) => state.leads.error);
  const messages = useSelector(selectMessages(conversation?.id || '_none'));
  const failedMessageCount = messages.filter((message) => message.direction === 'OUTBOUND' && message.status === 'FAILED').length;
  const { mode, connected } = useSocket();
  const role = authService.getCurrentUser()?.role;
  const readOnly = isReadOnly(role);
  const canApprove = canManageApprovals(role);

  useEffect(() => {
    try {
      const progress = onboardingService.getProgress();
      setOnboardingReminder(progress.status !== 'completed'
        && localStorage.getItem('omnihub.demo.onboardingReminderDismissed') !== 'true');
    } catch (error) {
      console.error('Could not load the onboarding reminder.', error);
    }
  }, []);

  useLayoutEffect(() => {
    dispatch(setAgentScope(role === 'Agent'));
  }, [dispatch, role]);

  useEffect(() => {
    dispatch(loadConversations());
    dispatch(loadApprovals());
    dispatch(loadAgents(role === 'Agent'
      ? { role, email: authService.getCurrentUser()?.email, name: authService.getCurrentUser()?.name, agentId: authService.getCurrentUser()?.agentId }
      : undefined));
    dispatch(loadLeads());
  }, [dispatch, role]);

  useEffect(() => {
    if (conversation?.id) dispatch(loadNotes(conversation.id));
  }, [conversation?.id, dispatch]);

  useEffect(() => {
    if (currentAgentId) dispatch(loadMentionNotifications(currentAgentId));
  }, [currentAgentId, dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedFilters = params.get('filters');
    if (sharedFilters) {
      try {
        const parsed = JSON.parse(sharedFilters);
        const allowed = [
          'platform', 'query', 'onlyUnread', 'onlyPending', 'onlyHuman', 'onlyUnassigned',
          'assignedToMe', 'hasMedia', 'hasLead', 'status', 'tag', 'language',
          'fromDate', 'toDate', 'sort',
        ];
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid shared filter data.');
        const sanitized = Object.fromEntries(Object.entries(parsed).filter(([key, value]) => allowed.includes(key)
          && ['string', 'boolean'].includes(typeof value)));
        dispatch(replaceFilters(sanitized));
      } catch (error) {
        console.error('Could not apply the shared conversation search.', error);
      }
    }
    if (params.get('queue') === 'unassigned') {
      dispatch(setFilter({ onlyUnassigned: true }));
    }
  }, [dispatch]);

  // Deep link: /dashboard/:conversationId selects that thread on load.
  useEffect(() => {
    const wanted = window.location.pathname.split('/')[2];
    if (!wanted || !conversations.length) return;
    if (conversations.some((item) => item.id === wanted)) dispatch(openConversation(wanted));
  }, [conversations, dispatch]);

  useEffect(() => {
    if (role !== 'Agent' || !currentAgentId || conversation) return;
    const firstAssigned = conversations.find((item) => item.assigned_agent_id === currentAgentId);
    if (firstAssigned) dispatch(openConversation(firstAssigned.id));
  }, [conversation, conversations, currentAgentId, dispatch, role]);

  const conversationId = conversation?.id;

  return (
    <div className="dashboard">
      {onboardingReminder && canApprove && (
        <aside className="dashboard-onboarding-reminder">
          <span className="dashboard-onboarding-icon"><Rocket size={17} /></span>
          <div><strong>Make this workspace launch-ready</strong><small>Continue your setup checklist for business details, channels and team readiness.</small></div>
          <Link to="/onboarding">Continue setup <ArrowRight size={13} /></Link>
          <button aria-label="Dismiss setup reminder" onClick={() => {
            try {
              localStorage.setItem('omnihub.demo.onboardingReminderDismissed', 'true');
            } catch (error) {
              console.error('Could not save the onboarding reminder preference.', error);
            }
            setOnboardingReminder(false);
          }} type="button"><X size={15} /></button>
        </aside>
      )}
      <div className={`dashboard-transport dashboard-transport--${mode}`}>
        <span className="transport-dot" />
        {connected
          ? (mode === 'live' ? 'Live socket connected' : 'Demo transport · local event bus')
          : 'Connecting to socket…'}
        {failedMessageCount > 0 && (
          <span className="dashboard-delivery-alert" role="status">
            {failedMessageCount} delivery {failedMessageCount === 1 ? 'failure' : 'failures'}
          </span>
        )}
      </div>

      <div className="dashboard-grid">
        <LeftPanel />
        <ConversationView canApprove={canApprove} canAssign={canApprove} readOnly={readOnly} />
        <RightPanel
          conversation={conversation}
          lead={conversation?.lead}
          leadError={leadError}
          messageCount={messages.length}
          notes={notes}
          noteError={noteError}
          agents={agents}
          currentAgentId={currentAgentId}
          noteNotifications={noteNotifications.filter((item) => item.conversation_id === conversationId)}
          readOnly={readOnly}
          onAddNote={(note) => conversationId && dispatch(addNote({
            ...note,
            conversationId,
            authorName: authService.getCurrentUser()?.name || 'You',
            authorId: currentAgentId,
          })).unwrap().then(() => dispatch(loadMentionNotifications(currentAgentId)))}
          onDeleteNote={(noteId) => conversationId && dispatch(deleteNote({ conversationId, noteId }))
            .unwrap().then(() => dispatch(loadMentionNotifications(currentAgentId)))}
          onToggleAutoPilot={(enabled) => conversationId && dispatch(toggleAutoPilot({ conversationId, enabled }))}
          onUpdateLead={(updates) => conversationId && dispatch(updateConversationLead({ conversationId, updates }))
            .then(() => dispatch(loadConversations()))}
        />
      </div>
    </div>
  );
}