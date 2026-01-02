const Tesseract = require('tesseract.js');
const { createCanvas, loadImage } = require('canvas');

// Enhanced image preprocessing to improve OCR accuracy
const preprocessImage = async (imageBuffer) => {
  try {
    const img = await loadImage(imageBuffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Get image data for manipulation
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply image enhancements for better OCR
    // 1. Increase contrast
    // 2. Convert to grayscale (optional, but can help)
    // 3. Normalize brightness

    // Contrast enhancement factor (1.5 = 50% more contrast)
    const contrastFactor = 1.5;
    const factor = (259 * (contrastFactor * 255 + 255)) / (255 * (259 - contrastFactor * 255));

    for (let i = 0; i < data.length; i += 4) {
      // Apply contrast
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));     // R
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128)); // G
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128)); // B

      // Optional: Convert to grayscale for better OCR (uncomment if needed)
      // const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      // data[i] = gray;
      // data[i + 1] = gray;
      // data[i + 2] = gray;
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas.toBuffer('image/png');
  } catch (error) {
    console.log('Image preprocessing failed, using original:', error.message);
    return imageBuffer; // Return original if preprocessing fails
  }
};

// Enhanced number extraction with better regex patterns
const extractNumber = (text) => {
  if (!text || typeof text !== 'string') return null;

  // Remove currency symbols (expanded list) but keep numbers, commas, and decimals
  const cleaned = text.replace(/[₹$€£¥Rs]/g, '').trim();

  // Enhanced patterns to match various number formats
  const patterns = [
    // Pattern 1: Numbers with commas and decimals (1,234.56, 12,345.67)
    /(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)/,
    // Pattern 2: Numbers with decimals (123.45, 1234.56)
    /(\d{4,}(?:\.\d{1,2})?)/,
    // Pattern 3: Standard decimal numbers (123.45, 99.99)
    /(\d{2,}\.\d{1,2})/,
    // Pattern 4: Integer numbers (1234, 5678)
    /(\d{3,})/,
    // Pattern 5: Any number with decimal (fallback)
    /(\d+\.\d{1,2})/,
    // Pattern 6: Any integer (fallback)
    /(\d+)/,
  ];

  const extractedNumbers = [];

  for (const pattern of patterns) {
    const matches = cleaned.match(pattern);
    if (matches) {
      const numStr = matches[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0 && num < 10000000) { // Reasonable upper limit
        extractedNumbers.push(num);
      }
    }
  }

  // Return the largest valid number found (most likely the total)
  if (extractedNumbers.length > 0) {
    return Math.max(...extractedNumbers);
  }

  return null;
};

// Extract all numbers from a line for better matching
const extractAllNumbers = (text) => {
  const numbers = [];
  // Remove currency symbols but keep numbers, commas, decimals, and spaces for pattern matching
  const cleaned = text.replace(/[₹$€£¥Rs]/g, '').trim();

  // Find all number patterns
  const patterns = [
    /(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)/g,
    /(\d{4,}(?:\.\d{1,2})?)/g,
    /(\d{2,}\.\d{1,2})/g,
    /(\d{3,})/g,
  ];

  for (const pattern of patterns) {
    const matches = [...cleaned.matchAll(pattern)];
    for (const match of matches) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0 && num < 10000000) {
        numbers.push(num);
      }
    }
  }

  return [...new Set(numbers)]; // Remove duplicates
};

