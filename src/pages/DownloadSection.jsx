import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import store from "../store";
import { generateOfferLetterPDF } from "../utils/generateOfferLetterPDF";
import { generateCertificatePDF } from "../utils/generateCertificatePDF";
import { getBaseUrl } from "../utils/getBaseUrl";

export default function DownloadSection({ onNavigate }) {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleFetch = async () => {
    setError(""); setResult(null); setShowQR(false);
    if (!token.trim()) { setError("Please enter your token."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const data = store.get(token.trim().toUpperCase());
    setLoading(false);
    if (!data) { setError("Token not found. Please check and try again."); return; }
    setResult(data);
  };

  const handleDownload = async () => {
    if (!jspdfLoaded) { alert("PDF library is loading, please try again."); return; }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 300));
    await generateOfferLetterPDF(result);
    store.recordDownload(result.token);
    setResult(store.get(result.token));
    setGenerating(false);
  };

  const handleCertDownload = async () => {
    if (!jspdfLoaded) { alert("PDF library is loading, please try again."); return; }
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

  const statusConfig = {
    pending:  { color: "#92400e", bg: "#fef3c7", border: "#fcd34d", icon: "⏳", title: "Pending Review",    desc: "Your request is under review. Please check back later." },
    approved: { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", icon: "✅", title: "Approved — Ready!", desc: "Your offer letter is approved and ready to download." },
    rejected: { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", icon: "❌", title: "Not Accepted",       desc: "Your request was not accepted. Please contact HR." },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg,#0a1a3c,#0d2d6b)", padding: "48px 24px 64px", textAlign: "center" }} className="page-header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 50, padding: "5px 16px", fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 16 }}>
          ⬇️ Download Letter
        </div>
        <h1 style={{ color: "#fff", fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, margin: "0 0 12px" }}>Download Offer Letter</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 440, margin: "0 auto" }}>
          Enter your token to fetch your application and download the PDF offer letter.
        </p>
      </div>

      <div style={{ maxWidth: 660, margin: "-32px auto 0", padding: "0 20px" }}>
        {/* Token input */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 20px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <div className="token-row">
            <input
              value={token}
              onChange={e => setToken(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleFetch()}
              placeholder="e.g. KVL-ABCD1234"
              style={{ flex: 1, minWidth: 0, padding: "13px 12px", borderRadius: 10, border: `2px solid ${error ? "#fca5a5" : "#e2e8f0"}`, fontSize: 14, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1, color: "#0f172a", outline: "none" }}
              onFocus={e => { e.target.style.borderColor = "#0d9e6e"; }}
              onBlur={e => { e.target.style.borderColor = error ? "#fca5a5" : "#e2e8f0"; }}
            />
            <button
              onClick={handleFetch} disabled={loading}
              style={{ padding: "13px 20px", borderRadius: 10, border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#0d9e6e,#10b981)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(13,158,110,0.3)", flexShrink: 0 }}
            >
              {loading ? "..." : "Fetch →"}
            </button>
          </div>
          {error && <div style={{ marginTop: 10, color: "#dc2626", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>⚠️ {error}</div>}
        </div>

        {result && (() => {
          const cfg = statusConfig[result.status];
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Status */}
              <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 36 }}>{cfg.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: cfg.color }}>{cfg.title}</div>
                  <div style={{ fontSize: 13, color: cfg.color, opacity: 0.85, marginTop: 2 }}>{cfg.desc}</div>
                  {result.status === "rejected" && result.rejectionReason && (
                    <div style={{ marginTop: 6, fontSize: 13, color: "#991b1b", fontWeight: 500 }}>
                      Reason: {result.rejectionReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Submitted Details</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, background: "#eff6ff", color: "#1a56db", borderRadius: 6, padding: "3px 8px", fontWeight: 600 }}>ID: {result.letterId}</span>
                    {result.duration && <span style={{ fontSize: 11, background: "#f0fdf4", color: "#065f46", borderRadius: 6, padding: "3px 8px", fontWeight: 600 }}>⏱ {result.duration}</span>}
                  </div>
                </div>
                <div className="details-grid">
                  {[
                    ["Full Name", result.fullName], ["Phone", result.phone],
                    ["Email", result.email], ["Enrollment No.", result.enrollmentNumber],
                    ["College", result.collegeName], ["Branch", result.branch],
                    ["Semester", result.semester], ["Technology", result.technology],
                    ["Gender", result.gender], ["Start Date", fmtDate(result.startDate)],
                    ["End Date", fmtDate(result.endDate)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3, fontWeight: 600 }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", wordBreak: "break-word" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download history */}
              {result.downloadCount > 0 && (
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 18px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#64748b" }}>
                  <span style={{ fontSize: 18 }}>📥</span>
                  <span>Downloaded <strong>{result.downloadCount}</strong> time{result.downloadCount !== 1 ? "s" : ""} — Last: {fmtDateTime(result.lastDownloadedAt)}</span>
                </div>
              )}

              {result.status === "approved" && (
                <>
                  {/* QR Code toggle */}
                  <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #e2e8f0" }}>
                    <button
                      onClick={() => setShowQR(v => !v)}
                      style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%" }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📱</div>
                      <div style={{ textAlign: "left", flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Verification QR Code</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>Scan to verify authenticity of this offer letter</div>
                      </div>
                      <span style={{ color: "#64748b", fontSize: 18 }}>{showQR ? "▲" : "▼"}</span>
                    </button>
                    {showQR && (
                      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                          <QRCodeSVG value={verifyUrl} size={160} level="H" includeMargin />
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", maxWidth: 280 }}>
                          Scan with your phone camera to open the verification page directly.
                        </div>
                        <button
                          onClick={() => onNavigate && onNavigate("verify")}
                          style={{ fontSize: 12, color: "#1a56db", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                        >
                          Open Verification Page →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Download button */}
                  <button
                    onClick={handleDownload}
                    disabled={generating || !jspdfLoaded}
                    style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: generating ? "#94a3b8" : "linear-gradient(135deg,#1a56db,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: generating ? "not-allowed" : "pointer", boxShadow: generating ? "none" : "0 6px 24px rgba(26,86,219,0.35)", transition: "all 0.2s" }}
                    onMouseEnter={e => { if (!generating) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(26,86,219,0.45)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = generating ? "none" : "0 6px 24px rgba(26,86,219,0.35)"; }}
                  >
                    {generating ? "⏳ Generating PDF..." : "⬇ Download Offer Letter PDF"}
                  </button>

                  {/* Certificate download — only if cert approved */}
                  {result.certStatus === "approved" && (
                    <button
                      onClick={handleCertDownload}
                      disabled={generatingCert || !jspdfLoaded}
                      style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: generatingCert ? "#94a3b8" : "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: generatingCert ? "not-allowed" : "pointer", boxShadow: generatingCert ? "none" : "0 6px 24px rgba(124,58,237,0.35)", transition: "all 0.2s" }}
                      onMouseEnter={e => { if (!generatingCert) { e.currentTarget.style.transform = "translateY(-2px)"; } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                    >
                      {generatingCert ? "⏳ Generating Certificate..." : "🏆 Download Completion Certificate"}
                    </button>
                  )}
                  {result.certStatus === "pending" && (
                    <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#92400e", fontWeight: 500, textAlign: "center" }}>
                      ⏳ Certificate request is under review by HR
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
