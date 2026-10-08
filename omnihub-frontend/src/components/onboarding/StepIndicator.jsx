import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep, completedSteps = [] }) {
  return (
    <ol aria-label="Onboarding steps" className="onboarding-step-indicator">
      {steps.map((step, index) => {
        const number = index + 1;
        const complete = completedSteps.includes(number) || number < currentStep;
        return (
          <li
            aria-current={number === currentStep ? 'step' : undefined}
            className={`onboarding-step${complete ? ' is-complete' : ''}${number === currentStep ? ' is-current' : ''}`}
            key={step.id}
          >
            <span>{complete ? <Check size={14} /> : String(number).padStart(2, '0')}</span>
            <div><strong>{step.label}</strong><small>{step.shortLabel || step.description}</small></div>
          </li>
        );
      })}
    </ol>
  );
}
