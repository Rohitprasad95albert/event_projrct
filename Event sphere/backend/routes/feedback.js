const express = require('express');
const verifyToken = require('../middleware/auth');     // JWT auth middleware
const Feedback = require('../models/Feedback');        // Feedback model

const router = express.Router();

// -----------------------------------------------
// Route: POST /:eventId
// Description: Submit feedback for an event
// Access: Authenticated users only
// -----------------------------------------------
router.post('/:eventId', verifyToken, async (req, res) => {
  const { comment, rating } = req.body;

  try {
    // Create feedback with event ID and user ID
    const feedback = await Feedback.create({
      eventId: req.params.eventId,
      userId: req.user.id,
      comment,
      rating
    });

    // Respond with the created feedback object
    res.json(feedback);
  } catch (err) {
    // Catch validation errors or DB failures
    res.status(400).json({ error: 'Failed to submit feedback' });
  }
});

// -----------------------------------------------
// Route: GET /:eventId
// Description: Fetch all feedback for a specific event
// Access: Public
// -----------------------------------------------
router.get('/:eventId', async (req, res) => {
  try {
    // Find all feedbacks for the given event and populate user name
    const feedback = await Feedback.find({ eventId: req.params.eventId })
                                   .populate('userId', 'name');

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve feedback' });
  }
});

module.exports = router; // Export feedback routes
