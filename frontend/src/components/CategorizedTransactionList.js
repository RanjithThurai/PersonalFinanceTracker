import React, { useState, useMemo, memo, useCallback } from 'react';

// TransactionItem component is no longer needed as we've moved its functionality inline

const CategorizedTransactionList = memo(({ 
  categorizedData, 
  onDeleteTransaction, 
  onMonthYearChange, 
  selectedMonth, 
  selectedYear, 
  loading 
}) => {
  // Use props for selected month/year to keep in sync with parent

  // Memoize the months and years arrays
  const { months, years } = useMemo(() => ({
    months: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
    years: Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  }), []);

  // Handle month/year changes
  const handleMonthChange = useCallback((e) => {
    const newMonth = parseInt(e.target.value);
    onMonthYearChange?.(newMonth, selectedYear);
  }, [onMonthYearChange, selectedYear]);

  const handleYearChange = useCallback((e) => {
    const newYear = parseInt(e.target.value);
    onMonthYearChange?.(selectedMonth, newYear);
  }, [onMonthYearChange, selectedMonth]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleCategory = useCallback((categoryName) => {
    setExpandedCategories(prev => {
      // Only update if the category state actually changes
      const hasCategory = prev.has(categoryName);
      if (hasCategory) {
        const newSet = new Set(prev);
        newSet.delete(categoryName);
        return newSet;
      } else {
        return new Set([...prev, categoryName]);
      }
    });
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const memoizedCategories = useMemo(() => {
    if (!categorizedData || !Array.isArray(categorizedData)) return [];

    try {
      return categorizedData.map(category => {
        const { transactions = [] } = category;
        
        const total = transactions.reduce((sum, tx) => {
          if (!tx) return sum;
          const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0;
          return tx.type === 'income' ? sum + amount : sum - amount;
        }, 0);
        
        const totalIncome = transactions
          .filter(tx => tx && tx.type === 'income')
          .reduce((sum, tx) => {
            const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0;
            return sum + amount;
          }, 0);
          
        const totalExpenses = transactions
          .filter(tx => tx && tx.type === 'expense')
          .reduce((sum, tx) => {
            const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0;
            return sum + amount;
          }, 0);
        
        return {
          ...category,
          total: Number(isNaN(total) ? 0 : total.toFixed(2)),
          totalIncome: Number(isNaN(totalIncome) ? 0 : totalIncome.toFixed(2)),
          totalExpenses: Number(isNaN(totalExpenses) ? 0 : totalExpenses.toFixed(2))
        };
      });
    } catch (error) {
      console.error('Error processing categorized data:', error);
      return [];
    }
  }, [categorizedData]);

  const overallTotals = useMemo(() => {
    try {
      return memoizedCategories.reduce((acc, category) => {
        if (!category) return acc;
        
        const income = typeof category.totalIncome === 'number' 
          ? category.totalIncome 
          : parseFloat(category.totalIncome) || 0;
          
        const expenses = typeof category.totalExpenses === 'number' 
          ? category.totalExpenses 
          : parseFloat(category.totalExpenses) || 0;
          
        const total = typeof category.total === 'number' 
          ? category.total 
          : parseFloat(category.total) || 0;
        
        return {
          totalIncome: (acc.totalIncome || 0) + (isNaN(income) ? 0 : income),
          totalExpenses: (acc.totalExpenses || 0) + (isNaN(expenses) ? 0 : expenses),
          netAmount: (acc.netAmount || 0) + (isNaN(total) ? 0 : total)
        };
      }, { totalIncome: 0, totalExpenses: 0, netAmount: 0 });
    } catch (error) {
      console.error('Error calculating overall totals:', error);
      return { totalIncome: 0, totalExpenses: 0, netAmount: 0 };
    }
  }, [memoizedCategories]);

  if (loading) {
    return (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Transactions by Category</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              value={selectedMonth} 
              onChange={handleMonthChange}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={handleYearChange}
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
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const renderMonthYearSelectors = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <h3 style={{ margin: 0 }}>Transactions by Category</h3>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <select 
          value={selectedMonth} 
          onChange={handleMonthChange}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {months.map((month, index) => (
            <option key={month} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
        <select 
          value={selectedYear} 
          onChange={handleYearChange}
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
  );

  if (!memoizedCategories || memoizedCategories.length === 0) {
    return (
      <div className="card">
        {renderMonthYearSelectors()}
        <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No transactions found for {months[selectedMonth - 1]} {selectedYear}.
        </p>
      </div>
    );
  }

  return (
    <div className="card transaction-list">
      {renderMonthYearSelectors()}

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
      {memoizedCategories.map((category) => {
        const isExpanded = expandedCategories.has(category.category);

        return (
          <div
            key={category.category}
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
              onClick={() => toggleCategory(category.category)}
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
                  {category.category || 'Uncategorized'}
                </h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary-color)' }}>
                  {category.transactions.length} transaction{category.transactions.length !== 1 ? 's' : ''}
                </div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: category.totalAmount >= 0 ? '#2ecc71' : '#e74c3c'
                  }}
                >
                  ${Math.abs(category.totalAmount).toFixed(2)}
                </div>
                {category.totalExpenses > 0 && (
                  <div style={{ fontSize: '0.85rem', color: '#e74c3c' }}>
                    Expenses: ${category.totalExpenses.toFixed(2)}
                  </div>
                )}
                {category.totalIncome > 0 && (
                  <div style={{ fontSize: '0.85rem', color: '#2ecc71' }}>
                    Income: ${category.totalIncome.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Transactions List - Shown when expanded */}
            {isExpanded && (
              <div style={{ backgroundColor: 'var(--card-bg-color)' }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr 120px 100px',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-color)',
                  borderBottom: '1px solid var(--border-color)',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary-color)'
                }}>
                  <span>Date</span>
                  <span>Description</span>
                  <span style={{ textAlign: 'right' }}>Type</span>
                  <span style={{ textAlign: 'right' }}>Amount</span>
                </div>
                
                {/* Transactions */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {category.transactions.map((tx) => (
                    <div 
                      key={tx._id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr 120px 100px',
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-color)',
                        alignItems: 'center',
                        '&:last-child': {
                          borderBottom: 'none'
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.02)'
                        }
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary-color)' }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                      <span style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        paddingRight: '1rem'
                      }}>
                        {tx.description}
                      </span>
                      <span style={{
                        textAlign: 'right',
                        color: tx.type === 'income' ? '#28a745' : '#dc3545',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {tx.type}
                      </span>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          color: tx.type === 'income' ? '#28a745' : '#dc3545',
                          fontWeight: '500',
                          textAlign: 'right',
                          flex: 1
                        }}>
                          {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => onDeleteTransaction(tx._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            marginLeft: '0.5rem',
                            '&:hover': {
                              opacity: 0.8
                            }
                          }}
                          title="Delete transaction"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

CategorizedTransactionList.displayName = 'CategorizedTransactionList';

export default CategorizedTransactionList;

