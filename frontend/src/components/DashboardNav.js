import React from 'react';

const DashboardNav = ({ setActiveView, activeView }) => {
  return (
    <div className="dashboard-nav">
      <button 
        className={`nav-btn ${activeView === 'add' ? 'active' : ''}`}
        onClick={() => setActiveView('add')}>
        Add Transaction
      </button>
      <button 
        className={`nav-btn ${activeView === 'list' ? 'active' : ''}`}
        onClick={() => setActiveView('list')}>
        List Transactions
      </button>
      <button 
        className={`nav-btn ${activeView === 'categorized' ? 'active' : ''}`}
        onClick={() => setActiveView('categorized')}>
        By Category
      </button>
      <button 
        className={`nav-btn ${activeView === 'summary' ? 'active' : ''}`}
        onClick={() => setActiveView('summary')}>
        Summary Charts
      </button>
      <button 
        className={`nav-btn ${activeView === 'budgets' ? 'active' : ''}`}
        onClick={() => setActiveView('budgets')}>
        Budgets
      </button>
      <button 
        className={`nav-btn ${activeView === 'upload' ? 'active' : ''}`}
        onClick={() => setActiveView('upload')}>
        Upload Receipt
      </button>
    </div>
  );
};

export default DashboardNav;