const express = require('express');
const Event = require('../models/Event');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Create event (Club role)
router.post('/create', verifyToken, async (req, res) => {
  const { title, description, date, time, type, venue } = req.body;
  try {
    const event = await Event.create({
      title, description, date, time, type, venue, createdBy: req.user.id
    });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: 'Event creation failed' });
  }
});

// List events
router.get('/', async (req, res) => {
  const events = await Event.find().populate('createdBy', 'name');
  res.json(events);
});

// Approve event (Admin only)
router.patch('/:id/approve', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const event = await Event.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  res.json(event);
});


// Student registers for event
router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    // Prevent duplicate registration
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already registered' });
    }

    event.attendees.push(req.user.id);
    await event.save();

    res.json({ message: 'Registered successfully', event });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Mark attendance (Organizer/Admin use)
router.post('/:id/attendance', verifyToken, async (req, res) => {
  if (!['club', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { studentId } = req.body;

  try {
    const event = await Event.findById(req.params.id);

    if (!event.attendees.includes(studentId)) {
      return res.status(400).json({ error: 'Student not registered' });
    }

    // You can track attendance separately if needed
    // For now, we're assuming attendee list = attendance

    res.json({ message: 'Attendance marked' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to mark attendance' });
  }
});


// GET /api/events/search?type=Cultural&keyword=music
router.get('/search', async (req, res) => {
  const { type, keyword } = req.query;

  const query = {};
  if (type) query.type = type;
  if (keyword) query.title = { $regex: keyword, $options: 'i' };

  try {
    const events = await Event.find(query).populate('createdBy', 'name');
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});


const upload = require('../middleware/upload');

// Create event with poster upload
router.post('/create-with-poster', verifyToken, upload.single('poster'), async (req, res) => {
  const { title, description, date, time, type, venue } = req.body;
  try {
    const event = await Event.create({
      title, description, date, time, type, venue,
      createdBy: req.user.id,
      posterUrl: req.file?.filename || null
    });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: 'Event creation failed' });
  }
});


module.exports = router;
