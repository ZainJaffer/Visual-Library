import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BookRow } from '../components/BookRow';
import { useBooks } from '../hooks/useBooks';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { LoadingSpinner } from '../components/LoadingSpinner';

function MyBooks() {
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
      } else {
        await api.put(`/users/books/${bookId}/update-status/`, { [field]: newValue });
      }
      
      if (field === 'is_favorite') {
        setBooks(prevBooks => 
          prevBooks.map(b => 
            b.id === bookId ? { ...b, is_favorite: newValue } : b
          )
        );
      } else {
        const bookElement = document.getElementById(`book-${bookId}`);
        if (bookElement) {
          bookElement.style.transition = 'all 0.3s ease-out';
          bookElement.style.opacity = '0';
          bookElement.style.transform = 'scale(0.95)';
        }
        
        setTimeout(() => {
          setBooks(prevBooks => 
            prevBooks.map(b => 
              b.id === bookId ? { ...b, is_read: newValue } : b
            )
          );

          if (bookElement && book.is_favorite) {
            bookElement.style.opacity = '1';
            bookElement.style.transform = 'scale(1)';
          }
        }, 300);
      }
    } catch (err) {
      console.error('Error updating book:', err);
      setError('Failed to update book status');
    }
  };

  // Group books into categories
  const bookCategories = useMemo(() => {
    // Get unique genres from read books only
    const genres = [...new Set(books
      .filter(book => book.is_read)
      .flatMap(book => book.genre ? book.genre.split(',').map(g => g.trim()) : [])
    )];

    return {
      'Favorites': books.filter(book => book.is_favorite && book.is_read),
      ...genres.reduce((acc, genre) => ({
        ...acc,
        [genre]: books.filter(book => 
          book.is_read && book.genre?.includes(genre)
        )
      }), {})
    };
  }, [books]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-slate-100 min-h-screen">
      <ErrorDisplay error={error} />
      <div className="max-w-[1320px] mx-auto px-4 py-16 space-y-12">
        {/* Favorites (Read) */}
        {bookCategories['Favorites'].length > 0 && (
          <BookRow 
            title="Favorites"
            books={bookCategories['Favorites']}
            onToggleStatus={toggleBookStatus}
          />
        )}
        
        {/* Read Books by Genre */}
        {Object.entries(bookCategories)
          .filter(([key, books]) => 
            key !== 'Favorites' && 
            books.length > 0
          )
          .map(([genre, books]) => (
            <BookRow 
              key={genre}
              title={genre}
              books={books}
              onToggleStatus={toggleBookStatus}
            />
          ))}
      </div>
    </div>
  );
}

export default MyBooks;