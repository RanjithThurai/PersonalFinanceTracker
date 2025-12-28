const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    trim: true
  },
  monthlyLimit: { 
    type: Number, 
    required: true,
    min: 0
  },
  month: { 
    type: String, 
    required: true,
    match: /^\d{4}-\d{2}$/ // YYYY-MM format
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Compound index to ensure one budget per user, category, and month
BudgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);

