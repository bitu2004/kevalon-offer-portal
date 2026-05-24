import kevalonLogo from "../assets/kevalon-logo.png";

export async function generateOfferLetterPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210, H = 297;
  const ML = 20, MR = 20;
  const CW = W - ML - MR;

  // Use admin-set offer letter date if available, otherwise today
  let displayDate = "";
  if (data.offerLetterDate) {
    const p = data.offerLetterDate.split("-");
    displayDate = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : data.offerLetterDate;
  } else {
    displayDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  // ── White background + outer border ──────────────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.rect(10, 10, W - 20, H - 20, "S");

  // ── Load logo ─────────────────────────────────────────────────────────────
  let logoDataUrl = null;
  try {
    const logoImg = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = kevalonLogo;
    });
    const canvas = document.createElement("canvas");
    canvas.width = logoImg.naturalWidth || 200;
    canvas.height = logoImg.naturalHeight || 200;
    canvas.getContext("2d").drawImage(logoImg, 0, 0);
    logoDataUrl = canvas.toDataURL("image/png");
  } catch { logoDataUrl = null; }

  // ── Header: Logo box + Company name + contact ─────────────────────────────
  doc.setDrawColor(13, 74, 110);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, 36, 28, "S");
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 16, 16, 32, 24);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(13, 74, 110);
  doc.text("KEVALON TECHNOLOGY", 56, 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text("Phone: +91 9081012218, 9104012218 | Email: ceo@kevalontechnology.in", 56, 34);

  // ── Horizontal divider ────────────────────────────────────────────────────
  doc.setDrawColor(13, 74, 110);
  doc.setLineWidth(0.6);
  doc.line(14, 46, W - 14, 46);

  // ── "Offer Letter" title ──────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text("Offer Letter", W / 2, 58, { align: "center" });

  // ── Date (right-aligned) ──────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(`Date: ${displayDate}`, W - MR, 68, { align: "right" });

  // ── To block ──────────────────────────────────────────────────────────────
  let y = 78;
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 30);
  doc.text("To,", ML, y);
  y += 6;
  doc.text(data.fullName, ML, y);
  y += 6;
  doc.text(`Enrollment No: ${data.enrollmentNumber}`, ML, y);
  y += 6;
  doc.text(`College ID: ${data.email}`, ML, y);
  y += 10;

  // ── Subject ───────────────────────────────────────────────────────────────
  const typeLabel = {
    internship:          "Internship",
    training:            "Training",
    project:             "Project-Based Internship",
    industrial_training: "Industrial Training",
  }[data.template] || "Internship";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(`Subject: ${typeLabel} Offer Letter for ${data.technology} Intern`, ML, y);
  y += 12;

  // ── Dear ──────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(`Dear ${data.fullName},`, ML, y);
  y += 8;

  // Opening paragraph
  const opening = `We are pleased to offer you an internship opportunity at Kevalon Technology as a ${data.technology} Intern.`;
  const openLines = doc.splitTextToSize(opening, CW);
  doc.text(openLines, ML, y);
  y += openLines.length * 6 + 6;

  // "Your internship details are as follows:"
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

  const bulletX = ML + 4;
  const labelX  = ML + 10;
  const valueX  = ML + 52;

  bullets.forEach(([label, value]) => {
    doc.setFillColor(30, 30, 30);
    doc.circle(bulletX, y - 1.2, 0.8, "F");
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, labelX, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value || ""), valueX, y);
    y += 7;
  });
  y += 4;

  // ── Body paragraph 1 ──────────────────────────────────────────────────────
  const p1 = `During the internship period, you will work on live projects and practical development tasks related to ${data.technology}. You are expected to maintain professionalism, complete assigned tasks responsibly, and follow company policies throughout the internship.`;
  const p1Lines = doc.splitTextToSize(p1, CW);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(p1Lines, ML, y);
  y += p1Lines.length * 6 + 8;

  // ── Body paragraph 2 ──────────────────────────────────────────────────────
  const p2 = `We believe that your technical skills and dedication will make valuable contributions to our organization. We look forward to having you as a part of our team and wish you a successful learning experience.`;
  const p2Lines = doc.splitTextToSize(p2, CW);
  doc.text(p2Lines, ML, y);
  y += p2Lines.length * 6 + 6;

  // ── Closing line ──────────────────────────────────────────────────────────
  doc.text("For any queries regarding the internship, feel free to contact us.", ML, y);
  y += 12;

  // ── Regards ───────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.text("Regards,", ML, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("HR Department", ML, y);

  // ── Decorative shape bottom-right ─────────────────────────────────────────
  doc.setFillColor(13, 74, 110);
  doc.ellipse(W - 10, H - 10, 38, 38, "F");
  doc.setFillColor(200, 215, 230);
  doc.ellipse(W - 28, H - 28, 22, 22, "F");

  // ── Footer: italic note ───────────────────────────────────────────────────
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("This is a computer-generated offer letter issued by Kevalon Technology.", W / 2, H - 22, { align: "center" });

  // ── Footer: address ───────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text(
    "913, Solaries Business Hub, Sola Road, Opp. The National Higher Secondary School, Naranpura, Ahmedabad, Gujarat - 380063",
    14, H - 14,
    { maxWidth: W - 80 }
  );

  doc.save(`Kevalon_OfferLetter_${data.token}.pdf`);
}
