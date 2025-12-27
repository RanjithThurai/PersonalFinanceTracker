import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // If user is not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // Note: Token validation is done on the backend for API calls
  // This component only checks for token presence
  // If token is expired or invalid, the backend will return 401 and the user will be logged out
  
  // If authenticated, render the component they were trying to access
  return children;
};

export default ProtectedRoute;