// Validation middleware for request validation

// Validate user registration
exports.validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  // Check if all required fields are present
  if (!username || !email || !password) {
    return res.status(400).json({ msg: 'Please provide all required fields' });
  }

  // Validate username
  if (username.trim().length < 3 || username.trim().length > 30) {
    return res.status(400).json({ msg: 'Username must be between 3 and 30 characters' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ msg: 'Please provide a valid email address' });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
  }

  if (password.length > 128) {
    return res.status(400).json({ msg: 'Password must be less than 128 characters' });
  }

  next();
};

// Validate user login
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ msg: 'Please provide a valid email address' });
  }

  next();
};

// Validate transaction data
exports.validateTransaction = (req, res, next) => {
  const { type, amount, category, date, description } = req.body;

  // Check required fields
  if (!type || amount === undefined || !category || !date) {
    return res.status(400).json({ msg: 'Please provide type, amount, category, and date' });
  }

  // Validate type
  if (type !== 'income' && type !== 'expense') {
    return res.status(400).json({ msg: 'Type must be either "income" or "expense"' });
  }

  // Validate amount
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ msg: 'Amount must be a positive number' });
  }

  if (numAmount > 999999999.99) {
    return res.status(400).json({ msg: 'Amount is too large' });
  }

  // Validate category
  if (category.trim().length < 1 || category.trim().length > 50) {
    return res.status(400).json({ msg: 'Category must be between 1 and 50 characters' });
  }

  // Validate date
  const transactionDate = new Date(date);
  if (isNaN(transactionDate.getTime())) {
    return res.status(400).json({ msg: 'Please provide a valid date' });
  }

  // Validate date is not too far in the future (e.g., within 1 year)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  if (transactionDate > maxDate) {
    return res.status(400).json({ msg: 'Date cannot be more than 1 year in the future' });
  }

  // Validate description length if provided
  if (description && description.length > 500) {
    return res.status(400).json({ msg: 'Description must be less than 500 characters' });
  }

  // Sanitize and update request body with validated values
  req.body.type = type;
  req.body.amount = numAmount;
  req.body.category = category.trim();
  req.body.date = transactionDate;
  req.body.description = description ? description.trim() : '';

  next();
};

// Validate date range query parameters
exports.validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ msg: 'Invalid date format. Use YYYY-MM-DD format' });
    }

    if (start > end) {
      return res.status(400).json({ msg: 'Start date must be before or equal to end date' });
    }

    // Limit date range to prevent excessive queries (e.g., max 10 years)
    const maxRange = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years in milliseconds
    if (end - start > maxRange) {
      return res.status(400).json({ msg: 'Date range cannot exceed 10 years' });
    }
  } else if (startDate || endDate) {
    return res.status(400).json({ msg: 'Both startDate and endDate must be provided together' });
  }

  next();
};

