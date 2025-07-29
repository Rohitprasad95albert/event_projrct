// backend/models/Event.js

const mongoose = require('mongoose'); // Import Mongoose to define the schema and interact with MongoDB

// Define the Event schema structure
const eventSchema = new mongoose.Schema({
  title: String,                     // Title of the event
  description: String,              // Detailed description
  type: String,                     // Type of event, e.g., "Tech", "Cultural"
  date: String,                     // Event date (as a string, e.g., "2025-08-01")
  time: String,                     // Event time (e.g., "14:00")
  venue: String,                    // Location of the event

  // Status of the event: pending (default), approved, or rejected
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },

  // Reference to the user who created the event
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  // List of users attending the event
  attendees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],

  posterUrl: String // Path or URL to the uploaded event poster image
}, 
{ 
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Export the Event model to use in other parts of the backend
module.exports = mongoose.model('Event', eventSchema);
