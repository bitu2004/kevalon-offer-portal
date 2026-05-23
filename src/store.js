// ─── Helpers ────────────────────────────────────────────────────────────────

function generateToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let t = "KVL-";
  for (let i = 0; i < 8; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

function generateLetterId(index) {
  const year = new Date().getFullYear();
  return `KVLN-${year}-${String(index).padStart(5, "0")}`;
}

function generateCertId(index) {
  const year = new Date().getFullYear();
  return `KVLC-${year}-${String(index).padStart(5, "0")}`;
}

export function calcDuration(startDate, endDate) {
  if (!startDate || !endDate) return "";
  const ms = new Date(endDate) - new Date(startDate);
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  const weeks = Math.round(days / 7);
  if (weeks >= 1) return `${weeks} Week${weeks !== 1 ? "s" : ""}`;
  return `${days} Day${days !== 1 ? "s" : ""}`;
}

// Token expires 90 days after submission if still pending
const TOKEN_EXPIRY_DAYS = 90;

export function isTokenExpired(record) {
  if (!record) return false;
  if (record.status === "approved") return false; // approved tokens never expire
  const submitted = new Date(record.submittedAt);
  const now = new Date();
  const diffDays = (now - submitted) / (1000 * 60 * 60 * 24);
  return diffDays > TOKEN_EXPIRY_DAYS;
}

export function daysUntilExpiry(record) {
  if (!record || record.status === "approved") return null;
  const submitted = new Date(record.submittedAt);
  const now = new Date();
  const diffDays = (now - submitted) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.round(TOKEN_EXPIRY_DAYS - diffDays));
}

// Check if internship end date has passed (internship completed)
export function isInternshipCompleted(record) {
  if (!record?.endDate) return false;
  // Compare date only (ignore time) — end date itself counts as completed
  const end = new Date(record.endDate);
  end.setHours(23, 59, 59, 999); // end of that day
  return end < new Date();
}

// ─── Persistence ─────────────────────────────────────────────────────────────

const LS_KEY = "kvl_requests";

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function save(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}

// ─── Store ───────────────────────────────────────────────────────────────────

