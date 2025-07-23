// server/routes/authRoutes.js
const express = require('express');
const { getCurrentUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authenticate, getCurrentUser);

module.exports = router;