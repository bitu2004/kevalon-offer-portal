export async function generateAdminOfferLetterPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210, H = 297;
  const ML = 22, MR = 22;
  const CW = W - ML - MR;

  // Use admin-set offer letter date if available, otherwise today
  let displayDate = "";
  if (data.offerLetterDate) {
    const p = data.offerLetterDate.split("-");
    displayDate = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : data.offerLetterDate;
  } else {
    displayDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  // ── "Offer Letter" centered title ─────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text("Offer Letter", W / 2, 30, { align: "center" });

  // ── Date right-aligned ────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(`Date: ${displayDate}`, W - MR, 42, { align: "right" });

  // ── To block ──────────────────────────────────────────────────────────────
  let y = 54;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 30);
  doc.text("To,", ML, y);           y += 6;
  doc.text(data.fullName, ML, y);   y += 6;
  doc.text(`Enrollment No: ${data.enrollmentNumber}`, ML, y); y += 6;
  doc.text(`College ID: ${data.email}`, ML, y); y += 12;

  // ── Subject ───────────────────────────────────────────────────────────────
  const typeLabel = {
    internship:          "Internship",
    training:            "Training",
    project:             "Project-Based Internship",
    internship_training: "Internship + Training",
  }[data.template] || "Internship";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(`Subject: ${typeLabel} Offer Letter for ${data.technology} Intern`, ML, y);
  y += 12;

  // ── Dear ──────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(`Dear ${data.fullName},`, ML, y);
  y += 7;

  // Opening
  const opening = `We are pleased to offer you an internship opportunity at Kevalon Technology as a ${data.technology} Intern.`;
  const openLines = doc.splitTextToSize(opening, CW);
  doc.text(openLines, ML, y);
  y += openLines.length * 5.5 + 5;

  doc.text("Your internship details are as follows:", ML, y);
  y += 8;

  // ── Bullet list ───────────────────────────────────────────────────────────
  const startFmt = new Date(data.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const endFmt   = new Date(data.endDate).toLocaleDateString("en-IN",   { day: "2-digit", month: "2-digit", year: "numeric" });

  const bullets = [
    ["Intern Name",         data.fullName],
    ["Technology",          data.technology],
    ["College",             data.collegeName],
    ["Branch",              data.branch],
    ["Semester",            data.semester],
    ["Internship Duration", `${startFmt} to ${endFmt}`],
  ];

  bullets.forEach(([label, value]) => {
    // Bullet dot
    doc.setFillColor(30, 30, 30);
    doc.circle(ML + 3, y - 1.2, 0.7, "F");
    // Bold label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`${label}:`, ML + 8, y);
    // Normal value
    doc.setFont("helvetica", "normal");
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.text(String(value || ""), ML + 8 + labelWidth, y);
    y += 6.5;
  });
  y += 5;

  // ── Body paragraph 1 ──────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const p1 = `During the internship period, you will work on live projects and practical development tasks related to ${data.technology}. You are expected to maintain professionalism, complete assigned tasks responsibly, and follow company policies throughout the internship.`;
  const p1Lines = doc.splitTextToSize(p1, CW);
  doc.text(p1Lines, ML, y);
  y += p1Lines.length * 5.5 + 8;

  // ── Body paragraph 2 ──────────────────────────────────────────────────────
  const p2 = `We believe that your technical skills and dedication will make valuable contributions to our organization. We look forward to having you as a part of our team and wish you a successful learning experience.`;
  const p2Lines = doc.splitTextToSize(p2, CW);
  doc.text(p2Lines, ML, y);
  y += p2Lines.length * 5.5 + 5;

  // ── Closing ───────────────────────────────────────────────────────────────
  doc.text("For any queries regarding the internship, feel free to contact us.", ML, y);
  y += 14;

  // ── Regards ───────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.text("Regards,", ML, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("HR Department", ML, y);

  doc.save(`AdminOfferLetter_${data.token}.pdf`);
}
