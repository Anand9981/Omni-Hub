import { approvalController } from '../../../src/controllers/approvalController.js';

describe('ApprovalController Unit Tests', () => {
  it('should export approvalController object', () => {
    expect(approvalController).toBeDefined();
    expect(typeof approvalController.getPendingApprovals).toBe('function');
    expect(typeof approvalController.approveDraft).toBe('function');
  });
});
