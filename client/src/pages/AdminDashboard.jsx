import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/sdet_logo.png';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = (path, opts = {}) => {
  const token = localStorage.getItem('sdet_admin_token');
  return fetch(`${API_BASE}/api/admin${path}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
};

const QUALITY_COLORS = {
  'Exceptional':   { bg: '#F0FDF4', color: '#15803D' },
  'Above Average': { bg: '#F7FEE7', color: '#65A30D' },
  'Average':       { bg: '#FFFBEB', color: '#D97706' },
  'Below Average': { bg: '#FEF2F2', color: '#DC2626' },
};

function StatCard({ value, label, accent = false }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0',
      borderRadius: 12, padding: '1.25rem', textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      borderTop: accent ? '3px solid #C2410C' : '3px solid #E2E8F0',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#C2410C' }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function RatingPill({ v, max = 5 }) {
  if (v == null) return <span style={{ color: '#CBD5E1', fontSize: '0.8rem' }}>N/A</span>;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: '#FFF7ED', padding: '2px 8px', borderRadius: 4,
      fontWeight: 700, fontSize: '0.875rem',
      border: '1px solid #FED7AA', color: '#9A3412',
    }}>
      <span aria-hidden="true" style={{ color: '#D97706' }}>★</span>{v}/{max}
    </span>
  );
}

function QualityBadge({ value }) {
  if (!value) return null;
  const style = QUALITY_COLORS[value] || { bg: '#F1F5F9', color: '#475569' };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '2px 8px', borderRadius: 999,
      fontSize: '0.75rem', fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>{value}</span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('sdet_admin_user') || '{}');

  const [view, setView]           = useState('dashboard');
  const [stats, setStats]         = useState(null);
  const [feedback, setFeedback]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [sort, setSort]           = useState('submitted_at');
  const [order, setOrder]         = useState('DESC');
  const [loading, setLoading]     = useState(true);
  const LIMIT = 15;

  const [admins, setAdmins]             = useState([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin]         = useState({ name: '', email: '', password: '', role: 'admin' });
  const [adminMsg, setAdminMsg]         = useState('');
  const [adminErr, setAdminErr]         = useState('');

  const loadStats = useCallback(async () => {
    const r = await API('/stats');
    if (r.ok) setStats(await r.json());
  }, []);

  const loadAdmins = useCallback(async () => {
    if (user.role !== 'superadmin') return;
    const r = await API('/admins');
    if (r.ok) setAdmins(await r.json());
  }, [user.role]);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    const r = await API(`/feedback?page=${page}&limit=${LIMIT}&sort=${sort}&order=${order}`);
    if (r.status === 401) { navigate('/admin/login'); return; }
    if (r.ok) { const d = await r.json(); setFeedback(d.data); setTotal(d.total); }
    setLoading(false);
  }, [page, sort, order, navigate]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (view === 'feedback') loadFeedback(); }, [view, loadFeedback]);
  useEffect(() => { if (view === 'admins') loadAdmins(); }, [view, loadAdmins]);

  function logout() {
    localStorage.removeItem('sdet_admin_token');
    localStorage.removeItem('sdet_admin_user');
    navigate('/admin/login');
  }

  function toggleSort(field) {
    if (sort === field) setOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSort(field); setOrder('DESC'); }
    setPage(1);
  }

  async function handleExport() {
    const token = localStorage.getItem('sdet_admin_token');
    const res = await fetch(`${API_BASE}/api/admin/export`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sdet_feedback_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleAddAdmin(e) {
    e.preventDefault(); setAdminErr(''); setAdminMsg('');
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      setAdminErr('All fields are required.'); return;
    }
    const res = await API('/admins', { method: 'POST', body: JSON.stringify(newAdmin) });
    const d   = await res.json();
    if (!res.ok) { setAdminErr(d.error); return; }
    setAdminMsg('Admin created successfully.');
    setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
    setShowAddAdmin(false);
    loadAdmins();
  }

  async function handleDeleteAdmin(id) {
    if (!window.confirm('Are you sure you want to delete this admin user?')) return;
    await API(`/admins/${id}`, { method: 'DELETE' });
    loadAdmins();
  }

  const navItems = [
    { id: 'dashboard', label: '📊 Overview' },
    { id: 'feedback',  label: '💬 Feedback' },
    ...(user.role === 'superadmin' ? [{ id: 'admins', label: '👥 Admins' }] : []),
  ];

  const thStyle = {
    padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600,
    color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase',
    letterSpacing: '0.04em', borderBottom: '2px solid #E2E8F0',
    whiteSpace: 'nowrap', userSelect: 'none',
  };

  const SortTh = ({ field, children }) => (
    <th onClick={() => toggleSort(field)}
      style={{ ...thStyle, cursor: 'pointer', color: sort === field ? '#C2410C' : '#64748B' }}
      aria-sort={sort === field ? (order === 'ASC' ? 'ascending' : 'descending') : 'none'}
      scope="col">
      {children}
      <span aria-hidden="true" style={{ marginLeft: 4, opacity: sort === field ? 1 : 0.4 }}>
        {sort === field ? (order === 'ASC' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  );

  const inputStyle = {
    width: '100%', padding: '0.7rem 0.9rem',
    background: '#fff', border: '1.5px solid #CBD5E1',
    borderRadius: 6, color: '#0F172A',
    fontSize: '0.9375rem', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const btnOutline = {
    padding: '0.5rem 1.25rem', background: '#fff',
    color: '#C2410C', border: '1.5px solid #C2410C',
    borderRadius: 6, fontWeight: 600, fontSize: '0.875rem',
    fontFamily: 'inherit', cursor: 'pointer',
  };

  const tdStyle = { padding: '0.875rem 1rem', borderTop: '1px solid #F1F5F9' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6FB' }}>

      {/* Sidebar */}
      <nav style={{
        width: 240, flexShrink: 0, background: '#fff',
        borderRight: '1px solid #E2E8F0', display: 'flex',
        flexDirection: 'column', boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      }} aria-label="Admin navigation">
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #E2E8F0', marginBottom: '0.5rem' }}>
          <img src={logo} alt="SDET Tech" style={{ height: 36 }} />
        </div>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setView(item.id)}
            aria-current={view === item.id ? 'page' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.7rem 1.25rem',
              background: view === item.id ? 'rgba(194,65,12,0.07)' : 'none',
              color: view === item.id ? '#C2410C' : '#475569',
              border: 'none',
              borderRight: view === item.id ? '3px solid #C2410C' : '3px solid transparent',
              fontWeight: view === item.id ? 700 : 500,
              fontSize: '0.9375rem', fontFamily: 'inherit',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.15s',
            }}>{item.label}</button>
        ))}
        <div style={{ marginTop: 'auto', padding: '1rem 1.25rem', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>{user.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'capitalize', marginBottom: '0.75rem' }}>{user.role}</div>
          <button onClick={logout} style={{
            width: '100%', padding: '0.5rem', background: '#F1F4F9',
            color: '#475569', border: '1px solid #E2E8F0', borderRadius: 6,
            fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
          }}>Sign Out</button>
        </div>
      </nav>

      {/* Main */}
      <main id="main" style={{ flex: 1, overflow: 'auto', padding: '2rem', background: '#F4F6FB' }}>

        {/* OVERVIEW */}
        {view === 'dashboard' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ fontSize: '1.5rem', color: '#0F172A' }}>Overview</h1>
              <button onClick={handleExport} style={btnOutline}>↓ Export CSV</button>
            </div>
            {stats ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <StatCard value={stats.total}               label="Total Responses"       accent />
                  <StatCard value={stats.avg_overall}         label="Overall Score (avg)" />
                  <StatCard value={stats.avg_nps}             label="Avg Recommendation Score" />
                  <StatCard value={stats.below_average_count} label="Below Average Ratings" />
                  <StatCard value={stats.duplicates}          label="Duplicate Submissions" />
                </div>
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '1.25rem', color: '#0F172A' }}>Category Averages</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem' }}>
                    <StatCard value={stats.avg_scope}         label="Testing Scope" />
                    <StatCard value={stats.avg_communication} label="Communication" />
                    <StatCard value={stats.avg_delivery}      label="Timely Delivery" />
                    <StatCard value={stats.avg_accuracy}      label="Accuracy & Quality" />
                    <StatCard value={stats.avg_ownership}     label="Ownership" />
                  </div>
                </div>
              </>
            ) : <p style={{ color: '#64748B' }}>Loading stats…</p>}
          </>
        )}

        {/* FEEDBACK TABLE */}
        {view === 'feedback' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ fontSize: '1.5rem', color: '#0F172A' }}>
                All Feedback{' '}
                <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 400 }}>({total} responses)</span>
              </h1>
              <button onClick={handleExport} style={btnOutline}>↓ Export CSV</button>
            </div>
            {loading ? <p style={{ color: '#64748B' }}>Loading…</p> : (
              <>
                <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 900 }} aria-label="Client feedback submissions">
                    <thead style={{ background: '#F8FAFC' }}>
                      <tr>
                        <SortTh field="full_name">Name</SortTh>
                        <th scope="col" style={thStyle}>Email</th>
                        <SortTh field="overall_quality">Overall Quality</SortTh>
                        <th scope="col" style={thStyle}>Scope</th>
                        <th scope="col" style={thStyle}>Comm.</th>
                        <th scope="col" style={thStyle}>Delivery</th>
                        <th scope="col" style={thStyle}>Accuracy</th>
                        <th scope="col" style={thStyle}>Ownership</th>
                        <SortTh field="nps_score">Rec.Score</SortTh>
                        <th scope="col" style={thStyle}>Improvement</th>
                        <th scope="col" style={thStyle}>Status</th>
                        <SortTh field="submitted_at">Date</SortTh>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.length === 0 ? (
                        <tr><td colSpan="12" style={{ textAlign: 'center', color: '#94A3B8', padding: '3rem' }}>No submissions yet.</td></tr>
                      ) : feedback.map(row => (
                        <tr key={row.id}>
                          <td style={{ ...tdStyle, color: '#0F172A' }}><strong>{row.full_name}</strong></td>
                          <td style={{ ...tdStyle, color: '#475569', fontSize: '0.8125rem' }}>{row.work_email}</td>
                          <td style={tdStyle}><QualityBadge value={row.overall_quality} /></td>
                          <td style={tdStyle}><RatingPill v={row.rating_scope} /></td>
                          <td style={tdStyle}><RatingPill v={row.rating_communication} /></td>
                          <td style={tdStyle}><RatingPill v={row.rating_delivery} /></td>
                          <td style={tdStyle}><RatingPill v={row.rating_accuracy} /></td>
                          <td style={tdStyle}><RatingPill v={row.rating_ownership} /></td>
                          <td style={tdStyle}><RatingPill v={row.nps_score} max={10} /></td>
                          <td style={{ ...tdStyle, maxWidth: 200 }}>
                            {row.improvement_area
                              ? <span style={{ fontStyle: 'italic', color: '#64748B', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.improvement_area}>{row.improvement_area}</span>
                              : <span style={{ color: '#CBD5E1' }}>—</span>}
                          </td>
                          <td style={tdStyle}>
                            {row.is_duplicate
                              ? <span style={{ background: '#FEF9C3', color: '#854D0E', padding: '2px 8px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 }}>Duplicate</span>
                              : <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 }}>Unique</span>}
                          </td>
                          <td style={{ ...tdStyle, fontSize: '0.8125rem', color: '#475569', whiteSpace: 'nowrap' }}>
                            {new Date(row.submitted_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {total > LIMIT && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem', background: '#fff', borderTop: '1px solid #E2E8F0', borderRadius: '0 0 12px 12px', fontSize: '0.875rem', color: '#64748B' }}>
                    <span style={{ marginRight: 'auto' }}>Showing {(page-1)*LIMIT+1}–{Math.min(page*LIMIT, total)} of {total}</span>
                    <button onClick={() => setPage(p => p-1)} disabled={page === 1}
                      style={{ padding: '0.4rem 0.9rem', border: '1px solid #E2E8F0', background: '#fff', borderRadius: 6, cursor: page===1?'not-allowed':'pointer', color: '#475569', fontFamily: 'inherit', opacity: page===1?0.4:1 }}>← Prev</button>
                    <span>Page {page} of {Math.ceil(total/LIMIT)}</span>
                    <button onClick={() => setPage(p => p+1)} disabled={page*LIMIT >= total}
                      style={{ padding: '0.4rem 0.9rem', border: '1px solid #E2E8F0', background: '#fff', borderRadius: 6, cursor: page*LIMIT>=total?'not-allowed':'pointer', color: '#475569', fontFamily: 'inherit', opacity: page*LIMIT>=total?0.4:1 }}>Next →</button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ADMIN MANAGEMENT */}
        {view === 'admins' && user.role === 'superadmin' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ fontSize: '1.5rem', color: '#0F172A' }}>Manage Admins</h1>
              <button onClick={() => setShowAddAdmin(true)}
                style={{ padding: '0.5rem 1.25rem', background: '#C2410C', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                + Add Admin
              </button>
            </div>

            {adminMsg && <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:6, padding:'0.75rem 1rem', marginBottom:'1rem', color:'#15803D', fontWeight:600 }}>{adminMsg}</div>}
            {adminErr && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:6, padding:'0.75rem 1rem', marginBottom:'1rem', color:'#DC2626', fontWeight:600 }}>⚠ {adminErr}</div>}

            <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }} aria-label="Admin users">
                <thead style={{ background: '#F8FAFC' }}>
                  <tr>
                    {['Name', 'Email', 'Role', 'Last Login', 'Created', 'Actions'].map(h => (
                      <th key={h} scope="col" style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admins.map(a => (
                    <tr key={a.id}>
                      <td style={{ ...tdStyle, color: '#0F172A' }}>
                        <strong>{a.name}</strong>
                        {a.id === user.id && <span style={{ background:'#DCFCE7', color:'#166534', padding:'1px 6px', borderRadius:999, fontSize:'0.7rem', fontWeight:600, marginLeft:6 }}>You</span>}
                      </td>
                      <td style={{ ...tdStyle, color: '#475569' }}>{a.email}</td>
                      <td style={tdStyle}>
                        <span style={{ background: a.role==='superadmin'?'#FEF9C3':'#EFF6FF', color: a.role==='superadmin'?'#854D0E':'#1D4ED8', padding:'2px 8px', borderRadius:999, fontSize:'0.75rem', fontWeight:600 }}>
                          {a.role}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#64748B', fontSize: '0.8125rem' }}>
                        {a.last_login ? new Date(a.last_login).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                      </td>
                      <td style={{ ...tdStyle, color: '#64748B', fontSize: '0.8125rem' }}>
                        {new Date(a.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td style={tdStyle}>
                        {a.id !== user.id && (
                          <button onClick={() => handleDeleteAdmin(a.id)}
                            style={{ padding:'0.35rem 0.75rem', background:'#FEE2E2', color:'#991B1B', border:'1px solid #FECACA', borderRadius:6, fontSize:'0.8125rem', fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Admin Modal */}
            {showAddAdmin && (
              <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}
                role="dialog" aria-modal="true" aria-labelledby="modal_title">
                <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:'2rem', width:'100%', maxWidth:440, boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
                    <h2 id="modal_title" style={{ fontSize:'1.125rem', fontWeight:700, color:'#0F172A' }}>Add New Admin</h2>
                    <button onClick={() => setShowAddAdmin(false)} aria-label="Close dialog"
                      style={{ background:'none', border:'none', fontSize:'1.5rem', color:'#94A3B8', cursor:'pointer', lineHeight:1 }}>×</button>
                  </div>
                  <form onSubmit={handleAddAdmin} noValidate>
                    {[
                      { f:'name',     l:'Name',     t:'text'     },
                      { f:'email',    l:'Email',    t:'email'    },
                      { f:'password', l:'Password', t:'password' },
                    ].map(({ f, l, t }) => (
                      <div key={f} style={{ marginBottom: '1rem' }}>
                        <label htmlFor={`new_${f}`} style={{ display:'block', fontWeight:600, marginBottom:'0.35rem', fontSize:'0.9rem', color:'#1E293B' }}>{l}</label>
                        <input id={`new_${f}`} type={t} style={inputStyle}
                          value={newAdmin[f]}
                          onChange={e => setNewAdmin(a => ({ ...a, [f]: e.target.value }))}
                          required />
                      </div>
                    ))}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label htmlFor="new_role" style={{ display:'block', fontWeight:600, marginBottom:'0.35rem', fontSize:'0.9rem', color:'#1E293B' }}>Role</label>
                      <select id="new_role" style={inputStyle} value={newAdmin.role}
                        onChange={e => setNewAdmin(a => ({ ...a, role: e.target.value }))}>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>
                    {adminErr && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:6, padding:'0.6rem 0.9rem', marginBottom:'1rem', color:'#DC2626', fontSize:'0.875rem', fontWeight:600 }}>⚠ {adminErr}</div>}
                    <div style={{ display:'flex', gap:'0.75rem' }}>
                      <button type="button" onClick={() => setShowAddAdmin(false)}
                        style={{ flex:1, padding:'0.75rem', background:'#F1F4F9', color:'#475569', border:'1px solid #E2E8F0', borderRadius:8, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>
                        Cancel
                      </button>
                      <button type="submit"
                        style={{ flex:1, padding:'0.75rem', background:'#C2410C', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>
                        Create Admin
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}