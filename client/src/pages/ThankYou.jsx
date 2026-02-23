export default function ThankYou() {
  return (
    <div className="card" role="main" id="main">
      <div className="thankyou-wrap">
        <div className="thankyou-icon" aria-hidden="true">✓</div>
        <h1 className="thankyou-title">Thank You!</h1>
        <p className="thankyou-body">
          Your feedback has been submitted successfully. We truly value your time and input — it helps us continuously improve our Quality Engineering services.
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-400)' }}>
          The SDET Tech Team
        </p>
      </div>
    </div>
  );
}
