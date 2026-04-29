const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public
router.post('/webhook', subscriptionController.handleWebhook);

// Protected
router.get('/status', requireAuth, subscriptionController.getSubscriptionStatus);
router.get('/manage', requireAuth, subscriptionController.getManagementLink);
router.post('/force-update', requireAuth, subscriptionController.forceUpdateSubscription);

module.exports = router;
