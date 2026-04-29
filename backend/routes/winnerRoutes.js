const express = require('express');
const router = express.Router();
const winnerController = require('../controllers/winnerController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/my-winnings', winnerController.getMyWinnings);
router.get('/:id', winnerController.getWinnerById);
router.post('/:id/verify', winnerController.submitProof);

module.exports = router;
