import { useState } from "react";
import kevalonLogo from "../assets/kevalon-logo.png";

export default function Navbar({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "Home",          key: "home" },
    { label: "Apply",         key: "request" },
    { label: "Track Status",  key: "track" },
    { label: "Download",      key: "download" },
    { label: "Verify",        key: "verify" },
  ];

  const active = {
    background: "linear-gradient(135deg,#1a56db,#0ea5e9)",
    color: "#fff",
    borderRadius: 8,
    padding: "7px 16px",
    fontWeight: 600,
  };
  const normal = {
    color: "rgba(255,255,255,0.75)",
    padding: "7px 16px",
    borderRadius: 8,
    fontWeight: 500,
    transition: "all 0.2s",
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10,26,60,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "0 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 64,
    }}>
      {/* Brand */}
      <button
        onClick={() => onNavigate("home")}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", minWidth: 0 }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: "#fff", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(26,86,219,0.25)",
        }}>
          <img src={kevalonLogo} alt="Kevalon" style={{ width: 28, height: 28, objectFit: "contain" }} />
        </div>
        <div style={{ textAlign: "left", overflow: "hidden" }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Kevalon Technology</div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>Offer Portal</div>
        </div>
      </button>

      {/* Desktop links */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="desktop-nav">
        {links.map(l => (
          <button
            key={l.key}
            onClick={() => onNavigate(l.key)}
            style={{
              ...(page === l.key ? active : normal),
              background: page === l.key ? "linear-gradient(135deg,#1a56db,#0ea5e9)" : "transparent",
              border: "none", cursor: "pointer", fontSize: 14,
            }}
            onMouseEnter={e => { if (page !== l.key) e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { if (page !== l.key) e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
          >
            {l.label}
          </button>
        ))}
        <button
          onClick={() => onNavigate("admin")}
          style={{
            marginLeft: 8,
            padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 13,
            cursor: "pointer", fontWeight: 500, transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
        >
          🔒 Admin
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(o => !o)}
        style={{ display: "none", background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}
        className="hamburger"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "absolute", top: 64, left: 0, right: 0,
          background: "rgba(10,26,60,0.98)", backdropFilter: "blur(16px)",
          padding: "16px 24px", display: "flex", flexDirection: "column", gap: 4,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          {[...links, { label: "🔒 Admin", key: "admin" }].map(l => (
            <button
              key={l.key}
              onClick={() => { onNavigate(l.key); setMenuOpen(false); }}
              style={{
                padding: "12px 16px", borderRadius: 8, border: "none", textAlign: "left",
                background: page === l.key ? "linear-gradient(135deg,#1a56db,#0ea5e9)" : "transparent",
                color: page === l.key ? "#fff" : "rgba(255,255,255,0.75)",
                fontSize: 15, fontWeight: page === l.key ? 600 : 400, cursor: "pointer",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
