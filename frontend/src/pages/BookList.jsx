import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function BookList() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user || !user.token) return;
      
      try {
        const url = filter === 'all' 
          ? 'http://localhost:8000/api/users/books/'
          : `http://localhost:8000/api/users/books/?status=${filter}`;
        
        const response = await axios.get(url, {
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
  }, [filter, user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Books</h1>
      
      <div className="mb-4">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Books</option>
          <option value="read">Read Books</option>
          <option value="unread">Unread Books</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <div key={book.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{book.title}</h2>
            <p className="text-gray-600">{book.author}</p>
            <p className="text-sm text-gray-500">{book.genre}</p>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-sm ${book.is_read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {book.is_read ? 'Read' : 'Unread'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookList;