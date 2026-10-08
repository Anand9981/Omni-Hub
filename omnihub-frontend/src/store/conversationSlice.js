import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { conversationService } from '../services/conversationService.js';

/* ------------------------------------------------------------
   Conversations - the inbox list, active thread and view filters.
   Thunks wrap conversationService so switching to the REST API
   later means editing the service, not this file.
   ------------------------------------------------------------ */

export const loadConversations = createAsyncThunk('conversations/load', async () => conversationService.listConversations());

export const loadSavedConversationSearches = createAsyncThunk(
  'conversations/loadSavedSearches',
  async () => conversationService.listSavedSearches(),
);

export const saveConversationSearch = createAsyncThunk(
  'conversations/saveSearch',
  async (search) => conversationService.saveConversationSearch(search),
);

export const deleteConversationSearch = createAsyncThunk(
  'conversations/deleteSearch',
  async (searchId) => conversationService.deleteConversationSearch(searchId),
);

export const openConversation = createAsyncThunk('conversations/open', async (conversationId) => {
  await conversationService.markRead(conversationId);
  const items = await conversationService.listConversations();
  return { conversationId, items };
});

/** PRD 9.4 - Auto-Pilot: OFF hands the thread to a human agent. */
export const toggleAutoPilot = createAsyncThunk('conversations/toggleAutoPilot', async ({ conversationId, enabled }) => {
  await conversationService.setAutoPilot(conversationId, enabled);
  return await conversationService.listConversations();
});

/** PRD 9.2 - approval toggle: MANUAL holds AI replies for review. */
export const changeApprovalMode = createAsyncThunk('conversations/changeApprovalMode', async ({ conversationId, mode }) => {
  await conversationService.setApprovalMode(conversationId, mode);
  return await conversationService.listConversations();
});

/** PRD 9.1 / 10 - Lead tags and status updates. */
export const updateLeadData = createAsyncThunk('conversations/updateLead', async ({ conversationId, updates }) => {
  await conversationService.updateLead(conversationId, updates);
  return await conversationService.listConversations();
});

const initialState = {
  items: [],
  activeId: null,
  status: 'idle',
  error: null,
  filters: {
    platform: 'all',
    query: '',
    onlyUnread: false,
    onlyPending: false,
    onlyHuman: false,
    onlyUnassigned: false,
    assignedToMe: false,
    hasMedia: false,
    hasLead: false,
    status: 'all',
    tag: 'all',
    language: 'all',
    fromDate: '',
    toDate: '',
    sort: 'latest',
  },
  savedSearches: [],
};

const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setActiveId(state, action) {
      state.activeId = action.payload;
    },
    setFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    replaceFilters(state, action) {
      state.filters = { ...initialState.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = { ...initialState.filters };
    },
    /** Pulls fresh rows after another slice mutated the demo store. */
    syncFromStore(state) {
      state.items = conversationService.getCachedConversations();
    },
  },
  extraReducers: (builder) => {
    const fulfilled = (state, action) => {
      state.items = action.payload.items ?? action.payload;
      state.status = 'ready';
      state.error = null;
    };

    builder
      .addCase(loadConversations.pending, (state) => {
        state.status = state.items.length ? 'ready' : 'loading';
        state.error = null;
      })
      .addCase(loadConversations.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
        state.activeId = state.activeId || action.payload[0]?.id || null;
      })
      .addCase(loadConversations.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      })
      .addCase(loadSavedConversationSearches.fulfilled, (state, action) => {
        state.savedSearches = action.payload;
        state.error = null;
      })
      .addCase(loadSavedConversationSearches.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(saveConversationSearch.fulfilled, (state, action) => {
        state.savedSearches = action.payload;
        state.error = null;
      })
      .addCase(saveConversationSearch.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteConversationSearch.fulfilled, (state, action) => {
        state.savedSearches = action.payload;
        state.error = null;
      })
      .addCase(deleteConversationSearch.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(openConversation.fulfilled, (state, action) => {
        state.activeId = action.payload.conversationId;
        state.items = action.payload.items;
      })
      .addCase(toggleAutoPilot.fulfilled, fulfilled)
      .addCase(changeApprovalMode.fulfilled, fulfilled)
      .addCase(updateLeadData.fulfilled, fulfilled);
  },
});

