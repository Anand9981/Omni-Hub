import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { setAutoPilot, setApprovalMode } from '../store/conversationSlice.js';

export function useConversations() {
  const dispatch = useDispatch();
  const conversations = useSelector((state) => state.conversations?.list || []);
  const activeConversationId = useSelector((state) => state.conversations?.activeId || null);

  const toggleAutoPilot = useCallback(
    (id, enabled) => {
      dispatch(setAutoPilot({ conversationId: id, enabled }));
    },
    [dispatch]
  );

  const updateApprovalMode = useCallback(
    (id, mode) => {
      dispatch(setApprovalMode({ conversationId: id, mode }));
    },
    [dispatch]
  );

  return {
    conversations,
    activeConversationId,
    toggleAutoPilot,
    updateApprovalMode,
  };
}

export default useConversations;
