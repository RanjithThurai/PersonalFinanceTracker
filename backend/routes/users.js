const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const { validateRegister, validateLogin } = require('../middleware/validation');

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, registerUser);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateLogin, loginUser);

module.exports = router;