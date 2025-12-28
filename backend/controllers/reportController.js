const Transaction = require('../models/Transaction');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

// Generate monthly financial report as PDF
exports.generateMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query; // Expected format: YYYY-MM
    
    // Validate month format
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ 
        msg: 'Please provide a valid month in YYYY-MM format' 
      });
    }

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Get user information
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Calculate total income and expenses using aggregation
    const totals = await Transaction.aggregate([
      {
        $match: {
          user: req.user.id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate category-wise expense breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: req.user.id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Extract totals
    const totalIncome = totals.find(t => t._id === 'income')?.total || 0;
    const totalExpenses = totals.find(t => t._id === 'expense')?.total || 0;
    const netIncome = totalIncome - totalExpenses;

    // Format month name for display
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[monthNum - 1];

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="financial-report-${month}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text('Monthly Financial Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`User: ${user.username}`, { align: 'left' });
    doc.text(`Email: ${user.email}`, { align: 'left' });
    doc.text(`Month: ${monthName} ${year}`, { align: 'left' });
    doc.moveDown(2);

    // Summary Section
    doc.fontSize(16).text('Summary', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Total Income: $${totalIncome.toFixed(2)}`, { indent: 20 });
    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, { indent: 20 });
    doc.text(`Net Income: $${netIncome.toFixed(2)}`, { 
      indent: 20,
      color: netIncome >= 0 ? 'green' : 'red'
    });
    doc.moveDown(2);

    // Category Breakdown Section
    if (categoryBreakdown.length > 0) {
      doc.fontSize(16).text('Category-wise Expense Breakdown', { underline: true });
      doc.moveDown();

      categoryBreakdown.forEach((category, index) => {
        doc.fontSize(12);
        doc.text(
          `${index + 1}. ${category._id || 'Uncategorized'}: $${category.total.toFixed(2)} (${category.count} transaction${category.count !== 1 ? 's' : ''})`,
          { indent: 20 }
        );
      });
      doc.moveDown(2);
    } else {
      doc.fontSize(12).text('No expenses recorded for this month.', { indent: 20 });
      doc.moveDown(2);
    }

    // Footer
    doc.fontSize(10)
      .text(
        `Generated on: ${new Date().toLocaleString()}`,
        { align: 'center' }
      );

    // Finalize PDF
    doc.end();

  } catch (err) {
    console.error('Generate Report Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ msg: 'Server Error' });
    }
  }
};

