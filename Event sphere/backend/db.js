const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// Define the MongoDB connection URL
// You can switch between local and remote MongoDB by changing the variable below
// const mongoURL = process.env.MONGODB_URL_LOCAL; // Use for local MongoDB
const mongoURL = process.env.MONGODB_URL;          // Use for remote/Atlas MongoDB

// Set up MongoDB connection using Mongoose
mongoose.connect(mongoURL, {
  useNewUrlParser: true,       // Use new MongoDB connection string parser
  useUnifiedTopology: true,    // Use new server discovery and monitoring engine
});

// Get the default connection
// Mongoose maintains a default connection object representing the MongoDB connection
const db = mongoose.connection;

// Define event listeners for MongoDB connection

// When successfully connected
db.on('connected', () => {
  console.log("✅ Connected to MongoDB Server");
});

// When connection throws an error
db.on('error', (err) => {
  console.log("❌ MongoDB connection error:", err);
});

// When connection is disconnected
db.on('disconnected', () => {
  console.log("⚠️ MongoDB disconnected");
});

// Export the database connection for use in other files
module.exports = db;
