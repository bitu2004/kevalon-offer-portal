import kevalonLogo from "../assets/kevalon-logo.png";

export async function generateCertificatePDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const W = 297, H = 210;
  const cx = W / 2;

  // ── Background ──────────────────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, W, H, "F");

  // Outer decorative border
  doc.setDrawColor(13, 74, 110);
  doc.setLineWidth(1.5);
  doc.rect(8, 8, W - 16, H - 16, "S");
  doc.setDrawColor(0, 168, 204);
  doc.setLineWidth(0.5);
  doc.rect(11, 11, W - 22, H - 22, "S");

  // Top accent bar
  doc.setFillColor(13, 74, 110);
  doc.rect(8, 8, W - 16, 22, "F");

  // Teal stripe
  doc.setFillColor(0, 168, 204);
  doc.rect(8, 30, W - 16, 3, "F");

  // ── Logo ────────────────────────────────────────────────────────────────────
  let logoDataUrl = null;
  try {
    const logoImg = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = kevalonLogo;
    });
    const canvas = document.createElement("canvas");
    canvas.width = logoImg.naturalWidth || 300;
    canvas.height = logoImg.naturalHeight || 100;
    canvas.getContext("2d").drawImage(logoImg, 0, 0);
    logoDataUrl = canvas.toDataURL("image/png");
  } catch { logoDataUrl = null; }

  if (logoDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 10, 40, 18, 2, 2, "F");
    doc.addImage(logoDataUrl, "PNG", 15, 11, 38, 16);
  }

  // Company name in header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("KEVALON TECHNOLOGY", cx, 21, { align: "center" });

  // ── Certificate title ────────────────────────────────────────────────────────
  doc.setTextColor(13, 74, 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("CERTIFICATE OF COMPLETION", cx, 55, { align: "center" });

  // Decorative line under title
  doc.setDrawColor(0, 168, 204);
  doc.setLineWidth(1);
  doc.line(cx - 70, 59, cx + 70, 59);

  // ── Body text ────────────────────────────────────────────────────────────────
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("This is to certify that", cx, 72, { align: "center" });

  // Intern name
  doc.setTextColor(13, 74, 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(data.fullName, cx, 85, { align: "center" });

  // Underline name
  const nameWidth = doc.getTextWidth(data.fullName);
  doc.setDrawColor(13, 74, 110);
  doc.setLineWidth(0.5);
  doc.line(cx - nameWidth / 2, 87, cx + nameWidth / 2, 87);

  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const line1 = `has successfully completed the internship program in`;
  const line2 = `${data.technology} at Kevalon Technology`;
  doc.text(line1, cx, 97, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 74, 110);
  doc.setFontSize(13);
  doc.text(line2, cx, 106, { align: "center" });

  // Duration & dates
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(11);
  const startFmt = new Date(data.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const endFmt   = new Date(data.endDate).toLocaleDateString("en-IN",   { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`From ${startFmt}  to  ${endFmt}  (${data.duration || ""})`, cx, 116, { align: "center" });

  // College & enrollment
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${data.collegeName}  ·  Enrollment No: ${data.enrollmentNumber}  ·  Branch: ${data.branch}`, cx, 124, { align: "center" });

  // ── Details box ──────────────────────────────────────────────────────────────
  doc.setFillColor(240, 247, 255);
  doc.setDrawColor(13, 74, 110);
  doc.setLineWidth(0.3);
  doc.roundedRect(30, 130, W - 60, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(13, 74, 110);
  const certDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Certificate ID: ${data.certId || ""}`, 40, 139);
  doc.text(`Token: ${data.token}`, cx, 139, { align: "center" });
  doc.text(`Issued: ${certDate}`, W - 40, 139, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Enrollment: ${data.enrollmentNumber}  ·  Semester: ${data.semester}  ·  Gender: ${data.gender}`, cx, 147, { align: "center" });

  // ── Signature ────────────────────────────────────────────────────────────────
  doc.setDrawColor(13, 74, 110);
  doc.setLineWidth(0.4);
  doc.line(50, 168, 110, 168);
  doc.line(W - 110, 168, W - 50, 168);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(13, 74, 110);
  doc.text("Kevalon Technology", 80, 174, { align: "center" });
  doc.text("HR Department", W - 80, 174, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Authorized Signatory", 80, 179, { align: "center" });
  doc.text("internship@kevalon.com", W - 80, 179, { align: "center" });

  // ── Footer ───────────────────────────────────────────────────────────────────
  doc.setFillColor(13, 74, 110);
  doc.rect(8, H - 18, W - 16, 10, "F");
  doc.setFillColor(0, 168, 204);
  doc.rect(8, H - 20, W - 16, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    `This certificate is system-generated and valid. Cert ID: ${data.certId || ""} | internship@kevalon.com | www.kevalontechnology.in`,
    cx, H - 12, { align: "center" }
  );

  doc.save(`Kevalon_Certificate_${data.token}.pdf`);
}
