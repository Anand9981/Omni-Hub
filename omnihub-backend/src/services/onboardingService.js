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
};

export default onboardingService;
