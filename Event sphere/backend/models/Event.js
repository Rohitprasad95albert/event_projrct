const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String, // e.g., Tech, Cultural
  date: String,
  time: String,
  venue: String,
  status: { type: String, default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posterUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
