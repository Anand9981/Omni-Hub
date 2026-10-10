import { useMemo } from 'react';
import { isStrongPassword, passwordRequirements } from '../utils/validators.js';

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

/**
 * Evaluates password complexity against PRD section 5.1 requirements.
 */
export function usePasswordStrength(password = '') {
  return useMemo(() => {
    const value = String(password || '');
    const results = passwordRequirements.map((requirement) => ({
      label: requirement.label,
      met: Boolean(requirement.test(value)),
    }));
    const completed = results.filter((item) => item.met).length;
    const total = passwordRequirements.length;
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      requirements: results,
      completed,
      total,
      score,
      label: STRENGTH_LABELS[Math.min(completed, STRENGTH_LABELS.length - 1)],
      isStrong: isStrongPassword(value),
    };
  }, [password]);
}

export default usePasswordStrength;
