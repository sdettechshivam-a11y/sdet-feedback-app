import { useState } from 'react';

const LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

export default function StarRating({ value, onChange, name, required = true }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="star-group" role="group" aria-label={`Star rating for ${name}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= display ? 'filled' : 'empty'}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onKeyDown={e => {
            if (e.key === 'ArrowRight' && value < 5) onChange(value + 1);
            if (e.key === 'ArrowLeft' && value > 1) onChange(value - 1);
          }}
          aria-label={`${star} star${star > 1 ? 's' : ''} — ${LABELS[star]}`}
          aria-pressed={value === star}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
      <p className="star-label-text sr-only" aria-live="polite">
        {display ? `${display} out of 5 — ${LABELS[display]}` : 'No rating selected'}
      </p>
    </div>
  );
}