const store = {
  get requests() { return load(); },

  add(data) {
    const all = load();
    const token = generateToken();
    const index = Object.keys(all).length + 1;
    const letterId = generateLetterId(index);
    const duration = calcDuration(data.startDate, data.endDate);

    all[token] = {
      ...data,
      token,
      letterId,
      duration,
      status: "pending",
      submittedAt: new Date().toISOString(),
      rejectionReason: "",
      template: data.template || "internship",
      downloadCount: 0,
      lastDownloadedAt: null,
      consentGiven: data.consentGiven || false,
      // Certificate fields
      certStatus: "not_requested",   // not_requested | pending | approved | rejected
      certId: null,
      certApprovedAt: null,
      certDownloadCount: 0,
      certLastDownloadedAt: null,
      certRejectionReason: "",
      // Token renewal
      renewalRequested: false,
      renewalRequestedAt: null,
    };
    save(all);
    return token;
  },

  get(token) {
    return load()[token] || null;
  },

  getAll() {
    return Object.values(load());
  },

  approve(token) {
    const all = load();
    if (all[token]) {
      all[token].status = "approved";
      all[token].approvedAt = new Date().toISOString();
      all[token].rejectionReason = "";
    }
    save(all);
  },

  reject(token, reason = "") {
    const all = load();
    if (all[token]) {
      all[token].status = "rejected";
      all[token].rejectedAt = new Date().toISOString();
      all[token].rejectionReason = reason;
    }
    save(all);
  },

  update(token, fields) {
    const all = load();
    if (all[token] && all[token].status === "pending") {
      const updated = { ...all[token], ...fields };
      updated.duration = calcDuration(updated.startDate, updated.endDate);
      all[token] = updated;
      save(all);
      return true;
    }
    return false;
  },

  // ── Token Renewal ──────────────────────────────────────────────────────────

  requestRenewal(token) {
    const all = load();
    if (!all[token]) return false;
    // Generate a new token, copy all data over, mark old as expired
    const newToken = generateToken();
    all[newToken] = {
      ...all[token],
      token: newToken,
      status: "pending",
      submittedAt: new Date().toISOString(),
      renewalRequested: false,
      renewalRequestedAt: null,
      renewedFrom: token,
      downloadCount: 0,
      certStatus: "not_requested",
      certId: null,
      certApprovedAt: null,
      certDownloadCount: 0,
    };
    all[token].expired = true;
    all[token].renewedTo = newToken;
    save(all);
    return newToken;
  },

  // ── Certificate ────────────────────────────────────────────────────────────

  requestCertificate(token) {
    const all = load();
    if (!all[token]) return false;
    if (all[token].status !== "approved") return false;
    if (!isInternshipCompleted(all[token])) return false;
    all[token].certStatus = "pending";
    all[token].certRequestedAt = new Date().toISOString();
    save(all);
    return true;
  },

  approveCertificate(token) {
    const all = load();
    if (!all[token]) return;
    const index = Object.keys(all).length;
    all[token].certStatus = "approved";
    all[token].certApprovedAt = new Date().toISOString();
    all[token].certId = all[token].certId || generateCertId(index);
    all[token].certRejectionReason = "";
    save(all);
  },

  rejectCertificate(token, reason = "") {
    const all = load();
    if (!all[token]) return;
    all[token].certStatus = "rejected";
    all[token].certRejectedAt = new Date().toISOString();
    all[token].certRejectionReason = reason;
    save(all);
  },

  recordCertDownload(token) {
    const all = load();
    if (all[token]) {
      all[token].certDownloadCount = (all[token].certDownloadCount || 0) + 1;
      all[token].certLastDownloadedAt = new Date().toISOString();
    }
    save(all);
  },

  // ── Existing helpers ───────────────────────────────────────────────────────

  recordDownload(token) {
    const all = load();
    if (all[token]) {
      all[token].downloadCount = (all[token].downloadCount || 0) + 1;
      all[token].lastDownloadedAt = new Date().toISOString();
    }
    save(all);
  },

  bulkApprove(tokens) {
    const all = load();
    tokens.forEach(t => {
      if (all[t]) {
        all[t].status = "approved";
        all[t].approvedAt = new Date().toISOString();
        all[t].rejectionReason = "";
      }
    });
    save(all);
  },

  bulkReject(tokens, reason = "") {
    const all = load();
    tokens.forEach(t => {
      if (all[t]) {
        all[t].status = "rejected";
        all[t].rejectedAt = new Date().toISOString();
        all[t].rejectionReason = reason;
      }
    });
    save(all);
  },

  getAnalytics() {
    const all = Object.values(load());
    const techCount = {}, collegeCount = {}, branchCount = {};
    all.forEach(r => {
      techCount[r.technology] = (techCount[r.technology] || 0) + 1;
      collegeCount[r.collegeName] = (collegeCount[r.collegeName] || 0) + 1;
      branchCount[r.branch] = (branchCount[r.branch] || 0) + 1;
    });
    const topTech     = Object.entries(techCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topColleges = Object.entries(collegeCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topBranches = Object.entries(branchCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      total:    all.length,
      pending:  all.filter(r => r.status === "pending").length,
      approved: all.filter(r => r.status === "approved").length,
      rejected: all.filter(r => r.status === "rejected").length,
      certPending:  all.filter(r => r.certStatus === "pending").length,
      certApproved: all.filter(r => r.certStatus === "approved").length,
      topTech, topColleges, topBranches,
    };
  },

  findByContact(email, phone) {
    const all = Object.values(load());
    return all.find(r =>
      (email && r.email?.toLowerCase() === email.toLowerCase()) ||
      (phone && r.phone === phone)
    ) || null;
  },

  clear() {
    localStorage.removeItem(LS_KEY);
  },
};

export default store;
