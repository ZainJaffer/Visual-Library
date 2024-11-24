import React, { useState } from 'react';
import { searchBooks } from '../../services/googleBooks';

export const GoogleBooksTest = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const books = await searchBooks(query);
            setResults(books);
            console.log('API Response:', books); // For debugging
        } catch (err) {
            setError(err.message);
            console.error('Search Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Google Books API Test</h2>
            
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search books..."
                    className="px-4 py-2 border rounded"
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && (
                <div className="text-red-500 mb-4">
                    Error: {error}
                </div>
            )}

            <div className="space-y-4">
                {results.map((book, index) => (
                    <div key={index} className="border p-4 rounded">
                        <div className="flex gap-4">
                            {book.cover_image_url && (
                                <img
                                    src={book.cover_image_url}
                                    alt={book.title}
                                    className="w-24 h-32 object-cover"
                                />
                            )}
                            <div>
                                <h3 className="font-bold">{book.title}</h3>
                                <p className="text-gray-600">{book.author}</p>
                                <p className="text-sm text-gray-500">{book.genre}</p>
                                <p className="text-sm">Published: {book.published_date}</p>
                                <p className="text-sm">Pages: {book.page_count}</p>
                                {book.preview_link && (
                                    <a
                                        href={book.preview_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                    >
                                        Preview
                                    </a>
                                )}
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{book.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
