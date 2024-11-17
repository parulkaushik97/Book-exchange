import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Navbar.css';
import axios from 'axios';

const Navbar = () => {
  const isLoggedIn = localStorage.getItem('token');
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false); // Toggle state for menu
  const [user, setUser] = useState();

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn) {
        const decodedToken = jwtDecode(isLoggedIn);
        try {
          const response = await axios.get(`http://localhost:5000/api/users/${decodedToken.id}`);
          setUser(response.data);
          console.log(response.data); // This will log the user data once when fetched
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };
    fetchUserData();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleLinkClick = () => {
    setMenuOpen(false); // Close the menu when a link is clicked
  };

  return (
    <header className="navbar">
      <img src="/logo.png" alt="Bookstore Logo" className="logo" />
      <h1>Online Bookstore</h1>
      <nav>
        {/* Show Signup and Login if not logged in and not on Dashboard */}
        {(!isLoggedIn && location.pathname !== '/dashboard') && (
          <>
            <Link to="/signup">Signup</Link>
            <Link to="/login">Login</Link>
          </>
        )}
        {/* Show Hamburger Menu if logged in and on Dashboard */}
        {isLoggedIn && location.pathname !== '/login' && (
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>
        )}
        {menuOpen && (
          <div className="dropdown-menu">
            <p>{user[0]?.email}</p>
            <Link to="/" onClick={handleLinkClick}>Home</Link><br />
            <Link to="/my-books" onClick={handleLinkClick}>My Books</Link><br />
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;