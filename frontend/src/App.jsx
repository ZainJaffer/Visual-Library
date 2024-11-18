import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TestProtected from './components/TestProtected';

console.log('App.jsx loaded');

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar /> 
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
              path="/test-protected" 
              element={
                <ProtectedRoute>
                  <TestProtected />
                </ProtectedRoute>
              } 
            />
            
            {/* Home route */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route for 404s */}
            <Route 
              path="*" 
              element={<div>Page not found</div>} 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App