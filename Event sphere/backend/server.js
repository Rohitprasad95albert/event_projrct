// backend/server.js (No changes needed)
require('dotenv').config(); // Should be at the very top to load environment variables first
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db'); // MongoDB connection

// CORS configuration
// Or, allow only your frontend origin:
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Changed from 5500 to 5501 as per frontend's settings.json
    credentials: true
}));

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // To parse JSON request bodies

const PORT = process.env.PORT || 3000;

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const certRoutes = require('./routes/certificates');
const analyticsRoutes = require('./routes/analytics');
const feedbackRoutes = require('./routes/feedback');
const path = require('path'); // Added for serving static files

// Serve static files (e.g., event posters, certificates)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/certificates', certRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});