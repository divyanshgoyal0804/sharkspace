// server/routes/bookingRoutes.js
const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const {
  getAllBookings,
  createBooking,
  cancelBooking,
  blockSlot,
  exportCSV,
  getStats
} = require('../controllers/bookingController');

const router = express.Router();

router.get('/', authenticate, getAllBookings);
router.post('/', authenticate, createBooking);
router.delete('/:id', authenticate, cancelBooking);
router.post('/block', authenticate, blockSlot);
router.get('/export/csv', authenticate, exportCSV);
router.get('/stats', authenticate, getStats);

module.exports = router;