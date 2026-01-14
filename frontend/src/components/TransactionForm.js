import React, { useState, useEffect } from 'react';

const TransactionForm = ({ onAddTransaction, initialAmount }) => {
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');

  // Predefined categories for expenses and income
  const expenseCategories = [
    'Groceries',
    'Dining Out',
    'Transportation',
    'Utilities',
    'Rent',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Education',
    'Insurance',
    'Subscriptions',
    'Personal Care',
    'Gifts',
    'Travel',
    'Other'
  ];

  const incomeCategories = [
    'Salary',
    'Freelance',
    'Business',
    'Investment',
    'Bonus',
    'Gift',
    'Refund',
    'Other'
  ];

  // Get current categories based on transaction type
  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  // This effect listens for a pre-filled amount from the receipt scanner
  // and updates the form's state accordingly.
  useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount);
    }
  }, [initialAmount]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Determine the final category value
    const finalCategory = category === 'Other (Custom)' ? customCategory : category;

    if (!finalCategory || !amount || !date) {
      alert('Please fill in all required fields.');
      return;
    }
    const newTransaction = {
      type,
      category: finalCategory,
      amount: Number(parseFloat(amount).toFixed(2)),
      date,
      description
    };
    onAddTransaction(newTransaction);
    // Reset form after submission
    setCategory('');
    setCustomCategory('');
    setAmount('');
    setDescription('');
  };

  return (
    <div className="card transaction-form">
      <h3>Add New Transaction</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (e.target.value !== 'Other (Custom)') {
                setCustomCategory('');
              }
            }}
            required
          >
            <option value="">Select a category</option>
            {currentCategories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
            <option value="Other (Custom)">Other (Custom)</option>
          </select>
          {category === 'Other (Custom)' && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter custom category"
              style={{ marginTop: '10px' }}
              required
            />
          )}
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description (Optional)</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Weekly shopping" />
        </div>
        <button type="submit" className="btn">Add Transaction</button>
      </form>
    </div>
  );
};

export default TransactionForm;