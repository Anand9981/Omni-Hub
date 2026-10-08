import { useSelector, useDispatch } from 'react-redux';
import { approveDraft, rejectDraft, editAndApproveDraft } from '../store/approvalSlice.js';

export function useApprovals() {
  const dispatch = useDispatch();
  const pendingApprovals = useSelector((state) => state.approvals?.pending || []);

  const handleApprove = (id) => dispatch(approveDraft(id));
  const handleReject = (id) => dispatch(rejectDraft(id));
  const handleEditAndApprove = (id, proposedText) =>
    dispatch(editAndApproveDraft({ id, proposedText }));

  return {
    pendingApprovals,
    approve: handleApprove,
    reject: handleReject,
    editAndApprove: handleEditAndApprove,
  };
}

export default useApprovals;
