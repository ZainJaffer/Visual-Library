// src/components/Navbar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  // Create a consistent navLink style for all links
  const navLinkStyle = ({ isActive }) => `
    text-xl font-medium text-gray-600 
    ${isActive 
      ? 'text-gray-900' 
      : 'hover:text-gray-900 transition-colors'
    }
  `;

  return (
    <nav className="bg-slate-100 px-4 py-4">
      <div className="max-w-[1320px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="text-2xl font-bold text-gray-800">
          Visual Library
        </NavLink>
        
        {/* Navigation Links */}
        <ul className="flex space-x-8">
          {user ? (
            <>
              <li>
                <NavLink to="/my-books" className={navLinkStyle}>
                  My Books
                </NavLink>
              </li>
              <li>
                <NavLink to="/discover" className={navLinkStyle}>
                  Discover
                </NavLink>
              </li>
              <li>
                <NavLink to="/books/add" className={navLinkStyle}>
                  Add Book
                </NavLink>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="text-xl font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" className={navLinkStyle}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className={navLinkStyle}>
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
