import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getMonthlyComparison } from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyComparison = () => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComparison = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMonthlyComparison(null, null); // API will use current and previous month by default
      setComparisonData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch comparison data:', err);
      setError(err.response?.data?.msg || 'Failed to load comparison data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  if (loading) {
    return (
      <div className="card">
        <h3>Monthly Comparison</h3>
        <p>Loading comparison data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3>Monthly Comparison</h3>
        <p style={{ color: '#e74c3c' }}>{error}</p>
        <button className="btn" onClick={fetchComparison}>
          Retry
        </button>
      </div>
    );
  }

  if (!comparisonData) {
    return (
      <div className="card">
        <h3>Monthly Comparison</h3>
        <p>No comparison data available.</p>
      </div>
    );
  }

  const { totals, chartData, categoryComparison } = comparisonData;
  const percentageChange = totals.percentageChange;

  // Prepare chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Expense Comparison',
        color: 'var(--text-color)',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      }
    }
  };

  return (
    <div className="card">
      <h3>Monthly Comparison Analytics</h3>
      
      <div style={{ marginBottom: '2rem' }}>
        <h4>Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary-color)' }}>
              {comparisonData.previousMonth}
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
              ${totals.previous.toFixed(2)}
            </p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary-color)' }}>
              {comparisonData.currentMonth}
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
              ${totals.current.toFixed(2)}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary-color)' }}>
            Change
          </p>
          <p
            style={{
              margin: '0.5rem 0 0 0',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: percentageChange >= 0 ? '#e74c3c' : '#2ecc71'
            }}
          >
            {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
            {' '}
            <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>
              (${Math.abs(totals.change).toFixed(2)})
            </span>
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4>Expense Comparison Chart</h4>
        <div style={{ position: 'relative', height: '300px', marginTop: '1rem' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {categoryComparison && categoryComparison.length > 0 && (
        <div>
          <h4>Category-wise Changes</h4>
          <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-color)' }}>
                    Category
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-color)' }}>
                    Previous
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-color)' }}>
                    Current
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-color)' }}>
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoryComparison.map((cat, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: index % 2 === 0 ? 'var(--card-bg-color)' : 'var(--bg-color)'
                    }}
                  >
                    <td style={{ padding: '0.75rem', color: 'var(--text-color)' }}>
                      {cat.category || 'Uncategorized'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-color)' }}>
                      ${cat.previous.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-color)' }}>
                      ${cat.current.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        color: cat.change >= 0 ? '#e74c3c' : '#2ecc71',
                        fontWeight: 'bold'
                      }}
                    >
                      {cat.change >= 0 ? '+' : ''}{cat.change.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyComparison;

