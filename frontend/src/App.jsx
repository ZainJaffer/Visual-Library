import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MyBooks from './pages/MyBooks'
import Discover from './pages/Discover'
import AddBook from './pages/AddBook'
import TestErrors from './pages/TestErrors';
import { Toaster } from 'react-hot-toast';

console.log('App.jsx loaded');

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Toaster position="top-right" />
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Navbar /> 
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route 
                path="/books/add" 
                element={
                  <ProtectedRoute>
                    <AddBook />
                  </ProtectedRoute>
                } 
              />
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
              <Route 
                path="/test-errors" 
                element={
                  <ProtectedRoute>
                    <TestErrors />
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
      </div>
    </AuthProvider>
  )
}

export default App