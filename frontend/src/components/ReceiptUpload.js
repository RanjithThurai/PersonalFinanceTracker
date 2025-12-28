import React, { useState } from 'react';
import { uploadReceipt } from '../services/api';

const ReceiptUpload = ({ onReceiptScanned }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [extractedAmount, setExtractedAmount] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editedAmount, setEditedAmount] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError('');
    setShowConfirmation(false);
    setExtractedAmount(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);
    setError('');
    setShowConfirmation(false);
    setExtractedAmount(null);

    try {
      const response = await uploadReceipt(selectedFile);
      const extractedTotal = response.data.data.extracted.total;

      if (extractedTotal) {
        // Show confirmation dialog instead of immediately using the amount
        setExtractedAmount(extractedTotal);
        setEditedAmount(extractedTotal.toString());
        setShowConfirmation(true);
      } else {
        setError('Could not automatically find a total amount. Please check the receipt image quality or enter the amount manually.');
      }
    } catch (err) {
      console.error('Receipt upload failed:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to scan the receipt. ';
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage += err.response.data?.msg || 'Invalid file format.';
        } else if (err.response.status === 413) {
          errorMessage += 'File is too large.';
        } else {
          errorMessage += 'Please try again or enter manually.';
        }
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please try again or enter manually.';
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = () => {
    const amountToUse = parseFloat(editedAmount);
    if (isNaN(amountToUse) || amountToUse <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    // Pass the confirmed/edited amount up to the Dashboard
    onReceiptScanned(amountToUse);
    
    // Reset everything
    setShowConfirmation(false);
    setExtractedAmount(null);
    setEditedAmount('');
    setSelectedFile(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
    setError('');
  };

  const handleReject = () => {
    // User rejected the extracted amount, reset and let them try again or enter manually
    setShowConfirmation(false);
    setExtractedAmount(null);
    setEditedAmount('');
    setError('Amount rejected. You can try uploading again or enter the amount manually.');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="card">
      <h3>Extract Expenses from Receipt</h3>
      <p style={{ color: 'var(--text-secondary-color)' }}>
        Upload an image of your receipt. Our system will try to find the total amount.
      </p>
      
      {!showConfirmation && (
        <>
          <div className="form-group">
            <label>Upload Receipt (Image or PDF)</label>
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {selectedFile && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary-color)', marginTop: '0.5rem' }}>
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          
          <button className="btn" onClick={handleUpload} disabled={isUploading}>
            {isUploading ? 'Scanning...' : 'Scan and Extract'}
          </button>
        </>
      )}

      {showConfirmation && extractedAmount && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          backgroundColor: 'var(--card-bg-color)',
          border: '2px solid var(--btn-bg-color)',
          borderRadius: '8px'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--btn-bg-color)' }}>
            ✓ Amount Extracted
          </h4>
          <p style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
            We found an amount: <span style={{ color: 'var(--btn-bg-color)', fontSize: '1.3rem' }}>
              {formatCurrency(extractedAmount)}
            </span>
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary-color)' }}>
            Please verify: Is this amount correct?
          </p>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Edit amount if needed:</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={editedAmount}
              onChange={(e) => setEditedAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid var(--input-border-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)'
              }}
              placeholder="Enter amount"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn" 
              onClick={handleConfirm}
              style={{ 
                flex: 1,
                minWidth: '120px',
                backgroundColor: '#27ae60',
                borderColor: '#27ae60',
                color: 'white'
              }}
            >
              ✓ Yes, Use This Amount
            </button>
            <button 
              className="btn" 
              onClick={handleReject}
              style={{ 
                flex: 1,
                minWidth: '120px',
                backgroundColor: '#e74c3c',
                borderColor: '#e74c3c',
                color: 'white'
              }}
            >
              ✗ No, Let Me Enter Manually
            </button>
          </div>
        </div>
      )}
      
      {error && <p style={{ color: '#e74c3c', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
};

export default ReceiptUpload;