// Enhanced receipt parsing with position-aware logic
const parseReceipt = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let candidates = [];
  const totalLines = lines.length;

  // Enhanced keyword lists with more variations
  const totalKeywords = [
    'grand total', 'grandtotal', 'grand-total',
    'total amount', 'totalamount', 'total-amount',
    'amount due', 'amountdue', 'amount-due',
    'final total', 'finaltotal', 'final-total',
    'balance due', 'balancedue', 'balance-due',
    'total', 'tot', 'ttl',
    'amount payable', 'amountpayable',
    'payable amount', 'payableamount'
  ];

  const subtotalKeywords = [
    'subtotal', 'sub-total', 'sub total', 'subtotal:',
    'sub-total:', 'sub total:', 'sub-total:'
  ];

  const amountKeywords = [
    'amount', 'balance', 'due', 'pay', 'charge',
    'total:', 'amount:', 'balance:', 'due:'
  ];

  // Calculate position score (lines near the end get higher scores)
  const getPositionScore = (lineIndex) => {
    const position = (totalLines - lineIndex) / totalLines; // 0 to 1, higher = closer to end
    return position * 2; // Max 2 points for position
  };

  // First pass: Look for "total" keywords with position awareness
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase().replace(/[:\-]/g, ' '); // Normalize separators
    const positionScore = getPositionScore(i);

    // Check for total keywords
    for (const keyword of totalKeywords) {
      if (lowerLine.includes(keyword)) {
        // Try to extract number from same line
        const numbers = extractAllNumbers(line);
        for (const num of numbers) {
          candidates.push({
            value: num,
            priority: 15 + positionScore, // Higher priority with position bonus
            line: line,
            method: 'total-keyword',
            lineIndex: i
          });
        }

        // Check next line (sometimes total is on next line)
        if (i + 1 < lines.length) {
          const nextNumbers = extractAllNumbers(lines[i + 1]);
          for (const num of nextNumbers) {
            candidates.push({
              value: num,
              priority: 14 + positionScore,
              line: lines[i + 1],
              method: 'total-keyword-next-line',
              lineIndex: i + 1
            });
          }
        }

        // Check previous line
        if (i > 0) {
          const prevNumbers = extractAllNumbers(lines[i - 1]);
          for (const num of prevNumbers) {
            candidates.push({
              value: num,
              priority: 13 + positionScore,
              line: lines[i - 1],
              method: 'total-keyword-prev-line',
              lineIndex: i - 1
            });
          }
        }
      }
    }

    // Check for subtotal (lower priority, but still valid)
    for (const keyword of subtotalKeywords) {
      if (lowerLine.includes(keyword)) {
        const numbers = extractAllNumbers(line);
        for (const num of numbers) {
          candidates.push({
            value: num,
            priority: 8 + positionScore,
            line: line,
            method: 'subtotal-keyword',
            lineIndex: i
          });
        }
      }
    }
  }

  // Second pass: Look for amount keywords if no good candidates
  if (candidates.filter(c => c.priority >= 10).length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      const positionScore = getPositionScore(i);

      for (const keyword of amountKeywords) {
        if (lowerLine.includes(keyword)) {
          const numbers = extractAllNumbers(line);
          for (const num of numbers) {
            candidates.push({
              value: num,
              priority: 5 + positionScore,
              line: line,
              method: 'amount-keyword',
              lineIndex: i
            });
          }
        }
      }
    }
  }

  // Third pass: Find numbers in last 30% of lines (receipt totals are usually at bottom)
  if (candidates.filter(c => c.priority >= 10).length === 0) {
    const bottomStartIndex = Math.floor(totalLines * 0.7);
    for (let i = bottomStartIndex; i < lines.length; i++) {
      const numbers = extractAllNumbers(lines[i]);
      const positionScore = getPositionScore(i);
      for (const num of numbers) {
        candidates.push({
          value: num,
          priority: 3 + positionScore,
          line: lines[i],
          method: 'bottom-region',
          lineIndex: i
        });
      }
    }
  }

  // Fourth pass: If still nothing, find the largest numbers overall
  if (candidates.length === 0) {
    const allNumbers = [];
    for (let i = 0; i < lines.length; i++) {
      const numbers = extractAllNumbers(lines[i]);
      const positionScore = getPositionScore(i);
      for (const num of numbers) {
        allNumbers.push({
          value: num,
          priority: 1 + positionScore,
          line: lines[i],
          method: 'largest-number',
          lineIndex: i
        });
      }
    }
    // Sort by value and take top candidates
    if (allNumbers.length > 0) {
      allNumbers.sort((a, b) => b.value - a.value);
      candidates.push(...allNumbers.slice(0, 3)); // Top 3 largest
    }
  }

  // Remove duplicate values and keep highest priority instance
  const uniqueCandidates = [];
  const seenValues = new Set();

  // Sort by priority first, then value
  candidates.sort((a, b) => {
    if (Math.abs(b.priority - a.priority) > 0.1) {
      return b.priority - a.priority;
    }
    return b.value - a.value;
  });

  for (const candidate of candidates) {
    const roundedValue = Number(candidate.value.toFixed(2));
    if (!seenValues.has(roundedValue)) {
      seenValues.add(roundedValue);
      uniqueCandidates.push(candidate);
    }
  }

  // Validate the top candidate
  let total = null;
  if (uniqueCandidates.length > 0) {
    const topCandidate = uniqueCandidates[0];

    // Sanity checks
    if (topCandidate.value > 0 &&
      topCandidate.value < 10000000 && // Reasonable upper limit
      topCandidate.value >= 0.01) { // Minimum reasonable amount
      total = Number(topCandidate.value.toFixed(2)); // Properly round to 2 decimal places
    }
  }

  console.log('Receipt parsing results:', {
    total,
    topCandidates: uniqueCandidates.slice(0, 5).map(c => ({
      value: c.value,
      priority: c.priority.toFixed(2),
      method: c.method,
      linePreview: c.line.substring(0, 50)
    })),
    totalLines,
    textPreview: text.substring(0, 300)
  });

  return { total };
};


