const Transaction = require('../models/Transaction');

// Get monthly comparison analytics (current vs previous month)
exports.getMonthlyComparison = async (req, res) => {
  try {
    const { currentMonth, previousMonth } = req.query; // Expected format: YYYY-MM
    
    // If not provided, use current month and previous month
    let currentMonthStr = currentMonth;
    let previousMonthStr = previousMonth;
    
    if (!currentMonthStr || !previousMonthStr) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthNum = now.getMonth() + 1;
      currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
      
      // Calculate previous month
      const prevDate = new Date(currentYear, currentMonthNum - 2, 1);
      const prevYear = prevDate.getFullYear();
      const prevMonthNum = prevDate.getMonth() + 1;
      previousMonthStr = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}`;
    }

    // Validate month formats
    if (!/^\d{4}-\d{2}$/.test(currentMonthStr) || !/^\d{4}-\d{2}$/.test(previousMonthStr)) {
      return res.status(400).json({ 
        msg: 'Month must be in YYYY-MM format' 
      });
    }

    // Calculate date ranges
    const [currentYear, currentMonthNum] = currentMonthStr.split('-').map(Number);
    const [prevYear, prevMonthNum] = previousMonthStr.split('-').map(Number);
    
    const currentStartDate = new Date(currentYear, currentMonthNum - 1, 1);
    const currentEndDate = new Date(currentYear, currentMonthNum, 0, 23, 59, 59, 999);
    const prevStartDate = new Date(prevYear, prevMonthNum - 1, 1);
    const prevEndDate = new Date(prevYear, prevMonthNum, 0, 23, 59, 59, 999);

    // Get transactions for both months grouped by month and category
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: req.user.id,
          type: 'expense',
          $or: [
            {
              date: { $gte: currentStartDate, $lte: currentEndDate }
            },
            {
              date: { $gte: prevStartDate, $lte: prevEndDate }
            }
          ]
        }
      },
      {
        $project: {
          amount: 1,
          category: 1,
          date: 1,
          month: {
            $concat: [
              { $toString: { $year: '$date' } },
              '-',
              { $toString: { $cond: [
                { $lt: [{ $month: '$date' }, 10] },
                { $concat: ['0', { $toString: { $month: '$date' } }] },
                { $toString: { $month: '$date' } }
              ]} }
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            month: '$month',
            category: '$category'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          categories: {
            $push: {
              category: '$_id.category',
              total: '$total',
              count: '$count'
            }
          },
          totalExpenses: { $sum: '$total' }
        }
      }
    ]);

    // Process data for easier consumption
    const currentMonthData = monthlyData.find(d => d._id === currentMonthStr);
    const previousMonthData = monthlyData.find(d => d._id === previousMonthStr);

    const currentTotal = currentMonthData?.totalExpenses || 0;
    const previousTotal = previousMonthData?.totalExpenses || 0;
    
    // Calculate percentage change
    let percentageChange = 0;
    if (previousTotal > 0) {
      percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
    } else if (currentTotal > 0) {
      percentageChange = 100; // 100% increase from 0
    }

    // Format data for Chart.js
    const chartData = {
      labels: [previousMonthStr, currentMonthStr],
      datasets: [
        {
          label: 'Total Expenses',
          data: [previousTotal, currentTotal],
          backgroundColor: ['rgba(231, 76, 60, 0.6)', 'rgba(52, 152, 219, 0.6)'],
          borderColor: ['rgba(231, 76, 60, 1)', 'rgba(52, 152, 219, 1)'],
          borderWidth: 1
        }
      ]
    };

    // Category-wise comparison
    const categoryComparison = {};
    
    // Add current month categories
    if (currentMonthData?.categories) {
      currentMonthData.categories.forEach(cat => {
        if (!categoryComparison[cat.category]) {
          categoryComparison[cat.category] = { current: 0, previous: 0 };
        }
        categoryComparison[cat.category].current = cat.total;
      });
    }
    
    // Add previous month categories
    if (previousMonthData?.categories) {
      previousMonthData.categories.forEach(cat => {
        if (!categoryComparison[cat.category]) {
          categoryComparison[cat.category] = { current: 0, previous: 0 };
        }
        categoryComparison[cat.category].previous = cat.total;
      });
    }

    // Convert to array format
    const categoryComparisonArray = Object.entries(categoryComparison).map(([category, data]) => ({
      category,
      current: data.current,
      previous: data.previous,
      change: data.previous > 0 
        ? ((data.current - data.previous) / data.previous) * 100 
        : (data.current > 0 ? 100 : 0)
    })).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    res.json({
      success: true,
      data: {
        currentMonth: currentMonthStr,
        previousMonth: previousMonthStr,
        totals: {
          current: currentTotal,
          previous: previousTotal,
          change: currentTotal - previousTotal,
          percentageChange: parseFloat(percentageChange.toFixed(2))
        },
        chartData,
        categoryComparison: categoryComparisonArray
      }
    });

  } catch (err) {
    console.error('Monthly Comparison Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

