import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function BookList() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user || !user.token) return;
      
      try {
        const response = await api.get('/users/books/');
        console.log('Books data:', response.data);
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
    // Find the book
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const newValue = field === 'is_read' ? !book.is_read : !book.is_favorite;

    setBooks(books.map(b => 
      b.id === bookId 
        ? { ...b, [field]: newValue }
        : b
    ));

    try {
      await api.put(
        `/users/books/${bookId}/update-status/`,
        { [field]: newValue }
      );
    } catch (err) {
      console.error('Error updating book:', err);
      setBooks(books.map(b => 
        b.id === bookId 
          ? { ...b, [field]: !newValue }
          : b
      ));
      setError('Failed to update book status');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  // Separate books into read and unread
  const readBooks = books.filter(book => book.is_read);
  const unreadBooks = books.filter(book => !book.is_read);

  const BookRow = ({ title, books }) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => {
          if (!book) {
            console.warn('Invalid book data:', book);
            return null;
          }

          return (
            <div key={book.id} className="border p-4 rounded shadow">
              {console.log('Image URL:', `http://localhost:8000/media/${book.cover_image_url}`)}
              
              <img 
                src={book.cover_image_url 
                  ? `http://localhost:8000/media/${book.cover_image_url}`
                  : 'https://via.placeholder.com/400x600?text=No+Cover'
                }
                alt={book.title || 'Book cover'}
                className="w-full h-64 object-cover rounded mb-4"
                onError={(e) => {
                  console.log('Image failed to load:', e.target.src);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x600?text=No+Cover';
                }}
              />
              <h3 className="text-lg font-semibold">{book.title}</h3>
              <p className="text-gray-600">{book.author}</p>
              <p className="text-sm text-gray-500">{book.genre}</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                {book.description}
              </p>
              <div className="mt-4 space-x-2">
                <button 
                  onClick={() => toggleBookStatus(book.id, 'is_read')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    book.is_read 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                >
                  {book.is_read ? 'Mark Unread' : 'Mark Read'}
                </button>
                
                <button 
                  onClick={() => toggleBookStatus(book.id, 'is_favorite')} 
                  className={`px-3 py-1 rounded-full text-sm ${
                    book.is_favorite
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {book.is_favorite ? '★ Favorited' : '☆ Favorite'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Books</h1>
      
      {books.length === 0 ? (
        <p className="text-gray-500">No books found. Add some books to get started!</p>
      ) : (
        <>
          {readBooks.length > 0 && (
            <BookRow title="Read Books" books={readBooks} />
          )}
          
          {unreadBooks.length > 0 && (
            <BookRow title="Unread Books" books={unreadBooks} />
          )}
        </>
      )}
    </div>
  );
}

export default BookList;