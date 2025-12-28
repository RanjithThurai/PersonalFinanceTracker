import React, { useState } from 'react';
import { uploadReceipt } from '../services/api';

const ReceiptUpload = ({ onReceiptScanned }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError('');
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

    try {
      const response = await uploadReceipt(selectedFile);
      const extractedTotal = response.data.data.extracted.total;

      if (extractedTotal) {
        // Pass the extracted amount up to the Dashboard
        onReceiptScanned(extractedTotal);
        // Clear the file input after successful extraction
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
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

  return (
    <div className="card">
      <h3>Extract Expenses from Receipt</h3>
      <p style={{ color: 'var(--text-secondary-color)' }}>
        Upload an image of your receipt. Our system will try to find the total amount.
      </p>
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
      
      {error && <p style={{ color: '#e74c3c', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
};

export default ReceiptUpload;