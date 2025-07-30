// backend/routes/certificates.js
const express = require('express');
const verifyToken = require('../middleware/auth');
const Event = require('../models/Event');
// const User = require('../models/User'); // Not directly needed here, but User is populated through Event
const generateCertificate = require('../utils/certificateGenerator');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Generate certificates for event
router.post('/generate/:eventId', verifyToken, async (req, res) => {
  if (!['admin', 'club'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Populate attendees.userId to get the student's name
  const event = await Event.findById(req.params.eventId).populate('attendees.userId', 'name');
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const certDir = path.join(__dirname, '../uploads/certificates');
  if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

  const files = [];

  for (const attendee of event.attendees) {
    if (attendee.userId) { // Ensure userId exists
        // attendee.userId.name is the student's name
        const studentName = attendee.userId.name;
        // attendee.registeredCollege (if you want to use it on the cert)
        const certPath = await generateCertificate(studentName, event.title, certDir);
        files.push({ student: studentName, file: path.basename(certPath) });
    }
  }

  res.json({ message: 'Certificates generated', files });
});

module.exports = router;