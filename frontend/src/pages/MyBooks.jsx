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
  const { books, loading, error, setBooks, fetchBooks } = useBooks();
  const [errorState, setErrorState] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const toggleBookStatus = async (bookId, field) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const newValue = field === 'is_read' ? !book.is_read : 
                    field === 'is_favorite' ? !book.is_favorite :
                    field === 'is_reading' ? !book.is_reading : null;
    
    if (newValue === null) return;

    try {
      // If marking as read, also stop reading
      if (field === 'is_read' && newValue === true && book.is_reading) {
        await api.put(`/api/users/books/status/${bookId}/`, { 
          is_read: true,
          is_reading: false 
        });
        // Update both statuses in state
        setBooks(prevBooks => 
          prevBooks.map(b => 
            b.id === bookId ? { ...b, is_read: true, is_reading: false } : b
          )
        );
      } 
      // If starting to read, make sure it's not marked as read
      else if (field === 'is_reading' && newValue === true) {
        await api.put(`/api/users/books/status/${bookId}/`, { 
          is_reading: true,
          is_read: false
        });
        // Update both statuses in state
        setBooks(prevBooks => 
          prevBooks.map(b => 
            b.id === bookId ? { ...b, is_reading: true, is_read: false } : b
          )
        );
      }
      else {
        await api.put(`/api/users/books/status/${bookId}/`, { [field]: newValue });
        // Update single status in state
        setBooks(prevBooks => 
          prevBooks.map(b => 
            b.id === bookId ? { ...b, [field]: newValue } : b
          )
        );
      }
    } catch (err) {
      console.error('Error updating book:', err);
      setErrorState('Failed to update book status');
    }
  };

  const handleDeleteBook = (bookId) => {
    console.log('MyBooks: Deleting book:', bookId);
    // Remove the book from the local state
    setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    setSuccessMessage('Book deleted successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleAddBook = async (book) => {
    console.log('MyBooks: Received book data:', book);
    try {
        // Add is_read flag for books added from search
        const bookData = {
            ...book,
            is_read: false  // Mark the book as unread when adding from search
        };
        
        console.log('MyBooks: Sending POST request to /api/users/books/add/');
        const response = await api.post('/api/users/books/add/', bookData);
        console.log('MyBooks: Book added successfully', response.data);
        
        // Update books state immediately with the new book
        if (response.data.status === 'success' && response.data.data) {
            console.log('MyBooks: Adding new book to state:', response.data.data);
            const newBook = {
                ...response.data.data,
                is_read: false  // Ensure the new book is marked as unread
            };
            setBooks(prevBooks => {
                const newBooks = [...prevBooks, newBook];
                console.log('MyBooks: Updated books state:', newBooks);
                return newBooks;
            });
        }
        
        setSuccessMessage(`"${book.title}" has been added to your library`);
        
        // Fetch all books to ensure everything is in sync
        await fetchBooks();  // Wait for the fetch to complete
        console.log('MyBooks: Books refetched');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
        console.error('MyBooks: Error adding book:', error);
        setErrorState(error.message);
    }
  };

  const handleUpdateBook = (updatedBook) => {
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === updatedBook.id ? updatedBook : book
      )
    );
    setSuccessMessage('Book updated successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Group books into categories
  const bookCategories = useMemo(() => {
    // Get unique genres from all books, not just read ones
    const genres = [...new Set(books
      .map(book => book.book.genre)
      .filter(Boolean)
      .flatMap(genre => genre.split(',').map(g => g.trim())))];

    // Get currently reading books
    const currentlyReading = books.filter(book => book.is_reading);

    // Get the 10 most recently added books
    const recentlyAdded = [...books]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    // Filter out genres with less than 5 books
    const genresWithEnoughBooks = genres.filter(genre => {
      const booksInGenre = books.filter(book => 
        book.book.genre?.includes(genre)
      );
      return booksInGenre.length >= 5;
    });

    return {
      'Currently Reading': currentlyReading,
      'Recently Added': recentlyAdded,
      'Favorites': books.filter(book => book.is_favorite),
      ...genresWithEnoughBooks.reduce((acc, genre) => ({
        ...acc,
        [genre]: books.filter(book => 
          book.book.genre?.includes(genre)
        )
      }), {})
    };
  }, [books]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-slate-100 min-h-screen">
        <div className="max-w-[1320px] mx-auto px-4 py-8">
            {errorState && (
              <ErrorDisplay 
                error={{ 
                  message: errorState,
                  onClose: () => setErrorState(null)
                }} 
              />
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
            
            <div className="-mx-4 space-y-8">
                {bookCategories['Currently Reading'].length > 0 && (
                    <BookRow 
                        title="Currently Reading"
                        books={bookCategories['Currently Reading']}
                        onToggleStatus={toggleBookStatus}
                        onDeleteBook={handleDeleteBook}
                        onUpdateBook={handleUpdateBook}
                    />
                )}

                {bookCategories['Recently Added'].length > 0 && (
                    <BookRow 
                        title="Recently Added"
                        books={bookCategories['Recently Added']}
                        onToggleStatus={toggleBookStatus}
                        onDeleteBook={handleDeleteBook}
                        onUpdateBook={handleUpdateBook}
                    />
                )}
                
                {bookCategories['Favorites'].length > 0 && (
                    <BookRow 
                        title="Favorites"
                        books={bookCategories['Favorites']}
                        onToggleStatus={toggleBookStatus}
                        onDeleteBook={handleDeleteBook}
                        onUpdateBook={handleUpdateBook}
                    />
                )}
                
                {Object.entries(bookCategories)
                    .filter(([key, books]) => 
                        key !== 'Favorites' && key !== 'Recently Added' && key !== 'Currently Reading' && 
                        books.length > 0
                    )
                    .map(([genre, books]) => (
                        <BookRow 
                            key={genre}
                            title={genre}
                            books={books}
                            onToggleStatus={toggleBookStatus}
                            onDeleteBook={handleDeleteBook}
                            onUpdateBook={handleUpdateBook}
                        />
                    ))}
            </div>
        </div>
    </div>
  );
}

export default MyBooks;