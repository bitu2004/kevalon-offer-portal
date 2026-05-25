import { useState, useRef, useEffect } from "react";

const SEMESTERS = ["1st","2nd","3rd","4th","5th","6th","7th","8th"];
const TECHNOLOGIES = ["Web Development","Android Development","iOS Development","React / React Native","Node.js","Python","Java","Machine Learning / AI","Data Science","Cloud Computing","DevOps","Cybersecurity","UI/UX Design","Other"];
const BRANCHES = ["Computer Science Engineering","Information Technology","Electronics & Communication","Electrical Engineering","Mechanical Engineering","Civil Engineering","Chemical Engineering","Biotechnology","Other"];

function generateToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let t = "KVL-";
  for (let i = 0; i < 8; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

// Simple in-memory store (simulates backend)
const store = {
  requests: {},
  add(data) {
    const token = generateToken();
    this.requests[token] = { ...data, token, status: "pending", submittedAt: new Date().toISOString() };
    return token;
  },
  get(token) { return this.requests[token] || null; },
  getAll() { return Object.values(this.requests); },
  approve(token) { if (this.requests[token]) this.requests[token].status = "approved"; },
  reject(token) { if (this.requests[token]) this.requests[token].status = "rejected"; },
};

// PDF generation using pure canvas → data URL
async function generateOfferLetterPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210, H = 297;
  const today = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });

  // Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, W, H, "F");

  // Top accent bar
  doc.setFillColor(13, 74, 110);
  doc.rect(0, 0, W, 18, "F");

  // Accent stripe
  doc.setFillColor(0, 168, 204);
  doc.rect(0, 18, W, 3, "F");

  // Company name in header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("KEVALON TECHNOLOGY", W / 2, 11.5, { align: "center" });

  // Logo circle placeholder
  doc.setFillColor(0, 168, 204);
  doc.circle(20, 9, 6, "F");
  doc.setTextColor(255,255,255);
  doc.setFontSize(8);
  doc.setFont("helvetica","bold");
  doc.text("KT", 20, 11, { align: "center" });

  // Title block
  doc.setFillColor(255,255,255);
  doc.roundedRect(20, 28, W - 40, 22, 3, 3, "F");
  doc.setDrawColor(13, 74, 110);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, 28, W - 40, 22, 3, 3, "S");
  doc.setTextColor(13, 74, 110);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text("INTERNSHIP OFFER LETTER", W / 2, 41, { align: "center" });

  // Date & Token
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${today}`, 20, 58);
  doc.text(`Token: ${data.token}`, W - 20, 58, { align: "right" });

  // Greeting
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(`Dear ${data.fullName},`, 20, 68);

  // Opening paragraph
  const opening = `We are pleased to offer you an internship at Kevalon Technology. After reviewing your application and enrollment details, we are delighted to welcome you as an Intern in our ${data.technology} division.`;
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  const openLines = doc.splitTextToSize(opening, W - 40);
  doc.text(openLines, 20, 77);

  // Details box
  const boxY = 77 + openLines.length * 5 + 6;
  doc.setFillColor(240, 247, 255);
  doc.setDrawColor(13, 74, 110);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, boxY, W - 40, 72, 2, 2, "FD");

  doc.setFillColor(13, 74, 110);
  doc.roundedRect(20, boxY, W - 40, 9, 2, 2, "F");
  doc.rect(20, boxY + 5, W - 40, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("INTERNSHIP DETAILS", W / 2, boxY + 6.5, { align: "center" });

  const details = [
    ["Intern Name", data.fullName],
    ["Gender", data.gender],
    ["Enrollment No.", data.enrollmentNumber],
    ["College / University", data.collegeName],
    ["Branch", data.branch],
    ["Semester", data.semester],
    ["Technology", data.technology],
    ["Start Date", new Date(data.startDate).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})],
    ["End Date", new Date(data.endDate).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})],
  ];

  details.forEach(([label, value], i) => {
    const rowY = boxY + 14 + i * 6.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(13, 74, 110);
    doc.text(label + ":", 25, rowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(String(value || ""), 80, rowY);
  });

  const afterBox = boxY + 80;

  // Paragraph 2
  const p2 = `During your internship, you are expected to demonstrate professionalism, dedication, and a willingness to learn. You will be guided by our experienced team members who will provide mentorship throughout the duration of the program.`;
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 30);
  const p2Lines = doc.splitTextToSize(p2, W - 40);
  doc.text(p2Lines, 20, afterBox);

  const p3Y = afterBox + p2Lines.length * 5 + 5;
  const p3 = `We look forward to your valuable contribution and wish you a successful and enriching internship experience at Kevalon Technology.`;
  const p3Lines = doc.splitTextToSize(p3, W - 40);
  doc.text(p3Lines, 20, p3Y);

  // Closing
  const closingY = p3Y + p3Lines.length * 5 + 10;
  doc.text("Yours sincerely,", 20, closingY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(13, 74, 110);
  doc.text("Kevalon Technology", 20, closingY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("HR Department", 20, closingY + 18);
  doc.text("internship@kevalon.com  |  www.kevalon.com", 20, closingY + 23);

  // Signature line
  doc.setDrawColor(13, 74, 110);
  doc.setLineWidth(0.4);
  doc.line(20, closingY + 9, 75, closingY + 9);

  // Footer
  doc.setFillColor(13, 74, 110);
  doc.rect(0, H - 14, W, 14, "F");
  doc.setFillColor(0, 168, 204);
  doc.rect(0, H - 17, W, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("This is a system-generated offer letter. For queries: internship@kevalon.com", W / 2, H - 6, { align: "center" });

  doc.save(`Kevalon_OfferLetter_${data.token}.pdf`);
}

// ─── COMPONENTS ────────────────────────────────────────────────

function Input({ label, error, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>{label}</label>
      <input {...props} style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${error ? "var(--color-border-danger)" : "var(--color-border-secondary)"}`, fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none", width: "100%", boxSizing: "border-box" }} />
      {error && <span style={{ fontSize: 12, color: "var(--color-text-danger)" }}>{error}</span>}
    </div>
  );
}

