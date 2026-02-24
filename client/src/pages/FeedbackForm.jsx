import { useState } from 'react';
import AppHeader from '../components/AppHeader';

const QUALITY_OPTIONS = [
  { value: 'Exceptional',   color: '#15803D', bg: '#F0FDF4', icon: '★' },
  { value: 'Above Average', color: '#65A30D', bg: '#F7FEE7', icon: '↑' },
  { value: 'Average',       color: '#D97706', bg: '#FFFBEB', icon: '→' },
  { value: 'Below Average', color: '#DC2626', bg: '#FEF2F2', icon: '↓' },
];

const RATING_QUESTIONS = [
  {
    field: 'rating_scope',
    label: 'Quality of Testing',
    question: 'How would you rate the quality and thoroughness of our testing (scoping, bug detection, edge cases, reporting, documentation)?',
  },
  {
  field: 'rating_communication',
  label: 'Communication and Responsiveness',
  question: 'How would you rate our team in terms of communication, responsiveness, and clarity of reporting?',
},
  {
  field: 'rating_ownership',
  label: 'Accountability and Ownership',
  question: 'How would you rate our team in terms of demonstrating the accountability and ownership of project delivery?',
},
];

const STAR_OPTIONS = [
  { value: 1, label: 'Poor',      color: '#DC2626', bg: '#FEF2F2' },
  { value: 2, label: 'Average',   color: '#C2410C', bg: '#FFF7ED' },
  { value: 3, label: 'Good',      color: '#D97706', bg: '#FFFBEB' },
  { value: 4, label: 'Very Good', color: '#65A30D', bg: '#F7FEE7' },
  { value: 5, label: 'Excellent', color: '#15803D', bg: '#F0FDF4' },
];

const INNOVATION_LABELS = {
  1: 'Not helpful',      2: 'Not helpful',
  3: 'Slightly helpful', 4: 'Slightly helpful',
  5: 'Neutral',          6: 'Neutral',
  7: 'Helpful',          8: 'Helpful',
  9: 'Very helpful',     10: 'Extremely helpful',
};

const NPS_LABELS = {
  1: 'Not at all likely', 2: 'Not at all likely',
  3: 'Unlikely',          4: 'Unlikely',
  5: 'Neutral',           6: 'Neutral',
  7: 'Likely',            8: 'Likely',
  9: 'Very Likely',       10: 'Extremely Likely',
};

const INITIAL = {
  full_name:            '',
  work_email:           '',
  overall_quality:      '',
  rating_scope:         0,
  rating_communication: 0,
  rating_ownership:     0,
  rating_accuracy:      0,
  nps_score:            0,
  improvement_area:     '',
};

function SectionHeader({ children }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1E3A5F 0%, #0F2040 100%)',
      borderLeft: '4px solid #C2410C',
      borderRadius: '10px 10px 0 0',
      padding: '0.875rem 1.25rem',
    }}>
      <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
        {children}
      </h2>
    </div>
  );
}

function StarCard({ value, selected, onClick }) {
  const opt = STAR_OPTIONS.find(o => o.value === value);
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') onClick(Math.min(value + 1, 5));
        if (e.key === 'ArrowLeft')  onClick(Math.max(value - 1, 1));
      }}
       onFocus={e => e.currentTarget.style.outline = '3px solid #C2410C'}
  onBlur={e => e.currentTarget.style.outline = 'none'}
      aria-pressed={selected}
      aria-label={`${value} — ${opt.label}`}
      style={{
  flex: 1, minWidth: 0, padding: '0.6rem 0.25rem',
  border: selected ? `2px solid ${opt.color}` : '2px solid #CBD5E1',
  borderRadius: '8px',
  background: selected ? opt.bg : '#F8FAFC',
  cursor: 'pointer',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
  transition: 'all 0.15s',
}}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"
        style={{ fill: selected ? opt.color : '#CBD5E1', transition: 'fill 0.15s' }}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <span style={{
        fontSize: '0.68rem', fontWeight: 700, lineHeight: 1.2,
        textAlign: 'center', color: selected ? opt.color : '#64748B',
        whiteSpace: 'nowrap',
      }}>{opt.label}</span>
    </button>
  );
}

