const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateCertificate(studentName, eventTitle, savePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filePath = path.join(savePath, `${studentName}_certificate.pdf`);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc
      .fontSize(25)
      .text('Certificate of Participation', { align: 'center' });

    doc.moveDown();
    doc.fontSize(16).text(`This is to certify that`, { align: 'center' });
    doc.fontSize(20).text(`${studentName}`, { align: 'center', underline: true });

    doc.moveDown();
    doc.fontSize(16).text(`has successfully participated in`, { align: 'center' });
    doc.fontSize(18).text(`${eventTitle}`, { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = generateCertificate;
