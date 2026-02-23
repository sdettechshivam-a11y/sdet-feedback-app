export default function NPSRating({ id, value, onChange, error }) {
  const handleKeyDown = (e, num) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(10, num + 1);
      onChange(next);
      document.getElementById(`${id}-nps-${next}`)?.focus();
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(1, num - 1);
      onChange(prev);
      document.getElementById(`${id}-nps-${prev}`)?.focus();
    }
  };

  return (
    <div className="nps-wrap">
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-required="true"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        className="nps-grid"
      >
        {[1,2,3,4,5,6,7,8,9,10].map((num) => (
          <button
            key={num}
            id={`${id}-nps-${num}`}
            type="button"
            role="radio"
            aria-checked={value === num}
            aria-label={`${num} out of 10`}
            className={`nps-btn${value === num ? " selected" : ""}`}
            onClick={() => onChange(num)}
            onKeyDown={(e) => handleKeyDown(e, num)}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="nps-labels" aria-hidden="true">
        <span>Not at all likely</span>
        <span>Extremely likely</span>
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
