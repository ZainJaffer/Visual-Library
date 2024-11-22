import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BookRow } from '../components/BookRow';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useBooks } from '../hooks/useBooks';
import { LoadingSpinner } from '../components/LoadingSpinner';

function Discover() {
  const { user } = useAuth();
  const { books, loading, error, fetchBooks } = useBooks();

  useEffect(() => {
    fetchBooks();
  }, []);

  const toggleBookStatus = async (bookId, field) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const newValue = field === 'is_read' ? !book.is_read : !book.is_favorite;

    try {
      if (field === 'is_read' && newValue === true) {
        await api.put(`/users/books/${bookId}/update-status/`, { 
          is_read: true,
          is_favorite: false 
        });
        
        setBooks(prevBooks => 
          prevBooks.map(b => 
            b.id === bookId ? { ...b, is_read: true, is_favorite: false } : b
          )
        );
      } else {
        await api.put(`/users/books/${bookId}/update-status/`, { [field]: newValue });
        
        setBooks(prevBooks => 
          prevBooks.map(b => 
            b.id === bookId ? { ...b, [field]: newValue } : b
          )
        );
      }
    } catch (err) {
      console.error('Error updating book:', err);
      setError({
        message: err.message || 'An unexpected error occurred'
      });
    }
  };

  // Group books into categories
  const bookCategories = useMemo(() => {
    // Get unique genres from unread books only
    const genres = [...new Set(books
      .filter(book => !book.is_read)
      .flatMap(book => book.genre ? book.genre.split(',').map(g => g.trim()) : [])
    )];

    return {
      'Wishlist': books.filter(book => book.is_favorite && !book.is_read),
      ...genres.reduce((acc, genre) => ({
        ...acc,
        [genre]: books.filter(book => 
          !book.is_read && book.genre?.includes(genre)
        )
      }), {})
    };
  }, [books]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-[1320px] mx-auto px-4 py-16">
        {/* Wishlist */}
        {bookCategories['Wishlist'].length > 0 && (
          <BookRow 
            title="Wishlist"
            books={bookCategories['Wishlist']}
            onToggleStatus={toggleBookStatus}
          />
        )}

        {/* Unread Books by Genre */}
        <div className="mt-12 space-y-12">
          {Object.entries(bookCategories)
            .filter(([key, books]) => 
              key !== 'Wishlist' && 
              books.length > 0
            )
            .map(([genre, books]) => (
              <BookRow 
                key={genre}
                title={`${genre}`}
                books={books}
                onToggleStatus={toggleBookStatus}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default Discover;