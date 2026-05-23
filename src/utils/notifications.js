/**
 * Notification utilities — WhatsApp deep links + mailto links.
 * These open the user's own WhatsApp/email app with a pre-filled message.
 * No backend or API key needed.
 */

export function whatsappLink(phone, message) {
  // phone: 10-digit Indian number, message: plain text
  const cleaned = phone.replace(/\D/g, "");
  const intl = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(email, subject, body) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ── Message templates ──────────────────────────────────────────────────────

export function msgSubmitted(name, token, letterId) {
  return `Hello ${name},\n\nYour internship offer letter request has been submitted successfully at Kevalon Technology.\n\n🔑 Your Tracking Token: *${token}*\n📄 Letter ID: ${letterId}\n\nUse this token to track your application status and download your offer letter once approved.\n\nTrack here: http://localhost:5173/?verify=${token}\n\nRegards,\nKevalon Technology\n📞 +91 97252 47990`;
}

export function msgApproved(name, token) {
  return `Hello ${name},\n\n✅ Great news! Your internship offer letter request has been *APPROVED* by Kevalon Technology.\n\n🔑 Token: *${token}*\n\nYou can now download your offer letter using the token above.\n\nDownload here: http://localhost:5173\n\nRegards,\nKevalon Technology\n📞 +91 97252 47990`;
}

export function msgRejected(name, token, reason) {
  return `Hello ${name},\n\nWe regret to inform you that your internship offer letter request has been reviewed and could not be approved at this time.\n\n🔑 Token: *${token}*\n${reason ? `📝 Reason: ${reason}\n` : ""}\nFor further assistance, please contact us.\n\nRegards,\nKevalon Technology\n📞 +91 97252 47990`;
}

export function msgCertApproved(name, token, certId) {
  return `Hello ${name},\n\n🏆 Congratulations! Your *Completion Certificate* has been approved by Kevalon Technology.\n\n🔑 Token: *${token}*\n📜 Certificate ID: ${certId}\n\nYou can now download your certificate using the token above.\n\nRegards,\nKevalon Technology\n📞 +91 97252 47990`;
}

// Email subject/body helpers
export function emailSubmitted(name, token, letterId) {
  return {
    subject: `Kevalon Technology — Internship Application Received | Token: ${token}`,
    body: `Dear ${name},\n\nYour internship offer letter request has been submitted successfully.\n\nTracking Token: ${token}\nLetter ID: ${letterId}\n\nPlease save this token. You will need it to track your application status and download your offer letter once approved.\n\nRegards,\nHR Department\nKevalon Technology\nPhone: +91 97252 47990\nEmail: ceo@kevalontechnology.in`,
  };
}

export function emailApproved(name, token) {
  return {
    subject: `Kevalon Technology — Offer Letter Approved | Token: ${token}`,
    body: `Dear ${name},\n\nCongratulations! Your internship offer letter request has been APPROVED.\n\nToken: ${token}\n\nYou can now download your offer letter from our portal.\n\nRegards,\nHR Department\nKevalon Technology`,
  };
}
