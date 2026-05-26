import { useState } from "react";
import Input from "../components/Input";
import Select from "../components/Select";
import Popup from "../components/Popup";
import store, { calcDuration } from "../store";
import { SEMESTERS, TECHNOLOGIES, BRANCHES, TEMPLATES } from "../constants";
import { whatsappLink, mailtoLink, msgSubmitted, emailSubmitted } from "../utils/notifications";
import { submitApplication as apiSubmit, checkBackendHealth } from "../utils/api";

export default function RequestForm({ onNavigate }) {
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", enrollmentNumber: "", collegeName: "", branch: "",
    semester: "", technology: "", otherTechnology: "", gender: "", startDate: "", endDate: "",
    template: "internship", consentGiven: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [darkMode] = useState(() => localStorage.getItem("kvl_dark") === "1");

  // Duplicate / smart warning state
  const [duplicateWarnings, setDuplicateWarnings] = useState([]);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [smartWarnings, setSmartWarnings] = useState([]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    // Clear smart warning for this field when user edits it
    setSmartWarnings(w => w.filter(x => x.field !== k));
  };

  // ── Auto-fill ──────────────────────────────────────────────────────────────
  const handleEmailBlur = () => {
    if (autoFilled || !form.email.trim()) return;
    const existing = store.findByContact(form.email.trim(), "");
    if (existing) {
      setForm(f => ({
        ...f,
        fullName: existing.fullName || f.fullName,
        phone: existing.phone || f.phone,
        enrollmentNumber: existing.enrollmentNumber || f.enrollmentNumber,
        collegeName: existing.collegeName || f.collegeName,
        branch: existing.branch || f.branch,
        semester: existing.semester || f.semester,
        gender: existing.gender || f.gender,
      }));
      setAutoFilled(true);
    }
    // Check duplicates on email blur
    checkDuplicates(form.email.trim(), form.enrollmentNumber.trim());
  };

  const handlePhoneBlur = () => {
    if (autoFilled || !form.phone.trim()) return;
    const existing = store.findByContact("", form.phone.trim());
    if (existing) {
      setForm(f => ({
        ...f,
        fullName: existing.fullName || f.fullName,
        email: existing.email || f.email,
        enrollmentNumber: existing.enrollmentNumber || f.enrollmentNumber,
        collegeName: existing.collegeName || f.collegeName,
        branch: existing.branch || f.branch,
        semester: existing.semester || f.semester,
        gender: existing.gender || f.gender,
      }));
      setAutoFilled(true);
    }
  };

  const handleEnrollmentBlur = () => {
    if (!form.enrollmentNumber.trim()) return;
    checkDuplicates(form.email.trim(), form.enrollmentNumber.trim());
  };

  // ── Duplicate detection ────────────────────────────────────────────────────
  const checkDuplicates = (email, enrollmentNumber) => {
    if (!email && !enrollmentNumber) return;
    const dupes = store.findDuplicates(email, enrollmentNumber);
    setDuplicateWarnings(dupes);
  };

  // ── Smart error prevention ─────────────────────────────────────────────────
  const runSmartChecks = (f) => {
    const warnings = [];
    // Future start date check
    if (f.startDate) {
      const start = new Date(f.startDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (start < now) {
        warnings.push({ field: "startDate", msg: "Start date is in the past. Is this intentional?" });
      }
    }
    // Very short duration
    if (f.startDate && f.endDate) {
      const ms = new Date(f.endDate) - new Date(f.startDate);
      const days = ms / (1000 * 60 * 60 * 24);
      if (days < 7) {
        warnings.push({ field: "endDate", msg: "Internship duration is less than 1 week. Please verify dates." });
      }
      if (days > 365) {
        warnings.push({ field: "endDate", msg: "Internship duration exceeds 1 year. Please verify dates." });
      }
    }
    // Suspicious enrollment number (too short)
    if (f.enrollmentNumber && f.enrollmentNumber.trim().length < 5) {
      warnings.push({ field: "enrollmentNumber", msg: "Enrollment number seems too short. Please verify." });
    }
    // Generic email domains that might be wrong
    if (f.email && (f.email.includes("test@") || f.email.includes("dummy@") || f.email.includes("abc@"))) {
      warnings.push({ field: "email", msg: "This looks like a test email. Please use your real email." });
    }
    return warnings;
  };

  const duration = calcDuration(form.startDate, form.endDate);

  // ── Validation ─────────────────────────────────────────────────────────────
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
    if (!form.consentGiven) e.consentGiven = "You must agree to the terms before submitting";
    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    // Run smart checks
    const sw = runSmartChecks(form);
    setSmartWarnings(sw);

    // Check duplicates
    const dupes = store.findDuplicates(form.email.trim(), form.enrollmentNumber.trim());
    setDuplicateWarnings(dupes);

    // If there are duplicates or smart warnings, show confirmation first
    if ((dupes.length > 0 || sw.length > 0) && !showDuplicateConfirm) {
      setShowDuplicateConfirm(true);
      return;
    }

    setShowDuplicateConfirm(false);
    setSubmitting(true);

    const technologyFinal = form.technology === "Other" ? form.otherTechnology : form.technology;
    const formData = { ...form, technology: technologyFinal };

    try {
      // Try backend first
      const backendUp = await checkBackendHealth();
      if (backendUp) {
        const res = await apiSubmit(formData);
        // Also save to localStorage for offline access
        store.add({ ...formData, _backendId: res.data?.uniqueId });
        setSubmitting(false);
        setPopup(res.data?.uniqueId || res.uniqueId);
      } else {
        // Fallback to localStorage
        const token = store.add(formData);
        setSubmitting(false);
        setPopup(token);
      }
    } catch (err) {
      // Backend error — fallback to localStorage
      const token = store.add(formData);
      setSubmitting(false);
      setPopup(token);
    }
  };

  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const card = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const text = darkMode ? "#f1f5f9" : "#0f172a";
  const sub = darkMode ? "#94a3b8" : "#64748b";

  return (
    <div style={{ minHeight: "100vh", background: bg, paddingBottom: 80 }}>
      {/* Page header */}
      <div style={{ background: "linear-gradient(135deg,#0a1a3c,#0d2d6b)", padding: "48px 24px 64px", textAlign: "center" }} className="page-header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 50, padding: "5px 16px", fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 16 }}>
          📝 New Application
        </div>
        <h1 style={{ color: "#fff", fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, margin: "0 0 12px" }}>
          Request Offer Letter
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 440, margin: "0 auto" }}>
          Fill in your details below. A unique tracking token will be generated upon submission.
        </p>
      </div>

      <div style={{ maxWidth: 700, margin: "-32px auto 0", padding: "0 20px" }}>
        {autoFilled && (
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#1a56db", fontWeight: 500 }}>
            ✨ Details auto-filled from a previous application. Please verify before submitting.
          </div>
        )}

        <div style={{ background: card, borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.1)", border: `1px solid ${border}` }} className="form-card">

          {/* Template selector */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📋</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: text }}>Letter Type</div>
                <div style={{ fontSize: 12, color: sub }}>Select the type of offer letter</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
              {TEMPLATES.map(t => (
                <button
                  key={t.value}
                  onClick={() => set("template", t.value)}
                  style={{
                    padding: "12px 10px", borderRadius: 10, border: `2px solid ${form.template === t.value ? "#1a56db" : border}`,
                    background: form.template === t.value ? "#eff6ff" : card,
                    cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: form.template === t.value ? "#1a56db" : text }}>{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: border, margin: "0 0 24px" }} />

          {/* Personal */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: text }}>Personal Information</div>
              <div style={{ fontSize: 12, color: sub }}>All fields marked * are required</div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 28 }}>
            <div className="col-full">
              <Input label="Full Name *" value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Enter your full name" error={errors.fullName} />
            </div>
            <Input label="Phone Number *" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, ""))} onBlur={handlePhoneBlur} placeholder="10-digit phone number" maxLength={10} error={errors.phone} />
            <Input label="Email ID *" type="email" value={form.email} onChange={e => set("email", e.target.value)} onBlur={handleEmailBlur} placeholder="you@college.edu" error={errors.email} />
            <Select label="Gender *" value={form.gender} onChange={e => set("gender", e.target.value)} error={errors.gender}>
              <option value="">Select gender</option>
              <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
            </Select>
            <Input label="Enrollment Number *" value={form.enrollmentNumber} onChange={e => set("enrollmentNumber", e.target.value)} onBlur={handleEnrollmentBlur} placeholder="e.g. EN2021CS001" error={errors.enrollmentNumber} />
          </div>

          <div style={{ height: 1, background: border, margin: "0 0 24px" }} />

          {/* Academic */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: text }}>Academic Details</div>
              <div style={{ fontSize: 12, color: sub }}>Your college and course information</div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 28 }}>
            <div className="col-full">
              <Input label="College / University Name *" value={form.collegeName} onChange={e => set("collegeName", e.target.value)} placeholder="Enter your institution name" error={errors.collegeName} />
            </div>
            <Select label="Branch *" value={form.branch} onChange={e => set("branch", e.target.value)} error={errors.branch}>
              <option value="">Select branch</option>
              {BRANCHES.map(b => <option key={b}>{b}</option>)}
            </Select>
            <Select label="Semester *" value={form.semester} onChange={e => set("semester", e.target.value)} error={errors.semester}>
              <option value="">Select semester</option>
              {SEMESTERS.map(s => <option key={s}>{s} Semester</option>)}
            </Select>
            <div className="col-full">
              <Select label="Technology *" value={form.technology} onChange={e => set("technology", e.target.value)} error={errors.technology}>
                <option value="">Select technology</option>
                {TECHNOLOGIES.map(t => <option key={t}>{t}</option>)}
              </Select>
            </div>
            {form.technology === "Other" && (
              <div className="col-full">
                <Input label="Specify Technology *" value={form.otherTechnology} onChange={e => set("otherTechnology", e.target.value)} placeholder="Enter technology name" error={errors.otherTechnology} />
              </div>
            )}
          </div>

          <div style={{ height: 1, background: border, margin: "0 0 24px" }} />

          {/* Dates */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: text }}>Internship Duration</div>
              <div style={{ fontSize: 12, color: sub }}>Start and end dates of your internship</div>
            </div>
          </div>

          <div className="grid-2">
            <Input label="Start Date *" type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} error={errors.startDate} />
            <Input label="End Date *" type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} error={errors.endDate} />
          </div>

          {duration && (
            <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "#065f46" }}>
              ⏱ Duration: {duration}
            </div>
          )}

          {/* Smart warnings */}
          {smartWarnings.length > 0 && (
            <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 12, padding: "14px 16px", marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#92400e", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                ⚠️ Please review before submitting
              </div>
              {smartWarnings.map((w, i) => (
                <div key={i} style={{ fontSize: 12, color: "#b45309", marginBottom: 4, display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ flexShrink: 0 }}>•</span> {w.msg}
                </div>
              ))}
            </div>
          )}

          {/* Duplicate warning */}
          {duplicateWarnings.length > 0 && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 12, padding: "14px 16px", marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#991b1b", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                🔴 Duplicate Application Detected
              </div>
              {duplicateWarnings.map((d, i) => (
                <div key={i} style={{ fontSize: 12, color: "#b91c1c", marginBottom: 4 }}>
                  • Existing request found — <strong>{d.fullName}</strong> ({d.email}) · Status: <strong style={{ textTransform: "capitalize" }}>{d.status}</strong> · Token: <span style={{ fontFamily: "monospace" }}>{d.token}</span>
                </div>
              ))}
              <div style={{ fontSize: 12, color: "#991b1b", marginTop: 6, fontStyle: "italic" }}>
                You can still submit, but please ensure this is not a duplicate request.
              </div>
            </div>
          )}

          {/* Duplicate/warning confirmation */}
          {showDuplicateConfirm && (
            <div style={{ background: "#fff7ed", border: "2px solid #fb923c", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#c2410c", marginBottom: 8 }}>⚠️ Confirm Submission</div>
              <div style={{ fontSize: 13, color: "#7c2d12", marginBottom: 14, lineHeight: 1.6 }}>
                {duplicateWarnings.length > 0 && "A similar application already exists. "}
                {smartWarnings.length > 0 && "Some details need your attention. "}
                Are you sure you want to proceed with this submission?
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowDuplicateConfirm(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Go Back & Review
                </button>
                <button onClick={handleSubmit} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#c2410c,#ea580c)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Yes, Submit Anyway
                </button>
              </div>
            </div>
          )}

          <div style={{ height: 1, background: border, margin: "24px 0" }} />

          {/* Consent */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.consentGiven}
              onChange={e => set("consentGiven", e.target.checked)}
              style={{ width: 18, height: 18, marginTop: 2, accentColor: "#1a56db", cursor: "pointer", flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, color: sub, lineHeight: 1.6 }}>
              I confirm that all the details provided are accurate and I understand the offer letter usage policy of Kevalon Technology. I agree to the terms and conditions.
            </span>
          </label>
          {errors.consentGiven && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
              ⚠ {errors.consentGiven}
            </div>
          )}

          {/* Submit */}
          <div style={{ marginTop: 28 }}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: "100%", padding: "15px", borderRadius: 12, border: "none",
                background: submitting ? "#94a3b8" : "linear-gradient(135deg,#1a56db,#0ea5e9)",
                color: "#fff", fontSize: 16, fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: submitting ? "none" : "0 6px 24px rgba(26,86,219,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(26,86,219,0.45)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = submitting ? "none" : "0 6px 24px rgba(26,86,219,0.35)"; }}
            >
              {submitting ? "⏳ Submitting..." : "🚀 Submit Application"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <Popup show={!!popup} onClose={() => setPopup(null)}>
        <div style={{ textAlign: "center" }} className="popup-inner">
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#d1fae5,#a7f3d0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>✅</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Application Submitted!</h3>
          <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
            Your internship offer letter request has been received. Save your token below.
          </p>
          <div style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1px solid #bfdbfe", borderRadius: 14, padding: "20px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#1a56db", marginBottom: 6, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Your Tracking Token</div>
            <div style={{ fontWeight: 800, fontFamily: "monospace", color: "#0f172a", wordBreak: "break-all" }} className="popup-token">{popup}</div>
          </div>
          {popup && (() => {
            const rec = store.get(popup);
            return rec ? (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#64748b", textAlign: "left" }}>
                <div><strong>Letter ID:</strong> {rec.letterId}</div>
                {rec.duration && <div><strong>Duration:</strong> {rec.duration}</div>}
              </div>
            ) : null;
          })()}
          <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 8, textAlign: "left" }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <p style={{ color: "#92400e", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              Save this token or take a screenshot. You need it to track status and download your offer letter.
            </p>
          </div>

          {/* WhatsApp & Email share */}
          {popup && (() => {
            const rec = store.get(popup);
            if (!rec) return null;
            const waMsg = msgSubmitted(rec.fullName, rec.token, rec.letterId);
            const { subject, body } = emailSubmitted(rec.fullName, rec.token, rec.letterId);
            return (
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <a
                  href={whatsappLink(rec.phone, waMsg)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ flex: 1, padding: "11px", borderRadius: 10, background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <span style={{ fontSize: 16 }}>💬</span> WhatsApp
                </a>
                <a
                  href={mailtoLink(rec.email, subject, body)}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, background: "#ea4335", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <span style={{ fontSize: 16 }}>✉️</span> Email
                </a>
              </div>
            );
          })()}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => { setPopup(null); onNavigate && onNavigate("track"); }}
              style={{ flex: 1, padding: "12px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, color: "#0f172a", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            >
              Track Status
            </button>
            <button
              onClick={() => setPopup(null)}
              style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#1a56db,#0ea5e9)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        </div>
      </Popup>
    </div>
  );
}
