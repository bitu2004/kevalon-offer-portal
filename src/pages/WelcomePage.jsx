import kevalonLogo from "../assets/kevalon-logo.png";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "📝",
    title: "Submit Application",
    desc: "Fill in your personal and academic details. Our system instantly generates a unique tracking token for your request.",
    color: "#1a56db",
  },
  {
    step: "02",
    icon: "⏳",
    title: "HR Review",
    desc: "Our HR team reviews your application. You can check the live status anytime using your token.",
    color: "#0ea5e9",
  },
  {
    step: "03",
    icon: "✅",
    title: "Get Approved",
    desc: "Once approved, you'll receive a confirmation. Your personalized offer letter is ready to download.",
    color: "#06b6d4",
  },
  {
    step: "04",
    icon: "⬇️",
    title: "Download PDF",
    desc: "Enter your token and download a professionally designed, system-generated internship offer letter PDF.",
    color: "#0891b2",
  },
];

const FEATURES = [
  { icon: "🔐", title: "Secure Token System",   desc: "Every application gets a unique token — your key to tracking and downloading." },
  { icon: "⚡", title: "Instant Processing",     desc: "Submit your form and get a token in seconds. No waiting, no paperwork." },
  { icon: "📄", title: "Professional PDF",       desc: "Download a beautifully designed offer letter with your details and our branding." },
  { icon: "📡", title: "Real-time Status",       desc: "Track your application status live — pending, approved, or rejected." },
  { icon: "🎓", title: "All Branches Welcome",   desc: "Open to students from all engineering and technology branches." },
  { icon: "🌐", title: "100% Online",            desc: "Completely paperless process — apply, track, and download from anywhere." },
];

