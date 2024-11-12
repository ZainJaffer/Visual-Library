// src/components/Navbar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // If you're using authentication

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo or Brand Name */}
        <div>
          <NavLink
            to="/"
            className="text-white text-xl font-bold"
          >
            Visual Book Library Project
          </NavLink>
        </div>
        {/* Navigation Links */}
        <ul className="flex space-x-6">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'text-yellow-400 text-lg font-bold underline'
                  : 'text-white text-lg font-medium hover:text-yellow-300'
              }
            >
              Home
            </NavLink>
          </li>
          {user ? (
            <li>
              <button
                onClick={logout}
                className="text-white text-lg font-medium hover:text-yellow-300"
              >
                Logout
              </button>
            </li>
          ) : (
            <>
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive
                      ? 'text-yellow-400 text-lg font-bold underline'
                      : 'text-white text-lg font-medium hover:text-yellow-300'
                  }
                >
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    isActive
                      ? 'text-yellow-400 text-lg font-bold underline'
                      : 'text-white text-lg font-medium hover:text-yellow-300'
                  }
                >
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
