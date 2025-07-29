const express = require('express');
const verifyToken = require('../middleware/auth');           // Middleware to verify JWT token
const Event = require('../models/Event');                    // Event model
const User = require('../models/User');                      // User model (not directly used here, but often needed)
const generateCertificate = require('../utils/certificateGenerator'); // Utility function to generate certificates
const path = require('path');                                // For working with file system paths
const fs = require('fs');                                    // File system module to handle directories

const router = express.Router();

// ---------------------------------------------
// POST /generate/:eventId
// Generate certificates for all attendees of a specific event
// ---------------------------------------------
router.post('/generate/:eventId', verifyToken, async (req, res) => {
  // Only admin and club users are allowed to generate certificates
  if (!['admin', 'club'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Fetch event by ID and populate attendee data
  const event = await Event.findById(req.params.eventId).populate('attendees');
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Define directory to store generated certificates
  const certDir = path.join(__dirname, '../uploads/certificates');

  // Create the directory if it doesn't exist
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  const files = [];

  // Loop through all attendees and generate certificates
  for (const attendee of event.attendees) {
    // Generate a certificate for the attendee and get the path
    const certPath = await generateCertificate(attendee.name, event.title, certDir);

    // Store the filename and student name in the response array
    files.push({ student: attendee.name, file: path.basename(certPath) });
  }

  // Send back a success message and list of generated files
  res.json({ message: 'Certificates generated', files });
});

module.exports = router; // Export the router
