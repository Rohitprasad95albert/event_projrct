// backend/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: {
    type: String,
    enum: ['Tech', 'Cultural', 'Sports', 'Intra College', 'Inter College', 'Workshop', 'Seminar', 'Other'],
    default: 'Other'
  },
  date: String,
  time: String,
  venue: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendees: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registeredCollege: { type: String, trim: true },
    isAttended: { type: Boolean, default: false }
  }],
  posterUrl: String,
  // NEW FIELDS FOR QR ATTENDANCE
  qrCodeId: { type: String, unique: true, sparse: true }, // Unique ID for QR code, sparse allows nulls
  attendanceQuestion: { // Multiple-choice question for verification
    question: { type: String },
    options: [{ type: String }],
    correctAnswer: { type: String } // Stores the correct option text
  }
}, { timestamps: true });

// Pre-save hook to generate qrCodeId if not present (e.g., when event is created)
eventSchema.pre('save', function(next) {
  if (this.isNew && !this.qrCodeId) {
    this.qrCodeId = new mongoose.Types.ObjectId().toHexString(); // Generate a new ObjectId string
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);