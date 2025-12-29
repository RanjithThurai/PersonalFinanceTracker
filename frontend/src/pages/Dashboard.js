import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardNav from '../components/DashboardNav';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import CategorizedTransactionList from '../components/CategorizedTransactionList';
import ReceiptUpload from '../components/ReceiptUpload';
import BudgetManager from '../components/BudgetManager';
import { getTransactions, createTransaction } from '../services/api';
import { deleteTransaction } from '../services/api';


const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [categorizedTransactions, setCategorizedTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeView, setActiveView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [extractedAmount, setExtractedAmount] = useState(null);
  const [overspendingAlert, setOverspendingAlert] = useState(null);
  
  // Memoize the active view to prevent unnecessary re-renders
  const memoizedActiveView = useMemo(() => activeView, [activeView]);

  const fetchTransactions = useCallback(async (categorize = false, month = null, year = null) => {
    try {
      setLoading(true);
      // If month and year are provided, calculate the date range
      let params = {};
      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month
        params = {
          categorize: categorize ? 'true' : 'false',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
      } else {
        params = { categorize: categorize ? 'true' : 'false' };
      }
      
      const response = await getTransactions(params);
      
      // Use functional updates to ensure we're working with the latest state
      if (categorize) {
        setCategorizedTransactions(prev => {
          // Only update if the data has actually changed
          const newData = Array.isArray(response.data?.data) ? response.data.data : [];
          if (JSON.stringify(prev) !== JSON.stringify(newData)) {
            return newData;
          }
          return prev;
        });
      } else {
        setTransactions(prev => {
          const newData = Array.isArray(response.data?.data) ? response.data.data : [];
          if (JSON.stringify(prev) !== JSON.stringify(newData)) {
            return newData;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(tx => tx._id !== id));
      // Also update categorized transactions if needed
      setCategorizedTransactions(prev => 
        prev.map(cat => ({
          ...cat,
          transactions: cat.transactions.filter(tx => tx._id !== id)
        })).filter(cat => cat.transactions.length > 0)
      );
      // Refetch if we're on categorized view
      if (activeView === 'categorized') {
        fetchTransactions(true);
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction.');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Fetch transactions when the component mounts or when the active view changes
  useEffect(() => {
    // Only fetch if the view is actually changing to prevent unnecessary requests
    if (memoizedActiveView === 'categorized') {
      fetchTransactions(true, selectedMonth, selectedYear);
    } else if (memoizedActiveView === 'list') {
      fetchTransactions(false);
    }
  }, [memoizedActiveView]);

  // Handle month/year changes for categorized view
  const handleMonthYearChange = useCallback((month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    if (memoizedActiveView === 'categorized') {
      fetchTransactions(true, month, year);
    }
  }, [memoizedActiveView, fetchTransactions]);

  // Handler to save new transactions
  const handleAddTransaction = async (transaction) => {
    try {
      const response = await createTransaction(transaction);
      const newTransaction = response.data;
      
      // Check for overspending warning in response
      if (newTransaction.overspendingWarning) {
        setOverspendingAlert(newTransaction.overspendingWarning);
        // Auto-dismiss after 10 seconds
        setTimeout(() => setOverspendingAlert(null), 10000);
      }
      
      // Add the new transaction at the beginning of the list (newest first)
      setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
      setExtractedAmount(null); // Clear the extracted amount after use
      setActiveView('list'); // Switch back to the list view after adding
      
      // Refetch categorized if needed
      if (memoizedActiveView === 'categorized') {
        fetchTransactions(true);
      }
    } catch (error) {
      console.error('Failed to add transaction:', error);
      alert(error.response?.data?.msg || 'Failed to add transaction.');
    }
  };

  // Handler for when a receipt amount is extracted
  const handleAmountExtracted = useCallback((amount) => {
    setExtractedAmount(amount);
    setActiveView('add');
  }, []);

  // Handler for when a transaction is added from receipt upload
  const handleTransactionAdded = useCallback((transaction) => {
    // Add the new transaction to the list
    setTransactions(prev => [transaction, ...prev]);
    setActiveView('list');
    
    // Refetch categorized transactions if needed
    if (memoizedActiveView === 'categorized') {
      fetchTransactions(true, selectedMonth, selectedYear);
    }
  }, [memoizedActiveView, selectedMonth, selectedYear, fetchTransactions]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending timeouts when component unmounts
      if (overspendingAlert) {
        setOverspendingAlert(null);
      }
    };
  }, [overspendingAlert]);
  
  const renderActiveView = useCallback(() => {
    if (loading && (memoizedActiveView === 'list' || memoizedActiveView === 'categorized')) {
      return <div className="loading-container">Loading...</div>;
    }
    
    switch (memoizedActiveView) {
      case 'add':
        return (
          <>
            {overspendingAlert && (
              <div 
                className="card" 
                style={{
                  marginBottom: '1rem',
                  backgroundColor: '#fff3cd',
                  border: '2px solid #ffc107',
                  color: '#856404'
                }}
              >
                <h4 style={{ marginTop: 0, color: '#856404' }}>⚠️ Budget Overspending Alert</h4>
                <p style={{ marginBottom: '0.5rem' }}><strong>{overspendingAlert.message}</strong></p>
                <p style={{ marginBottom: 0, fontSize: '0.9rem' }}>
                  Budget Limit: ${overspendingAlert.budgetLimit.toFixed(2)} | 
                  Spent: ${overspendingAlert.spent.toFixed(2)} | 
                  Exceeded by: ${overspendingAlert.exceededBy.toFixed(2)}
                </p>
                <button 
                  onClick={() => setOverspendingAlert(null)}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#856404',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}
            <TransactionForm 
              onAddTransaction={handleAddTransaction} 
              initialAmount={extractedAmount}
            />
          </>
        );
      case 'list':
        return <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} loading={loading} />;
      case 'categorized':
        return <CategorizedTransactionList 
          categorizedData={categorizedTransactions} 
          onDeleteTransaction={handleDeleteTransaction}
          onMonthYearChange={handleMonthYearChange}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          loading={loading} 
        />;
      case 'budgets':
        return <BudgetManager />;
      case 'upload':
        return <ReceiptUpload onReceiptScanned={handleAmountExtracted} onTransactionAdded={handleTransactionAdded} />;
      default:
        return <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} loading={loading} />;
    }
  }, [
    memoizedActiveView, 
    transactions, 
    categorizedTransactions, 
    extractedAmount, 
    overspendingAlert, 
    handleAddTransaction, 
    handleDeleteTransaction, 
    loading, 
    handleMonthYearChange,
    handleAmountExtracted,
    handleTransactionAdded
  ]);

  // Memoize the DashboardNav to prevent unnecessary re-renders
  const memoizedDashboardNav = useMemo(
    () => <DashboardNav setActiveView={setActiveView} activeView={memoizedActiveView} />,
    [memoizedActiveView]
  );

  return (
    <div className="dashboard">
      {memoizedDashboardNav}
      <div className="dashboard-content">
        {useMemo(() => renderActiveView(), [renderActiveView])}
      </div>
    </div>
  );
};

export default Dashboard;