export const { setActiveId, setFilter, replaceFilters, resetFilters, syncFromStore } = conversationSlice.actions;

/* -------- Selectors -------- */

export const selectActiveConversation = (state) => {
  const conversation = state.conversations.items.find((item) => item.id === state.conversations.activeId) || null;
  if (state.agents.isAgentScoped
    && (!state.agents.currentAgentId || conversation?.assigned_agent_id !== state.agents.currentAgentId)) return null;
  return conversation;
};

/** Applies the left-panel filters (PRD 9.1 & 15 search and filter). */
export const selectVisibleConversations = createSelector(
  [
    (state) => state.conversations.items,
    (state) => state.conversations.filters,
    (state) => state.agents.currentAgentId,
    (state) => state.agents.isAgentScoped,
  ],
  (items, filters, currentAgentId, isAgentScoped) => {
    const {
      platform,
      query,
      onlyUnread,
      onlyPending,
      onlyHuman,
      onlyUnassigned,
      assignedToMe,
      hasMedia,
      hasLead,
      status,
      tag,
      language,
      fromDate,
      toDate,
      sort = 'latest',
    } = filters;
    const needle = query.trim().toLowerCase();

    const visible = items.filter((item) => {
      if (isAgentScoped && (!currentAgentId || item.assigned_agent_id !== currentAgentId)) return false;
      if (platform !== 'all' && item.platform !== platform) return false;
      if (onlyUnread && !item.unread) return false;
      if (onlyPending && !item.heldDraft) return false;
      if (onlyHuman && item.auto_pilot !== 'OFF') return false;
      if (onlyUnassigned && item.assigned_agent_id) return false;
      if (assignedToMe && (!currentAgentId || item.assigned_agent_id !== currentAgentId)) return false;
      if (hasMedia && !item.hasMedia) return false;
      if (hasLead && !item.lead) return false;
      if (status === 'pending' && !item.heldDraft && !item.messageStatuses?.includes('PENDING_APPROVAL')) return false;
      if (status === 'sent' && !item.messageStatuses?.some((value) => ['SENT', 'DELIVERED', 'READ'].includes(value))) return false;
      if (status === 'failed' && !item.messageStatuses?.some((value) => ['FAILED', 'REJECTED'].includes(value))) return false;
      if (tag !== 'all' && !item.lead?.lead_tags?.includes(tag)) return false;
      if (language !== 'all' && item.language !== language) return false;
      if (fromDate && new Date(item.last_activity_at) < new Date(`${fromDate}T00:00:00`)) return false;
      if (toDate) {
        const endOfDay = new Date(`${toDate}T00:00:00`);
        endOfDay.setHours(23, 59, 59, 999);
        if (new Date(item.last_activity_at) > endOfDay) return false;
      }
      if (!needle) return true;
      return [item.sender_name, item.sender_email, item.sender_phone, item.messageText]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle));
    });

    return visible.sort((a, b) => {
      if (sort === 'oldest') return new Date(a.last_activity_at) - new Date(b.last_activity_at);
      if (sort === 'mostMessages') return b.messageCount - a.messageCount;
      if (sort === 'longestPending') {
        const pendingTime = (item) => item.heldDraft ? new Date(item.heldDraft.created_at).getTime() : Number.POSITIVE_INFINITY;
        return pendingTime(a) - pendingTime(b);
      }
      if (sort === 'priority') {
        const score = (item) => Number(Boolean(item.heldDraft))
          + Number(item.lead?.lead_tags?.some((value) => ['#VIP', '#HOT_LEAD'].includes(value)));
        return score(b) - score(a) || new Date(b.last_activity_at) - new Date(a.last_activity_at);
      }
      return new Date(b.last_activity_at) - new Date(a.last_activity_at);
    });
  },
);

export const selectPlatformCounts = createSelector(
  [(state) => state.conversations.items],
  (items) => items.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1;
    return acc;
  }, {}),
);

export default conversationSlice.reducer;