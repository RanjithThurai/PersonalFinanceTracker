import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Debug: Always log the API URL to help with deployment issues
console.log('🔗 API Base URL configured:', baseURL);
console.log('🔗 REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL || 'NOT SET (using default)');

const api = axios.create({
  baseURL: baseURL,
});

// Use an interceptor to add the auth token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Response interceptor to handle 401 errors (unauthorized/expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired, remove it and redirect to login
      localStorage.removeItem('token');
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- ADD THIS NEW FUNCTION ---
// Function to upload a receipt file
export const uploadReceipt = (file) => {
  const formData = new FormData();
  formData.append('receipt', file); // 'receipt' must match the backend field name
  
  return api.post('/upload/receipt', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// --- Existing Functions ---
export const getTransactions = (categorize = false, startDate = null, endDate = null) => {
  const params = {};
  if (categorize) params.categorize = 'true';
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return api.get('/transactions', { params });
};
export const createTransaction = (transaction) => api.post('/transactions', transaction);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const loginUser = (credentials) => api.post('/users/login', credentials);
export const registerUser = (userData) => api.post('/users/register', userData);

// --- Budget APIs ---
export const getBudgets = (month) => {
  const params = month ? { month } : {};
  return api.get('/budgets', { params });
};
export const createOrUpdateBudget = (budgetData) => api.post('/budgets', budgetData);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);

// --- Report APIs ---
export const downloadMonthlyReport = (month) => {
  return api.get('/reports/monthly', {
    params: { month },
    responseType: 'blob' // Important for PDF download
  });
};

// --- Analytics APIs ---
export const getMonthlyComparison = (currentMonth, previousMonth) => {
  const params = {};
  if (currentMonth) params.currentMonth = currentMonth;
  if (previousMonth) params.previousMonth = previousMonth;
  return api.get('/analytics/monthly-comparison', { params });
};

export default api;