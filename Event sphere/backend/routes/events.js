// backend/routes/events.js
const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User'); // Import User model for populate in recommendations
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create event (Club role)
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

// List events - Populate createdBy to get club name
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name')
      .populate('attendees.userId', 'name email');
    res.json(events);
  } catch (err) {
    console.error('Failed to fetch events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Update event status (Approve/Reject) - Admin only
router.patch('/:id/status', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only admin can approve/reject events' });
  }
  const { status } = req.body;
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

    const studentId = req.user.id;

    // IMPORTANT FIX: Explicitly check if studentId is present
    if (!studentId) {
        console.error('Registration error: studentId is undefined in token payload for user:', req.user);
        return res.status(401).json({ error: 'Authentication error: User ID not found in token. Please re-login.' });
    }

    const { collegeName } = req.body;

    // Check for duplicate registration: Ensure a.userId exists before calling .equals()
    if (event.attendees.some(a => a.userId && a.userId.equals(studentId))) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    const attendeeData = { userId: studentId };
    if (event.type === 'Inter College' && collegeName) {
      attendeeData.registeredCollege = collegeName;
    } else if (event.type === 'Inter College' && !collegeName) {
        // Optional: If you strictly require college name for inter-college events
        // return res.status(400).json({ error: 'College name is required for Inter College events' });
    }


    event.attendees.push(attendeeData);
    await event.save();

    res.json({ message: 'Registered successfully', event });
  } catch (err) {
    // This catch block will now receive the Mongoose ValidationError
    console.error('Registration failed:', err); // This will log the detailed ValidationError
    if (err.name === 'ValidationError') {
        // Extract specific validation messages if needed
        const errors = Object.values(err.errors).map(el => el.message);
        return res.status(400).json({ error: `Validation failed: ${errors.join(', ')}` });
    }
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

    // Check if student is registered (now checking userId in the attendee objects)
    if (!event.attendees.some(a => a.userId && a.userId.equals(studentId))) { // Added a.userId check
      return res.status(400).json({ error: 'Student not registered for this event' });
    }

    res.json({ message: 'Attendance marked for student' });
  } catch (err) {
    console.error('Failed to mark attendance:', err);
    res.status(400).json({ error: 'Failed to mark attendance', details: err.message });
  }
});

// GET /api/events/search?type=Cultural&keyword=music
router.get('/search', async (req, res) => {
  const { type, keyword } = req.query;

  const query = { status: 'approved' };
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

// Create event with poster upload
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

// GET /api/events/recommended - Get recommended events for a student
router.get('/recommended', verifyToken, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied: Only students can get recommendations' });
  }

  try {
    const studentId = req.user.id;
    if (!studentId) { // Added check for studentId here too
        return res.status(401).json({ error: 'Authentication error: User ID not found for recommendations.' });
    }

    const attendedEvents = await Event.find({ "attendees.userId": studentId, status: 'approved' });

    const attendedEventTypes = [...new Set(attendedEvents.map(event => event.type))];

    if (attendedEventTypes.length === 0) {
      const generalRecommendations = await Event.find({
        status: 'approved',
        "attendees.userId": { $ne: studentId }
      }).limit(5).populate('createdBy', 'name');
      return res.json(generalRecommendations);
    }

    const recommendedEvents = await Event.find({
      type: { $in: attendedEventTypes },
      status: 'approved',
      "attendees.userId": { $ne: studentId }
    }).limit(10).populate('createdBy', 'name');

    if (recommendedEvents.length === 0) {
      const generalRecommendations = await Event.find({
        status: 'approved',
        "attendees.userId": { $ne: studentId }
      }).limit(5).populate('createdBy', 'name');
      return res.json(generalRecommendations);
    }

    res.json(recommendedEvents);
  } catch (err) {
    console.error('Failed to fetch recommended events:', err);
    res.status(500).json({ error: 'Failed to fetch recommended events', details: err.message });
  }
});


// backend/routes/events.js

// ... (existing routes from previous conversations) ...

// NEW: Student submits attendance via QR code scan
router.post('/:qrCodeId/qr-attendance', async (req, res) => {
  const { qrCodeId } = req.params; // QR code ID from the URL
  const { email, name, answer } = req.body; // Student's email, name, and their answer

  try {
    const event = await Event.findOne({ qrCodeId: qrCodeId, status: 'approved' }); // Find event by QR ID and ensure it's approved
    if (!event) {
      return res.status(404).json({ error: 'Event not found or not approved for attendance.' });
    }

    if (!event.attendanceQuestion || !event.attendanceQuestion.question) {
        return res.status(400).json({ error: 'Attendance verification question not set for this event.' });
    }

    // 1. Find the student among the event's registered attendees
    const attendee = event.attendees.find(a =>
        a.userId && a.userId.email.toLowerCase() === email.toLowerCase() && a.userId.name.toLowerCase() === name.toLowerCase()
    );

    if (!attendee) {
        return res.status(400).json({ error: 'You are not registered for this event with the provided name/email.' });
    }

    // 2. Check if attendance already marked
    if (attendee.isAttended) {
        return res.status(400).json({ error: 'Attendance already marked for this event.' });
    }

    // 3. Verify the answer to the multiple-choice question
    if (event.attendanceQuestion.correctAnswer.toLowerCase() !== answer.toLowerCase()) {
        return res.status(401).json({ error: 'Incorrect answer to verification question.' });
    }

    // 4. Mark attendance
    attendee.isAttended = true;
    await event.save(); // Save the updated event document

    res.json({ message: 'Attendance successfully marked!' });

  } catch (err) {
    console.error('QR attendance submission failed:', err);
    res.status(500).json({ error: 'Failed to submit attendance', details: err.message });
  }
});



module.exports = router;