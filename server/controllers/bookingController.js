// server/controllers/bookingController.js
const Booking = require('../models/Booking');

// Get all bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1, startTime: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create booking (client)
exports.createBooking = async (req, res) => {
  const { userId, userName, room, date, startTime, endTime } = req.body;

  // Validation: Max 1 hour per day per user
  const existing = await Booking.findOne({
    userId,
    date,
    room
  });

  if (existing) {
    return res.status(400).json({ message: 'You can only book one hour per day per room.' });
  }

  // Check for double booking
  const conflicting = await Booking.findOne({
    room,
    date,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });

  if (conflicting) {
    return res.status(400).json({ message: 'This time slot is already booked.' });
  }

  const booking = new Booking({
    userId,
    userName,
    room,
    date,
    startTime,
    endTime
  });

  try {
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const now = new Date();
    const start = new Date(`${booking.date}T${booking.startTime}`);
    const twoHours = 2 * 60 * 60 * 1000;

    if (start - now < twoHours) {
      return res.status(400).json({ message: 'Cannot cancel within 2 hours of start time.' });
    }

    await booking.deleteOne();
    res.json({ message: 'Booking canceled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Block time slot (admin)
exports.blockSlot = async (req, res) => {
  const { room, date, startTime, endTime, reason = 'Blocked' } = req.body;

  const conflicting = await Booking.findOne({
    room,
    date,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });

  if (conflicting) {
    return res.status(400).json({ message: 'Conflict with existing booking.' });
  }

  const booking = new Booking({
    userId: 'admin',
    userName: 'Admin',
    room,
    date,
    startTime,
    endTime,
    isBlocked: true,
    reason
  });

  try {
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Export CSV
exports.exportCSV = async (req, res) => {
  try {
    const bookings = await Booking.find();
    let csv = 'ID,User,Room,Date,Start,End,Status\n';
    bookings.forEach(b => {
      csv += `${b._id},${b.userName},${b.room},${b.date},${b.startTime},${b.endTime},${b.isBlocked ? 'Blocked' : 'Booked'}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('bookings.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dashboard stats
exports.getStats = async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const peakHours = await Booking.aggregate([
      { $group: { _id: "$startTime", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({ totalBookings: total, peakHours });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};