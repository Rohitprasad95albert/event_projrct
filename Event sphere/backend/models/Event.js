// backend/models/Event.js (No changes needed)
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String, // e.g., Tech, Cultural
  date: String,
  time: String,
  venue: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Added 'rejected' to enum
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posterUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);