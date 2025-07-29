const express = require('express');
const verifyToken = require('../middleware/auth'); // Middleware to verify JWT token
const Event = require('../models/Event');           // Event model
const User = require('../models/User');             // User model

const router = express.Router();

// GET /api/analytics/summary
// Route to fetch admin-level analytics summary
router.get('/summary', verifyToken, async (req, res) => {
  // Only admin users are allowed to access analytics
  if (req.user.role !== 'admin') 
    return res.status(403).json({ error: 'Access denied' });

  try {
    // Count total number of events in the system
    const totalEvents = await Event.countDocuments();

    // Count total number of users (all roles)
    const totalUsers = await User.countDocuments();

    // Count total number of students
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Count total number of clubs
    const totalClubs = await User.countDocuments({ role: 'club' });

    // Group events by type (e.g., Tech, Cultural) and count them
    const eventTypes = await Event.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    // Group events by creator (clubs/admins) to analyze activity
    const clubActivity = await Event.aggregate([
      { $group: { _id: "$createdBy", count: { $sum: 1 } } }
    ]);

    // Return the analytics data as JSON
    res.json({
      totalEvents,
      totalUsers,
      totalStudents,
      totalClubs,
      eventTypes,
      clubActivity
    });
  } catch (err) {
    // Handle errors gracefully
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router; // Export the router
