// backend/routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');                 // For password hashing
const jwt = require('jsonwebtoken');              // For generating JWT tokens
const User = require('../models/User');           // Mongoose User model
const router = express.Router();

// -----------------------------
// Register Route (POST /register)
// -----------------------------
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in the database
    const user = await User.create({ name, email, password: hashedPassword, role });

    // Respond with 201 Created and return the user object (excluding password)
    res.status(201).json(user);
  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern.email) {
      return res.status(400).json({ error: "Email already registered." });
    }

    console.error('Registration failed:', err);
    res.status(400).json({ 
      error: "Registration failed or invalid data.", 
      details: err.message 
    });
  }
});

// -----------------------------
// Login Route (POST /login)
// -----------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) 
      return res.status(404).json({ error: "User not found" });

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
      return res.status(401).json({ error: "Invalid credentials" });

    // Generate JWT token with expiry (1 hour)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return the token and basic user info (excluding password)
    res.json({ 
      token, 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: "Server error during login." });
  }
});

module.exports = router; // Export the auth routes
