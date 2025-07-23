// server/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  room: String,
  date: String,
  startTime: String,
  endTime: String,
  isBlocked: { type: Boolean, default: false },
  reason: String
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);