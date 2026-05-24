import { useState, useEffect } from "react";
import Badge from "../components/Badge";
import store from "../store";
import kevalonLogo from "../assets/kevalon-logo.png";
import { whatsappLink, mailtoLink, msgApproved, msgRejected, msgCertApproved, emailApproved } from "../utils/notifications";

const TABS = ["requests", "analytics"];

export default function AdminPanel({ onNavigate }) {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("requests");
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("kvl_dark") === "1");

  // View modal
  const [viewRecord, setViewRecord] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({});

  // Approve flow: step 1 = show date picker, step 2 = confirm
  const [approveTarget, setApproveTarget] = useState(null); // token
  const [offerLetterDate, setOfferLetterDate] = useState("");
  const [approveStep, setApproveStep] = useState(1); // 1=initial view, 2=date picker shown

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const refresh = () => {
    setRequests([...store.getAll()].reverse());
    setAnalytics(store.getAnalytics());
  };

  const login = () => {
    if (pwd === "admin123") { setAuthed(true); refresh(); }
    else setPwdErr("Incorrect password. Please try again.");
  };

  // Open view modal
  const openView = (req) => {
    setViewRecord(req);
    setApproveTarget(null);
    setApproveStep(1);
    setOfferLetterDate("");
    setEditMode(false);
    setEditFields({});
  };
  const closeView = () => {
    setViewRecord(null);
    setApproveTarget(null);
    setApproveStep(1);
    setEditMode(false);
    setEditFields({});
  };

  // Edit mode
  const startEdit = () => {
    setEditFields({ ...viewRecord });
    setEditMode(true);
  };
  const saveEdit = () => {
    const all = store.requests;
    const token = viewRecord.token;
    if (all[token]) {
      // Use store update for pending, or force-update for admin
      const updated = { ...all[token], ...editFields };
      const ls = JSON.parse(localStorage.getItem("kvl_requests") || "{}");
      ls[token] = updated;
      localStorage.setItem("kvl_requests", JSON.stringify(ls));
    }
    refresh();
    const updated = store.get(viewRecord.token);
    setViewRecord(updated);
    setEditMode(false);
  };

  // Reset to pending
  const resetToPending = (token) => {
    store.resetToPending(token);
    refresh();
    setViewRecord(store.get(token));
    setApproveTarget(null);
    setApproveStep(1);
  };

  // Approve flow: click Approve → show date picker → Confirm Approval → done
  const startApprove = (token) => {
    setApproveTarget(token);
    setApproveStep(2);
    setOfferLetterDate(new Date().toISOString().split("T")[0]);
  };
  const confirmApprove = () => {
    store.approve(approveTarget, offerLetterDate);
    refresh();
    closeView();
  };

  // Reject
  const openReject = (token) => { setRejectTarget(token); setRejectReason(""); };
  const confirmReject = () => {
    if (!rejectReason.trim()) return;
    store.reject(rejectTarget, rejectReason);
    refresh(); closeView(); setRejectTarget(null); setRejectReason("");
  };

  // Delete
  const deleteRecord = (token) => {
    if (!window.confirm("Delete this application permanently?")) return;
    store.deleteRecord(token);
    refresh(); closeView();
  };

  const approveCert = (token) => { store.approveCertificate(token); refresh(); };
  const openRejectCert = (token) => { setRejectTarget("cert:" + token); setRejectReason(""); };
  const confirmRejectCert = () => {
    if (!rejectReason.trim()) return;
    const token = rejectTarget.replace("cert:", "");
    store.rejectCertificate(token, rejectReason);
    refresh(); setRejectTarget(null); setRejectReason("");
  };

  const toggleSelect = (token) => {
    setSelectedTokens(prev => prev.includes(token) ? prev.filter(t => t !== token) : [...prev, token]);
  };
  const selectAll = () => {
    const pendingTokens = filtered.filter(r => r.status === "pending").map(r => r.token);
    setSelectedTokens(pendingTokens);
  };
  const clearSelect = () => setSelectedTokens([]);

  const doBulk = () => {
    if (!selectedTokens.length) return;
    if (bulkAction === "approve") { store.bulkApprove(selectedTokens); }
    else if (bulkAction === "reject") {
      const reason = prompt("Enter rejection reason for bulk reject:") || "Bulk rejected by admin";
      store.bulkReject(selectedTokens, reason);
    }
    setSelectedTokens([]); setBulkAction(""); refresh();
  };

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("kvl_dark", next ? "1" : "0");
  };

  const filtered = filter === "all" ? requests
    : filter === "cert_pending" ? requests.filter(r => r.certStatus === "pending")
    : requests.filter(r => r.status === filter);

  const counts = {
    all:          requests.length,
    pending:      requests.filter(r => r.status === "pending").length,
    approved:     requests.filter(r => r.status === "approved").length,
    rejected:     requests.filter(r => r.status === "rejected").length,
    cert_pending: requests.filter(r => r.certStatus === "pending").length,
  };

  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const card = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const text = darkMode ? "#f1f5f9" : "#0f172a";
  const sub = darkMode ? "#94a3b8" : "#64748b";

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a1a3c,#0d2d6b)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "48px 40px", maxWidth: 400, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#1a56db,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(26,86,219,0.35)" }}>
            <img src={kevalonLogo} alt="Kevalon" style={{ width: 44, height: 44, objectFit: "contain" }} />
          </div>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Admin Login</h2>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Kevalon Technology HR Portal</p>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
          <input type="password" value={pwd} onChange={e => { setPwd(e.target.value); setPwdErr(""); }} onKeyDown={e => e.key === "Enter" && login()} placeholder="Enter admin password"
            style={{ display: "block", width: "100%", padding: "13px 16px", borderRadius: 10, border: `2px solid ${pwdErr ? "#fca5a5" : "#e2e8f0"}`, fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
            onFocus={e => { e.target.style.borderColor = "#1a56db"; }} onBlur={e => { e.target.style.borderColor = pwdErr ? "#fca5a5" : "#e2e8f0"; }}
          />
          {pwdErr && <p style={{ fontSize: 12, color: "#dc2626", margin: "6px 0 0" }}>{pwdErr}</p>}
        </div>
        <button onClick={login} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#1a56db,#0ea5e9)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 16px rgba(26,86,219,0.3)" }}>
          🔓 Login to Admin Panel
        </button>
        <button onClick={() => onNavigate && onNavigate("home")} style={{ display: "block", width: "100%", marginTop: 12, padding: "11px", background: "transparent", border: "1px solid #e2e8f0", borderRadius: 10, color: "#64748b", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
          ← Back to Portal
        </button>
      </div>
    </div>
  );

  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN") : "";

  return (
    <div style={{ minHeight: "100vh", background: bg, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0a1a3c,#0d2d6b)", padding: "20px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 2px" }}>Admin Panel</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>Kevalon Technology HR Portal</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => onNavigate && onNavigate("home")} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              ← Back
            </button>
            <button onClick={toggleDark} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, cursor: "pointer" }}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button onClick={refresh} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              ↻ Refresh
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ maxWidth: 1100, margin: "16px auto 0", display: "flex", gap: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: tab === t ? "#fff" : "transparent", color: tab === t ? "#0f172a" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: tab === t ? 700 : 400, cursor: "pointer", textTransform: "capitalize" }}>
              {t === "requests" ? "📋 Requests" : "📊 Analytics"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px" }}>

        {tab === "analytics" && analytics && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16 }}>
              {[
                { label: "Total",         val: analytics.total,        color: "#1a56db", icon: "📋" },
                { label: "Pending",       val: analytics.pending,      color: "#b45309", icon: "⏳" },
                { label: "Approved",      val: analytics.approved,     color: "#065f46", icon: "✅" },
                { label: "Rejected",      val: analytics.rejected,     color: "#991b1b", icon: "❌" },
                { label: "Cert Pending",  val: analytics.certPending,  color: "#7c3aed", icon: "🎓" },
                { label: "Cert Issued",   val: analytics.certApproved, color: "#0891b2", icon: "🏆" },
              ].map(s => (
                <div key={s.label} style={{ background: card, borderRadius: 14, padding: "20px", border: `1px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: sub, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Approval rate bar */}
            {analytics.total > 0 && (
              <div style={{ background: card, borderRadius: 16, padding: "24px", border: `1px solid ${border}` }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: text, marginBottom: 16 }}>Approval Rate</div>
                <div style={{ height: 12, background: border, borderRadius: 6, overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${(analytics.approved / analytics.total) * 100}%`, background: "linear-gradient(90deg,#10b981,#34d399)", transition: "width 0.5s" }} />
                  <div style={{ width: `${(analytics.rejected / analytics.total) * 100}%`, background: "linear-gradient(90deg,#ef4444,#fca5a5)" }} />
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 10, fontSize: 12, color: sub }}>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>✅ Approved: {Math.round((analytics.approved / analytics.total) * 100)}%</span>
                  <span style={{ color: "#ef4444", fontWeight: 600 }}>❌ Rejected: {Math.round((analytics.rejected / analytics.total) * 100)}%</span>
                  <span style={{ color: "#f59e0b", fontWeight: 600 }}>⏳ Pending: {Math.round((analytics.pending / analytics.total) * 100)}%</span>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[
                { title: "Top Technologies", data: analytics.topTech, icon: "💻" },
                { title: "Top Colleges", data: analytics.topColleges, icon: "🎓" },
                { title: "Top Branches", data: analytics.topBranches, icon: "🏫" },
              ].map(({ title, data, icon }) => (
                <div key={title} style={{ background: card, borderRadius: 16, padding: "20px", border: `1px solid ${border}` }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: text, marginBottom: 14 }}>{icon} {title}</div>
                  {data.length === 0 ? <div style={{ color: sub, fontSize: 13 }}>No data yet</div> : data.map(([name, count], i) => (
                    <div key={name} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: text, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{name}</span>
                        <span style={{ fontSize: 12, color: "#1a56db", fontWeight: 700 }}>{count}</span>
                      </div>
                      <div style={{ height: 4, background: border, borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${(count / (data[0][1] || 1)) * 100}%`, background: "linear-gradient(90deg,#1a56db,#0ea5e9)", borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "requests" && (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Total",    key: "all",      color: "#1a56db", icon: "📋" },
                { label: "Pending",  key: "pending",  color: "#b45309", icon: "⏳" },
                { label: "Approved", key: "approved", color: "#065f46", icon: "✅" },
                { label: "Rejected", key: "rejected", color: "#991b1b", icon: "❌" },
              ].map(s => (
                <div key={s.key} style={{ background: card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer" }} onClick={() => setFilter(s.key)}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{counts[s.key]}</div>
                  <div style={{ fontSize: 11, color: sub, fontWeight: 600, marginTop: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter + bulk */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              {["all", "pending", "approved", "rejected", "cert_pending"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 18px", borderRadius: 20, background: filter === f ? "linear-gradient(135deg,#1a56db,#0ea5e9)" : card, color: filter === f ? "#fff" : sub, fontSize: 13, fontWeight: filter === f ? 700 : 500, cursor: "pointer", textTransform: "capitalize", border: filter === f ? "none" : `1px solid ${border}`, boxShadow: filter === f ? "0 4px 12px rgba(26,86,219,0.3)" : "none" }}>
                  {f === "cert_pending" ? `🎓 Cert Review (${counts.cert_pending})` : `${f} (${counts[f]})`}
                </button>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                {selectedTokens.length > 0 && (
                  <>
                    <span style={{ fontSize: 12, color: sub }}>{selectedTokens.length} selected</span>
                    <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${border}`, background: card, color: text, fontSize: 13, cursor: "pointer" }}>
                      <option value="">Bulk Action</option>
                      <option value="approve">Approve All</option>
                      <option value="reject">Reject All</option>
                    </select>
                    <button onClick={doBulk} disabled={!bulkAction} style={{ padding: "7px 16px", borderRadius: 8, background: bulkAction ? "linear-gradient(135deg,#1a56db,#0ea5e9)" : "#94a3b8", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: bulkAction ? "pointer" : "not-allowed" }}>Apply</button>
                    <button onClick={clearSelect} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${border}`, background: card, color: sub, fontSize: 13, cursor: "pointer" }}>Clear</button>
                  </>
                )}
                {filter === "pending" && filtered.length > 0 && (
                  <button onClick={selectAll} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${border}`, background: card, color: "#1a56db", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Select All Pending</button>
                )}
              </div>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div style={{ background: card, borderRadius: 16, padding: "60px 40px", textAlign: "center", border: `1px solid ${border}` }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{"🔭"}</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: text, marginBottom: 8 }}>No requests found</div>
                <p style={{ color: sub, fontSize: 14 }}>Submit a request from the portal to see it here.</p>
              </div>
            ) : filtered.map(req => (
              <div key={req.token} style={{ background: card, borderRadius: 14, padding: "16px 20px", border: `1px solid ${selectedTokens.includes(req.token) ? "#1a56db" : border}`, marginBottom: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {req.status === "pending" && (
                      <input type="checkbox" checked={selectedTokens.includes(req.token)} onChange={() => toggleSelect(req.token)} style={{ width: 16, height: 16, accentColor: "#1a56db", cursor: "pointer" }} />
                    )}
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: "linear-gradient(135deg,#eff6ff,#dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👤</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: text }}>{req.fullName}</div>
                      <div style={{ fontSize: 11, color: sub, marginTop: 1 }}>{req.email}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
                        <Badge status={req.status} />
                        {req.certStatus === "pending" && <span style={{ fontSize: 10, background: "#ede9fe", color: "#7c3aed", borderRadius: 6, padding: "2px 7px", fontWeight: 700 }}>🎓 Cert Pending</span>}
                        {req.certStatus === "approved" && <span style={{ fontSize: 10, background: "#d1fae5", color: "#065f46", borderRadius: 6, padding: "2px 7px", fontWeight: 700 }}>🏆 Cert Issued</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: sub }}>{fmtDate(req.submittedAt)}</span>
                    <button
                      onClick={() => openView(req)}
                      style={{ padding: "7px 18px", borderRadius: 8, background: "linear-gradient(135deg,#1a56db,#0ea5e9)", border: "none", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── VIEW / APPROVE MODAL ── */}
      {viewRecord && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>

            {/* Modal header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#0f172a" }}>Application Details</div>
                <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>Admin-only record controls</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {!editMode && viewRecord.status !== "approved" && (
                  <button
                    onClick={startEdit}
                    style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Edit details
                  </button>
                )}
                {!editMode && viewRecord.status === "approved" && (
                  <span style={{ fontSize: 11, background: "#d1fae5", color: "#065f46", borderRadius: 6, padding: "4px 10px", fontWeight: 600, border: "1px solid #6ee7b7" }}>
                    🔒 Locked
                  </span>
                )}
                <button onClick={closeView} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>✕</button>
              </div>
            </div>

            {/* Details / Edit form */}
            <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
              {editMode ? (
                // Edit form
                <>
                  {[
                    ["fullName",        "Full Name",       "text"],
                    ["phone",           "Phone",           "text"],
                    ["email",           "Email",           "email"],
                    ["enrollmentNumber","Enrollment No.",  "text"],
                    ["collegeName",     "College",         "text"],
                    ["branch",          "Branch",          "text"],
                    ["semester",        "Semester",        "text"],
                    ["gender",          "Gender",          "text"],
                    ["technology",      "Technology",      "text"],
                    ["startDate",       "Start Date",      "date"],
                    ["endDate",         "End Date",        "date"],
                  ].map(([key, label, type]) => (
                    <div key={key}>
                      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                      <input
                        type={type}
                        value={editFields[key] || ""}
                        onChange={e => setEditFields(f => ({ ...f, [key]: e.target.value }))}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "2px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                        onFocus={e => { e.target.style.borderColor = "#1a56db"; }}
                        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; }}
                      />
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 4 }}>Offer Letter Date</div>
                    <input
                      type="date"
                      value={editFields.offerLetterDate || ""}
                      onChange={e => setEditFields(f => ({ ...f, offerLetterDate: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "2px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                      onFocus={e => { e.target.style.borderColor = "#1a56db"; }}
                      onBlur={e => { e.target.style.borderColor = "#e2e8f0"; }}
                    />
                  </div>
                </>
              ) : (
                // View mode
                <>
                  {[
                    ["Full Name",      viewRecord.fullName],
                    ["Unique ID",      viewRecord.letterId],
                    ["Phone",          viewRecord.phone],
                    ["Email",          viewRecord.email],
                    ["Enrollment No.", viewRecord.enrollmentNumber],
                    ["College",        viewRecord.collegeName],
                    ["Branch",         viewRecord.branch],
                    ["Semester",       viewRecord.semester],
                    ["Gender",         viewRecord.gender],
                    ["Technology",     viewRecord.technology],
                    ["Start Date",     fmtDate(viewRecord.startDate)],
                    ["End Date",       fmtDate(viewRecord.endDate)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 3 }}>{k}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", wordBreak: "break-word" }}>{v || "—"}</div>
                    </div>
                  ))}

                  {/* Offer Letter Date */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 3 }}>Offer Letter Date</div>
                    {viewRecord.offerLetterDate
                      ? <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{viewRecord.offerLetterDate}</div>
                      : <div style={{ fontSize: 13, color: "#94a3b8" }}>Not set yet</div>
                    }
                  </div>

                  {/* Date picker for approve step 2 */}
                  {approveStep === 2 && approveTarget === viewRecord.token && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={{ fontSize: 10, color: "#1a56db", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700, marginBottom: 6 }}>Set Offer Letter Date</div>
                      <input
                        type="date"
                        value={offerLetterDate}
                        onChange={e => setOfferLetterDate(e.target.value)}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #1a56db", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  )}

            {/* Duplicate warning for admin */}
            {(() => {
              const dupes = store.findDuplicates(viewRecord.email, viewRecord.enrollmentNumber, viewRecord.token);
              if (!dupes.length) return null;
              return (
                <div style={{ gridColumn: "1 / -1", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#991b1b", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    🔴 Duplicate Applications Found ({dupes.length})
                  </div>
                  {dupes.map(d => (
                    <div key={d.token} style={{ fontSize: 11, color: "#b91c1c", marginBottom: 3 }}>
                      • <strong>{d.fullName}</strong> · {d.email} · <span style={{ fontFamily: "monospace" }}>{d.token}</span> · Status: <strong style={{ textTransform: "capitalize" }}>{d.status}</strong>
                    </div>
                  ))}
                </div>
              );
            })()}

              {/* Status */}
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Current Status:</span>
                <Badge status={viewRecord.status} />
                {viewRecord.status === "approved" && (
                  <span style={{ fontSize: 11, background: "#d1fae5", color: "#065f46", borderRadius: 6, padding: "3px 8px", fontWeight: 600, border: "1px solid #6ee7b7" }}>
                    🔒 Details Locked
                  </span>
                )}
                {viewRecord.certStatus && viewRecord.certStatus !== "not_requested" && (
                  <span style={{ fontSize: 11, background: "#ede9fe", color: "#7c3aed", borderRadius: 6, padding: "3px 8px", fontWeight: 700 }}>🎓 Cert: {viewRecord.certStatus}</span>
                )}
              </div>
                </>
              )}
            </div>

            {/* Notify section (view mode only) */}
            {!editMode && (viewRecord.status === "approved" || viewRecord.status === "rejected") && (
              <div style={{ padding: "0 24px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, width: "100%", marginBottom: 4 }}>📣 Notify User</div>
                {viewRecord.status === "approved" && (
                  <>
                    <a href={whatsappLink(viewRecord.phone, msgApproved(viewRecord.fullName, viewRecord.token))} target="_blank" rel="noreferrer"
                      style={{ padding: "6px 14px", borderRadius: 8, background: "#25D366", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      💬 WhatsApp
                    </a>
                    <a href={mailtoLink(viewRecord.email, ...Object.values(emailApproved(viewRecord.fullName, viewRecord.token)))} target="_blank" rel="noreferrer"
                      style={{ padding: "6px 14px", borderRadius: 8, background: "#ea4335", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      ✉️ Email
                    </a>
                  </>
                )}
                {viewRecord.status === "rejected" && (
                  <a href={whatsappLink(viewRecord.phone, msgRejected(viewRecord.fullName, viewRecord.token, viewRecord.rejectionReason))} target="_blank" rel="noreferrer"
                    style={{ padding: "6px 14px", borderRadius: 8, background: "#64748b", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                    💬 WhatsApp Rejected
                  </a>
                )}
                {viewRecord.certStatus === "approved" && (
                  <a href={whatsappLink(viewRecord.phone, msgCertApproved(viewRecord.fullName, viewRecord.token, viewRecord.certId))} target="_blank" rel="noreferrer"
                    style={{ padding: "6px 14px", borderRadius: 8, background: "#7c3aed", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                    💬 Certificate
                  </a>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ padding: "16px 24px 24px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 10, flexWrap: "wrap" }}>
              {editMode ? (
                <>
                  <button onClick={() => setEditMode(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                  <button onClick={saveEdit} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1a56db,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(26,86,219,0.3)" }}>Save Changes</button>
                </>
              ) : (
                <>
                  {/* PENDING actions */}
                  {viewRecord.status === "pending" && (
                    <>
                      {approveStep === 1 || approveTarget !== viewRecord.token ? (
                        <button onClick={() => startApprove(viewRecord.token)} style={{ flex: 1, minWidth: 110, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#065f46,#10b981)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                          ✓ Approve
                        </button>
                      ) : (
                        <button onClick={confirmApprove} disabled={!offerLetterDate} style={{ flex: 1, minWidth: 110, padding: "12px", borderRadius: 10, border: "none", background: offerLetterDate ? "linear-gradient(135deg,#065f46,#10b981)" : "#94a3b8", color: "#fff", fontWeight: 700, fontSize: 14, cursor: offerLetterDate ? "pointer" : "not-allowed" }}>
                          ✓ Confirm Approval
                        </button>
                      )}
                      <button onClick={() => openReject(viewRecord.token)} style={{ flex: 1, minWidth: 90, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#991b1b,#ef4444)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Reject</button>
                    </>
                  )}

                  {/* APPROVED actions */}
                  {viewRecord.status === "approved" && (
                    <>
                      <button
                        onClick={async () => {
                          const rec = store.get(viewRecord.token);
                          if (!rec) return;
                          if (!window.jspdf) {
                            await new Promise(resolve => {
                              const s = document.createElement("script");
                              s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
                              s.onload = resolve;
                              document.head.appendChild(s);
                            });
                          }
                          const { generateAdminOfferLetterPDF } = await import("../utils/generateAdminOfferLetterPDF");
                          await generateAdminOfferLetterPDF(rec);
                        }}
                        style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1a56db,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                      >
                        ⬇ Download letter
                      </button>
                      <button onClick={() => openReject(viewRecord.token)} style={{ padding: "12px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#991b1b,#ef4444)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Reject</button>
                      <button onClick={() => resetToPending(viewRecord.token)} style={{ padding: "12px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>↺ Reset</button>
                    </>
                  )}

                  {/* REJECTED actions */}
                  {viewRecord.status === "rejected" && (
                    <button onClick={() => resetToPending(viewRecord.token)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>↺ Reset to Pending</button>
                  )}

                  {/* Certificate actions */}
                  {viewRecord.certStatus === "pending" && (
                    <>
                      <button onClick={() => { approveCert(viewRecord.token); setViewRecord(store.get(viewRecord.token)); }} style={{ padding: "12px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🏆 Approve Cert</button>
                      <button onClick={() => openRejectCert(viewRecord.token)} style={{ padding: "12px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#991b1b,#ef4444)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✕ Reject Cert</button>
                    </>
                  )}

                  {/* Delete — always shown */}
                  <button onClick={() => deleteRecord(viewRecord.token)} style={{ padding: "12px 18px", borderRadius: 10, border: "1px solid #fca5a5", background: "#fff", color: "#dc2626", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Delete</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", maxWidth: 440, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              {rejectTarget.startsWith("cert:") ? "Reject Certificate Request" : "Reject Application"}
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>
              {rejectTarget.startsWith("cert:") ? "Provide a reason for rejecting this certificate request." : "Provide a reason for rejection. This will be shown to the applicant."}
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder={rejectTarget.startsWith("cert:") ? "e.g. Internship not completed, missing attendance..." : "e.g. Incomplete details, invalid enrollment number..."}
              rows={3}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "2px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" }}
              onFocus={e => { e.target.style.borderColor = "#ef4444"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; }}
            />
            {!rejectReason.trim() && <p style={{ fontSize: 12, color: "#dc2626", margin: "6px 0 0" }}>Reason is required</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setRejectTarget(null); setRejectReason(""); }} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button
                onClick={rejectTarget.startsWith("cert:") ? confirmRejectCert : confirmReject}
                disabled={!rejectReason.trim()}
                style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: rejectReason.trim() ? "linear-gradient(135deg,#991b1b,#ef4444)" : "#94a3b8", color: "#fff", fontWeight: 700, fontSize: 14, cursor: rejectReason.trim() ? "pointer" : "not-allowed" }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
