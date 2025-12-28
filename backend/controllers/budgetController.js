const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Create or update a budget for a category and month
exports.createOrUpdateBudget = async (req, res) => {
  try {
    const { category, monthlyLimit, month } = req.body;

    // Validate required fields
    if (!category || monthlyLimit === undefined || !month) {
      return res.status(400).json({ 
        msg: 'Please provide category, monthlyLimit, and month (YYYY-MM)' 
      });
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ 
        msg: 'Month must be in YYYY-MM format (e.g., 2024-03)' 
      });
    }

    // Validate monthlyLimit
    if (monthlyLimit < 0) {
      return res.status(400).json({ 
        msg: 'Monthly limit must be a positive number' 
      });
    }

    // Find existing budget or create new one
    const budget = await Budget.findOneAndUpdate(
      { 
        user: req.user.id, 
        category: category.trim(), 
        month 
      },
      { 
        user: req.user.id,
        category: category.trim(),
        monthlyLimit,
        month
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: budget
    });
  } catch (err) {
    console.error('Create/Update Budget Error:', err.message);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ msg: 'Validation error', errors });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        msg: 'Budget already exists for this category and month' 
      });
    }
    
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Get all budgets for the logged-in user
exports.getBudgets = async (req, res) => {
  try {
    const { month } = req.query;
    
    const query = { user: req.user.id };
    if (month) {
      // Validate month format
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ 
          msg: 'Month must be in YYYY-MM format' 
        });
      }
      query.month = month;
    }

    const budgets = await Budget.find(query).sort({ month: -1, category: 1 });

    res.json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (err) {
    console.error('Get Budgets Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }
    
    // Make sure user owns the budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this budget' });
    }
    
    await budget.deleteOne();
    res.json({ msg: 'Budget removed', success: true });
  } catch (err) {
    console.error('Delete Budget Error:', err.message);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid budget ID' });
    }
    
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Helper function to check overspending for a category in a given month
exports.checkOverspending = async (userId, category, month) => {
  try {
    // Get budget for the category and month
    const budget = await Budget.findOne({ user: userId, category, month });
    
    if (!budget) {
      return { overspending: false, budget: null, spent: 0, remaining: 0 };
    }

    // Calculate start and end of the month
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Calculate total expenses for this category in the month
    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          category: category,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const spent = expenses.length > 0 ? expenses[0].total : 0;
    const remaining = budget.monthlyLimit - spent;
    const overspending = spent > budget.monthlyLimit;

    return {
      overspending,
      budget: {
        limit: budget.monthlyLimit,
        category: budget.category,
        month: budget.month
      },
      spent,
      remaining: Math.max(0, remaining),
      exceededBy: overspending ? spent - budget.monthlyLimit : 0
    };
  } catch (err) {
    console.error('Check Overspending Error:', err.message);
    return { overspending: false, budget: null, spent: 0, remaining: 0 };
  }
};

