import { useState } from 'react'
import { useAuth } from '../../context/AuthContext' 
import { useNavigate } from 'react-router-dom'  // Add this import

function LoginForm() {
  const { login } = useAuth()  
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',     
    password: ''
  })

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)  // Add loading state

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return  // Prevent multiple submissions
    
    setIsLoading(true)
    setError('')
    
    try {
      await login(formData)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        
        {/* Email/Username field */}
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
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
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
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            required
          />
        </div>

        {/* Error message display */}
        {error && (
          <div className="text-red-500 text-sm mt-1">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium 
            bg-gray-900 text-white hover:bg-gray-800 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 
            transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  )
}

export default LoginForm