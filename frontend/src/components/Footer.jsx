import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Footer() {
  const { user } = useAuth();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-[1320px] mx-auto px-4 py-6">
        <div className="text-center">
          {user && (
            <NavLink 
              to="/books/add" 
              className="text-gray-400 hover:text-white transition-colors underline"
            >
              Add a book manually to your library
            </NavLink>
          )}
          <div className="mt-4 text-gray-400 text-sm">
            &copy; 2024 Visual Library. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
