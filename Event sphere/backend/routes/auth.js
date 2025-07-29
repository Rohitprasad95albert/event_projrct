// backend/routes/auth.js (No changes needed)
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json(user); // Use 201 for creation
  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern.email) {
      return res.status(400).json({ error: "Email already registered." });
    }
    console.error('Registration failed:', err);
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

    // JWT_SECRET should be defined in your .env file
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Add expiry
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } }); // Return limited user info
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: "Server error during login." });
  }
});

module.exports = router;