// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/auth'); // Import verifyToken middleware
const router = express.Router();

// Register a new user (role forced to 'student')
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, password: hashedPassword, role: 'student' });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern.email) {
      return res.status(400).json({ error: "Email already registered." });
    }
    console.error('User registration failed:', err);
    res.status(400).json({ error: "Registration failed or invalid data.", details: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('User login failed:', err);
    res.status(500).json({ error: "Server error during login." });
  }
});

// --- NEW ADMIN USER MANAGEMENT ROUTES ---

// GET all users (Admin only)
router.get('/users', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Only admin can view all users' });
  }
  try {
    // Select specific fields (exclude password for security)
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

// PATCH update user role (Admin only)
router.patch('/users/:id/role', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Only admin can update user roles' });
  }
  const { role } = req.body; // New role from the request body
  const userIdToUpdate = req.params.id;

  // Validate the new role
  if (!['student', 'club', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role provided' });
  }

  try {
    const user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from changing their own role (optional, but good practice)
    if (user._id.toString() === req.user.id.toString() && user.role !== role) {
        return res.status(400).json({ error: 'Cannot change your own role through this interface' });
    }

    user.role = role;
    await user.save(); // Save the updated user

    res.json({ message: 'User role updated successfully', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Failed to update user role:', err);
    res.status(500).json({ error: 'Failed to update user role', details: err.message });
  }
});

module.exports = router;