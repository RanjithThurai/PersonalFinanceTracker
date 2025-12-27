import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = ({ toggleTheme, currentTheme, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    onLogout();
    setIsMenuOpen(false);
    navigate('/'); // Redirect to home page after logout
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <h1>💰 Personal Finance Assistant</h1>
      <div className="header-right">
        <button 
          className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={isMenuOpen ? 'active' : ''}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={handleLinkClick}>Dashboard</Link>
              <button onClick={handleLogoutClick} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/" onClick={handleLinkClick}>Home</Link>
              <Link to="/login" onClick={handleLinkClick}>Login</Link>
              <Link to="/signup" onClick={handleLinkClick}>Sign Up</Link>
            </>
          )}
        </nav>
        <ThemeToggle toggleTheme={toggleTheme} currentTheme={currentTheme} />
      </div>
    </header>
  );
};

export default Header;