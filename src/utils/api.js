/**
 * API service — connects frontend to the Express/MongoDB backend.
 * Falls back to localStorage store if backend is unreachable.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Helpers ───────────────────────────────────────────────────────────────

async function request(method, path, body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const get  = (path, token) => request("GET",    path, null, token);
const post = (path, body, token) => request("POST",   path, body, token);
const put  = (path, body, token) => request("PUT",    path, body, token);
const del  = (path, token) => request("DELETE", path, null, token);

// ── Auth ──────────────────────────────────────────────────────────────────

export async function adminLogin(username, password) {
  const data = await post("/admin/login", { username, password });
  if (data.token) localStorage.setItem("kvl_admin_token", data.token);
  return data;
}

export function getAdminToken() {
  return localStorage.getItem("kvl_admin_token");
}

export function adminLogout() {
  localStorage.removeItem("kvl_admin_token");
}

// ── Applications (user) ───────────────────────────────────────────────────

export async function submitApplication(formData) {
  // Map frontend field names → backend field names
  const body = {
    name:             formData.fullName,
    number:           formData.phone,
    emailId:          formData.email,
    enrollmentNumber: formData.enrollmentNumber,
    college:          formData.collegeName,
    branch:           formData.branch,
    semester:         formData.semester,
    gender:           formData.gender,
    technology:       formData.technology,
    startDate:        formData.startDate,
    endDate:          formData.endDate,
  };
  return post("/applications/submit", body);
}

export async function checkStatus(uniqueId) {
  return get(`/applications/status/${uniqueId.toUpperCase()}`);
}

// ── Admin ─────────────────────────────────────────────────────────────────

export async function getAllApplications(params = {}) {
  const token = getAdminToken();
  const qs = new URLSearchParams(params).toString();
  return get(`/admin/applications${qs ? "?" + qs : ""}`, token);
}

export async function getApplication(id) {
  const token = getAdminToken();
  return get(`/admin/applications/${id}`, token);
}

export async function updateStatus(id, status, adminNote = "", offerLetterDate = "") {
  const token = getAdminToken();
  return put(`/admin/applications/${id}/status`, { status, adminNote, offerLetterDate }, token);
}

export async function updateApplication(id, fields) {
  const token = getAdminToken();
  return put(`/admin/applications/${id}`, fields, token);
}

export async function deleteApplication(id) {
  const token = getAdminToken();
  return del(`/admin/applications/${id}`, token);
}

// ── Health check ──────────────────────────────────────────────────────────

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
