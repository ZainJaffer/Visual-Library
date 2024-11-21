import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const formatAuthors = (authorString) => {
  if (!authorString) return '';
  
  const MAX_LENGTH = 30; // Maximum characters before truncating
  const authors = authorString.split(',').map(author => author.trim());
  
  if (authors.length === 1) {
    // Single author - truncate if too long
    return authors[0].length > MAX_LENGTH 
      ? authors[0].substring(0, MAX_LENGTH) + '...'
      : authors[0];
  }
  
  // Multiple authors - show first author + et al.
  return authors[0].length > MAX_LENGTH
    ? authors[0].substring(0, MAX_LENGTH) + '...'
    : `${authors[0]} et al.`;
};

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

  const BookRow = ({ title, books }) => {
    const [coverUrls, setCoverUrls] = useState({});

    const getRandomCover = async () => {
      try {
        const response = await api.get('/users/random-cover/');
        return response.data.cover_url;
      } catch (error) {
        console.error('Failed to get random cover:', error);
        return null;
      }
    };

    useEffect(() => {
      const fetchCovers = async () => {
        const newCoverUrls = {};
        for (const book of books) {
          if (!book.cover_image_url) {
            newCoverUrls[book.id] = await getRandomCover();
          }
        }
        setCoverUrls(newCoverUrls);
      };
      
      fetchCovers();
    }, [books]);

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="relative min-w-0">
          <div className="overflow-x-auto scrollbar-hide smooth-scroll -mx-4">
            <div className="flex gap-6 pb-4 px-4 whitespace-nowrap">
              {books.map((book) => {
                if (!book) return null;

                return (
                  <div key={book.id} 
                       className="flex-none w-[280px] group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Image with overlay on hover */}
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <LazyLoadImage 
                        src={book.cover_image_url 
                          ? `http://localhost:8000/media/${book.cover_image_url}`
                          : `http://localhost:8000/media/${coverUrls[book.id] || ''}`
                        }
                        alt={book.title}
                        effect="blur"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        wrapperClassName="w-full h-full"
                        onError={async (e) => {
                          e.target.onerror = null;
                          const randomCover = await getRandomCover();
                          if (randomCover) {
                            e.target.src = `http://localhost:8000/media/${randomCover}`;
                          }
                        }}
                      />
                      
                      {/* Favorite badge */}
                      {book.is_favorite && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-lg">★</span>
                        </div>
                      )}

                      {/* Read status badge */}
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
                        book.is_read 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-400 text-gray-800'
                      }`}>
                        {book.is_read ? 'Read' : 'Unread'}
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4" title={book.author}>
                        {formatAuthors(book.author)}
                      </p>

                      {/* Action buttons with hover effects */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleBookStatus(book.id, 'is_read')}
                          className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 
                                   hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {book.is_read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        
                        <button 
                          onClick={() => toggleBookStatus(book.id, 'is_favorite')}
                          className={`w-12 flex items-center justify-center rounded-lg border 
                                    transition-all duration-200 focus:outline-none focus:ring-2 
                                    focus:ring-offset-2 ${
                            book.is_favorite
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 focus:ring-red-500'
                              : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-blue-500'
                          }`}
                        >
                          <span className="text-xl">{book.is_favorite ? '★' : '☆'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-8">My Books</h1>
      
      {books.length === 0 ? (
        <p className="text-gray-500">No books found. Add some books to get started!</p>
      ) : (
        <div className="space-y-12">
          {readBooks.length > 0 && (
            <BookRow title="Read Books" books={readBooks} />
          )}
          
          {unreadBooks.length > 0 && (
            <BookRow title="Unread Books" books={unreadBooks} />
          )}
        </div>
      )}
    </div>
  );
}

export default BookList;