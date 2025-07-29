// backend/server.js

require('dotenv').config(); // Load environment variables from .env (MUST be at top)

const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db'); // Connect to MongoDB

const bodyParser = require('body-parser');
const path = require('path'); // Used for serving static files like posters and certificates

// CORS configuration to allow requests from frontend
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Update if frontend runs on a different port or domain
    credentials: true               // Allow cookies and credentials
}));

// Parse incoming JSON requests
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000; // Fallback to 3000 if no PORT in .env

// Import route modules
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const certRoutes = require('./routes/certificates');
const analyticsRoutes = require('./routes/analytics');
const feedbackRoutes = require('./routes/feedback');

// Serve static files from the "uploads" directory
// Useful for accessing posters, certificates, etc., via URLs like /uploads/file.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount all API routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/certificates', certRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
