import React, { useState } from 'react';
import { downloadMonthlyReport } from '../services/api';

const ReportDownload = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    if (!selectedMonth) {
      setError('Please select a month');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await downloadMonthlyReport(selectedMonth);

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-report-${selectedMonth}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download report:', err);
      setError(err.response?.data?.msg || 'Failed to download report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Monthly Financial Report</h3>
      <p style={{ color: 'var(--text-secondary-color)', marginBottom: '1.5rem' }}>
        Download a detailed PDF report for any month containing your income, expenses, and category breakdowns.
      </p>

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label>Select Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setError('');
          }}
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

      <button
        className="btn"
        onClick={handleDownload}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#95a5a6' : '#3498db',
          borderColor: loading ? '#95a5a6' : '#3498db',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Generating Report...' : '📥 Download PDF Report'}
      </button>
    </div>
  );
};

export default ReportDownload;

