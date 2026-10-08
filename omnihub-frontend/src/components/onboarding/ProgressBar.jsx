export default function ProgressBar({ currentStep, totalSteps }) {
  const progress = Math.min(100, Math.max(0, Math.round((currentStep / totalSteps) * 100)));
  return (
    <div aria-label={`${progress}% of onboarding complete`} className="onboarding-progress">
      <div aria-valuemax="100" aria-valuemin="0" aria-valuenow={progress} className="onboarding-progress-track" role="progressbar">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div><strong>{progress}%</strong><span>setup journey</span></div>
    </div>
  );
}
