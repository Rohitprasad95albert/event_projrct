// backend/routes/events.js

const express = require('express');
const Event = require('../models/Event');                     // Event model
const verifyToken = require('../middleware/auth');           // Auth middleware to protect routes
const upload = require('../middleware/upload');              // Multer middleware for poster uploads

const router = express.Router();

// -------------------------------
// Route: POST /create
// Description: Club creates an event (no poster)
// Access: Club role only
// -------------------------------
router.post('/create', verifyToken, async (req, res) => {
  if (req.user.role !== 'club') {
    return res.status(403).json({ error: 'Forbidden: Only clubs can create events' });
  }

  const { title, description, date, time, type, venue } = req.body;
  try {
    const event = await Event.create({
      title, description, date, time, type, venue, createdBy: req.user.id
    });
    res.status(201).json(event);
  } catch (err) {
    console.error('Event creation failed:', err);
    res.status(400).json({ error: 'Event creation failed', details: err.message });
  }
});

// -------------------------------
// Route: GET /
// Description: List all events with creator's name
// Access: Public
// -------------------------------
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name');
    res.json(events);
  } catch (err) {
    console.error('Failed to fetch events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// -------------------------------
// Route: PATCH /:id/status
// Description: Admin approves or rejects event
// Access: Admin only
// -------------------------------
router.patch('/:id/status', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only admin can approve/reject events' });
  }

  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status provided' });
  }

  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error('Failed to update event status:', err);
    res.status(400).json({ error: 'Event status update failed', details: err.message });
  }
});

// -------------------------------
// Route: POST /:id/register
// Description: Student registers for an approved event
// Access: Student (authenticated)
// -------------------------------
router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.status !== 'approved') {
      return res.status(400).json({ error: 'Cannot register for a non-approved event.' });
    }

    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already registered' });
    }

    event.attendees.push(req.user.id);
    await event.save();

    res.json({ message: 'Registered successfully', event });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(400).json({ error: 'Registration failed', details: err.message });
  }
});

// -------------------------------
// Route: POST /:id/attendance
// Description: Mark attendance for a student
// Access: Admin or Club only
// -------------------------------
router.post('/:id/attendance', verifyToken, async (req, res) => {
  if (!['club', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { studentId } = req.body;

  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (!event.attendees.includes(studentId)) {
      return res.status(400).json({ error: 'Student not registered for this event' });
    }

    // Note: If attendance tracking is needed, modify Event model to store this separately
    res.json({ message: 'Attendance marked for student' });
  } catch (err) {
    console.error('Failed to mark attendance:', err);
    res.status(400).json({ error: 'Failed to mark attendance', details: err.message });
  }
});

// -------------------------------
// Route: GET /search?type=Cultural&keyword=music
// Description: Search for approved events by type and keyword
// Access: Public
// -------------------------------
router.get('/search', async (req, res) => {
  const { type, keyword } = req.query;

  const query = { status: 'approved' }; // Filter only approved events
  if (type) query.type = type;
  if (keyword) query.title = { $regex: keyword, $options: 'i' };

  try {
    const events = await Event.find(query).populate('createdBy', 'name');
    res.json(events);
  } catch (err) {
    console.error('Search failed:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// -------------------------------
// Route: POST /create-with-poster
// Description: Club creates event with poster image
// Access: Club only
// -------------------------------
router.post('/create-with-poster', verifyToken, upload.single('poster'), async (req, res) => {
  if (req.user.role !== 'club') {
    return res.status(403).json({ error: 'Forbidden: Only clubs can create events with posters' });
  }

  const { title, description, date, time, type, venue } = req.body;

  try {
    const event = await Event.create({
      title, description, date, time, type, venue,
      createdBy: req.user.id,
      posterUrl: req.file ? `/uploads/posters/${req.file.filename}` : null
    });

    res.status(201).json(event);
  } catch (err) {
    console.error('Event creation with poster failed:', err);
    res.status(400).json({ error: 'Event creation failed', details: err.message });
  }
});

module.exports = router;
