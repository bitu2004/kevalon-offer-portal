const Application = require('../models/Application');
const PDFDocument = require('pdfkit');
const path = require('path');

const KEVALON_LOGO = path.join(__dirname, '../assets/kevalon-logo.png');
const BRAND = {
  navy: '#0C4C70',
  blue: '#176F95',
  ink: '#23303D',
  muted: '#556576',
  border: '#90A5B8',
  wave: '#D6DEE1'
};

const formatDate = (value) => new Date(value).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const drawFooterWave = (doc) => {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const bottom = pageHeight - 29;
  const right = pageWidth - 29;

  doc.save();
  doc.path(
    `M ${pageWidth - 278} ${bottom}
     L ${pageWidth - 239} ${bottom - 29}
     C ${pageWidth - 194} ${bottom - 61}, ${pageWidth - 157} ${bottom - 63}, ${pageWidth - 111} ${bottom - 24}
     L ${pageWidth - 78} ${bottom}
     L ${pageWidth - 145} ${bottom}
     C ${pageWidth - 179} ${bottom - 25}, ${pageWidth - 202} ${bottom - 24}, ${pageWidth - 232} ${bottom}
     Z`
  ).fill(BRAND.wave);
  doc.path(
    `M ${pageWidth - 178} ${bottom}
     L ${pageWidth - 139} ${bottom - 31}
     C ${pageWidth - 93} ${bottom - 68}, ${pageWidth - 60} ${bottom - 78}, ${right} ${bottom - 86}
     L ${right} ${bottom - 30}
     C ${pageWidth - 74} ${bottom - 22}, ${pageWidth - 99} ${bottom - 15}, ${pageWidth - 126} ${bottom}
     Z`
  ).fill(BRAND.navy);
  doc.restore();
};

const drawDetailBullet = (doc, label, value, x, y, width) => {
  doc.circle(x + 4, y + 6, 1.7).fill(BRAND.ink);
  doc.fillColor(BRAND.ink).font('Times-Bold')
    .text(`${label}: `, x + 14, y, { continued: true, width });
  doc.font('Times-Roman').text(value);
  return doc.y + 1;
};

const drawLetterhead = (doc) => {
  const pageRight = doc.page.width - 42;

  doc.lineWidth(0.6).strokeColor(BRAND.border)
    .rect(28, 28, doc.page.width - 56, doc.page.height - 56)
    .stroke();

  doc.image(KEVALON_LOGO, 58, 43, { fit: [18, 36], align: 'center', valign: 'center' });
  doc.font('Times-Bold').fontSize(10.6).fillColor(BRAND.ink)
    .text('KEVALON', 82, 49, { width: 78, characterSpacing: 0.15 });
  doc.font('Helvetica-Bold').fontSize(5.8).fillColor(BRAND.ink)
    .text('TECHNOLOGY', 84, 62, { width: 72, characterSpacing: 0.95 });

  doc.font('Times-Bold').fontSize(22.5).fillColor(BRAND.ink)
    .text('KEVALON TECHNOLOGY', 172, 42, {
      width: pageRight - 172,
      characterSpacing: 0
    });
  doc.font('Helvetica-Bold').fontSize(6.3).fillColor(BRAND.ink)
    .text('Phone: +91 9081012218, 9104012218 | Email: ceo@kevalontechnology.in', 174, 72, {
      width: pageRight - 174
    });
  doc.moveTo(42, 96).lineTo(pageRight, 96).strokeColor(BRAND.ink).lineWidth(0.75).stroke();
};

const drawFooter = (doc) => {
  const footerY = doc.page.height - 61;

  doc.font('Helvetica-Oblique').fontSize(7).fillColor(BRAND.muted)
    .text(
      'This is a computer-generated offer letter issued by Kevalon Technology.',
      42,
      footerY - 38,
      { width: doc.page.width - 84, align: 'center' }
    );

  doc.font('Helvetica').fontSize(6.2).fillColor(BRAND.muted)
    .text(
      '913, Solaries Business Hub, Sola Road, Opp. The National Higher Secondary School, Naranpura, Ahmedabad, Gujarat - 380063',
      42,
      footerY,
      { width: 300 }
    );
  drawFooterWave(doc);
};

