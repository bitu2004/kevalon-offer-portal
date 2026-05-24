import { useState } from "react";
import kevalonLogo from "../assets/kevalon-logo.png";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSend = () => {
    if (!form.name.trim() || !form.message.trim()) return;
    // Opens email client with pre-filled message
    const subject = encodeURIComponent(`Internship Portal Enquiry from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
    );
    window.open(`mailto:ceo@kevalontechnology.in?subject=${subject}&body=${body}`);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: 80 }}>

      {/* Page header */}
      <div style={{ background: "linear-gradient(135deg,#0a1a3c,#0d2d6b)", padding: "48px 24px 64px", textAlign: "center" }} className="page-header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 50, padding: "5px 16px", fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 16 }}>
          📬 Contact Us
        </div>
        <h1 style={{ color: "#fff", fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, margin: "0 0 12px" }}>Get in Touch</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
          Have questions about your internship offer letter? We're here to help.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: "-32px auto 0", padding: "0 20px" }}>

        {/* Company brand row */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "22px 24px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", flexShrink: 0 }}>
            <img src={kevalonLogo} alt="Kevalon" style={{ width: 42, height: 42, objectFit: "contain" }} />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>Kevalon Technology</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>Leading IT Company · Ahmedabad, Gujarat, India</div>
          </div>
          <a href="https://www.kevalontechnology.in" target="_blank" rel="noreferrer"
            style={{ padding: "9px 20px", borderRadius: 10, background: "linear-gradient(135deg,#1a56db,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            Visit Website →
          </a>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 20 }}>

          {/* LEFT: Contact info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Office */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef3c7", border: "1px solid #fcd34d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📍</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Office</div>
              </div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
                913, Solaris Business Hub,<br />
                Parshwanath Jain BRTS, Sola Road,<br />
                Bhuyangdev, Ahmedabad, India
              </div>
              <a href="https://maps.google.com/?q=Solaris+Business+Hub+Sola+Road+Bhuyangdev+Ahmedabad" target="_blank" rel="noreferrer"
                style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: "#1a56db", fontWeight: 600, textDecoration: "none" }}>
                📍 View on Google Maps →
              </a>
            </div>

            {/* Phone */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📞</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Phone</div>
              </div>
              {["+91 90810 12218", "+91 91040 12218", "+91 97252 47990"].map(p => (
                <a key={p} href={`tel:${p.replace(/\s/g, "")}`}
                  style={{ display: "block", fontSize: 14, color: "#1a56db", fontWeight: 600, textDecoration: "none", marginBottom: 6, lineHeight: 1.5 }}>
                  {p}
                </a>
              ))}
            </div>

            {/* Email */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#d1fae5", border: "1px solid #6ee7b7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✉️</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Email</div>
              </div>
              {["ceo@kevalontechnology.in", "hr@kevalontechnology.in", "career@kevalontechnology.in"].map(e => (
                <a key={e} href={`mailto:${e}`}
                  style={{ display: "block", fontSize: 13, color: "#065f46", fontWeight: 600, textDecoration: "none", marginBottom: 6, wordBreak: "break-all", lineHeight: 1.5 }}>
                  {e}
                </a>
              ))}
            </div>

            {/* Working Hours */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ede9fe", border: "1px solid #c4b5fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🕐</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Working Hours</div>
              </div>
              <div style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>Mon – Sat : 10 AM – 7 PM</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Sunday: Closed</div>
            </div>

          </div>

          {/* RIGHT: Send a message form */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1a56db,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💬</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Send Us a Message</div>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>We'll respond within 24 hours.</div>

            {sent && (
              <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#065f46", fontWeight: 600 }}>
                ✅ Message opened in your email app. Thank you!
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Your Name *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Enter your full name"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "2px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = "#1a56db"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Email Address</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "2px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = "#1a56db"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Phone Number</label>
                <input value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, ""))} placeholder="10-digit number" maxLength={10}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "2px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = "#1a56db"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Message *</label>
                <textarea value={form.message} onChange={e => set("message", e.target.value)} placeholder="Write your query here..."
                  rows={5}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "2px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" }}
                  onFocus={e => { e.target.style.borderColor = "#1a56db"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!form.name.trim() || !form.message.trim()}
                style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: form.name.trim() && form.message.trim() ? "linear-gradient(135deg,#1a56db,#0ea5e9)" : "#94a3b8", color: "#fff", fontWeight: 700, fontSize: 15, cursor: form.name.trim() && form.message.trim() ? "pointer" : "not-allowed", boxShadow: form.name.trim() && form.message.trim() ? "0 4px 16px rgba(26,86,219,0.3)" : "none" }}
              >
                Send Message →
              </button>
            </div>
          </div>
        </div>

        {/* Social + WhatsApp row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <a href="https://wa.link/a02fdn" target="_blank" rel="noreferrer"
            style={{ background: "#25D366", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
            <span style={{ fontSize: 32 }}>💬</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Chat on WhatsApp</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>Quick response guaranteed</div>
            </div>
          </a>
          <div style={{ background: "linear-gradient(135deg,#0a1a3c,#0d2d6b)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Follow Us</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "LinkedIn",  url: "https://www.linkedin.com/company/kevalon-technology", icon: "💼" },
                { label: "Instagram", url: "https://www.instagram.com/kevalon_technology",         icon: "📸" },
                { label: "Twitter",   url: "https://x.com/KevalonT",                              icon: "🐦" },
              ].map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 600px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
