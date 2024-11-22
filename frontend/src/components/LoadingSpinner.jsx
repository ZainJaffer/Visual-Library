import React from 'react';

export const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-40">
            <div className="flex flex-col items-center">
                {/* Spinner */}
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                {/* Loading text */}
                <p className="text-gray-600 text-lg">Loading your books...</p>
            </div>
        </div>
    );
};