// Enhanced OCR logic with improved configuration
const performOCR = async (imageBuffer) => {
  console.log('Starting OCR process...');

  try {
    // Use PSM 6 (Uniform block of text) - best for structured receipts
    // Falls back to trying PSM 11 if needed
    let result = null;
    let text = '';

    // Primary attempt with PSM 6 (good for structured receipts)
    try {
      const { data } = await Tesseract.recognize(
        imageBuffer,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text' && m.progress === 1) {
              console.log('OCR completed with PSM 6 (Uniform block)');
            }
          },
          // Improved OCR configuration
          tessedit_char_whitelist: '0123456789.,$₹€£¥RsABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz :-\n/()',
          psm: 6, // Uniform block of text - good for structured receipts
        }
      );

      text = data.text || '';
      result = parseReceipt(text);

      // If we found a total, use this result
      if (result.total) {
        console.log('Successfully extracted total with PSM 6:', result.total);
      }
    } catch (error) {
      console.log('PSM 6 failed, trying PSM 11:', error.message);

      // Fallback to PSM 11 (Sparse text) - good for scattered text
      try {
        const { data } = await Tesseract.recognize(
          imageBuffer,
          'eng',
          {
            logger: () => { },
            tessedit_char_whitelist: '0123456789.,$₹€£¥RsABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz :-\n/()',
            psm: 11, // Sparse text
          }
        );

        text = data.text || '';
        result = parseReceipt(text);

        if (result.total) {
          console.log('Successfully extracted total with PSM 11:', result.total);
        }
      } catch (error2) {
        console.log('PSM 11 failed, trying default PSM 3:', error2.message);

        // Final fallback to default PSM 3 (Fully automatic)
        const { data } = await Tesseract.recognize(
          imageBuffer,
          'eng',
          {
            logger: () => { },
            tessedit_char_whitelist: '0123456789.,$₹€£¥RsABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz :-\n/()',
            psm: 3, // Fully automatic
          }
        );

        text = data.text || '';
        result = parseReceipt(text);
      }
    }

    console.log('OCR process finished. Extracted text length:', text.length);
    console.log('OCR text preview:', text.substring(0, 500));
    if (result && result.total) {
      console.log('Successfully extracted total:', result.total);
    }

    return result || { total: null };

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
      console.log('Image detected, applying preprocessing...');
      // Preprocess image for better OCR accuracy
      imageBuffer = await preprocessImage(req.file.buffer);
      console.log('Image preprocessing completed.');

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