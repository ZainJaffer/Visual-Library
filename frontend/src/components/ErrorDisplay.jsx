import React from 'react';

const colorClasses = {
    blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-100 text-blue-600',
        title: 'text-blue-800',
        message: 'text-blue-700',
        button: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
    yellow: {
        bg: 'bg-yellow-50',
        icon: 'bg-yellow-100 text-yellow-600',
        title: 'text-yellow-800',
        message: 'text-yellow-700',
        button: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
    },
    red: {
        bg: 'bg-red-50',
        icon: 'bg-red-100 text-red-600',
        title: 'text-red-800',
        message: 'text-red-700',
        button: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    },
    purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-100 text-purple-600',
        title: 'text-purple-800',
        message: 'text-purple-700',
        button: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
    }
};

const errorTitles = {
    bad_request: 'Bad Request Error',
    not_found: 'Not Found Error',
    server_error: 'Server Error',
    unauthorized: 'Unauthorized Error'
};

export const ErrorDisplay = ({ error }) => {
    if (!error) return null;

    const colors = colorClasses[error.color || 'red'];
    const title = errorTitles[error.type] || 'Error';

    // Close on background click
    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget && error.onClose) {
            error.onClose();
        }
    };

    // Close on escape key
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && error.onClose) {
                error.onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [error.onClose]);

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            onClick={handleBackgroundClick}
        >
            <div className={`${colors.bg} rounded-lg shadow-xl p-6 m-4 max-w-sm w-full`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className={`${colors.icon} rounded-full p-3 mr-3`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className={`text-lg font-semibold ${colors.title}`}>{title}</h3>
                    </div>
                    <button 
                        onClick={error.onClose} 
                        className={`${colors.title} hover:opacity-75`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <p className={`${colors.message} mb-6`}>{error.message}</p>
                
                <div className="flex justify-end">
                    <button 
                        onClick={error.onClose} 
                        className={`px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${colors.button}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};