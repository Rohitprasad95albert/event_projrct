const express = require('express');
const verifyToken = require('../middleware/auth');
const Feedback = require('../models/Feedback');

const router = express.Router();

// Submit feedback
router.post('/:eventId', verifyToken, async (req, res) => {
  const { comment, rating } = req.body;
  try {
    const feedback = await Feedback.create({
      eventId: req.params.eventId,
      userId: req.user.id,
      comment,
      rating
    });
    res.json(feedback);
  } catch (err) {
    res.status(400).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback for event
router.get('/:eventId', async (req, res) => {
  const feedback = await Feedback.find({ eventId: req.params.eventId }).populate('userId', 'name');
  res.json(feedback);
});

module.exports = router;
