const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/authMiddleware');

// @route  GET  /api/dashboard
router.get('/', requireAuth, dashboardController.getDashboardData);

// @route  POST /api/dashboard/upload-proof
router.post('/upload-proof', requireAuth, dashboardController.uploadProof);

module.exports = router;
