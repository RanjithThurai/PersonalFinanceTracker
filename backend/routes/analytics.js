const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getMonthlyComparison } = require('../controllers/analyticsController');

// Apply the auth middleware to all routes in this file
router.use(auth);

// @route   GET api/analytics/monthly-comparison
// @desc    Get monthly comparison analytics (current vs previous month)
// @access  Private
router.get('/monthly-comparison', getMonthlyComparison);

module.exports = router;

