import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function BookList() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user || !user.token) return;
      
      try {
        const response = await axios.get('http://localhost:8000/api/users/books/', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        setBooks(response.data);
        setLoading(false);
      } catch (err) {
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

    // Create new value
    const newValue = field === 'is_read' ? !book.is_read : !book.is_favorite;

    // Optimistically update UI
    setBooks(books.map(b => 
      b.id === bookId 
        ? { ...b, [field]: newValue }
        : b
    ));

    try {
      await axios.put(
        `http://localhost:8000/api/users/books/${bookId}/update-status/`,
        { [field]: newValue },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      );
    } catch (err) {
      // Revert on failure
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
      <div className="space-y-4">
        {books.map((book) => (
          <div key={book.id} className="border p-4 rounded shadow">
            <h3 className="text-lg font-semibold">{book.title}</h3>
            <p className="text-gray-600">{book.author}</p>
            <p className="text-sm text-gray-500">{book.genre}</p>
            <div className="mt-2 space-x-2">
              <button 
                onClick={() => toggleBookStatus(book.id, 'is_read')}
                className={`px-2 py-1 rounded text-sm ${
                  book.is_read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {book.is_read ? 'Mark Unread' : 'Mark Read'}
              </button>
              
              <button 
                onClick={() => toggleBookStatus(book.id, 'is_favorite')} 
                className="text-sm text-gray-500"
              >
                {book.is_favorite ? 'Unfavorite' : 'Favorite'}
              </button>
            </div>
          </div>
        ))}
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