const Transaction = require('../models/Transaction');

// Get all transactions for a logged-in user
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
    
    // --- Pagination ---
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10)); // Max 100 items per page
    const startIndex = (page - 1) * limit;

    const total = await Transaction.countDocuments(queryObj);
    const transactions = await Transaction.find(queryObj)
      .sort({ _id: -1 }) // Sort by _id descending (newest first) - ObjectIds contain timestamp
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
      amount: req.body.amount,
      category: req.body.category,
      date: req.body.date,
      description: req.body.description || '',
      user: req.user.id,
    });
    const transaction = await newTransaction.save();
    res.json(transaction);
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