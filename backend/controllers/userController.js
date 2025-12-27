const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Check if username already exists
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'Username already taken' });
    }

    user = new User({ username: username.trim(), email: email.trim(), password });
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err.message);
        return res.status(500).json({ msg: 'Server error during registration' });
      }
      res.json({ token });
    });
  } catch (err) {
    console.error('Registration Error:', err.message);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ msg: `${field} already exists` });
    }

    res.status(500).json({ msg: 'Server error' });
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err.message);
        return res.status(500).json({ msg: 'Server error during login' });
      }
      res.json({ token });
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};