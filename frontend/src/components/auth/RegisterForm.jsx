// src/components/auth/RegisterForm.jsx
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'  // Import useAuth to access the register function
import { useNavigate } from 'react-router-dom'       // Import useNavigate to redirect after registration

function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()   // Access the register function from AuthContext
  const navigate = useNavigate()    // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Call the register function from AuthContext
    try {
      setIsLoading(true)
      await register({
        email: formData.email,
        password: formData.password
      })
      navigate('/')  // Redirect to home page after successful registration
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
   // Inside your return statement in RegisterForm.jsx

<div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
  <form onSubmit={handleSubmit} className="space-y-4">
    <h2 className="text-2xl font-bold mb-4">Register</h2>

    {/* Email field */}
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>

    {/* Password field */}
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
        Password
      </label>
      <input
        type="password"
        id="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>

    {/* Confirm Password field */}
    <div>
      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
        Confirm Password
      </label>
      <input
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>

    {/* Error message display */}
    {error && (
      <div className="text-red-500 text-sm mt-1">
        {error}
      </div>
    )}

    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {isLoading ? 'Registering...' : 'Register'}
    </button>
  </form>
</div>

  )
}

export default RegisterForm
