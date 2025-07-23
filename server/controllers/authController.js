// server/controllers/authController.js
const admin = require('firebase-admin');

exports.getCurrentUser = (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email });
};