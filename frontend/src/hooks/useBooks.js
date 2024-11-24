import { useState } from 'react';
import api from '../services/api';  

export const useBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users/books/');
            setBooks(response.data);
            setError(null);
        } catch (error) {
            setError({
                message: error.message,
                onClose: () => setError(null)
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        books,
        loading,
        error,
        setError,
        fetchBooks,
        setBooks  
    };
};