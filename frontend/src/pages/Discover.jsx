import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BookRow } from '../components/BookRow';

function Discover() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user || !user.token) return;
      
      try {
        const response = await api.get('/users/books/');
        setBooks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to fetch books');
        setLoading(false);
      }
    };

    fetchBooks();
  }, [user]);

  const toggleBookStatus = async (bookId, field) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const newValue = field === 'is_read' ? !book.is_read : !book.is_favorite;

    try {
      await api.put(`/users/books/${bookId}/update-status/`, { [field]: newValue });
      
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

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