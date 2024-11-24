import React, { useState } from 'react';
import api from '../services/api';
import { ErrorDisplay } from '../components/ErrorDisplay';

export default function TestErrors() {
    const [error, setError] = useState(null);

    const testBadRequest = async () => {
        try {
            await api.get('/api/users/test-errors/?error=bad_request');
        } catch (error) {
            setError({
                message: error.message,
                onClose: () => setError(null),
                type: 'bad_request',
                color: 'blue'
            });
        }
    };

    const testNotFound = async () => {
        try {
            await api.get('/api/users/test-errors/?error=not_found');
        } catch (error) {
            setError({
                message: error.message,
                onClose: () => setError(null),
                type: 'not_found',
                color: 'yellow'
            });
        }
    };

    const testServerError = async () => {
        try {
            await api.get('/api/users/test-errors/?error=server_error');
        } catch (error) {
            setError({
                message: error.message,
                onClose: () => setError(null),
                type: 'server_error',
                color: 'red'
            });
        }
    };

    const testUnauthorized = async () => {
        // Temporarily remove the token to test unauthorized access
        const token = localStorage.getItem('token');
        localStorage.removeItem('token');
        
        try {
            await api.get('/api/users/test-errors/');
        } catch (error) {
            setError({
                message: 'You are not authorized to access this resource',
                onClose: () => setError(null),
                type: 'unauthorized',
                color: 'purple'
            });
        } finally {
            // Restore the token
            if (token) localStorage.setItem('token', token);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Test Error Handling</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold mb-4 text-blue-600">Bad Request (400)</h2>
                    <p className="text-gray-600 mb-4">Test how the application handles invalid data submissions.</p>
                    <button
                        onClick={testBadRequest}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Test Bad Request
                    </button>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold mb-4 text-yellow-600">Not Found (404)</h2>
                    <p className="text-gray-600 mb-4">Test how the application handles requests to non-existent resources.</p>
                    <button
                        onClick={testNotFound}
                        className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Test Not Found
                    </button>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold mb-4 text-red-600">Server Error (500)</h2>
                    <p className="text-gray-600 mb-4">Test how the application handles unexpected server errors.</p>
                    <button
                        onClick={testServerError}
                        className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Test Server Error
                    </button>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold mb-4 text-purple-600">Unauthorized (401)</h2>
                    <p className="text-gray-600 mb-4">Test how the application handles unauthorized access attempts.</p>
                    <button
                        onClick={testUnauthorized}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Test Unauthorized
                    </button>
                </div>
            </div>

            {error && <ErrorDisplay error={error} />}
        </div>
    );
}
