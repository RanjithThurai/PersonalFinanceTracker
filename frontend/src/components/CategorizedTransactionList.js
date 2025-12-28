import React, { useState, useEffect } from 'react';

const CategorizedTransactionList = ({ categorizedData, onDeleteTransaction, onMonthYearChange }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Notify parent component when month/year changes
  useEffect(() => {
    if (onMonthYearChange) {
      onMonthYearChange(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear, onMonthYearChange]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!categorizedData || categorizedData.length === 0) {
    return (
      <div className="card">
        <h3>Transactions by Category</h3>
        <p>No transactions found.</p>
      </div>
    );
  }

  // Calculate overall totals
  const overallTotals = categorizedData.reduce(
    (acc, cat) => ({
      totalIncome: acc.totalIncome + cat.totalIncome,
      totalExpenses: acc.totalExpenses + cat.totalExpenses,
      netAmount: acc.netAmount + cat.totalAmount
    }),
    { totalIncome: 0, totalExpenses: 0, netAmount: 0 }
  );

  return (
    <div className="card transaction-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Transactions by Category</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="summary-container" style={{ marginBottom: '1.5rem' }}>
        <div className="summary-box income-summary">
          <span>Total Income</span>
          <span className="amount">${overallTotals.totalIncome.toFixed(2)}</span>
        </div>
        <div className="summary-box expense-summary">
          <span>Total Expenses</span>
          <span className="amount">${overallTotals.totalExpenses.toFixed(2)}</span>
        </div>
      </div>

      {/* Categorized Transactions */}
      {categorizedData.map((categoryGroup) => {
        const isExpanded = expandedCategories.has(categoryGroup.category);
        const { category, transactions, totalAmount, totalExpenses, totalIncome } = categoryGroup;

        return (
          <div
            key={category}
            style={{
              marginBottom: '1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'var(--card-bg-color)'
            }}
          >
            {/* Category Header - Clickable to expand/collapse */}
            <div
              onClick={() => toggleCategory(category)}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-color)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
                <h4 style={{ margin: 0, color: 'var(--text-color)' }}>
                  {category || 'Uncategorized'}
                </h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary-color)' }}>
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: totalAmount >= 0 ? '#2ecc71' : '#e74c3c'
                  }}
                >
                  ${Math.abs(totalAmount).toFixed(2)}
                </div>
                {totalExpenses > 0 && (
                  <div style={{ fontSize: '0.85rem', color: '#e74c3c' }}>
                    Expenses: ${totalExpenses.toFixed(2)}
                  </div>
                )}
                {totalIncome > 0 && (
                  <div style={{ fontSize: '0.85rem', color: '#2ecc71' }}>
                    Income: ${totalIncome.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Transactions List - Shown when expanded */}
            {isExpanded && (
              <div>
                <div className="list-header" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--bg-color)' }}>
                  <span className="header-date">Date</span>
                  <span className="header-details">Description</span>
                  <span className="header-amount">Amount</span>
                </div>
                <ul style={{ margin: 0, padding: 0 }}>
                  {transactions.map((tx) => {
                    const { description, category: txCategory } = tx;
                    let displayText = description || txCategory;
                    if (description && txCategory && description !== txCategory) {
                      displayText = `${description} (${txCategory})`;
                    }

                    return (
                      <li key={tx._id} className={tx.type} style={{ padding: '0.75rem 1rem' }}>
                        <span className="date-column">{formatDate(tx.date)}</span>
                        <div className="details-column">
                          <span className="description">{displayText}</span>
                        </div>
                        <div className="amount-container">
                          <span className="amount">
                            {tx.type === 'expense' ? '-' : '+'}
                            ${tx.amount.toFixed(2)}
                          </span>
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTransaction(tx._id);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategorizedTransactionList;

