const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes are protected by authentication
router.use(requireAuth);

// Stats & Users
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/users/:id/scores', adminController.getUserScores);
router.put('/users/:id/subscription', adminController.toggleUserSubscription);
router.put('/scores/:scoreId', adminController.updateUserScore);
router.delete('/scores/:scoreId', adminController.deleteScore);
router.delete('/users/:id', adminController.deleteUser);

// Draw Control
router.post('/draw/execute', adminController.executeDraw);
router.get('/draw/history', adminController.getDrawHistory);

// Winners
router.get('/winners', adminController.getWinners);
router.put('/winners/:id/status', adminController.updateWinnerStatus);

// Charity Management
router.get('/charities', adminController.getCharities);
router.post('/charities', adminController.createCharity);
router.put('/charities/:id', adminController.updateCharity);
router.delete('/charities/:id', adminController.deleteCharity);

module.exports = router;
