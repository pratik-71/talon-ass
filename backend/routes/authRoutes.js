const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware placeholder
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    req.user = { id: 'test-user-id' }; // Mock user
    next();
  } else {
    next();
  }
};

// Auth Routes
router.post('/register', authMiddleware, authController.register);
router.post('/login', authMiddleware, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
