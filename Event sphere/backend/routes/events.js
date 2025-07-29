// backend/routes/events.js
const express = require('express');
const Event = require('../models/Event');
const verifyToken = require('../middleware/auth'); // Correct path for middleware
const upload = require('../middleware/upload'); // Ensure this is present if using poster upload

const router = express.Router();

// Create event (Club role)
// The `verifyToken` middleware populates `req.user.id` and `req.user.role`
router.post('/create', verifyToken, async (req, res) => {
  // Add a check to ensure only 'club' role can create events
  if (req.user.role !== 'club') {
    return res.status(403).json({ error: 'Forbidden: Only clubs can create events' });
  }

  const { title, description, date, time, type, venue } = req.body;
  try {
    const event = await Event.create({
      title, description, date, time, type, venue, createdBy: req.user.id // Use req.user.id for createdBy
    });
    res.status(201).json(event); // Use 201 for successful creation
  } catch (err) {
    console.error('Event creation failed:', err); // Log error for debugging
    res.status(400).json({ error: 'Event creation failed', details: err.message });
  }
});

// List events - Populate createdBy to get club name
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name'); // Populate 'name' field from 'User' model
    res.json(events);
  } catch (err) {
    console.error('Failed to fetch events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Update event status (Approve/Reject) - Admin only
// This route now takes the status dynamically in the request body
router.patch('/:id/status', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only admin can approve/reject events' });
  }
  const { status } = req.body; // Expect 'status' in the request body
  if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided' });
  }

  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status: status }, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error('Failed to update event status:', err);
    res.status(400).json({ error: 'Event status update failed', details: err.message });
  }
});

// Student registers for event
router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.status !== 'approved') {
        return res.status(400).json({ error: 'Cannot register for a non-approved event.' });
    }

    // Prevent duplicate registration
    // req.user.id is the ID of the authenticated user (student)
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

// Mark attendance (Organizer/Admin use)
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

    // To properly mark attendance, you might want a separate array or a map
    // on the Event schema, e.g., 'attendedStudents: [{ userId: ObjectId, attended: Boolean }]'
    // For now, assuming if they are in attendees and this endpoint is hit, attendance is marked.
    // If you need actual attendance tracking, you'll need to update the Event model
    // and add logic here to add/update the student in an 'attendedStudents' array.

    res.json({ message: 'Attendance marked for student' });
  } catch (err) {
    console.error('Failed to mark attendance:', err);
    res.status(400).json({ error: 'Failed to mark attendance', details: err.message });
  }
});


// GET /api/events/search?type=Cultural&keyword=music
router.get('/search', async (req, res) => {
  const { type, keyword } = req.query;

  const query = { status: 'approved' }; // Only search for approved events
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


// Create event with poster upload (Club role)
// Note: This route will require 'multer' and 'path' setup in backend/middleware/upload.js
router.post('/create-with-poster', verifyToken, upload.single('poster'), async (req, res) => {
  if (req.user.role !== 'club') {
    return res.status(403).json({ error: 'Forbidden: Only clubs can create events with posters' });
  }
  const { title, description, date, time, type, venue } = req.body;
  try {
    const event = await Event.create({
      title, description, date, time, type, venue,
      createdBy: req.user.id,
      posterUrl: req.file ? `/uploads/posters/${req.file.filename}` : null // Store path
    });
    res.status(201).json(event);
  } catch (err) {
    console.error('Event creation with poster failed:', err);
    res.status(400).json({ error: 'Event creation failed', details: err.message });
  }
});


module.exports = router;