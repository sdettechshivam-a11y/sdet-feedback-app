import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import logo from "../assets/sdet_logo.png";

const API = (path, opts = {}) => {
  const token = localStorage.getItem("sdet_admin_token");
  return fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
};

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [delId, setDelId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSub] = useState(false);
  const [error, setError] = useState("");
  const me = JSON.parse(localStorage.getItem("sdet_admin_user") || "{}");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await API("/api/auth/admins");
      if (res.status === 401) { navigate("/admin/login"); return; }
      const json = await res.json();
      setAdmins(json.admins || []);
    } catch { setError("Failed to load admins."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email.";
    if (!form.password)     e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    return e;
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setSub(true); setError("");
    try {
      const res  = await API("/api/auth/admins", { method: "POST", body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setShowAdd(false); setForm({ name: "", email: "", password: "", role: "admin" });
      load();
    } catch (err) { setError(err.message); }
    finally { setSub(false); }
  };

  const deleteAdmin = async () => {
    try {
      await API(`/api/auth/admins/${delId}`, { method: "DELETE" });
      setDelId(null); load();
    } catch { alert("Delete failed."); }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div className="page-wrapper">
      <header className="admin-header" role="banner">
        <div className="admin-header-left">
          <img src={logo} alt="SDET Tech" className="header-logo" />
          <div className="header-divider" aria-hidden="true" />
          <nav className="admin-nav" aria-label="Admin navigation">
            <NavLink to="/admin"        className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`} end>Dashboard</NavLink>
            <NavLink to="/admin/manage" className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}>Manage Admins</NavLink>
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{me.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <main id="main-content" className="admin-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Manage Admins</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Admin</button>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {loading ? (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: 40 }}>Loading…</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Created</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{a.email}</td>
                    <td>
                      <span className={`badge ${a.role === "superadmin" ? "badge-warn" : "badge-ok"}`}>
                        {a.role}
                      </span>
                    </td>
                    <td style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {a.id !== me.id && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDelId(a.id)}
                          aria-label={`Delete admin ${a.name}`}
                        >Delete</button>
                      )}
                      {a.id === me.id && <span style={{ fontSize: "0.8125rem", color: "var(--color-text-dim)" }}>You</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add Admin Modal */}
      {showAdd && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-title"
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}
        >
          <div className="modal">
            <h2 id="add-title" className="modal-title">Add New Admin</h2>
            <form onSubmit={addAdmin} noValidate>
              {[
                { id: "a-name", label: "Full Name", type: "text", key: "name", auto: "name" },
                { id: "a-email", label: "Email Address", type: "email", key: "email", auto: "off" },
                { id: "a-pass", label: "Password", type: "password", key: "password", auto: "new-password" },
              ].map(({ id, label, type, key, auto }) => (
                <div className="form-group" key={key}>
                  <label className="form-label" htmlFor={id}>
                    {label} <span aria-label="required" style={{ color: "var(--color-accent)" }}>*</span>
                  </label>
                  <input
                    id={id} type={type}
                    className={`form-input${formErrors[key] ? " error" : ""}`}
                    value={form[key]}
                    onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setFormErrors(f => ({ ...f, [key]: "" })); }}
                    autoComplete={auto}
                    aria-required="true"
                    aria-invalid={!!formErrors[key]}
                    aria-describedby={formErrors[key] ? `err-${key}` : undefined}
                  />
                  {formErrors[key] && <p id={`err-${key}`} className="field-error" role="alert">{formErrors[key]}</p>}
                </div>
              ))}
              <div className="form-group">
                <label className="form-label" htmlFor="a-role">Role</label>
                <select
                  id="a-role"
                  className="form-input"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  style={{ appearance: "none" }}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting}>
                  {submitting ? <><span className="spinner" aria-hidden="true" /> Adding…</> : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delId && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="del-admin-title">
          <div className="modal">
            <h2 id="del-admin-title" className="modal-title">Remove Admin</h2>
            <p style={{ color: "var(--color-text-muted)" }}>Are you sure you want to remove this admin? They will lose all access.</p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={deleteAdmin} autoFocus>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
