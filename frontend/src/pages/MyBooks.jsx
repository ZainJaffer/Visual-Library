import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BookRow } from '../components/books/BookRow';
import { BookSearch } from '../components/books/BookSearch';
import { useBooks } from '../hooks/useBooks';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { LoadingSpinner } from '../components/LoadingSpinner';

function MyBooks() {
  const { user } = useAuth();
  const { books, loading, error, fetchBooks } = useBooks();
  const [errorState, setErrorState] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

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
      setErrorState('Failed to update book status');
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

  const handleAddBook = async (book) => {
    console.log('MyBooks: Received book data:', book);
    try {
        console.log('MyBooks: Sending POST request to /users/books/add/');
        await api.post('/users/books/add/', book);
        console.log('MyBooks: Book added successfully');
        setSuccessMessage(`"${book.title}" has been added to your library`);
        fetchBooks();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
        console.error('MyBooks: Error adding book:', error);
        setErrorState(error.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-slate-100 min-h-screen">
        <div className="max-w-[1320px] mx-auto px-4 py-8">
            <ErrorDisplay error={errorState} />
            {errorState && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    {errorState}
                </div>
            )}
            {successMessage && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    {successMessage}
                </div>
            )}

            <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <BookSearch onBookSelect={handleAddBook} />
                </div>
            </div>
            
            <div className="space-y-8">
                {bookCategories['Favorites'].length > 0 && (
                    <BookRow 
                        title="Favorites"
                        books={bookCategories['Favorites']}
                        onToggleStatus={toggleBookStatus}
                    />
                )}
                
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
    </div>
  );
}

export default MyBooks;