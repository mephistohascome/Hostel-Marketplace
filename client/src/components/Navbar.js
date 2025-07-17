import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo/Brand */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          🏠 Hostel Marketplace
        </Link>

        {/* Mobile menu button */}
        <button 
          className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* Navigation menu */}
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>

          {user ? (
            // Authenticated user menu
            <>
              <li className="nav-item">
                <Link 
                  to="/create-item" 
                  className={`nav-link create-btn ${isActive('/create-item') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  + Sell Item
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/my-items" 
                  className={`nav-link ${isActive('/my-items') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  My Items
                </Link>
              </li>
              <li className="nav-item dropdown">
                <div className="nav-link dropdown-toggle">
                  👤 {user.name}
                </div>
                <div className="dropdown-menu">
                  <Link 
                    to="/profile" 
                    className="dropdown-item" 
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="dropdown-item logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </li>
            </>
          ) : (
            // Guest user menu
            <>
              <li className="nav-item">
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/register" 
                  className={`nav-link register-btn ${isActive('/register') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;