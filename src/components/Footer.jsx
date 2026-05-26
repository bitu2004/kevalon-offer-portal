import kevalonLogo from "../assets/kevalon-logo.png";
import { LinkedInIcon, InstagramIcon, TwitterXIcon, WhatsAppIcon } from "./SocialIcons";

export default function Footer() {
  return (
    <footer style={{ background: "#0a1a3c", padding: "48px 24px 32px", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "auto" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Top row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={kevalonLogo} alt="Kevalon" style={{ width: 24, height: 24, objectFit: "contain" }} />
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Kevalon Technology</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.7, margin: 0 }}>
              Leading IT company in Ahmedabad delivering web, mobile & software solutions.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {[
                { Icon: LinkedInIcon, url: "https://www.linkedin.com/company/kevalon-technology", color: "#0a66c2" },
                { Icon: InstagramIcon, url: "https://www.instagram.com/kevalon_technology", color: "#e1306c" },
                { Icon: TwitterXIcon, url: "https://x.com/KevalonT", color: "#fff" },
                { Icon: WhatsAppIcon, url: "https://wa.link/a02fdn", color: "#25D366" },
              ].map(({ Icon, url, color }) => (
                <a key={url} href={url} target="_blank" rel="noreferrer"
                  style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color, transition: "background 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}>
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Contact</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["+91 90810 12218", "+91 91040 12218", "+91 97252 47990"].map(p => (
                <a key={p} href={`tel:${p.replace(/\s/g, "")}`} style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#38bdf8"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                  📞 {p}
                </a>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Email</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["ceo@kevalontechnology.in", "hr@kevalontechnology.in", "career@kevalontechnology.in"].map(e => (
                <a key={e} href={`mailto:${e}`} style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textDecoration: "none", wordBreak: "break-all" }}
                  onMouseEnter={ev => { ev.currentTarget.style.color = "#38bdf8"; }}
                  onMouseLeave={ev => { ev.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                  ✉️ {e}
                </a>
              ))}
            </div>
          </div>

          {/* Address & Hours */}
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Office</div>
            <div style={{ display: "flex", gap: 6, color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.8, alignItems: "flex-start" }}>
              <span style={{ flexShrink: 0 }}>📍</span>
              <div>
                913, Solaris Business Hub,<br />
                Parshwanath Jain BRTS, Sola Road,
                Bhuyangdev,<br />
                Ahmedabad, India
              </div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 10 }}>
              🕐 Mon – Sat : 10 AM – 7 PM
            </div>
          </div>

        </div>

        {/* Bottom row */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
            © 2026 Kevalon Technology. All rights reserved.
          </p>
          <a href="https://www.kevalontechnology.in" target="_blank" rel="noreferrer"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textDecoration: "none" }}>
            www.kevalontechnology.in
          </a>
        </div>
      </div>
    </footer>
  );
}
