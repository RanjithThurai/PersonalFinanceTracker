const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getTransactions,
  addTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { validateTransaction, validateDateRange } = require('../middleware/validation');

// Apply the auth middleware to all routes in this file
router.use(auth);

// @route   GET api/transactions
// @desc    Get all user transactions (with filtering and pagination)
// @access  Private
router.get('/', validateDateRange, getTransactions);

// @route   POST api/transactions
// @desc    Add a new transaction
// @access  Private
router.post('/', validateTransaction, addTransaction);

// @route   DELETE api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', deleteTransaction);

module.exports = router;