const inputBase = (hasError) => ({
  width: '100%', padding: '0.75rem 1rem',
  background: '#FFFFFF',
  border: `1.5px solid ${hasError ? '#DC2626' : '#CBD5E1'}`,
  borderRadius: '6px', color: '#0F172A',
  fontSize: '1rem', fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
});

function validate(data) {
  const errs = {};
  const isBelow = data.overall_quality === 'Below Average';

  if (!data.full_name.trim())
    errs.full_name = 'Full name is required.';

  if (!data.work_email.trim())
    errs.work_email = 'Work email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.work_email))
    errs.work_email = 'Please enter a valid work email address.';

  if (!data.overall_quality)
    errs.overall_quality = 'Please select an option to continue.';

  if (!isBelow) {
    RATING_QUESTIONS.forEach(q => {
      if (!data[q.field]) errs[q.field] = 'Please select a rating.';
    });
    if (!data.rating_accuracy)
      errs.rating_accuracy = 'Please select a score.';
    if (!data.nps_score)
      errs.nps_score = 'Please select a score.';
  }

  return errs;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function FeedbackForm() {
  const [data, setData]               = useState(INITIAL);
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isBelow      = data.overall_quality === 'Below Average';
  const showFullForm = ['Exceptional', 'Above Average', 'Average'].includes(data.overall_quality);

  function set(field, val) {
    setData(d => ({ ...d, [field]: val }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(data);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTimeout(() => {
        const el = document.querySelector('[data-error="true"]');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Submission failed. Please try again.');
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Thank you screen
  if (submitted) {
    return (
      <div className="page-wrapper">
        <AppHeader />
        <main id="main" style={{ padding: '3rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 16, padding: '3rem 2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#F0FDF4', border: '2px solid #15803D',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="#15803D" strokeWidth="2.5" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1 style={{ marginBottom: '0.75rem', color: '#0F172A' }}>
                Thank You, {data.full_name.split(' ')[0]}!
              </h1>
              <p style={{ color: '#475569', marginBottom: '0.5rem' }}>
                {isBelow
                  ? 'We sincerely appreciate you taking the time to share your experience with us. Your feedback is important, and we are committed to reviewing it carefully and making the necessary improvements.'
                  : 'Your feedback has been received. We truly value your time and input — it will definitely help us grow and serve you better.'}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '1rem' }}>
                — The SDET Tech Team
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <AppHeader />
      <main id="main" style={{ padding: '2rem 1rem 4rem', background: '#F4F6FB' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem', color: '#0F172A' }}>Share Your Feedback</h1>
            <p style={{ color: '#475569', fontSize: '0.9375rem' }}>
              Your experience matters to us — your feedback helps us serve you better.
            </p>
            <p style={{ color: '#C2410C', fontSize: '0.8125rem', marginTop: '0.35rem', fontWeight: 600 }}>
              * Required information
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-label="Client feedback form">

            {/* SECTION 1 — Details + Overall Quality */}
            <div style={{ marginBottom: '1.5rem', border: '1px solid #CBD5E1', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <SectionHeader>Your Details *</SectionHeader>
              <div style={{ background: '#FFFFFF', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                {/* Full Name */}
                <div data-error={!!errors.full_name}>
                  <label htmlFor="full_name" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem', color: '#1E293B' }}>
                    Full Name <span aria-hidden="true" style={{ color: '#C2410C' }}>*</span>
                  </label>
                  <input
                    id="full_name" type="text"
                    style={inputBase(!!errors.full_name)}
                    value={data.full_name}
                    onChange={e => set('full_name', e.target.value)}
                    placeholder="e.g. Jane Smith"
                    autoComplete="name"
                    required aria-required="true"
                    aria-describedby={errors.full_name ? 'err_full_name' : undefined}
                    onFocus={e => { e.target.style.borderColor = '#C2410C'; e.target.style.boxShadow = '0 0 0 3px rgba(194,65,12,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.full_name ? '#DC2626' : '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                  />
                  {errors.full_name && (
                    <p id="err_full_name" role="alert" style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.3rem', fontWeight: 600 }}>
                      ⚠ {errors.full_name}
                    </p>
                  )}
                </div>

                {/* Work Email */}
                <div data-error={!!errors.work_email}>
                  <label htmlFor="work_email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem', color: '#1E293B' }}>
                    Email <span aria-hidden="true" style={{ color: '#C2410C' }}>*</span>
                  </label>
                  <input
                    id="work_email" type="email"
                    style={inputBase(!!errors.work_email)}
                    value={data.work_email}
                    onChange={e => set('work_email', e.target.value)}
                    placeholder="e.g. jane@company.com"
                    autoComplete="email"
                    required aria-required="true"
                    aria-describedby={errors.work_email ? 'err_work_email' : undefined}
                    onFocus={e => { e.target.style.borderColor = '#C2410C'; e.target.style.boxShadow = '0 0 0 3px rgba(194,65,12,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.work_email ? '#DC2626' : '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                  />
                  {errors.work_email && (
                    <p id="err_work_email" role="alert" style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.3rem', fontWeight: 600 }}>
                      ⚠ {errors.work_email}
                    </p>
                  )}
                </div>

                {/* Overall Quality */}
                <div data-error={!!errors.overall_quality}>
                  <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9375rem', color: '#1E293B' }}>
                    How would you rate our software testing services overall?{' '}
                    <span aria-hidden="true" style={{ color: '#C2410C' }}>*</span>
                  </p>
                  <div role="group" aria-label="Overall quality rating"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    {QUALITY_OPTIONS.map(opt => {
                      const selected = data.overall_quality === opt.value;
                      return (
                        <button key={opt.value} type="button" aria-pressed={selected}
                          onClick={() => set('overall_quality', opt.value)}
                          style={{
                            padding: '0.875rem 0.5rem',
                            border: selected ? `2px solid ${opt.color}` : '2px solid #CBD5E1',
                            borderRadius: 10, background: selected ? opt.bg : '#F8FAFC',
                            cursor: 'pointer', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: '0.4rem',
                            transition: 'all 0.15s', outline: 'none',
                          }}>
                          <span style={{ fontSize: '1.5rem', lineHeight: 1 }} aria-hidden="true">{opt.icon}</span>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: selected ? opt.color : '#475569', textAlign: 'center', lineHeight: 1.3 }}>
                            {opt.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.overall_quality && (
                    <p role="alert" style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>
                      ⚠ {errors.overall_quality}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Below Average — sorry message */}
            {isBelow && (
              <div style={{
                marginBottom: '1.5rem', background: '#FFF7ED',
                border: '1px solid #FED7AA', borderLeft: '4px solid #C2410C',
                borderRadius: 10, padding: '1.5rem',
              }} role="note" aria-live="polite">
                <p style={{ fontWeight: 700, color: '#9A3412', marginBottom: '0.5rem', fontSize: '1rem' }}>
                  We're Sorry to Hear That
                </p>
                <p style={{ color: '#78350F', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  We sincerely apologise for not meeting your expectations. Your feedback is important to us and we are committed to reviewing it carefully and taking the appropriate steps to improve. We will follow up with you shortly.
                </p>
              </div>
            )}

            {/* Full form — shown for Exceptional, Above Average, Average */}
            {showFullForm && (
              <>
                {/* Q1–Q3 Star Ratings + Q4 Innovation 1-10 */}
                <div style={{ marginBottom: '1.5rem', border: '1px solid #CBD5E1', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <SectionHeader>How would you rate us on the following? *</SectionHeader>
                  <div style={{ background: '#FFFFFF' }}>

                    {/* Q1–Q3: Star rating questions */}
                    {RATING_QUESTIONS.map((q, idx) => (
                      <div key={q.field} data-error={!!errors[q.field]}
                        style={{
  display: 'flex', alignItems: 'flex-start', gap: '1rem',
  padding: '1.1rem 1.25rem',
  borderTop: idx > 0 ? '1px solid #E2E8F0' : 'none',
  flexDirection: 'column',
}}>
                        <div style={{ width: '100%' }}>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B', marginBottom: '2px' }}>
  {q.label.split(' ').slice(0, -1).join(' ')}{' '}
  <span style={{ whiteSpace: 'nowrap' }}>
    {q.label.split(' ').slice(-1)[0]}{' '}
    <span aria-hidden="true" style={{ color: '#C2410C' }}>*</span>
  </span>
</p>
                          <p style={{ fontSize: '0.775rem', color: '#64748B', lineHeight: 1.4 }}>{q.question}</p>
                          {errors[q.field] && (
                            <p role="alert" style={{ color: '#DC2626', fontSize: '0.775rem', marginTop: '0.25rem', fontWeight: 600 }}>
                              ⚠ {errors[q.field]}
                            </p>
                          )}
                        </div>
                        <div role="group" aria-label={`Rating for ${q.label}`}
  style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                          {STAR_OPTIONS.map(opt => (
                            <StarCard key={opt.value} value={opt.value}
                              selected={data[q.field] === opt.value}
                              onClick={v => set(q.field, v)} />
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Q4: Innovation and Solutioning — 1-10 scale */}
                    <div data-error={!!errors.rating_accuracy}
                      style={{
  display: 'flex', alignItems: 'flex-start', gap: '1rem',
  padding: '1.1rem 1.25rem',
  borderTop: '1px solid #E2E8F0',
  flexDirection: 'column',
}}
>
                      <div style={{ width: '100%' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B', marginBottom: '2px' }}>
                          Innovation and Solutioning <span aria-hidden="true" style={{ color: '#C2410C' }}>*</span>
                        </p>
                        <p style={{ fontSize: '0.775rem', color: '#64748B', lineHeight: 1.4 }}>
                          On a scale of 1–10, how do you rate our innovation and solutions that has impacted the outcomes in corresponding projects?
                        </p>
                        {errors.rating_accuracy && (
                          <p role="alert" style={{ color: '#DC2626', fontSize: '0.775rem', marginTop: '0.25rem', fontWeight: 600 }}>
                            ⚠ {errors.rating_accuracy}
                          </p>
                        )}
                      </div>
                      <div style={{ width: '100%' }}>
                        <div role="group" aria-label="Innovation and Solutioning score 1 to 10"
                          style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          {[1,2,3,4,5,6,7,8,9,10].map(n => {
                            const color    = n <= 4 ? '#DC2626' : n <= 7 ? '#D97706' : '#15803D';
                            const bg       = n <= 4 ? '#FEF2F2' : n <= 7 ? '#FFFBEB' : '#F0FDF4';
                            const selected = data.rating_accuracy === n;
                            return (
                              <button key={n} type="button"
                                onClick={() => set('rating_accuracy', n)}
                                onKeyDown={e => {
                                  if (e.key === 'ArrowRight') set('rating_accuracy', Math.min(n + 1, 10));
                                  if (e.key === 'ArrowLeft')  set('rating_accuracy', Math.max(n - 1, 1));
                                }}
                                aria-pressed={selected}
                                aria-label={`${n} — ${INNOVATION_LABELS[n]}`}
                                style={{
                                  width: 40, height: 40, borderRadius: 8,
                                  border: selected ? `2px solid ${color}` : '2px solid #CBD5E1',
                                  background: selected ? bg : '#F8FAFC',
                                  color: selected ? color : '#475569',
                                  fontWeight: 700, fontSize: '0.9rem',
                                  cursor: 'pointer', fontFamily: 'inherit',
                                  transition: 'all 0.15s',
                                }}
                              >{n}</button>
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B' }} aria-hidden="true">
                          <span>Not helpful</span><span>Extremely helpful</span>
                        </div>
                        {data.rating_accuracy > 0 && (
                          <p aria-live="polite" style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                            {INNOVATION_LABELS[data.rating_accuracy]}
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Recommendation */}
                <div style={{ marginBottom: '1.5rem', border: '1px solid #CBD5E1', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <SectionHeader>Recommendation *</SectionHeader>
                  <div style={{ background: '#FFFFFF', padding: '1.5rem' }} data-error={!!errors.nps_score}>
                    <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1E293B', marginBottom: '1.1rem' }}>
                      How likely are you to recommend our services to others?{' '}
                      <span aria-hidden="true" style={{ color: '#C2410C' }}>*</span>
                    </p>
                    <div role="group" aria-label="Likelihood to recommend, 1 to 10"
                      style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.5rem' }}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => {
                        const color    = n <= 6 ? '#DC2626' : n <= 8 ? '#D97706' : '#15803D';
                        const bg       = n <= 6 ? '#FEF2F2' : n <= 8 ? '#FFFBEB' : '#F0FDF4';
                        const selected = data.nps_score === n;
                        return (
                          <button key={n} type="button"
                            onClick={() => set('nps_score', n)}
                            onKeyDown={e => {
                              if (e.key === 'ArrowRight') set('nps_score', Math.min(n + 1, 10));
                              if (e.key === 'ArrowLeft')  set('nps_score', Math.max(n - 1, 1));
                            }}
                            aria-pressed={selected}
                            aria-label={`${n} — ${NPS_LABELS[n]}`}
                            style={{
                              width: 48, height: 48, borderRadius: 8,
                              border: selected ? `2px solid ${color}` : '2px solid #CBD5E1',
                              background: selected ? bg : '#F8FAFC',
                              color: selected ? color : '#475569',
                              fontWeight: 700, fontSize: '1rem',
                              cursor: 'pointer', fontFamily: 'inherit',
                              transition: 'all 0.15s',
                            }}
                          >{n}</button>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', padding: '0 4px' }} aria-hidden="true">
                      <span>Not at all likely</span><span>Extremely likely</span>
                    </div>
                    {data.nps_score > 0 && (
                      <p aria-live="polite" style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>
                        {NPS_LABELS[data.nps_score]}
                      </p>
                    )}
                    {errors.nps_score && (
                      <p role="alert" style={{ color: '#DC2626', fontSize: '0.8125rem', marginTop: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
                        ⚠ {errors.nps_score}
                      </p>
                    )}
                  </div>
                </div>

                {/* Improvement Suggestions */}
                <div style={{ marginBottom: '2rem', border: '1px solid #CBD5E1', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <SectionHeader>Improvement Suggestions</SectionHeader>
                  <div style={{ background: '#FFFFFF', padding: '1.5rem' }}>
                    <label htmlFor="improvement_area" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: '#1E293B' }}>
                      Is there anything that you want us to focus on to serve you better?{' '}
                      <span style={{ color: '#64748B', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <textarea
                      id="improvement_area"
                      value={data.improvement_area}
                      onChange={e => set('improvement_area', e.target.value)}
                      placeholder="Share any thoughts or suggestions..."
                      maxLength={1000}
                      style={{ ...inputBase(false), minHeight: 110, resize: 'vertical', lineHeight: 1.6 }}
                      onFocus={e => { e.target.style.borderColor = '#C2410C'; e.target.style.boxShadow = '0 0 0 3px rgba(194,65,12,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>
  {data.improvement_area.length}/1000
</p>
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            {data.overall_quality && (
              <>
                {submitError && (
                  <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#DC2626', fontSize: '0.9rem', fontWeight: 600 }}>
                    ⚠ {submitError}
                  </div>
                )}
                <button type="submit" disabled={submitting}
                  style={{
                    width: '100%', padding: '0.9rem',
                    background: '#C2410C', color: '#fff',
                    border: 'none', borderRadius: 8,
                    fontSize: '1.0625rem', fontWeight: 700, fontFamily: 'inherit',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.8 : 1,
                    transition: 'background 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 12px rgba(194,65,12,0.3)',
                  }}>
                  {submitting
                    ? <><span className="spinner" aria-hidden="true" style={{ marginRight: 8 }} />Submitting…</>
                    : 'Submit Feedback →'}
                </button>
              </>
            )}

          </form>
        </div>
      </main>
    </div>
  );
}