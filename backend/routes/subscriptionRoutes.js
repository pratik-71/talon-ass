const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// We will need a middleware to verify JWT (already have auth logic, just need to extract it)
// For now, let's just define the routes
router.get('/status', subscriptionController.getSubscriptionStatus);
router.post('/webhook', subscriptionController.handleWebhook);

module.exports = router;
