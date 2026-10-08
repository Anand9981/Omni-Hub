import { leadController } from '../../../src/controllers/leadController.js';

describe('LeadController Unit Tests', () => {
  it('should export leadController object', () => {
    expect(leadController).toBeDefined();
    expect(typeof leadController.listAllLeads).toBe('function');
    expect(typeof leadController.getLeadByConversation).toBe('function');
  });
});