const drawOfferBody = (doc, application, layout) => {
  const {
    contentX,
    contentWidth,
    titleY,
    dateY,
    recipientY,
    subjectY,
    greetingY,
    signoffGap
  } = layout;

  doc.font('Helvetica').fontSize(16).fillColor(BRAND.ink)
    .text('Offer Letter', 0, titleY, { align: 'center' });
  doc.fontSize(11)
    .text(`Date: ${formatDate(application.offerLetterDate || new Date())}`, contentX, dateY, { align: 'right', width: contentWidth });

  doc.font('Times-Roman').fontSize(11.3).fillColor(BRAND.ink);
  doc.text('To,', contentX, recipientY);
  doc.text(application.name, contentX, recipientY + 16);
  doc.text(`Enrollment No: ${application.enrollmentNumber}`, contentX, recipientY + 32);
  doc.text(`College ID: ${application.emailId}`, contentX, recipientY + 48);

  doc.font('Times-Bold').text(
    `Subject: Internship Offer Letter for ${application.technology} Intern`,
    contentX,
    subjectY,
    { width: contentWidth }
  );

  doc.font('Times-Roman').text(`Dear ${application.name},`, contentX, greetingY);
  doc.text(
    `We are pleased to offer you an internship opportunity at Kevalon Technology as a ${application.technology} Intern.`,
    contentX,
    greetingY + 18,
    { width: contentWidth, lineGap: 1.5 }
  );
  doc.text('Your internship details are as follows:', contentX, doc.y + 3);

  let detailY = doc.y + 4;
  [
    ['Intern Name', application.name],
    ['Technology', application.technology],
    ['College', application.college],
    ['Branch', application.branch],
    ['Semester', application.semester],
    ['Internship Duration', `${formatDate(application.startDate)} to ${formatDate(application.endDate)}`]
  ].forEach(([label, value]) => {
    detailY = drawDetailBullet(doc, label, value, contentX + 12, detailY, contentWidth - 24);
  });

  doc.font('Times-Roman').text(
    `During the internship period, you will work on live projects and practical development tasks related to ${application.technology}. You are expected to maintain professionalism, complete assigned tasks responsibly, and follow company policies throughout the internship.`,
    contentX,
    detailY + 22,
    { width: contentWidth, align: 'justify', lineGap: 2 }
  );
  doc.text(
    'We believe that your technical skills and dedication will make valuable contributions to our organization. We look forward to having you as a part of our team and wish you a successful learning experience.',
    contentX,
    doc.y + 22,
    { width: contentWidth, align: 'justify', lineGap: 2 }
  );
  doc.text(
    'For any queries regarding the internship, feel free to contact us.',
    contentX,
    doc.y + 2,
    { width: contentWidth }
  );

  doc.text('Regards,', contentX, doc.y + signoffGap);
  doc.font('Times-Bold').text('HR Department', contentX, doc.y + 2);
};

const streamPdf = (doc, res, fileName) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  doc.pipe(res);
};

const requireApprovedApplication = async (uniqueId) => {
  const application = await Application.findOne({ uniqueId: uniqueId.toUpperCase() });
  return application;
};

const generateOfferLetter = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const application = await requireApprovedApplication(uniqueId);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: application.status === 'pending'
          ? 'Your application is still under review. Please wait for approval.'
          : 'Your application has been rejected. You cannot download the offer letter.'
      });
    }

    await Application.findByIdAndUpdate(application._id, { $inc: { downloadCount: 1 } });

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 38, right: 42, bottom: 28, left: 42 }
    });

    streamPdf(doc, res, `OfferLetter_${application.uniqueId}.pdf`);

    const contentX = 62;
    const contentWidth = doc.page.width - (contentX * 2);

    drawLetterhead(doc);
    drawOfferBody(doc, application, {
      contentX,
      contentWidth,
      titleY: 132,
      dateY: 157,
      recipientY: 189,
      subjectY: 270,
      greetingY: 313,
      signoffGap: 23
    });

    drawFooter(doc);
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error generating offer letter' });
    }
  }
};

const generateAdminOfferLetter = async (req, res) => {
  try {
    const application = await requireApprovedApplication(req.params.uniqueId);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Only approved applications can download offer letters.' });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 52, right: 48, bottom: 52, left: 48 }
    });

    streamPdf(doc, res, `AdminOfferLetter_${application.uniqueId}.pdf`);
    drawOfferBody(doc, application, {
      contentX: 50,
      contentWidth: doc.page.width - 100,
      titleY: 94,
      dateY: 116,
      recipientY: 148,
      subjectY: 238,
      greetingY: 279,
      signoffGap: 126
    });
    doc.end();
  } catch (error) {
    console.error('Admin PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error generating admin offer letter' });
    }
  }
};

module.exports = { generateOfferLetter, generateAdminOfferLetter };
