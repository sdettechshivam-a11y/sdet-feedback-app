export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="progress-wrap" aria-label={`Step ${current} of ${total}`}>
      <div className="progress-label">
        <span className="progress-step-text">Step {current} of {total}</span>
        <span className="progress-pct" aria-hidden="true">{pct}%</span>
      </div>
      <div
        className="progress-bar-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% complete`}
      >
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
