const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { generateMonthlyReport } = require('../controllers/reportController');

// Apply the auth middleware to all routes in this file
router.use(auth);

// @route   GET api/reports/monthly
// @desc    Generate monthly financial report as PDF
// @access  Private
router.get('/monthly', generateMonthlyReport);

module.exports = router;

