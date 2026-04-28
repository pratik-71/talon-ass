const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const requireAuth = require('../middleware/authMiddleware');

// @route  GET  /api/scores
router.get('/', requireAuth, scoreController.getScores);

// @route  POST /api/scores
router.post('/', requireAuth, scoreController.addScore);

// @route  PUT  /api/scores/:id
router.put('/:id', requireAuth, scoreController.editScore);

// @route  DELETE /api/scores/:id
router.delete('/:id', requireAuth, scoreController.deleteScore);

module.exports = router;
