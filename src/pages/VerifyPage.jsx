import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import store from "../store";
import kevalonLogo from "../assets/kevalon-logo.png";

export default function VerifyPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-check if token is in URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("verify");
    if (t) {
      setToken(t.toUpperCase());
      doVerify(t.toUpperCase());
    }
  }, []);

  const doVerify = async (t) => {
    setError(""); setResult(null);
    const tok = (t || token).trim().toUpperCase();
    if (!tok) { setError("Please enter a token."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const data = store.get(tok);
    setLoading(false);
    if (!data) { setError("No record found for this token. This letter may not be authentic."); return; }
    setResult(data);
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "";
  const verifyUrl = result?.token || "";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg,#0a1a3c,#0d2d6b)", padding: "48px 24px 64px", textAlign: "center" }} className="page-header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 50, padding: "5px 16px", fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 16 }}>
          🛡️ Verification
        </div>
        <h1 style={{ color: "#fff", fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, margin: "0 0 12px" }}>Verify Offer Letter</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
          Enter a token or scan the QR code on the offer letter to confirm it was issued by Kevalon Technology.
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: "-32px auto 0", padding: "0 20px" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 20px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <div className="token-row">
            <input
              value={token}
              onChange={e => setToken(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && doVerify()}
              placeholder="e.g. KVL-ABCD1234"
              style={{ flex: 1, minWidth: 0, padding: "13px 12px", borderRadius: 10, border: `2px solid ${error ? "#fca5a5" : "#e2e8f0"}`, fontSize: 14, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1, color: "#0f172a", outline: "none" }}
              onFocus={e => { e.target.style.borderColor = "#7c3aed"; }}
              onBlur={e => { e.target.style.borderColor = error ? "#fca5a5" : "#e2e8f0"; }}
            />
            <button
              onClick={() => doVerify()} disabled={loading}
              style={{ padding: "13px 20px", borderRadius: 10, border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.3)", flexShrink: 0 }}
            >
              {loading ? "..." : "Verify →"}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: 12, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, color: "#991b1b", fontSize: 13 }}>
              <span style={{ fontSize: 20 }}>❌</span>
              <div>
                <div style={{ fontWeight: 700 }}>Verification Failed</div>
                <div>{error}</div>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Verified banner */}
            <div style={{ background: result.status === "approved" ? "linear-gradient(135deg,#d1fae5,#a7f3d0)" : "#fef3c7", border: `1px solid ${result.status === "approved" ? "#6ee7b7" : "#fcd34d"}`, borderRadius: 16, padding: "20px" }} className="verify-banner">
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: result.status === "approved" ? "#065f46" : "#b45309", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                {result.status === "approved" ? "✅" : "⚠️"}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "clamp(16px,4vw,20px)", color: result.status === "approved" ? "#065f46" : "#92400e" }}>
                  {result.status === "approved" ? "Authentic Offer Letter" : "Letter Not Yet Approved"}
                </div>
                <div style={{ fontSize: 13, color: result.status === "approved" ? "#047857" : "#b45309", marginTop: 4, lineHeight: 1.5 }}>
                  {result.status === "approved"
                    ? "This offer letter was officially issued by Kevalon Technology."
                    : "This application exists but the offer letter has not been approved yet."}
                </div>
              </div>
            </div>

            {/* Issuer info */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0 }}>
                <img src={kevalonLogo} alt="Kevalon" style={{ width: 32, height: 32, objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Kevalon Technology</div>
                <div style={{ fontSize: 12, color: "#64748b", wordBreak: "break-all" }}>internship@kevalon.com · www.kevalontechnology.in</div>
              </div>
            </div>

            {/* Letter details */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 16 }}>Letter Details</div>
              <div className="details-grid">
                {[
                  ["Intern Name", result.fullName],
                  ["Letter ID", result.letterId],
                  ["Token", result.token],
                  ["Technology", result.technology],
                  ["College", result.collegeName],
                  ["Branch", result.branch],
                  ["Start Date", fmtDate(result.startDate)],
                  ["End Date", fmtDate(result.endDate)],
                  ["Duration", result.duration],
                  ["Status", result.status?.toUpperCase()],
                  ["Issued On", fmtDate(result.approvedAt || result.submittedAt)],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3, fontWeight: 600 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", wordBreak: "break-word" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR code */}
            {result.status === "approved" && (
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Verification QR Code</div>
                <div style={{ padding: 12, background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <QRCodeSVG value={verifyUrl} size={140} level="H" includeMargin />
                </div>
                <div style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>Scan to get the token for this offer letter</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
