import React from 'react';

export const ErrorDisplay = ({ error }) => {
    if (!error) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full animate-fade-in">
                <div className="flex items-center mb-4">
                    <div className="bg-red-100 rounded-full p-3 mr-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Error</h3>
                </div>
                
                <p className="text-gray-600 mb-6">{error.message}</p>
                
                <div className="flex justify-end">
                    <button 
                        onClick={() => error.onClose?.()} 
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 ease-in-out"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};