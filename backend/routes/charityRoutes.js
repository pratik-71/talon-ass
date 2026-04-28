const express = require('express');
const router = express.Router();
const charityController = require('../controllers/charityController');

// Public route to fetch all charities
router.get('/', charityController.getCharities);

module.exports = router;
