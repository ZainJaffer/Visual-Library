import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MyBooks from './pages/MyBooks'
import Discover from './pages/Discover'
import TestErrors from './components/TestErrors';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
              path="/my-books" 
              element={
                <ProtectedRoute>
                  <MyBooks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/discover" 
              element={
                <ProtectedRoute>
                  <Discover />
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

            {/* Test errors route */}
            <Route 
              path="/test-errors" 
              element={
                <ProtectedRoute>
                  <TestErrors />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App