import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { agentService } from '../services/agentService.js';

export const loadAgents = createAsyncThunk('agents/load', async (user) => {
  const currentAgentId = agentService.ensureCurrentUserAgent(user);
  return {
    items: agentService.listAgents(),
    currentAgentId,
    isAgentScoped: user?.role === 'Agent',
  };
});

export const assignConversation = createAsyncThunk(
  'agents/assignConversation',
  async ({ conversationId, agentId }) => agentService.assignConversation(conversationId, agentId),
);

export const autoAssignConversation = createAsyncThunk(
  'agents/autoAssignConversation',
  async ({ conversationId, strategy }) => agentService.autoAssign(conversationId, strategy),
);

export const updateAgent = createAsyncThunk(
  'agents/update',
  async ({ agentId, updates }) => agentService.updateAgent(agentId, updates),
);

const initialState = {
  items: [],
  status: 'idle',
  assignmentStatus: 'idle',
  currentAgentId: null,
  isAgentScoped: false,
  error: null,
};

const agentSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    clearAgentError(state) {
      state.error = null;
    },
    setAgentScope(state, action) {
      state.isAgentScoped = action.payload;
      if (!action.payload) state.currentAgentId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAgents.pending, (state) => {
        state.status = state.items.length ? 'ready' : 'loading';
        state.error = null;
      })
      .addCase(loadAgents.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.currentAgentId = action.payload.currentAgentId;
        state.isAgentScoped = action.payload.isAgentScoped;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(loadAgents.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      })
      .addCase(assignConversation.pending, (state) => {
        state.assignmentStatus = 'loading';
        state.error = null;
      })
      .addCase(autoAssignConversation.pending, (state) => {
        state.assignmentStatus = 'loading';
        state.error = null;
      })
      .addCase(assignConversation.fulfilled, (state, action) => {
        state.items = action.payload.agents;
        state.assignmentStatus = 'ready';
      })
      .addCase(autoAssignConversation.fulfilled, (state, action) => {
        state.items = action.payload.agents;
        state.assignmentStatus = 'ready';
      })
      .addCase(assignConversation.rejected, (state, action) => {
        state.assignmentStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(autoAssignConversation.rejected, (state, action) => {
        state.assignmentStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { clearAgentError, setAgentScope } = agentSlice.actions;
export default agentSlice.reducer;
