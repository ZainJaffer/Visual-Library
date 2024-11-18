import React, { useState } from 'react'
import { authService } from '../services/auth'

const TestProtected = () => {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const testProtectedRoute = async () => {
    try {
      setError('')
      console.log('Testing protected route...')
      const response = await authService.testProtectedRoute()
      console.log('Response:', response)
      setMessage(response.message)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Failed to access protected route')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Protected Page</h2>
      <button 
        onClick={testProtectedRoute}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Test Backend Protection
      </button>
      {message && <p className="text-green-600 mt-2">{message}</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  )
}

export default TestProtected