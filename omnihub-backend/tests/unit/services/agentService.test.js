import { agentService } from '../../../src/services/agentService.js';

describe('AgentService Unit Tests', () => {
  it('should export agentService object', () => {
    expect(agentService).toBeDefined();
    expect(typeof agentService.getAllAgents).toBe('function');
  });
});
