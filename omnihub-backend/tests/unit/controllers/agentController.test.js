import { agentController } from '../../../src/controllers/agentController.js';

describe('AgentController Unit Tests', () => {
  it('should export agentController object', () => {
    expect(agentController).toBeDefined();
    expect(typeof agentController.listAgents).toBe('function');
    expect(typeof agentController.assignConversation).toBe('function');
  });
});
