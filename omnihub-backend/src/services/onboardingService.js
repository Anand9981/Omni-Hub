import { OnboardingProgress } from '../models/index.js';
import logger from '../utils/logger.js';

export const onboardingService = {
  async getProgress(userId) {
    let progress = await OnboardingProgress.findOne({ user_id: userId });
    if (!progress) {
      progress = await OnboardingProgress.create({
        user_id: userId,
        current_step: 1,
        completed_steps: [],
        checklist: {
          business_info: false,
          channel_connected: false,
          knowledge_base: false,
          team_invited: false,
          test_message_sent: false,
        },
      });
    }
    return progress;
  },

  async updateChecklist(userId, stepKey, value = true) {
    const progress = await this.getProgress(userId);
    if (progress.checklist && stepKey in progress.checklist) {
      progress.checklist[stepKey] = value;
    }

    // Check if all steps completed
    const allDone = Object.values(progress.checklist.toObject ? progress.checklist.toObject() : progress.checklist).every(Boolean);
    if (allDone) {
      progress.status = 'completed';
    }
    await progress.save();
    logger.info(`[OnboardingService] Updated checklist for user ${userId}: ${stepKey} = ${value}`);
    return progress;
  },

  async setStep(userId, stepNumber) {
    const progress = await this.getProgress(userId);
    progress.current_step = stepNumber;
    if (!progress.completed_steps.includes(stepNumber - 1) && stepNumber > 1) {
      progress.completed_steps.push(stepNumber - 1);
    }
    await progress.save();
    return progress;
  },

  async updateProgress(userId, updates = {}) {
    const progress = await this.getProgress(userId);
    if (updates.status) progress.status = updates.status;
    if (typeof (updates.currentStep ?? updates.current_step) === 'number') {
      progress.current_step = updates.currentStep ?? updates.current_step;
    }
    if (updates.business) {
      progress.business = { ...(progress.business?.toObject?.() || progress.business || {}), ...updates.business };
    }
    if (updates.channels) {
      progress.channels = { ...(progress.channels || {}), ...updates.channels };
      progress.markModified('channels');
    }
    if (updates.knowledge) {
      progress.knowledge = { ...(progress.knowledge || {}), ...updates.knowledge };
      progress.markModified('knowledge');
    }
    if (Array.isArray(updates.invitedAgents || updates.invited_agents)) {
      progress.invited_agents = updates.invitedAgents || updates.invited_agents;
    }
    if (updates.tests) {
      progress.tests = { ...(progress.tests || {}), ...updates.tests };
      progress.markModified('tests');
    }
    if (updates.status === 'completed') {
      progress.completed_at = new Date();
    }
    await progress.save();
    return progress;
  },
};

export default onboardingService;
