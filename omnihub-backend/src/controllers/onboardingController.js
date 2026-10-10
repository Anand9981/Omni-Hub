import { onboardingService } from '../services/onboardingService.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const onboardingController = {
  async getProgress(req, res) {
    try {
      const progress = await onboardingService.getProgress(req.user._id);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, progress, 'Onboarding progress.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async updateChecklist(req, res) {
    try {
      const { stepKey, value } = req.body;
      const progress = await onboardingService.updateChecklist(req.user._id, stepKey, value);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, progress, 'Checklist item updated.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async setStep(req, res) {
    try {
      const { stepNumber } = req.body;
      const progress = await onboardingService.setStep(req.user._id, stepNumber);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, progress, `Advanced to step ${stepNumber}.`));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async updateProgress(req, res) {
    try {
      const progress = await onboardingService.updateProgress(req.user._id, req.body);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, progress, 'Onboarding progress updated.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },
};

export default onboardingController;
