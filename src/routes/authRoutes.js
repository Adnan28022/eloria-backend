const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { loginAdmin } = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, error: 'Too many login attempts. Try again after 15 minutes.' },
});

router.post('/login', loginLimiter, loginAdmin);

module.exports = router;
