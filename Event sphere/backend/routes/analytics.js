const express = require('express');
const verifyToken = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');

const router = express.Router();

// GET /api/analytics/summary
router.get('/summary', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  try {
    const totalEvents = await Event.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalClubs = await User.countDocuments({ role: 'club' });

    const eventTypes = await Event.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const clubActivity = await Event.aggregate([
      { $group: { _id: "$createdBy", count: { $sum: 1 } } }
    ]);

    res.json({
      totalEvents,
      totalUsers,
      totalStudents,
      totalClubs,
      eventTypes,
      clubActivity
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
