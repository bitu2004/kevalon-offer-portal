import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Input from "../components/Input";
import Select from "../components/Select";
import store, { isTokenExpired, daysUntilExpiry, isInternshipCompleted } from "../store";
import { SEMESTERS, TECHNOLOGIES, BRANCHES } from "../constants";
import { generateOfferLetterPDF } from "../utils/generateOfferLetterPDF";
import { generateCertificatePDF } from "../utils/generateCertificatePDF";
import { getBaseUrl } from "../utils/getBaseUrl";

export default function TrackDownload({ onNavigate }) {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [saveMsg, setSaveMsg] = useState("");
  const [renewalDone, setRenewalDone] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [jspdfLoaded, setJspdfLoaded] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (window.jspdf) { setJspdfLoaded(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => setJspdfLoaded(true);
    document.head.appendChild(s);
  }, []);

  const handleSearch = async () => {
    setError(""); setResult(null); setEditing(false); setRenewalDone(null); setShowQR(false);
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
    if (newToken) { setRenewalDone(newToken); setResult(store.get(newToken)); setToken(newToken); }
  };

  const handleCertRequest = () => {
    const ok = store.requestCertificate(result.token);
    if (ok) setResult(store.get(result.token));
  };

  const startEdit = () => { setEditForm({ ...result }); setEditing(true); setSaveMsg(""); };
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
    if (ok) { setResult(store.get(result.token)); setEditing(false); setSaveMsg("Details updated!"); setTimeout(() => setSaveMsg(""), 3000); }
  };

  const handleDownload = async () => {
    if (!jspdfLoaded) { alert("PDF loading, try again."); return; }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 300));
    await generateOfferLetterPDF(result);
    store.recordDownload(result.token);
    setResult(store.get(result.token));
    setGenerating(false);
  };

  const handleCertDownload = async () => {
    if (!jspdfLoaded) { alert("PDF loading, try again."); return; }
    setGeneratingCert(true);
    await new Promise(r => setTimeout(r, 300));
    await generateCertificatePDF(result);
    store.recordCertDownload(result.token);
    setResult(store.get(result.token));
    setGeneratingCert(false);
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "";
  const fmtDateTime = d => d ? new Date(d).toLocaleString("en-IN") : "";
  const verifyUrl = result ? `${getBaseUrl()}/?verify=${result.token}` : "";
  const expired = result ? isTokenExpired(result) : false;
  const days = result ? daysUntilExpiry(result) : null;
  const completed = result ? isInternshipCompleted(result) : false;

  const steps = ["Submitted", "Under Review", "Decision Made", "Letter Ready"];
  const stepIndex = result ? (result.status === "pending" ? 1 : result.status === "approved" ? 3 : 2) : -1;

  const theme = !result ? {
    pageBg: "#f8fafc", headerBg: "linear-gradient(135deg,#0a1a3c,#0d2d6b)",
    badge: "🔍 Track & Download", title: "Track & Download", desc: "Enter your token to check status and download your offer letter.",
    badgeBg: "rgba(56,189,248,0.15)", badgeBorder: "rgba(56,189,248,0.3)", badgeColor: "#38bdf8",
  } : result.status === "approved" ? {
    pageBg: "linear-gradient(180deg,#f0fdf4 0%,#f8fafc 40%)", headerBg: "linear-gradient(135deg,#064e3b,#065f46,#047857)",
    badge: "🎉 Congratulations!", title: "You're Approved!", desc: "Your offer letter is ready. Download it below.",
    badgeBg: "rgba(52,211,153,0.2)", badgeBorder: "rgba(52,211,153,0.4)", badgeColor: "#6ee7b7", confetti: true,
  } : result.status === "rejected" ? {
    pageBg: "#f8fafc", headerBg: "linear-gradient(135deg,#1e293b,#334155)",
    badge: "❌ Not Accepted", title: "Application Status", desc: "Your request was not accepted. Please contact HR.",
    badgeBg: "rgba(248,113,113,0.15)", badgeBorder: "rgba(248,113,113,0.3)", badgeColor: "#fca5a5",
  } : {
    pageBg: "#f8fafc", headerBg: "linear-gradient(135deg,#0a1a3c,#0d2d6b)",
    badge: "⏳ Under Review", title: "Application Pending", desc: "Your application is being reviewed. Check back soon.",
    badgeBg: "rgba(56,189,248,0.15)", badgeBorder: "rgba(56,189,248,0.3)", badgeColor: "#38bdf8",
  };

  const statusCfg = {
    pending:  { color: "#b45309", bg: "#fef3c7", border: "#fcd34d", icon: "⏳", title: "Under Review",   desc: "Your application is being reviewed by our HR team." },
    approved: { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", icon: "✅", title: "Approved!",       desc: "Congratulations! Your internship offer letter is ready to download." },
    rejected: { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", icon: "❌", title: "Not Accepted",    desc: "Your request was not accepted. Please contact HR." },
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.pageBg, paddingBottom: 80, transition: "background 0.5s" }}>
      {theme.confetti && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, pointerEvents: "none", zIndex: 50, overflow: "hidden", height: 120 }}>
          {[...Array(18)].map((_, i) => (<div key={i} style={{ position: "absolute", left: `${(i/18)*100}%`, top: "-10px", width: 8, height: 8, borderRadius: i%3===0?"50%":2, background: ["#10b981","#34d399","#fbbf24","#60a5fa","#a78bfa","#f472b6"][i%6], animation: `fall${i%3} ${1.2+(i%4)*0.3}s ease-in ${(i%5)*0.15}s forwards`, opacity: 0 }} />))}
          <style>{`@keyframes fall0{0%{opacity:1;transform:translateY(0) rotate(0)}100%{opacity:0;transform:translateY(130px) rotate(360deg)}}@keyframes fall1{0%{opacity:1}100%{opacity:0;transform:translateY(110px) rotate(-270deg)}}@keyframes fall2{0%{opacity:1}100%{opacity:0;transform:translateY(120px) rotate(180deg)}}`}</style>
        </div>
      )}

      {/* Header */}
      <div style={{ background: theme.headerBg, padding: "48px 24px 64px", textAlign: "center", transition: "background 0.5s" }} className="page-header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: theme.badgeBg, border: `1px solid ${theme.badgeBorder}`, borderRadius: 50, padding: "5px 16px", fontSize: 12, fontWeight: 600, color: theme.badgeColor, marginBottom: 16 }}>{theme.badge}</div>
        <h1 style={{ color: "#fff", fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, margin: "0 0 12px" }}>{theme.title}</h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>{theme.desc}</p>
      </div>

      <div style={{ maxWidth: 680, margin: "-32px auto 0", padding: "0 20px" }}>
        {/* Token input */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 20px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)", border: `1px solid ${result?.status === "approved" ? "#6ee7b7" : "#e2e8f0"}`, marginBottom: 20, transition: "border-color 0.4s" }}>
          <div className="token-row">
            <input value={token} onChange={e => setToken(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="Enter token — e.g. KVL-ABCD1234"
              style={{ flex: 1, minWidth: 0, padding: "13px 12px", borderRadius: 10, border: `2px solid ${error ? "#fca5a5" : "#e2e8f0"}`, fontSize: 14, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1, color: "#0f172a", outline: "none" }}
              onFocus={e => { e.target.style.borderColor = "#1a56db"; }} onBlur={e => { e.target.style.borderColor = error ? "#fca5a5" : "#e2e8f0"; }} />
            <button onClick={handleSearch} disabled={loading}
              style={{ padding: "13px 20px", borderRadius: 10, border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#1a56db,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", flexShrink: 0, boxShadow: "0 4px 16px rgba(26,86,219,0.3)" }}>
              {loading ? "..." : "Search →"}
            </button>
          </div>
          {error && <div style={{ marginTop: 10, color: "#dc2626", fontSize: 13 }}>⚠️ {error}</div>}
        </div>

        {saveMsg && <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#065f46", fontSize: 13, fontWeight: 600 }}>✅ {saveMsg}</div>}

        {result && (() => {
          const cfg = statusCfg[result.status];
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Renewal success */}
              {renewalDone && <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 20 }}>🔄</span><div><div style={{ fontWeight: 700, fontSize: 14, color: "#1a56db" }}>Token Renewed!</div><div style={{ fontSize: 12, color: "#3b82f6", marginTop: 2 }}>New token: <strong style={{ fontFamily: "monospace" }}>{renewalDone}</strong> — save it!</div></div></div>}

              {/* Expiry warning */}
              {!expired && days !== null && days <= 14 && result.status === "pending" && <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}><span>⚠️</span><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14, color: "#92400e" }}>Token Expiring Soon</div><div style={{ fontSize: 12, color: "#b45309" }}>Expires in <strong>{days} day{days !== 1 ? "s" : ""}</strong>. Renew to keep active.</div></div></div>}

              {/* Expired */}
              {expired && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 16, padding: "20px 24px" }}><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}><span style={{ fontSize: 28 }}>⏰</span><div><div style={{ fontWeight: 800, fontSize: 16, color: "#991b1b" }}>Token Expired</div><div style={{ fontSize: 13, color: "#b91c1c" }}>Request a renewal to resubmit.</div></div></div>{!result.renewedTo ? <button onClick={handleRenewal} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1a56db,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🔄 Renew Token</button> : <div style={{ fontSize: 13, color: "#991b1b", fontWeight: 600 }}>Renewed → <span style={{ fontFamily: "monospace" }}>{result.renewedTo}</span></div>}</div>}

              {/* Status banner */}
              {!expired && <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ fontSize: 36, lineHeight: 1 }}>{cfg.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color: cfg.color }}>{cfg.title}</div>
                  <div style={{ fontSize: 13, color: cfg.color, opacity: 0.85, marginTop: 4 }}>{cfg.desc}</div>
                  {result.status === "rejected" && result.rejectionReason && <div style={{ marginTop: 8, background: "rgba(0,0,0,0.06)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#991b1b" }}><strong>Reason:</strong> {result.rejectionReason}</div>}
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: cfg.color, background: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "3px 8px" }}>{result.token}</span>
                    <span style={{ fontSize: 11, color: cfg.color, background: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "3px 8px" }}>ID: {result.letterId}</span>
                    {result.duration && <span style={{ fontSize: 11, color: cfg.color, background: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "3px 8px" }}>⏱ {result.duration}</span>}
                    {days !== null && !expired && <span style={{ fontSize: 11, color: days <= 14 ? "#b45309" : "#64748b", background: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "3px 8px" }}>Expires in {days}d</span>}
                  </div>
                </div>
              </div>}

              {/* Progress stepper */}
              {!expired && <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 20 }}>Application Progress</div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
                  <div style={{ position: "absolute", top: 16, left: "12.5%", right: "12.5%", height: 3, background: "#e2e8f0", borderRadius: 2, zIndex: 0 }} />
                  <div style={{ position: "absolute", top: 16, left: "12.5%", width: `${(stepIndex / (steps.length - 1)) * 75}%`, height: 3, background: result.status === "rejected" ? "linear-gradient(90deg,#ef4444,#fca5a5)" : "linear-gradient(90deg,#1a56db,#0ea5e9)", borderRadius: 2, zIndex: 1, transition: "width 0.6s" }} />
                  {steps.map((s, i) => { const done = i <= stepIndex; const active = i === stepIndex; const rej = result.status === "rejected" && active; return (
                    <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 2, flex: 1 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: rej ? "linear-gradient(135deg,#ef4444,#dc2626)" : done ? "linear-gradient(135deg,#1a56db,#0ea5e9)" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: done ? "#fff" : "#94a3b8", boxShadow: active ? `0 0 0 4px ${rej ? "rgba(239,68,68,0.2)" : "rgba(26,86,219,0.2)"}` : "none", transition: "all 0.3s" }}>{rej ? "✕" : done ? (active ? i + 1 : "✓") : i + 1}</div>
                      <div style={{ fontSize: 11, fontWeight: done ? 600 : 400, color: done ? (rej ? "#dc2626" : "#1a56db") : "#94a3b8", textAlign: "center" }}>{s}</div>
                    </div>
                  ); })}
                </div>
              </div>}

              {/* Lock / Edit */}
              {result.status === "pending" && !editing && !expired && <button onClick={startEdit} style={{ padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#1a56db", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>✏️ Edit My Details (while pending)</button>}
              {result.status === "approved" && <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#065f46", fontWeight: 600 }}>🔒 Details are locked after approval.</div>}

              {/* Edit form */}
              {editing && <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "2px solid #bfdbfe" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>✏️ Edit Details <span style={{ fontSize: 12, color: "#64748b", fontWeight: 400 }}>— Only while pending</span></div>
                <div className="grid-2" style={{ gap: 14 }}>
                  <div className="col-full"><Input label="Full Name" value={editForm.fullName || ""} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} error={editErrors.fullName} /></div>
                  <Input label="Phone" value={editForm.phone || ""} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} maxLength={10} error={editErrors.phone} />
                  <Input label="Email" type="email" value={editForm.email || ""} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} error={editErrors.email} />
                  <div className="col-full"><Input label="College" value={editForm.collegeName || ""} onChange={e => setEditForm(f => ({ ...f, collegeName: e.target.value }))} error={editErrors.collegeName} /></div>
                  <Select label="Branch" value={editForm.branch || ""} onChange={e => setEditForm(f => ({ ...f, branch: e.target.value }))} error={editErrors.branch}><option value="">Select</option>{BRANCHES.map(b => <option key={b}>{b}</option>)}</Select>
                  <Select label="Semester" value={editForm.semester || ""} onChange={e => setEditForm(f => ({ ...f, semester: e.target.value }))} error={editErrors.semester}><option value="">Select</option>{SEMESTERS.map(s => <option key={s}>{s} Semester</option>)}</Select>
                  <div className="col-full"><Select label="Technology" value={editForm.technology || ""} onChange={e => setEditForm(f => ({ ...f, technology: e.target.value }))} error={editErrors.technology}><option value="">Select</option>{TECHNOLOGIES.map(t => <option key={t}>{t}</option>)}</Select></div>
                  <Input label="Start Date" type="date" value={editForm.startDate || ""} onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))} error={editErrors.startDate} />
                  <Input label="End Date" type="date" value={editForm.endDate || ""} onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))} error={editErrors.endDate} />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                  <button onClick={saveEdit} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1a56db,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Save Changes</button>
                </div>
              </div>}

              {/* Application details */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 16 }}>Application Details</div>
                <div className="details-grid">
                  {[["Full Name",result.fullName],["Email",result.email],["Phone",result.phone],["Enrollment No.",result.enrollmentNumber],["College",result.collegeName],["Branch",result.branch],["Technology",result.technology],["Semester",result.semester],["Start Date",fmtDate(result.startDate)],["End Date",fmtDate(result.endDate)],["Duration",result.duration],["Applied On",fmtDate(result.submittedAt)]].filter(([,v])=>v).map(([k,v])=>(
                    <div key={k}><div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3, fontWeight: 600 }}>{k}</div><div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", wordBreak: "break-word" }}>{v}</div></div>
                  ))}
                </div>
              </div>

              {/* ── DOWNLOAD SECTION (only when approved) ── */}
              {result.status === "approved" && <>
                <style>{`@keyframes pulse-green{0%,100%{box-shadow:0 6px 24px rgba(13,158,110,0.35)}50%{box-shadow:0 6px 32px rgba(13,158,110,0.65),0 0 0 6px rgba(13,158,110,0.12)}}`}</style>

                {/* Download history */}
                {result.downloadCount > 0 && <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#64748b" }}><span>📥</span><span>Downloaded <strong>{result.downloadCount}</strong> time{result.downloadCount !== 1 ? "s" : ""} — Last: {fmtDateTime(result.lastDownloadedAt)}</span></div>}

                {/* QR Code */}
                <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid #e2e8f0" }}>
                  <button onClick={() => setShowQR(v => !v)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📱</div>
                    <div style={{ textAlign: "left", flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Verification QR Code</div><div style={{ fontSize: 12, color: "#64748b" }}>Scan to verify authenticity</div></div>
                    <span style={{ color: "#64748b", fontSize: 18 }}>{showQR ? "▲" : "▼"}</span>
                  </button>
                  {showQR && <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ padding: 14, background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0" }}><QRCodeSVG value={verifyUrl} size={150} level="H" includeMargin /></div>
                    <div style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>Scan with phone camera to verify</div>
                    <button onClick={() => onNavigate && onNavigate("verify")} style={{ fontSize: 12, color: "#1a56db", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Open Verification Page →</button>
                  </div>}
                </div>

                {/* Download offer letter */}
                <button onClick={handleDownload} disabled={generating || !jspdfLoaded}
                  style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: generating ? "#94a3b8" : "linear-gradient(135deg,#1a56db,#0ea5e9)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: generating ? "not-allowed" : "pointer", animation: generating ? "none" : "pulse-green 2s ease-in-out infinite" }}>
                  {generating ? "⏳ Generating PDF..." : "⬇ Download Offer Letter PDF"}
                </button>

                {/* Certificate download */}
                {result.certStatus === "approved" && <button onClick={handleCertDownload} disabled={generatingCert || !jspdfLoaded}
                  style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: generatingCert ? "#94a3b8" : "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: generatingCert ? "not-allowed" : "pointer", boxShadow: "0 6px 24px rgba(124,58,237,0.35)" }}>
                  {generatingCert ? "⏳ Generating..." : "🏆 Download Completion Certificate"}
                </button>}
                {result.certStatus === "pending" && <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#92400e", fontWeight: 500, textAlign: "center" }}>⏳ Certificate request is under review by HR</div>}

                {/* Certificate request */}
                {completed && (!result.certStatus || result.certStatus === "not_requested" || result.certStatus === "rejected") && (
                  <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    <div style={{ background: "linear-gradient(135deg,#0a1a3c,#1a56db)", padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>🏆</span>
                      <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Completion Certificate</div><div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>Internship completed — request your certificate</div></div>
                    </div>
                    <div style={{ padding: "16px 18px" }}>
                      {result.certStatus === "rejected" && result.certRejectionReason && <div style={{ fontSize: 12, color: "#991b1b", marginBottom: 10 }}>Previous rejection reason: {result.certRejectionReason}</div>}
                      <button onClick={handleCertRequest} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🎓 Request Completion Certificate</button>
                    </div>
                  </div>
                )}
              </>}

            </div>
          );
        })()}
      </div>
    </div>
  );
}
