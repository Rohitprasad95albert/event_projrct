const mongoose = require('mongoose'); // Import Mongoose to define the schema and interact with MongoDB

// Define the User schema structure
const userSchema = new mongoose.Schema({
  // User's full name (required)
  name: { 
    type: String, 
    required: true 
  },

  // User's email address (must be unique and required)
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },

  // Hashed password (required)
  password: { 
    type: String, 
    required: true 
  },

  // Role of the user: can be student, club, or admin (default: student)
  role: { 
    type: String, 
    enum: ['student', 'club', 'admin'], 
    default: 'student' 
  }
}, 
{ 
  timestamps: true // Automatically adds createdAt and updatedAt timestamps
});

// Export the User model for use throughout the backend
module.exports = mongoose.model('User', userSchema);
