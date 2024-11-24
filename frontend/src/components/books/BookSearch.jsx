import React, { useState, useEffect, useRef } from 'react';
import { searchBooks } from '../../services/googleBooks';
import { debounce } from 'lodash';

export const BookSearch = ({ onBookSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const searchRef = useRef();

    // Debounce the search to prevent too many API calls
    const debouncedSearch = useRef(
        debounce(async (searchQuery) => {
            if (!searchQuery.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const books = await searchBooks(searchQuery);
                setResults(books);
                setError(null);
            } catch (err) {
                setError('Failed to search books');
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300)
    ).current;

    useEffect(() => {
        debouncedSearch(query);
    }, [query]);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setShowResults(true);
                }}
                placeholder="Search for books..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {showResults && (query || loading || error) && (
                <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {loading && (
                        <div className="p-4 text-center text-gray-500">
                            Searching...
                        </div>
                    )}

                    {error && (
                        <div className="p-4 text-center text-red-500">
                            {error}
                        </div>
                    )}

                    {!loading && !error && results.map((book) => (
                        <div
                            key={book.google_books_id}
                            className="p-4 hover:bg-gray-100 cursor-pointer flex items-center gap-4"
                            onClick={() => {
                                onBookSelect(book);
                                setQuery('');
                                setShowResults(false);
                            }}
                        >
                            {book.cover_image_url && (
                                <img 
                                    src={book.cover_image_url} 
                                    alt={book.title}
                                    className="w-12 h-16 object-cover"
                                />
                            )}
                            <div>
                                <h3 className="font-semibold">{book.title}</h3>
                                <p className="text-sm text-gray-600">{book.author}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};