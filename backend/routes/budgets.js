const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createOrUpdateBudget,
  getBudgets,
  deleteBudget,
} = require('../controllers/budgetController');

// Apply the auth middleware to all routes in this file
router.use(auth);

// @route   POST api/budgets
// @desc    Create or update a budget
// @access  Private
router.post('/', createOrUpdateBudget);

// @route   GET api/budgets
// @desc    Get all budgets for the logged-in user (optionally filter by month)
// @access  Private
router.get('/', getBudgets);

// @route   DELETE api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', deleteBudget);

module.exports = router;