export default function WelcomePage({ onNavigate }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(135deg, #0a1a3c 0%, #0d2d6b 45%, #0a4a7a 100%)",
        padding: "80px 24px 100px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,86,219,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "10%", width: 6, height: 6, borderRadius: "50%", background: "#38bdf8", opacity: 0.6 }} />
        <div style={{ position: "absolute", top: "60%", right: "15%", width: 4, height: 4, borderRadius: "50%", background: "#60a5fa", opacity: 0.5 }} />
        <div style={{ position: "absolute", top: "20%", right: "30%", width: 8, height: 8, borderRadius: "50%", background: "#0ea5e9", opacity: 0.3 }} />

        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative" }}>
          {/* Logo badge */}
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, padding: "8px 20px 8px 8px", marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={kevalonLogo} alt="Kevalon" style={{ width: 26, height: 26, objectFit: "contain" }} />
            </div>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500 }}>Kevalon Technology — Internship Portal</span>
          </div>

          <h1 className="fade-up" style={{ color: "#fff", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 20px", animationDelay: "0.1s" }}>
            Launch Your Tech Career<br />
            <span style={{ background: "linear-gradient(90deg, #38bdf8, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              with Kevalon Technology
            </span>
          </h1>

          <p className="fade-up" style={{ color: "rgba(255,255,255,0.65)", fontSize: 18, lineHeight: 1.75, maxWidth: 600, margin: "0 auto 48px", animationDelay: "0.2s" }}>
            Apply for your internship offer letter, track your application status in real-time, and download a professional PDF — all in one seamless portal.
          </p>

          {/* CTA buttons */}
          <div className="fade-up" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", animationDelay: "0.3s" }}>
            <button
              onClick={() => onNavigate("request")}
              style={{
                padding: "14px 36px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #1a56db, #0ea5e9)",
                color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 8px 32px rgba(14,165,233,0.4)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(14,165,233,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(14,165,233,0.4)"; }}
            >
              📝 Apply Now
            </button>
            <button
              onClick={() => onNavigate("track")}
              style={{
                padding: "14px 36px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
                color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "none"; }}
            >
              🔍 Track Status
            </button>
          </div>

          {/* Stats row */}
          <div className="fade-up" style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 64, flexWrap: "wrap", animationDelay: "0.4s" }}>
            {[["500+", "Applications"], ["100%", "Online Process"], ["24h", "Avg. Review Time"]].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ color: "#38bdf8", fontSize: 28, fontWeight: 800 }}>{val}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK ACTION CARDS ── */}
      <section style={{ maxWidth: 960, margin: "-40px auto 0", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {[
            {
              icon: "📝", title: "Request Offer Letter",
              desc: "Submit your details and get a unique tracking token instantly.",
              action: "request", grad: "linear-gradient(135deg,#1a56db,#0ea5e9)",
              shadow: "rgba(26,86,219,0.3)",
            },
            {
              icon: "🔍", title: "Track & Download",
              desc: "Enter your token to check status, edit details, and download your offer letter.",
              action: "track", grad: "linear-gradient(135deg,#0891b2,#06b6d4)",
              shadow: "rgba(8,145,178,0.3)",
            },
            {
              icon: "🛡️", title: "Verify Letter",
              desc: "Verify the authenticity of any Kevalon offer letter by token.",
              action: "verify", grad: "linear-gradient(135deg,#7c3aed,#a855f7)",
              shadow: "rgba(124,58,237,0.3)",
            },
          ].map(card => (
            <button
              key={card.action}
              onClick={() => onNavigate(card.action)}
              style={{
                background: "#fff", borderRadius: 20, padding: "28px 24px",
                border: "1px solid #e2e8f0", cursor: "pointer", textAlign: "left",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                transition: "all 0.25s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 16px 48px ${card.shadow}`; e.currentTarget.style.borderColor = "transparent"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: card.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16, boxShadow: `0 6px 20px ${card.shadow}` }}>
                {card.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", marginBottom: 8 }}>{card.title}</div>
              <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{card.desc}</div>
              <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, background: card.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Get started →
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 960, margin: "80px auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1px solid #bfdbfe", borderRadius: 50, padding: "6px 18px", fontSize: 13, fontWeight: 600, color: "#1a56db", marginBottom: 16 }}>
            How It Works
          </div>
          <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>
            Simple 4-Step Process
          </h2>
          <p style={{ color: "#64748b", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
            From application to offer letter — everything happens online in minutes.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, position: "relative" }}>
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} style={{ position: "relative" }}>
              {/* Connector line */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div style={{ position: "absolute", top: 36, left: "calc(50% + 36px)", width: "calc(100% - 36px)", height: 2, background: "linear-gradient(90deg,#bfdbfe,#e0f2fe)", zIndex: 0, display: "none" }} className="connector" />
              )}
              <div style={{
                background: "#fff", borderRadius: 20, padding: "28px 20px",
                border: "1px solid #e2e8f0", textAlign: "center",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                transition: "all 0.25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(26,86,219,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)"; }}
              >
                <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto" }}>
                    {item.icon}
                  </div>
                  <div style={{ position: "absolute", top: -4, right: -4, width: 22, height: 22, borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>
                    {item.step}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: "linear-gradient(135deg,#0a1a3c,#0d2d6b)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-block", background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 50, padding: "6px 18px", fontSize: 13, fontWeight: 600, color: "#38bdf8", marginBottom: 16 }}>
              Why Choose Us
            </div>
            <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>
              Everything You Need
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, maxWidth: 440, margin: "0 auto" }}>
              A complete, secure, and professional internship offer letter system.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: "24px 20px", backdropFilter: "blur(10px)",
                transition: "all 0.25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0a1a3c", padding: "32px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={kevalonLogo} alt="Kevalon" style={{ width: 20, height: 20, objectFit: "contain" }} />
          </div>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Kevalon Technology</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
          {[
            { label: "📞 +91 90810 12218", href: "tel:+919081012218" },
            { label: "✉️ ceo@kevalontechnology.in", href: "mailto:ceo@kevalontechnology.in" },
            { label: "🌐 kevalontechnology.in", href: "https://www.kevalontechnology.in" },
          ].map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
              style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#38bdf8"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
            >
              {l.label}
            </a>
          ))}
        </div>
        <button
          onClick={() => onNavigate("contact")}
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 18px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", marginBottom: 12 }}
        >
          Contact Us
        </button>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
          © 2026 Kevalon Technology. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
