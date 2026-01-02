const Transaction = require('../models/Transaction');
const { checkOverspending } = require('./budgetController');

// Get all transactions for a logged-in user (with optional categorization)
exports.getTransactions = async (req, res) => {
  try {
    // --- Filtering ---
    const queryObj = { user: req.user.id };
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);

      // Set endDate to end of day for inclusive range
      endDate.setHours(23, 59, 59, 999);

      queryObj.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Check if categorization is requested
    const categorize = req.query.categorize === 'true';

    if (categorize) {
      // Return transactions grouped by category
      const transactions = await Transaction.find(queryObj)
        .sort({ date: -1, _id: -1 }); // Sort by date (latest first), then by _id

      // Group transactions by category
      const categorized = transactions.reduce((acc, tx) => {
        const category = tx.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = {
            category,
            transactions: [],
            totalAmount: 0,
            totalExpenses: 0,
            totalIncome: 0
          };
        }
        acc[category].transactions.push(tx);
        acc[category].totalAmount += tx.type === 'income' ? tx.amount : -tx.amount;
        if (tx.type === 'expense') {
          acc[category].totalExpenses += tx.amount;
        } else {
          acc[category].totalIncome += tx.amount;
        }
        return acc;
      }, {});

      // Convert to array and sort by total amount (descending)
      const categorizedArray = Object.values(categorized).sort((a, b) =>
        Math.abs(b.totalAmount) - Math.abs(a.totalAmount)
      );

      res.json({
        success: true,
        count: transactions.length,
        categorized: true,
        data: categorizedArray,
        // Also include flat list for backward compatibility
        transactions: transactions
      });
    } else {
      // Original behavior: return flat list with pagination
      // --- Pagination ---
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10)); // Max 100 items per page
      const startIndex = (page - 1) * limit;

      const total = await Transaction.countDocuments(queryObj);
      const transactions = await Transaction.find(queryObj)
        .sort({ date: -1, _id: -1 }) // Sort by date (latest first), then by _id
        .skip(startIndex)
        .limit(limit);

      res.json({
        success: true,
        count: transactions.length,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        },
        data: transactions,
      });
    }
  } catch (err) {
    console.error('Get Transactions Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Add a new transaction
exports.addTransaction = async (req, res) => {
  try {
    const newTransaction = new Transaction({
      type: req.body.type,
      amount: Number(parseFloat(req.body.amount).toFixed(2)),
      category: req.body.category,
      date: req.body.date,
      description: req.body.description || '',
      user: req.user.id,
    });
    const transaction = await newTransaction.save();

    // Check for overspending if this is an expense
    let overspendingWarning = null;
    if (transaction.type === 'expense') {
      // Extract month from transaction date (YYYY-MM format)
      const txDate = new Date(transaction.date);
      const month = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;

      // Check overspending for this category and month
      const overspendingCheck = await checkOverspending(
        req.user.id,
        transaction.category,
        month
      );

      if (overspendingCheck.overspending) {
        overspendingWarning = {
          message: `Warning: You have exceeded your budget for ${transaction.category} in ${month}`,
          category: overspendingCheck.budget.category,
          month: overspendingCheck.budget.month,
          budgetLimit: overspendingCheck.budget.limit,
          spent: overspendingCheck.spent,
          exceededBy: overspendingCheck.exceededBy,
          remaining: overspendingCheck.remaining
        };
      }
    }

    // Return transaction with optional overspending warning
    const response = {
      ...transaction.toObject(),
      overspendingWarning
    };

    res.json(response);
  } catch (err) {
    console.error('Add Transaction Error:', err.message);

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ msg: 'Validation error', errors });
    }

    res.status(500).json({ msg: 'Server Error' });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'Invalid transaction ID format' });
    }

    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Make sure user owns the transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this transaction' });
    }

    await transaction.deleteOne();
    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    console.error('Delete Transaction Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};