function Select({ label, error, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>{label}</label>
      <select {...props} style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${error ? "var(--color-border-danger)" : "var(--color-border-secondary)"}`, fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none" }}>
        {children}
      </select>
      {error && <span style={{ fontSize: 12, color: "var(--color-text-danger)" }}>{error}</span>}
    </div>
  );
}

function Badge({ status }) {
  const map = { pending: ["#b45309","#fef3c7"], approved: ["#065f46","#d1fae5"], rejected: ["#991b1b","#fee2e2"] };
  const [color, bg] = map[status] || ["#555","#eee"];
  return <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: bg, color, fontWeight: 600, textTransform: "capitalize" }}>{status}</span>;
}

function Popup({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
      <div style={{ background: "var(--color-background-primary)", borderRadius: 16, padding: "32px 28px", maxWidth: 440, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-secondary)" }}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ─── WELCOME PAGE ────────────────────────────────────────────────

function WelcomePage({ onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0d4a6e 0%, #0a3a57 40%, #052a40 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Georgia', serif" }}>
      {/* Decorative circles */}
      <div style={{ position: "fixed", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(0,168,204,0.08)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(0,168,204,0.06)", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#00a8cc,#0d6e8e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(0,168,204,0.35)" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 22, fontFamily: "sans-serif", letterSpacing: 1 }}>KT</span>
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 700, letterSpacing: 0.5, fontFamily: "sans-serif" }}>Kevalon Technology</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontFamily: "sans-serif", letterSpacing: 1 }}>OFFER LETTER PORTAL</div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", maxWidth: 560, marginBottom: 48 }}>
        <h1 style={{ color: "#fff", fontSize: 38, fontWeight: 700, lineHeight: 1.2, margin: "0 0 16px", fontFamily: "sans-serif" }}>
          Your Internship Journey <br /><span style={{ color: "#00c8ef" }}>Starts Here</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.7, margin: 0, fontFamily: "sans-serif" }}>
          Apply for your internship offer letter, track your request status using a unique token, and download your personalized offer letter — all in one place.
        </p>
      </div>

      {/* Action cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 20, width: "100%", maxWidth: 560, marginBottom: 40 }}>
        {[
          { icon: "📝", label: "Request Offer Letter", desc: "Submit your internship application and get a tracking token", action: "request", color: "#00a8cc" },
          { icon: "⬇️", label: "Download Offer Letter", desc: "Enter your token to fetch and download your approved offer letter", action: "download", color: "#0d9e6e" },
        ].map(card => (
          <button key={card.action} onClick={() => onNavigate(card.action)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: "28px 24px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", backdropFilter: "blur(10px)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = card.color; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 17, fontFamily: "sans-serif", marginBottom: 8 }}>{card.label}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "sans-serif", lineHeight: 1.5 }}>{card.desc}</div>
            <div style={{ marginTop: 16, color: card.color, fontSize: 13, fontWeight: 600, fontFamily: "sans-serif" }}>Get started →</div>
          </button>
        ))}
      </div>

      {/* Admin link */}
      <button onClick={() => onNavigate("admin")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 20px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", letterSpacing: 0.5 }}>
        Admin Panel
      </button>
    </div>
  );
}

// ─── REQUEST FORM ────────────────────────────────────────────────

function RequestForm({ onBack }) {
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", enrollmentNumber: "", collegeName: "", branch: "",
    semester: "", technology: "", otherTechnology: "", gender: "", startDate: "", endDate: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit phone number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.enrollmentNumber.trim()) e.enrollmentNumber = "Enrollment number is required";
    if (!form.collegeName.trim()) e.collegeName = "College name is required";
    if (!form.branch) e.branch = "Branch is required";
    if (!form.semester) e.semester = "Semester is required";
    if (!form.technology) e.technology = "Technology is required";
    if (form.technology === "Other" && !form.otherTechnology.trim()) e.otherTechnology = "Please specify technology";
    if (!form.gender) e.gender = "Gender is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.endDate) e.endDate = "End date is required";
    if (form.startDate && form.endDate && form.endDate <= form.startDate) e.endDate = "End date must be after start date";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    const technologyFinal = form.technology === "Other" ? form.otherTechnology : form.technology;
    const token = store.add({ ...form, technology: technologyFinal });
    setSubmitting(false);
    setPopup(token);
  };

  const inputStyle = { gap: 6 };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", padding: "0 0 60px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0d4a6e,#0a3a57)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "sans-serif" }}>← Back</button>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, fontFamily: "sans-serif" }}>Request Offer Letter</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "sans-serif" }}>Fill in your details to apply</div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "32px auto", padding: "0 20px" }}>
        <div style={{ background: "var(--color-background-primary)", borderRadius: 16, padding: "32px 28px", border: "1px solid var(--color-border-tertiary)" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 600, fontFamily: "sans-serif" }}>Personal Information</h2>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--color-text-secondary)", fontFamily: "sans-serif" }}>All fields marked are required. Token is generated after submission.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Full Name *" value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Enter your full name" error={errors.fullName} />
            </div>
            <Input label="Phone Number *" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, ""))} placeholder="10-digit phone number" maxLength={10} error={errors.phone} />
            <Input label="Email ID *" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@college.edu" error={errors.email} />
            <Input label="Enrollment Number *" value={form.enrollmentNumber} onChange={e => set("enrollmentNumber", e.target.value)} placeholder="e.g. EN2021CS001" error={errors.enrollmentNumber} />
            <Select label="Branch *" value={form.branch} onChange={e => set("branch", e.target.value)} error={errors.branch}>
              <option value="">Select branch</option>
              {BRANCHES.map(b => <option key={b}>{b}</option>)}
            </Select>
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="College / University Name *" value={form.collegeName} onChange={e => set("collegeName", e.target.value)} placeholder="Enter your institution name" error={errors.collegeName} />
            </div>
            <Select label="Semester *" value={form.semester} onChange={e => set("semester", e.target.value)} error={errors.semester}>
              <option value="">Select semester</option>
              {SEMESTERS.map(s => <option key={s}>{s} Semester</option>)}
            </Select>
            <Select label="Gender *" value={form.gender} onChange={e => set("gender", e.target.value)} error={errors.gender}>
              <option value="">Select gender</option>
              <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
            </Select>
            <div style={{ gridColumn: "1 / -1" }}>
              <Select label="Technology *" value={form.technology} onChange={e => set("technology", e.target.value)} error={errors.technology}>
                <option value="">Select technology</option>
                {TECHNOLOGIES.map(t => <option key={t}>{t}</option>)}
              </Select>
            </div>
            {form.technology === "Other" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <Input label="Specify Technology *" value={form.otherTechnology} onChange={e => set("otherTechnology", e.target.value)} placeholder="Enter technology name" error={errors.otherTechnology} />
              </div>
            )}
            <Input label="Start Date *" type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} error={errors.startDate} />
            <Input label="End Date *" type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} error={errors.endDate} />
          </div>

          <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={onBack} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid var(--color-border-secondary)", background: "transparent", cursor: "pointer", fontSize: 14, fontFamily: "sans-serif", color: "var(--color-text-secondary)" }}>Cancel</button>
            <button onClick={handleSubmit} disabled={submitting} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: submitting ? "#666" : "linear-gradient(135deg,#0d6e8e,#0d4a6e)", color: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, fontFamily: "sans-serif" }}>
              {submitting ? "Submitting..." : "Register"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <Popup show={!!popup} onClose={() => { setPopup(null); onBack(); }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>✅</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 20, fontFamily: "sans-serif" }}>Registration Successful!</h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14, fontFamily: "sans-serif", margin: "0 0 20px" }}>
            You have successfully registered for the offer letter request.
          </p>
          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#0369a1", fontFamily: "sans-serif", marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>YOUR TOKEN</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "monospace", color: "#0d4a6e", letterSpacing: 3 }}>{popup}</div>
          </div>
          <p style={{ color: "#b45309", fontSize: 13, background: "#fef3c7", borderRadius: 8, padding: "10px 16px", fontFamily: "sans-serif", margin: "0 0 20px" }}>
            ⚠️ Please save this token or take a screenshot. It is required to download your offer letter after approval.
          </p>
          <button onClick={() => { setPopup(null); onBack(); }} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#0d6e8e,#0d4a6e)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "sans-serif" }}>
            Done
          </button>
        </div>
      </Popup>
    </div>
  );
}

// ─── DOWNLOAD SECTION ────────────────────────────────────────────

function DownloadSection({ onBack }) {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [jspdfLoaded, setJspdfLoaded] = useState(false);

  useEffect(() => {
    if (window.jspdf) { setJspdfLoaded(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => setJspdfLoaded(true);
    document.head.appendChild(s);
  }, []);

  const handleFetch = async () => {
    setError(""); setResult(null);
    if (!token.trim()) { setError("Please enter your token."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
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
    setGenerating(false);
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", paddingBottom: 60 }}>
      <div style={{ background: "linear-gradient(135deg,#065f46,#044a38)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "sans-serif" }}>← Back</button>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, fontFamily: "sans-serif" }}>Download Offer Letter</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "sans-serif" }}>Enter your token to fetch details</div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "32px auto", padding: "0 20px" }}>
        <div style={{ background: "var(--color-background-primary)", borderRadius: 16, padding: "28px", border: "1px solid var(--color-border-tertiary)", marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", fontFamily: "sans-serif", marginBottom: 6 }}>Your Token *</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={token} onChange={e => setToken(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && handleFetch()} placeholder="e.g. KVL-ABCD1234" style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--color-border-secondary)", fontSize: 15, fontFamily: "monospace", fontWeight: 600, letterSpacing: 2, background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none" }} />
            <button onClick={handleFetch} disabled={loading} style={{ padding: "10px 22px", borderRadius: 8, background: "linear-gradient(135deg,#065f46,#044a38)", border: "none", color: "#fff", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", fontFamily: "sans-serif" }}>
              {loading ? "..." : "Fetch"}
            </button>
          </div>
          {error && <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--color-text-danger)", fontFamily: "sans-serif" }}>{error}</p>}
        </div>

        {result && (
          <div style={{ background: "var(--color-background-primary)", borderRadius: 16, padding: "28px", border: "1px solid var(--color-border-tertiary)" }}>
            {/* Status banner */}
            {result.status === "rejected" && (
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>❌</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, fontFamily: "sans-serif", color: "#991b1b" }}>Request Not Accepted</div>
                  <div style={{ fontSize: 13, color: "#b91c1c", fontFamily: "sans-serif" }}>Your request is not accepted. Please contact HR for more information.</div>
                </div>
              </div>
            )}
            {result.status === "pending" && (
              <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>⏳</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, fontFamily: "sans-serif", color: "#92400e" }}>Pending Review</div>
                  <div style={{ fontSize: 13, color: "#b45309", fontFamily: "sans-serif" }}>Your request is under review. Please check back later.</div>
                </div>
              </div>
            )}
            {result.status === "approved" && (
              <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>✅</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, fontFamily: "sans-serif", color: "#065f46" }}>Request Accepted!</div>
                  <div style={{ fontSize: 13, color: "#047857", fontFamily: "sans-serif" }}>Your request is accepted. Here is your token: <strong>{result.token}</strong></div>
                </div>
              </div>
            )}

            {/* Details */}
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontFamily: "sans-serif" }}>Submitted Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
              {[
                ["Full Name", result.fullName], ["Phone", result.phone], ["Email", result.email],
                ["Enrollment No.", result.enrollmentNumber], ["College", result.collegeName], ["Branch", result.branch],
                ["Semester", result.semester], ["Technology", result.technology], ["Gender", result.gender],
                ["Start Date", fmtDate(result.startDate)], ["End Date", fmtDate(result.endDate)],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "sans-serif", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, fontFamily: "sans-serif", color: "var(--color-text-primary)" }}>{v}</div>
                </div>
              ))}
            </div>

            {result.status === "approved" && (
              <button onClick={handleDownload} disabled={generating || !jspdfLoaded} style={{ marginTop: 24, width: "100%", padding: "14px", background: generating ? "#555" : "linear-gradient(135deg,#0d6e8e,#0d4a6e)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: generating ? "not-allowed" : "pointer", fontFamily: "sans-serif", letterSpacing: 0.5 }}>
                {generating ? "⏳ Generating PDF..." : "⬇ Download Offer Letter PDF"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ────────────────────────────────────────────────

function AdminPanel({ onBack }) {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const refresh = () => setRequests([...store.getAll()].reverse());

  const login = () => {
    if (pwd === "admin123") { setAuthed(true); refresh(); }
    else setPwdErr("Invalid password. (Hint: admin123)");
  };

  const approve = (token) => { store.approve(token); refresh(); setSelected(null); };
  const reject = (token) => { store.reject(token); refresh(); setSelected(null); };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--color-background-primary)", borderRadius: 16, padding: "40px 36px", maxWidth: 360, width: "100%", border: "1px solid var(--color-border-tertiary)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "linear-gradient(135deg,#0d6e8e,#0d4a6e)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <span style={{ fontSize: 22 }}>🔒</span>
          </div>
          <h2 style={{ margin: 0, fontFamily: "sans-serif", fontSize: 20 }}>Admin Login</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 13, fontFamily: "sans-serif", margin: "6px 0 0" }}>Kevalon Technology HR Portal</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: "var(--color-text-secondary)", fontFamily: "sans-serif" }}>Password</label>
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Enter admin password" style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--color-border-secondary)", fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} />
          {pwdErr && <p style={{ fontSize: 12, color: "var(--color-text-danger)", margin: "6px 0 0", fontFamily: "sans-serif" }}>{pwdErr}</p>}
        </div>
        <button onClick={login} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#0d6e8e,#0d4a6e)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "sans-serif" }}>Login</button>
        <button onClick={onBack} style={{ display: "block", margin: "12px auto 0", background: "none", border: "none", color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" }}>← Back to portal</button>
      </div>
    </div>
  );

  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN") : "";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", paddingBottom: 60 }}>
      <div style={{ background: "linear-gradient(135deg,#0d4a6e,#0a3a57)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "sans-serif" }}>← Back</button>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, fontFamily: "sans-serif" }}>Admin Panel</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["all","pending","approved","rejected"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.25)", background: filter === f ? "#fff" : "transparent", color: filter === f ? "#0d4a6e" : "#fff", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", textTransform: "capitalize", fontWeight: filter === f ? 600 : 400 }}>{f}</button>
          ))}
          <button onClick={refresh} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif" }}>↻ Refresh</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "28px auto", padding: "0 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ background: "var(--color-background-primary)", borderRadius: 16, padding: 48, textAlign: "center", border: "1px solid var(--color-border-tertiary)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ color: "var(--color-text-secondary)", fontFamily: "sans-serif" }}>No requests found. Submit a request from the portal to see it here.</p>
          </div>
        ) : filtered.map(req => (
          <div key={req.token} style={{ background: "var(--color-background-primary)", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--color-border-tertiary)", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, fontFamily: "sans-serif" }}>{req.fullName}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "sans-serif" }}>{req.email} · {req.collegeName}</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#0d6e8e", marginTop: 2, letterSpacing: 1 }}>{req.token}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge status={req.status} />
                {req.status === "pending" && (
                  <>
                    <button onClick={() => approve(req.token)} style={{ padding: "6px 16px", borderRadius: 8, background: "#065f46", border: "none", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 500 }}>Approve</button>
                    <button onClick={() => reject(req.token)} style={{ padding: "6px 16px", borderRadius: 8, background: "#991b1b", border: "none", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 500 }}>Reject</button>
                  </>
                )}
                <button onClick={() => setSelected(selected?.token === req.token ? null : req)} style={{ padding: "6px 14px", borderRadius: 8, background: "var(--color-background-secondary)", border: "1px solid var(--color-border-tertiary)", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", color: "var(--color-text-secondary)" }}>
                  {selected?.token === req.token ? "Hide" : "View"}
                </button>
              </div>
            </div>

            {selected?.token === req.token && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border-tertiary)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 20px" }}>
                {[["Phone", req.phone], ["Branch", req.branch], ["Semester", req.semester], ["Technology", req.technology], ["Gender", req.gender], ["Enrollment No.", req.enrollmentNumber], ["Start Date", fmtDate(req.startDate)], ["End Date", fmtDate(req.endDate)], ["Applied On", fmtDate(req.submittedAt)]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</div>
                    <div style={{ fontSize: 13, fontFamily: "sans-serif", marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "request") return <RequestForm onBack={() => setPage("home")} />;
  if (page === "download") return <DownloadSection onBack={() => setPage("home")} />;
  if (page === "admin") return <AdminPanel onBack={() => setPage("home")} />;
  return <WelcomePage onNavigate={setPage} />;
}
