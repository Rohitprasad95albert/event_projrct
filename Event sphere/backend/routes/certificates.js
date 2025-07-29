const express = require('express');
const verifyToken = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');
const generateCertificate = require('../utils/certificateGenerator');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Generate certificates for event
router.post('/generate/:eventId', verifyToken, async (req, res) => {
  if (!['admin', 'club'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const event = await Event.findById(req.params.eventId).populate('attendees');
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const certDir = path.join(__dirname, '../uploads/certificates');
  if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

  const files = [];

  for (const attendee of event.attendees) {
    const certPath = await generateCertificate(attendee.name, event.title, certDir);
    files.push({ student: attendee.name, file: path.basename(certPath) });
  }

  res.json({ message: 'Certificates generated', files });
});

module.exports = router;
