import { configureStore } from '@reduxjs/toolkit';
import approvalReducer from './approvalSlice.js';
import analyticsReducer from './analyticsSlice.js';
import agentReducer from './agentSlice.js';
import conversationReducer from './conversationSlice.js';
import leadReducer from './leadSlice.js';
import cannedResponseReducer from './cannedResponseSlice.js';
import messageReducer from './messageSlice.js';
import noteReducer from './noteSlice.js';
import businessHoursReducer from './businessHoursSlice.js';
import templateReducer from './templateSlice.js';
import authReducer from './auth/authSlice.js';

/**
 * Redux Toolkit store for the workspace.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    conversations: conversationReducer,
    messages: messageReducer,
    approvals: approvalReducer,
    analytics: analyticsReducer,
    agents: agentReducer,
    leads: leadReducer,
    cannedResponses: cannedResponseReducer,
    notes: noteReducer,
    businessHours: businessHoursReducer,
    templates: templateReducer,
  },
  devTools: true,
});

export default store;