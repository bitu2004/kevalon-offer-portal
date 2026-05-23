import { useState } from "react";
import Input from "../components/Input";
import Select from "../components/Select";
import store, { isTokenExpired, daysUntilExpiry, isInternshipCompleted } from "../store";
import { SEMESTERS, TECHNOLOGIES, BRANCHES } from "../constants";

export default function TrackStatus({ onNavigate }) {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [saveMsg, setSaveMsg] = useState("");
  const [renewalDone, setRenewalDone] = useState(null);
  const [certRequested, setCertRequested] = useState(false);

  const handleTrack = async () => {
    setError(""); setResult(null); setEditing(false); setRenewalDone(null); setCertRequested(false);
    if (!token.trim()) { setError("Please enter your token."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const data = store.get(token.trim().toUpperCase());
    setLoading(false);
    if (!data) { setError("Token not found. Please check and try again."); return; }
    setResult(data);
  };

  const handleRenewal = () => {
    const newToken = store.requestRenewal(result.token);
    if (newToken) {
      setRenewalDone(newToken);
      setResult(store.get(newToken));
      setToken(newToken);
    }
  };

  const handleCertRequest = () => {
    const ok = store.requestCertificate(result.token);
    if (ok) {
      setCertRequested(true);
      setResult(store.get(result.token));
    }
  };

  const startEdit = () => {
    setEditForm({ ...result });
    setEditing(true);
    setSaveMsg("");
  };

  const saveEdit = () => {
    const e = {};
    if (!editForm.fullName?.trim()) e.fullName = "Required";
    if (!editForm.phone?.trim() || !/^\d{10}$/.test(editForm.phone)) e.phone = "Valid 10-digit number required";
    if (!editForm.email?.trim()) e.email = "Required";
    if (!editForm.collegeName?.trim()) e.collegeName = "Required";
    if (!editForm.branch) e.branch = "Required";
    if (!editForm.semester) e.semester = "Required";
    if (!editForm.technology) e.technology = "Required";
    if (!editForm.startDate) e.startDate = "Required";
    if (!editForm.endDate) e.endDate = "Required";
    if (editForm.startDate && editForm.endDate && editForm.endDate <= editForm.startDate) e.endDate = "End must be after start";
    setEditErrors(e);
    if (Object.keys(e).length) return;

    const ok = store.update(result.token, editForm);
    if (ok) {
      const updated = store.get(result.token);
      setResult(updated);
      setEditing(false);
      setSaveMsg("Details updated successfully!");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "";

  const statusConfig = {
    pending:  { color: "#b45309", bg: "#fef3c7", border: "#fcd34d", icon: "⏳", title: "Under Review",   desc: "Your application is being reviewed by our HR team. Please check back soon." },
    approved: { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", icon: "✅", title: "Approved!",       desc: "Congratulations! Your internship offer letter is ready to download." },
    rejected: { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", icon: "❌", title: "Not Accepted",    desc: "Your request was not accepted." },
  };

  const steps = ["Submitted", "Under Review", "Decision Made", "Letter Ready"];
  const stepIndex = result ? (result.status === "pending" ? 1 : result.status === "approved" ? 3 : 2) : -1;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg,#0a1a3c,#0d2d6b)", padding: "48px 24px 64px", textAlign: "center" }} className="page-header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 50, padding: "5px 16px", fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 16 }}>
          🔍 Track Application
        </div>
        <h1 style={{ color: "#fff", fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, margin: "0 0 12px" }}>Track Your Status</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 440, margin: "0 auto" }}>
          Enter your unique token to check the current status of your internship application.
        </p>
      </div>

      <div style={{ maxWidth: 660, margin: "-32px auto 0", padding: "0 20px" }}>
        {/* Token input */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 20px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <div className="token-row">
            <input
              value={token}
              onChange={e => setToken(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
              placeholder="e.g. KVL-ABCD1234"
              style={{ flex: 1, minWidth: 0, padding: "13px 12px", borderRadius: 10, border: `2px solid ${error ? "#fca5a5" : "#e2e8f0"}`, fontSize: 14, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1, color: "#0f172a", outline: "none" }}
              onFocus={e => { e.target.style.borderColor = "#1a56db"; }}
              onBlur={e => { e.target.style.borderColor = error ? "#fca5a5" : "#e2e8f0"; }}
            />
            <button
              onClick={handleTrack} disabled={loading}
              style={{ padding: "13px 20px", borderRadius: 10, border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#1a56db,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(26,86,219,0.3)", flexShrink: 0 }}
            >
              {loading ? "..." : "Track →"}
            </button>
          </div>
          {error && <div style={{ marginTop: 10, color: "#dc2626", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>⚠️ {error}</div>}
        </div>

        {saveMsg && (
          <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#065f46", fontSize: 13, fontWeight: 600 }}>
            ✅ {saveMsg}
          </div>
        )}

        {result && (() => {
          const cfg = statusConfig[result.status];
          const expired = isTokenExpired(result);
          const days = daysUntilExpiry(result);
          const completed = isInternshipCompleted(result);
          const certStatusConfig = {
            not_requested: { color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0", icon: "🎓", title: "Certificate Not Requested", desc: "Your internship must be completed before requesting a certificate." },
            pending:       { color: "#b45309", bg: "#fef3c7", border: "#fcd34d", icon: "⏳", title: "Certificate Under Review",  desc: "Your certificate request is being reviewed by HR." },
            approved:      { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", icon: "🏆", title: "Certificate Approved!",      desc: "Your completion certificate is ready to download." },
            rejected:      { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", icon: "❌", title: "Certificate Not Approved",   desc: "Your certificate request was not approved." },
          };
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Renewal success */}
              {renewalDone && (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🔄</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1a56db" }}>Token Renewed!</div>
                    <div style={{ fontSize: 12, color: "#3b82f6", marginTop: 2 }}>New token: <strong style={{ fontFamily: "monospace", letterSpacing: 1 }}>{renewalDone}</strong> — save it!</div>
                  </div>
                </div>
              )}
              {/* Expiry warning */}
              {!expired && days !== null && days <= 14 && result.status === "pending" && (
                <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e" }}>Token Expiring Soon</div>
                    <div style={{ fontSize: 12, color: "#b45309", marginTop: 2 }}>Expires in <strong>{days} day{days !== 1 ? "s" : ""}</strong>. Renew to keep your application active.</div>
                  </div>
                </div>
              )}
              {/* Expired */}
              {expired && (
                <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 16, padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>⏰</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#991b1b" }}>Token Expired</div>
                      <div style={{ fontSize: 13, color: "#b91c1c", marginTop: 2 }}>Request a renewal to resubmit your application.</div>
                    </div>
                  </div>
                  {!result.renewedTo ? (
                    <button onClick={handleRenewal} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1a56db,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                      🔄 Renew Token & Resubmit
                    </button>
                  ) : (
                    <div style={{ fontSize: 13, color: "#991b1b", fontWeight: 600 }}>Already renewed → New token: <span style={{ fontFamily: "monospace" }}>{result.renewedTo}</span></div>
                  )}
                </div>
              )}
              {/* Status banner */}
              {!expired && (
              <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ fontSize: 36, lineHeight: 1 }}>{cfg.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color: cfg.color }}>{cfg.title}</div>
                  <div style={{ fontSize: 13, color: cfg.color, opacity: 0.85, marginTop: 4, lineHeight: 1.5 }}>{cfg.desc}</div>
                  {result.status === "rejected" && result.rejectionReason && (
                    <div style={{ marginTop: 8, background: "rgba(0,0,0,0.06)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#991b1b" }}>
                      <strong>Reason:</strong> {result.rejectionReason}
                    </div>
                  )}
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: cfg.color, background: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "3px 8px", letterSpacing: 1 }}>{result.token}</span>
                    <span style={{ fontSize: 11, color: cfg.color, background: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "3px 8px" }}>ID: {result.letterId}</span>
                    {result.duration && <span style={{ fontSize: 11, color: cfg.color, background: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "3px 8px" }}>⏱ {result.duration}</span>}
                    {days !== null && !expired && <span style={{ fontSize: 11, color: days <= 14 ? "#b45309" : "#64748b", background: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "3px 8px" }}>Expires in {days}d</span>}
                  </div>
                </div>
              </div>
              )}

              {/* Progress stepper */}
              {!expired && (
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 20 }}>Application Progress</div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
                  <div style={{ position: "absolute", top: 16, left: "12.5%", right: "12.5%", height: 3, background: "#e2e8f0", borderRadius: 2, zIndex: 0 }} />
                  <div style={{ position: "absolute", top: 16, left: "12.5%", width: `${(stepIndex / (steps.length - 1)) * 75}%`, height: 3, background: result.status === "rejected" ? "linear-gradient(90deg,#ef4444,#fca5a5)" : "linear-gradient(90deg,#1a56db,#0ea5e9)", borderRadius: 2, zIndex: 1, transition: "width 0.6s ease" }} />
                  {steps.map((s, i) => {
                    const done = i <= stepIndex;
                    const active = i === stepIndex;
                    const rejected = result.status === "rejected" && i === stepIndex;
                    return (
                      <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 2, flex: 1 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: rejected ? "linear-gradient(135deg,#ef4444,#dc2626)" : done ? "linear-gradient(135deg,#1a56db,#0ea5e9)" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: done ? "#fff" : "#94a3b8", boxShadow: active ? `0 0 0 4px ${rejected ? "rgba(239,68,68,0.2)" : "rgba(26,86,219,0.2)"}` : "none", transition: "all 0.3s" }}>
                          {rejected ? "✕" : done ? (active ? i + 1 : "✓") : i + 1}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: done ? 600 : 400, color: done ? (rejected ? "#dc2626" : "#1a56db") : "#94a3b8", textAlign: "center", lineHeight: 1.3 }}>{s}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Edit section (only for pending, not expired) */}
              {result.status === "pending" && !editing && !expired && (
                <button onClick={startEdit} style={{ padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#1a56db", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  ✏️ Edit My Details (while pending)
                </button>
              )}

              {editing && (
                <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "2px solid #bfdbfe" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    ✏️ Edit Details
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 400 }}>— Only available while pending</span>
                  </div>
                  <div className="grid-2" style={{ gap: 14 }}>
                    <div className="col-full"><Input label="Full Name" value={editForm.fullName || ""} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} error={editErrors.fullName} /></div>
                    <Input label="Phone" value={editForm.phone || ""} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} maxLength={10} error={editErrors.phone} />
                    <Input label="Email" type="email" value={editForm.email || ""} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} error={editErrors.email} />
                    <div className="col-full"><Input label="College Name" value={editForm.collegeName || ""} onChange={e => setEditForm(f => ({ ...f, collegeName: e.target.value }))} error={editErrors.collegeName} /></div>
                    <Select label="Branch" value={editForm.branch || ""} onChange={e => setEditForm(f => ({ ...f, branch: e.target.value }))} error={editErrors.branch}>
                      <option value="">Select branch</option>{BRANCHES.map(b => <option key={b}>{b}</option>)}
                    </Select>
                    <Select label="Semester" value={editForm.semester || ""} onChange={e => setEditForm(f => ({ ...f, semester: e.target.value }))} error={editErrors.semester}>
                      <option value="">Select semester</option>{SEMESTERS.map(s => <option key={s}>{s} Semester</option>)}
                    </Select>
                    <div className="col-full">
                      <Select label="Technology" value={editForm.technology || ""} onChange={e => setEditForm(f => ({ ...f, technology: e.target.value }))} error={editErrors.technology}>
                        <option value="">Select technology</option>{TECHNOLOGIES.map(t => <option key={t}>{t}</option>)}
                      </Select>
                    </div>
                    <Input label="Start Date" type="date" value={editForm.startDate || ""} onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))} error={editErrors.startDate} />
                    <Input label="End Date" type="date" value={editForm.endDate || ""} onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))} error={editErrors.endDate} />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                    <button onClick={saveEdit} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1a56db,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 16px rgba(26,86,219,0.3)" }}>Save Changes</button>
                  </div>
                </div>
              )}

              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 16 }}>Application Details</div>
                <div className="details-grid">
                  {[
                    ["Full Name", result.fullName], ["Email", result.email],
                    ["Phone", result.phone], ["Enrollment No.", result.enrollmentNumber],
                    ["College", result.collegeName], ["Branch", result.branch],
                    ["Technology", result.technology], ["Semester", result.semester],
                    ["Start Date", fmtDate(result.startDate)], ["End Date", fmtDate(result.endDate)],
                    ["Duration", result.duration], ["Applied On", fmtDate(result.submittedAt)],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3, fontWeight: 600 }}>{k}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", wordBreak: "break-word" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {result.status === "approved" && (
                <button onClick={() => onNavigate && onNavigate("download")} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0d9e6e,#10b981)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 6px 24px rgba(13,158,110,0.35)" }}>
                  ⬇ Download Offer Letter
                </button>
              )}

              {/* ── CERTIFICATE SECTION ── */}
              {result.status === "approved" && (() => {
                const cs = result.certStatus || "not_requested";
                const certStatusConfig = {
                  not_requested: { color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0", icon: "🎓", title: "Certificate Not Requested", desc: completed ? "Click below to request your completion certificate." : `Available after ${fmtDate(result.endDate)}` },
                  pending:       { color: "#b45309", bg: "#fef3c7", border: "#fcd34d", icon: "⏳", title: "Certificate Under Review",  desc: "Your certificate request is being reviewed by HR." },
                  approved:      { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", icon: "🏆", title: "Certificate Approved!",      desc: "Your completion certificate is ready to download." },
                  rejected:      { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", icon: "❌", title: "Certificate Not Approved",   desc: "Your certificate request was not approved." },
                };
                const ccfg = certStatusConfig[cs];
                return (
                  <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    <div style={{ background: "linear-gradient(135deg,#0a1a3c,#1a56db)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>🏆</span>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Completion Certificate</div>
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>Same token — available after internship ends</div>
                      </div>
                    </div>
                    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ background: ccfg.bg, border: `1px solid ${ccfg.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{ccfg.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: ccfg.color }}>{ccfg.title}</div>
                          <div style={{ fontSize: 12, color: ccfg.color, opacity: 0.85, marginTop: 2 }}>{ccfg.desc}</div>
                          {cs === "rejected" && result.certRejectionReason && (
                            <div style={{ marginTop: 4, fontSize: 12, color: "#991b1b" }}>Reason: {result.certRejectionReason}</div>
                          )}
                          {cs === "approved" && result.certId && (
                            <div style={{ marginTop: 4, fontSize: 11, color: "#065f46", fontFamily: "monospace", fontWeight: 700 }}>Cert ID: {result.certId}</div>
                          )}
                        </div>
                      </div>
                      {completed && (cs === "not_requested" || cs === "rejected") && (
                        <button onClick={handleCertRequest} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
                          🎓 Request Completion Certificate
                        </button>
                      )}
                      {cs === "approved" && (
                        <button onClick={() => onNavigate && onNavigate("download")} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
                          ⬇ Download Certificate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>
          );
        })()}
      </div>
    </div>
  );
}
