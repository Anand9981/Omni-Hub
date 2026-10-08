import { approvalService } from '../../../src/services/approvalService.js';

describe('ApprovalService Unit Tests', () => {
  it('should export approvalService object', () => {
    expect(approvalService).toBeDefined();
    expect(typeof approvalService.listPending).toBe('function');
    expect(typeof approvalService.approveDraft).toBe('function');
    expect(typeof approvalService.rejectDraft).toBe('function');
  });
});
