import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'  // Add this line

function LoginForm() {
  const { login } = useAuth()  // Add this line
  const [formData, setFormData] = useState({
    email: '',     
    password: ''
  })

  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  // const handleSubmit = (e) => {
  //   e.preventDefault()
  //   console.log('Testing auth context:', !!login)  // Add this line to test
  //   console.log('Login attempted:', formData)
  //   // We'll add API call here later
  // }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('') // Clear any previous errors
    try {
      const result = await login(formData)
      console.log('Login successful:', result)
      // TODO: Redirect to dashboard or home page after successful login
    } catch (err) {
      setError(err.message || 'Login failed')
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

        {/* Error message display */}
        {error && (
          <div className="text-red-500 text-sm mt-1">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Login
        </button>
      </form>
    </div>
  )
}

export default LoginForm