import kevalonLogo from "../assets/kevalon-logo.png";
import kevalonLetterheadLogo from "../assets/kevalon-letterhead-logo.png";

export async function generateOfferLetterPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210, H = 297;
  const ML = 20, MR = 20;
  const CW = W - ML - MR;

  // Offer letter date
  let displayDate = "";
  if (data.offerLetterDate) {
    const p = data.offerLetterDate.split("-");
    displayDate = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : data.offerLetterDate;
  } else {
    displayDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  const startFmt = new Date(data.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const endFmt   = new Date(data.endDate).toLocaleDateString("en-IN",   { day: "2-digit", month: "long", year: "numeric" });

  // Load logo images
  const loadImg = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

  const [logoImg, lhLogoImg] = await Promise.all([
    loadImg(kevalonLogo),
    loadImg(kevalonLetterheadLogo),
  ]);

  const toDataUrl = (img) => {
    if (!img) return null;
    const c = document.createElement("canvas");
    c.width = img.naturalWidth || 300;
    c.height = img.naturalHeight || 300;
    c.getContext("2d").drawImage(img, 0, 0);
    return c.toDataURL("image/png");
  };

  const logoDataUrl = toDataUrl(logoImg);
  const lhLogoDataUrl = toDataUrl(lhLogoImg);

  // ── White background ──────────────────────────────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  // ════════════════════════════════════════════════════════════════════════
  // BUILD DECORATIVE LAYER (waves + pin) — canvas, transparent background
  // ════════════════════════════════════════════════════════════════════════
  const PW = 2100, PH = 2970; // 10x scale of mm dimensions
  const dc = document.createElement("canvas");
  dc.width = PW; dc.height = PH;
  const ctx = dc.getContext("2d");
  // Transparent — only draw shapes

  // ── 3 wave arcs — bottom right, matching photo exactly ──────────────────
  // The waves are elongated ellipses, tilted ~-12deg, stacked from back to front
  // Back to front: dark navy → steel blue → light grey

  const angle = -0.20; // tilt angle in radians (~-11.5 degrees)

  // Wave 1 — dark navy (back, largest)
  ctx.save();
  ctx.translate(PW + 150, PH + 80);
  ctx.rotate(angle);
  ctx.fillStyle = "#0d2a5e";
  ctx.beginPath();
  ctx.ellipse(0, 0, 620, 290, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Wave 2 — steel blue-grey (middle)
  ctx.save();
  ctx.translate(PW + 30, PH + 120);
  ctx.rotate(angle);
  ctx.fillStyle = "#6e8fa8";
  ctx.beginPath();
  ctx.ellipse(0, 0, 530, 240, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Wave 3 — light grey (front, smallest)
  ctx.save();
  ctx.translate(PW - 100, PH + 160);
  ctx.rotate(angle);
  ctx.fillStyle = "#b0c4d4";
  ctx.beginPath();
  ctx.ellipse(0, 0, 430, 190, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Footer separator line ─────────────────────────────────────────────────
  ctx.strokeStyle = "#cccccc";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(ML * 10, PH - 190);
  ctx.lineTo(PW - MR * 10, PH - 190);
  ctx.stroke();

  // ── Location pin (drawn shapes) ───────────────────────────────────────────
  const px = ML * 10 + 15, py = PH - 120;
  ctx.fillStyle = "#0d2a5e";
  // Circle head
  ctx.beginPath();
  ctx.arc(px, py - 35, 22, 0, Math.PI * 2);
  ctx.fill();
  // Teardrop point
  ctx.beginPath();
  ctx.moveTo(px - 15, py - 18);
  ctx.lineTo(px + 15, py - 18);
  ctx.lineTo(px, py + 18);
  ctx.closePath();
  ctx.fill();

  const decDataUrl = dc.toDataURL("image/png");
  doc.addImage(decDataUrl, "PNG", 0, 0, W, H);

  // ════════════════════════════════════════════════════════════════════════
  // HEADER — all text via jsPDF (no canvas text = no overlap)
  // ════════════════════════════════════════════════════════════════════════

  // Logo image — top left
  if (lhLogoDataUrl) {
    doc.addImage(lhLogoDataUrl, "PNG", ML, 6, 22, 22);
  } else if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", ML, 6, 22, 22);
  }

  // "KEVALON" bold dark navy
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(13, 42, 94);
  doc.text("KEVALON", ML + 26, 13);

  // "TECHNOLOGY" small grey
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 90);
  doc.text("TECHNOLOGY", ML + 26, 19);

  // "KEVALON TECHNOLOGY" large bold right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(13, 42, 94);
  doc.text("KEVALON TECHNOLOGY", W - MR, 14, { align: "right" });

  // Phone + Email right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(55, 55, 55);
  doc.text("Phone: +91 9081012218, 9104012218  |  Email: ceo@kevalontechnology.in", W - MR, 20.5, { align: "right" });

  // Divider line
  doc.setDrawColor(13, 42, 94);
  doc.setLineWidth(0.5);
  doc.line(ML, 27, W - MR, 27);

  // ── Computer-generated note ───────────────────────────────────────────────
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("This is a computer-generated offer letter issued by Kevalon Technology.", W / 2, H - 22, { align: "center" });

  // ── Footer address text ───────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(55, 55, 55);
  doc.text("913, Solaries Business Hub, Sola Road, Opp. The National Higher Secondary", ML + 6, H - 17);
  doc.text("School, Naranpura, Ahmedabad, Gujarat - 380063", ML + 6, H - 12);

  // ════════════════════════════════════════════════════════════════════════
  // LETTER CONTENT
  // ════════════════════════════════════════════════════════════════════════

  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(25, 25, 25);
  doc.text("Offer Letter", W / 2, 40, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Date: ${displayDate}`, W - MR, 50, { align: "right" });

  let y = 60;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  doc.text("To,", ML, y);           y += 6;
  doc.text(data.fullName, ML, y);   y += 6;
  doc.text(`Enrollment No: ${data.enrollmentNumber}`, ML, y); y += 6;
  doc.text(`College ID: ${data.email}`, ML, y); y += 12;

  const typeLabel = {
    internship: "Internship", training: "Training",
    project: "Project-Based Internship", industrial_training: "Industrial Training",
  }[data.template] || "Internship";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  const subLines = doc.splitTextToSize(`Subject: ${typeLabel} Offer Letter for ${data.technology} Intern`, CW);
  doc.text(subLines, ML, y);
  y += subLines.length * 6 + 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(`Dear ${data.fullName},`, ML, y);
  y += 7;

  const opening = `We are pleased to offer you an internship opportunity at Kevalon Technology as a ${data.technology} Intern.`;
  const openLines = doc.splitTextToSize(opening, CW);
  doc.text(openLines, ML, y);
  y += openLines.length * 5.5 + 6;

  doc.text("Your internship details are as follows:", ML, y);
  y += 9;

  [
    ["Intern Name",         data.fullName],
    ["Technology",          data.technology],
    ["College",             data.collegeName],
    ["Branch",              data.branch],
    ["Semester",            data.semester],
    ["Internship Duration", `${startFmt} to ${endFmt}${data.duration ? " (" + data.duration + ")" : ""}`],
  ].forEach(([label, value]) => {
    doc.setFillColor(20, 20, 20);
    doc.circle(ML + 3, y - 1.2, 0.7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`${label}:`, ML + 8, y);
    doc.setFont("helvetica", "normal");
    const lw = doc.getTextWidth(`${label}: `);
    const vLines = doc.splitTextToSize(String(value || ""), CW - 8 - lw);
    doc.text(vLines, ML + 8 + lw, y);
    y += Math.max(vLines.length, 1) * 5.5 + 1;
  });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const p1 = `During the internship period, you will work on live projects and practical development tasks related to ${data.technology}. You are expected to maintain professionalism, complete assigned tasks responsibly, and follow company policies throughout the internship.`;
  const p1Lines = doc.splitTextToSize(p1, CW);
  doc.text(p1Lines, ML, y);
  y += p1Lines.length * 5.5 + 7;

  const p2 = `We believe that your technical skills and dedication will make valuable contributions to our organization. We look forward to having you as a part of our team and wish you a successful learning experience.`;
  const p2Lines = doc.splitTextToSize(p2, CW);
  doc.text(p2Lines, ML, y);
  y += p2Lines.length * 5.5 + 5;

  doc.text("For any queries regarding the internship, feel free to contact us.", ML, y);
  y += 13;

  doc.setFont("helvetica", "normal");
  doc.text("Regards,", ML, y); y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("HR Department", ML, y); y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  doc.text("Kevalon Technology", ML, y);

  doc.save(`Kevalon_OfferLetter_${data.token}.pdf`);
}
