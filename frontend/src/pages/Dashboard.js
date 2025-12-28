import { useState, useEffect } from 'react';
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
      if (categorize) {
        // Make sure we have a valid array before setting state
        if (Array.isArray(response.data?.data)) {
          setCategorizedTransactions(response.data.data);
        } else {
          console.error('Unexpected response format for categorized transactions:', response.data);
          setCategorizedTransactions([]);
        }
      } else {
        setTransactions(Array.isArray(response.data?.data) ? response.data.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Add dependency array here

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
  }, []);

  // Fetch categorized transactions when switching to categorized view
  useEffect(() => {
    if (activeView === 'categorized') {
      fetchTransactions(true, selectedMonth, selectedYear);
    } else {
      fetchTransactions(false);
    }
  }, [activeView, selectedMonth, selectedYear]);

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
      if (activeView === 'categorized') {
        fetchTransactions(true);
      }
    } catch (error) {
      console.error('Failed to add transaction:', error);
      alert(error.response?.data?.msg || 'Failed to add transaction.');
    }
  };

  // Handler for when a receipt amount is extracted
  const handleAmountExtracted = (amount) => {
    setExtractedAmount(amount);
    setActiveView('add');
  };

  // Handler for when a transaction is added from receipt upload
  const handleTransactionAdded = (transaction) => {
    // Add the new transaction to the list
    setTransactions(prev => [transaction, ...prev]);
    setActiveView('list');
    
    // Refetch categorized transactions if needed
    if (activeView === 'categorized') {
      fetchTransactions(true);
    }
  };
  
  // Alias for backward compatibility
  const handleReceiptScanned = handleAmountExtracted;
  
  const renderActiveView = () => {
    if (loading && (activeView === 'list' || activeView === 'categorized')) {
      return <p>Loading...</p>;
    }
    
    switch (activeView) {
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
          onMonthYearChange={(month, year) => {
            setSelectedMonth(month);
            setSelectedYear(year);
            fetchTransactions(true, month, year);
          }}
          loading={loading} 
        />;
      case 'budgets':
        return <BudgetManager />;
      case 'upload':
        return <ReceiptUpload onReceiptScanned={handleAmountExtracted} onTransactionAdded={handleTransactionAdded} />;
      default:
        return <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} loading={loading} />;
    }
  };

  return (
    <div>
      <DashboardNav setActiveView={setActiveView} activeView={activeView} />
      <div className="dashboard-content">
        {renderActiveView()}
      </div>
    </div>
  );
};

export default Dashboard;