const mongoose = require('mongoose'); // Import Mongoose to define schemas and interact with MongoDB

// Define the Feedback schema structure
const feedbackSchema = new mongoose.Schema({
  // Reference to the event for which feedback is given
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event' 
  },

  // Reference to the user who submitted the feedback
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  // User's written comment or opinion about the event
  comment: String,

  // Rating given by the user (1 to 5 stars)
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  }
}, 
{ 
  timestamps: true // Automatically adds createdAt and updatedAt timestamps
});

// Export the Feedback model for use in controllers and routes
module.exports = mongoose.model('Feedback', feedbackSchema);
