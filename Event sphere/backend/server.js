// backend/server.js
require('dotenv').config(); // Should be at the very top to load environment variables first
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db'); // MongoDB connection
const path = require('path'); // For serving static files

// CORS configuration - ENSURE THIS MATCHES YOUR FRONTEND'S PORT
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Assuming your frontend is truly on port 5500
    credentials: true
}));

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // To parse JSON request bodies

const PORT = process.env.PORT || 3000;

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const certRoutes = require('./routes/certificates');
const analyticsRoutes = require('./routes/analytics');
const feedbackRoutes = require('./routes/feedback');

// Use routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/certificates', certRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});