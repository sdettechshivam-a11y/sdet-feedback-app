import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/sdet_logo.png';

export default function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('sdet_admin_token', data.token);
      localStorage.setItem('sdet_admin_user', JSON.stringify(data.admin));
      navigate('/admin');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    background: '#fff', border: '1.5px solid #CBD5E1',
    borderRadius: '6px', color: '#0F172A',
    fontSize: '1rem', fontFamily: 'inherit',
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', display: 'flex', flexDirection: 'column' }}>
      <main id="main" style={{ flex: 1, padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 420, width: '100%' }}>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src={logo} alt="SDET Tech" style={{ height: 52 }} />
          </div>

          <div style={{ background: '#fff', border: '1px solid #CBD5E1', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.25rem', color: '#0F172A' }}>
              Admin Login
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#475569', textAlign: 'center', marginBottom: '1.5rem' }}>
              Sign in to view and manage client feedback
            </p>

            {error && (
              <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#DC2626', fontSize: '0.9rem', fontWeight: 600 }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="admin_email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem', color: '#1E293B' }}>
                  Email Address
                </label>
                <input id="admin_email" type="email" style={inputStyle}
                  value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email" required aria-required="true"
                  placeholder="admin@sdettech.com"
                  onFocus={e => { e.target.style.borderColor = '#C2410C'; e.target.style.boxShadow = '0 0 0 3px rgba(194,65,12,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="admin_password" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem', color: '#1E293B' }}>
                  Password
                </label>
                <input id="admin_password" type="password" style={inputStyle}
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" required aria-required="true"
                  placeholder="••••••••"
                  onFocus={e => { e.target.style.borderColor = '#C2410C'; e.target.style.boxShadow = '0 0 0 3px rgba(194,65,12,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '0.8rem',
                  background: loading ? '#9A3412' : '#C2410C',
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontSize: '1rem', fontWeight: 700, fontFamily: 'inherit',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(194,65,12,0.25)',
                  transition: 'background 0.2s',
                }}>
                {loading
                  ? <><span className="spinner" aria-hidden="true" style={{ marginRight: 8 }} />Signing in…</>
                  : 'Sign In'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748B' }}>
            <a href="/" style={{ color: '#C2410C', fontWeight: 500 }}>← Back to Feedback Form</a>
          </p>
        </div>
      </main>
    </div>
  );
}