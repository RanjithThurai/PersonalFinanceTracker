const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/authMiddleware');
const { scanReceipt } = require('../controllers/uploadController');

// Configure multer for in-memory file storage with size limits
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only images and PDFs
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed.'));
    }
  }
});

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'File size too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ msg: 'File upload error' });
  }
  if (err) {
    return res.status(400).json({ msg: err.message || 'File upload error' });
  }
  next();
};

// @route   POST api/upload/receipt
// @desc    Upload a receipt image and extract data
// @access  Private
router.post('/receipt', auth, upload.single('receipt'), handleMulterError, scanReceipt);

module.exports = router;