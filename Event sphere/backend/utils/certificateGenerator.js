const PDFDocument = require('pdfkit');           // For generating PDF files
const fs = require('fs');                        // File system module for saving files
const path = require('path');                    // For file path handling

/**
 * Generates a participation certificate PDF for a student.
 *
 * @param {string} studentName - The full name of the student
 * @param {string} eventTitle - The title of the event
 * @param {string} savePath - Directory path to save the generated PDF
 * @returns {Promise<string>} - Resolves with the full path of the saved PDF
 */
function generateCertificate(studentName, eventTitle, savePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();  // Create a new PDF document

    // Create the full file path for the PDF
    const filePath = path.join(savePath, `${studentName}_certificate.pdf`);

    // Create a writable stream to that file
    const stream = fs.createWriteStream(filePath);

    // Pipe PDF output to the file stream
    doc.pipe(stream);

    // Title
    doc
      .fontSize(25)
      .text('Certificate of Participation', { align: 'center' });

    doc.moveDown();

    // Certificate body
    doc
      .fontSize(16)
      .text(`This is to certify that`, { align: 'center' });

    doc
      .fontSize(20)
      .text(`${studentName}`, { align: 'center', underline: true });

    doc.moveDown();

    doc
      .fontSize(16)
      .text(`has successfully participated in`, { align: 'center' });

    doc
      .fontSize(18)
      .text(`${eventTitle}`, { align: 'center' });

    // Finalize PDF and close the stream
    doc.end();

    // Resolve the promise once file writing is complete
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject); // Handle stream errors
  });
}

module.exports = generateCertificate; // Export the function
