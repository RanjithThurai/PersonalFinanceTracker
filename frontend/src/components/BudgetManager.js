import React, { useState, useEffect, useCallback } from 'react';
import { getBudgets, createOrUpdateBudget, deleteBudget, getTransactions } from '../services/api';

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    monthlyLimit: '',
    month: selectedMonth
  });
  const [categorySpending, setCategorySpending] = useState({});

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBudgets(selectedMonth);
      setBudgets(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      setError('Failed to load budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  const fetchCategorySpending = useCallback(async () => {
    try {
      // Get start and end dates for the selected month
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      // Fetch transactions with date range filter
      const response = await getTransactions({
        startDate,
        endDate,
        type: 'expense' // Only fetch expenses for budget calculations
      });
      const transactions = response.data.data || [];

      // Calculate spending per category for the selected month
      // Note: Backend already filters by date, but we'll calculate totals here
      const spending = {};
      transactions.forEach(tx => {
        if (tx.type === 'expense') {
          spending[tx.category] = (spending[tx.category] || 0) + tx.amount;
        }
      });

      setCategorySpending(spending);
    } catch (err) {
      console.error('Failed to fetch spending data:', err);
    }
  }, [selectedMonth]);

  // Fetch budgets and spending data
  useEffect(() => {
    fetchBudgets();
    fetchCategorySpending();
  }, [fetchBudgets, fetchCategorySpending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.monthlyLimit) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const budgetData = {
        category: formData.category.trim(),
        monthlyLimit: parseFloat(formData.monthlyLimit),
        month: formData.month
      };

      await createOrUpdateBudget(budgetData);
      setShowForm(false);
      setFormData({ category: '', monthlyLimit: '', month: selectedMonth });
      fetchBudgets();
      fetchCategorySpending();
      setError('');
    } catch (err) {
      console.error('Failed to save budget:', err);
      setError(err.response?.data?.msg || 'Failed to save budget. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await deleteBudget(id);
      fetchBudgets();
      fetchCategorySpending();
    } catch (err) {
      console.error('Failed to delete budget:', err);
      setError(err.response?.data?.msg || 'Failed to delete budget. Please try again.');
    }
  };

  const getProgressPercentage = (limit, spent) => {
    if (limit === 0) return 0;
    const percentage = (spent / limit) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#e74c3c'; // Red - over budget
    if (percentage >= 80) return '#f39c12'; // Orange - approaching limit
    return '#2ecc71'; // Green - within budget
  };

  return (
    <div className="card">
      <h3>Budget Management</h3>

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label>Select Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '1px solid var(--input-border-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)'
          }}
        />
      </div>

      {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}

      {!showForm ? (
        <button
          className="btn"
          onClick={() => {
            setShowForm(true);
            setFormData({ category: '', monthlyLimit: '', month: selectedMonth });
            setError('');
          }}
        >
          + Add Budget
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Category:</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Groceries, Utilities"
              required
            />
          </div>
          <div className="form-group">
            <label>Monthly Limit ($):</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.monthlyLimit}
              onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label>Month:</label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn">Save Budget</button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              style={{ backgroundColor: '#95a5a6', borderColor: '#95a5a6' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <p style={{ color: 'var(--text-secondary-color)', marginTop: '1rem' }}>
          No budgets set for this month. Add a budget to get started!
        </p>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <h4>Current Budgets</h4>
          {budgets.map(budget => {
            const spent = categorySpending[budget.category] || 0;
            const percentage = getProgressPercentage(budget.monthlyLimit, spent);
            const isOverBudget = spent > budget.monthlyLimit;
            const remaining = Math.max(0, budget.monthlyLimit - spent);

            return (
              <div
                key={budget._id}
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  border: `2px solid ${getProgressColor(percentage)}`,
                  borderRadius: '8px',
                  backgroundColor: 'var(--card-bg-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-color)' }}>{budget.category}</h4>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(budget._id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0.25rem 0.5rem'
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary-color)' }}>
                      Spent: ${spent.toFixed(2)} / ${budget.monthlyLimit.toFixed(2)}
                    </span>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: isOverBudget ? '#e74c3c' : getProgressColor(percentage)
                      }}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '20px',
                      backgroundColor: 'var(--border-color)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, percentage)}%`,
                        height: '100%',
                        backgroundColor: getProgressColor(percentage),
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>

                  {isOverBudget ? (
                    <p style={{ color: '#e74c3c', margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>
                      ⚠️ Over budget by ${(spent - budget.monthlyLimit).toFixed(2)}
                    </p>
                  ) : (
                    <p style={{ color: 'var(--text-secondary-color)', margin: 0, fontSize: '0.9rem' }}>
                      ${remaining.toFixed(2)} remaining
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetManager;

