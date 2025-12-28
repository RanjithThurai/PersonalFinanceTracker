const Tesseract = require('tesseract.js');
const { createCanvas } = require('canvas');

// Helper function to extract numbers from text (handles commas, decimals, currency)
const extractNumber = (text) => {
  // Remove currency symbols and common text, keep numbers, dots, and commas
  const cleaned = text.replace(/[₹$€£¥]/g, '').trim();
  
  // Match numbers with optional commas and decimals
  // Patterns: 123.45, 1,234.56, 1234, 123.5, etc.
  const patterns = [
    /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/,  // With commas: 1,234.56
    /(\d+\.\d{1,2})/,                       // Decimal: 123.45
    /(\d+)/                                 // Integer: 1234
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      // Remove commas and parse
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0) {
        return num;
      }
    }
  }
  return null;
};

// Helper function to parse receipt text with improved logic
const parseReceipt = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let candidates = [];
  
  // Keywords in priority order (most important first)
  const totalKeywords = ['grand total', 'total amount', 'amount due', 'total', 'final total', 'balance due'];
  const subtotalKeywords = ['subtotal', 'sub-total', 'sub total'];
  const amountKeywords = ['amount', 'balance', 'due', 'pay', 'charge'];
  
  // First pass: Look for "total" keywords (highest priority)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Check for total keywords
    for (const keyword of totalKeywords) {
      if (lowerLine.includes(keyword)) {
        // Try to extract number from same line
        let num = extractNumber(line);
        if (num) {
          candidates.push({ value: num, priority: 10, line: line });
        }
        
        // Also check next line (sometimes total is on next line)
        if (i + 1 < lines.length) {
          num = extractNumber(lines[i + 1]);
          if (num) {
            candidates.push({ value: num, priority: 10, line: lines[i + 1] });
          }
        }
        
        // Check previous line
        if (i > 0) {
          num = extractNumber(lines[i - 1]);
          if (num) {
            candidates.push({ value: num, priority: 9, line: lines[i - 1] });
          }
        }
      }
    }
    
    // Check for subtotal (lower priority, but still valid)
    for (const keyword of subtotalKeywords) {
      if (lowerLine.includes(keyword)) {
        const num = extractNumber(line);
        if (num) {
          candidates.push({ value: num, priority: 5, line: line });
        }
      }
    }
  }
  
  // Second pass: If no total found, look for amount keywords
  if (candidates.length === 0) {
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const keyword of amountKeywords) {
        if (lowerLine.includes(keyword)) {
          const num = extractNumber(line);
          if (num) {
            candidates.push({ value: num, priority: 3, line: line });
          }
        }
      }
    }
  }
  
  // Third pass: If still nothing, find the largest number (might be the total)
  if (candidates.length === 0) {
    const allNumbers = [];
    for (const line of lines) {
      const num = extractNumber(line);
      if (num && num > 0) {
        allNumbers.push({ value: num, priority: 1, line: line });
      }
    }
    // Sort by value and take the largest (likely the total)
    if (allNumbers.length > 0) {
      allNumbers.sort((a, b) => b.value - a.value);
      candidates.push(allNumbers[0]);
    }
  }
  
  // Sort candidates by priority (highest first), then by value (largest first)
  candidates.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return b.value - a.value;
  });
  
  const total = candidates.length > 0 ? candidates[0].value : null;
  
  console.log('Receipt parsing results:', {
    total,
    candidates: candidates.slice(0, 3), // Log top 3 candidates
    textPreview: text.substring(0, 200) // First 200 chars for debugging
  });
  
  return { total };
};


// Refactored OCR logic with improved configuration
const performOCR = async (imageBuffer) => {
  console.log('Starting OCR process...');
  
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: m => {
          // Only log important messages to reduce noise
          if (m.status === 'recognizing text' && m.progress === 1) {
            console.log('OCR completed successfully');
          }
        },
        // Improve OCR accuracy - allow numbers, currency symbols, and common receipt characters
        tessedit_char_whitelist: '0123456789.,$₹€£¥ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz :-\n/',
        // Page segmentation mode: 3 = Auto (default, works well for most receipts)
        // Alternative: 11 = Sparse text (good for receipts with scattered text)
        psm: 3,
      }
    );
    
    console.log('OCR process finished. Extracted text length:', text.length);
    console.log('OCR text preview:', text.substring(0, 500));
    
    return parseReceipt(text);
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to perform OCR on the image');
  }
};


// Main controller function with the dynamic import fix
exports.scanReceipt = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded.' });
  }

  try {
    let imageBuffer;

    // Check the file's MIME type
    if (req.file.mimetype === 'application/pdf') {
      console.log('PDF detected, starting conversion to image...');
      
      // --- THE FIX: Dynamically import the pdfjs-dist package ---
      const { getDocument } = await import('pdfjs-dist');

      const pdfData = new Uint8Array(req.file.buffer);
      // Update the call to match the modern API
      const doc = await getDocument({ data: pdfData }).promise;
      const page = await doc.getPage(1); // Get the first page
      const viewport = page.getViewport({ scale: 2.0 }); // Increase scale for better quality
      
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      await page.render({ canvasContext: context, viewport: viewport }).promise;
      
      imageBuffer = canvas.toBuffer('image/png');
      console.log('PDF conversion successful.');

    } else if (req.file.mimetype.startsWith('image/')) {
      console.log('Image detected.');
      // For images, we can optionally preprocess them for better OCR
      // For now, use the buffer directly, but we could add image enhancement here
      imageBuffer = req.file.buffer;

    } else {
      return res.status(400).json({ msg: 'Unsupported file type. Please upload an image or PDF.' });
    }

    // Perform OCR on the final image buffer
    const extractedData = await performOCR(imageBuffer);

    res.json({
      success: true,
      data: {
        extracted: extractedData
      }
    });

  } catch (error) {
    console.error('File Processing Error:', error);
    
    // Handle file type errors
    if (error.message && error.message.includes('Invalid file type')) {
      return res.status(400).json({ msg: error.message });
    }
    
    // Generic error response (don't expose internal error details)
    res.status(500).json({ msg: 'Failed to process the file. Please try again.' });
  }
};