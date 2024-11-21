import React, { useState, useEffect, useMemo } from 'react';
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

// Move BookRow component outside BookList
const BookRow = React.memo(({ title, subtitle, books, onToggleStatus }) => {
  const [coverUrls, setCoverUrls] = useState({});
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [scrollInterval, setScrollInterval] = useState(null);

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

  // Scroll handler to check scroll position
  const handleScroll = (e) => {
    const container = e.target;
    setShowLeftScroll(container.scrollLeft > 0);
    setShowRightScroll(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  // Modified scroll function
  const startScroll = (direction) => {
    const container = document.getElementById(`scroll-${title}`);
    const isLeft = direction === 'left';
    
    // Single click scroll
    container.scrollBy({
      left: isLeft ? -700 : 700,
      behavior: 'smooth'
    });

    // Clear any existing interval
    if (scrollInterval) clearInterval(scrollInterval);

    // Set up continuous scrolling for hold
    const interval = setInterval(() => {
      container.scrollBy({
        left: isLeft ? -700 : 700,
        behavior: 'auto'
      });
      
      // Check if we've reached the end
      const atStart = container.scrollLeft === 0;
      const atEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth;
      
      if ((isLeft && atStart) || (!isLeft && atEnd)) {
        clearInterval(interval);
        setScrollInterval(null);
      }
    }, 150);  // Kept at 200 for fast scrolling

    setScrollInterval(interval);
  };

  const stopScroll = () => {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      setScrollInterval(null);
    }
  };

  // Check for scrollable content on mount and resize
  useEffect(() => {
    const container = document.getElementById(`scroll-${title}`);
    if (container) {
      setShowRightScroll(
        container.scrollWidth > container.clientWidth
      );
      
      // Add resize observer
      const observer = new ResizeObserver(() => {
        setShowRightScroll(
          container.scrollWidth > container.clientWidth
        );
      });
      
      observer.observe(container);
      return () => observer.disconnect();
    }
  }, [title, books]);

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="relative min-w-0 group">
        {/* Left scroll button */}
        {showLeftScroll && (
          <button
            onMouseDown={() => startScroll('left')}
            onMouseUp={stopScroll}
            onMouseLeave={stopScroll}
            onTouchStart={() => startScroll('left')}
            onTouchEnd={stopScroll}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right scroll button */}
        {showRightScroll && (
          <button
            onMouseDown={() => startScroll('right')}
            onMouseUp={stopScroll}
            onMouseLeave={stopScroll}
            onTouchStart={() => startScroll('right')}
            onTouchEnd={stopScroll}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Scroll container */}
        <div 
          id={`scroll-${title}`}
          className="overflow-x-auto scrollbar-hide smooth-scroll -mx-4"
          onScroll={handleScroll}
        >
          <div className="flex gap-6 pb-4 px-4 whitespace-nowrap">
            {books.map((book) => {
              if (!book) return null;

              return (
                <div 
                  key={book.id}
                  id={`book-${book.id}`}
                  className="flex-none w-[220px] group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Image section - removed opacity changes */}
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
                      <div className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-base">★</span>
                      </div>
                    )}

                    {/* Read status badge */}
                    <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                      book.is_read 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-400 text-gray-800'
                    }`}>
                      {book.is_read ? 'Read' : 'Unread'}
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="p-3">
                    <h3 className="text-base font-semibold mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3" title={book.author}>
                      {formatAuthors(book.author)}
                    </p>

                    {/* Action buttons with loading states */}
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => onToggleStatus(book.id, 'is_read')}
                        className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg border hover:bg-gray-50"
                      >
                        {book.is_read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      
                      <button 
                        onClick={() => onToggleStatus(book.id, 'is_favorite')}
                        className={`w-9 flex items-center justify-center rounded-lg border ${
                          book.is_favorite
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{book.is_favorite ? '★' : '☆'}</span>
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
});

function BookList() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});

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
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const newValue = field === 'is_read' ? !book.is_read : !book.is_favorite;

    try {
      // Make API call first
      await api.put(`/users/books/${bookId}/update-status/`, { [field]: newValue });
      
      // Then update state
      if (field === 'is_favorite') {
        setBooks(prevBooks => 
          prevBooks.map(b => 
            b.id === bookId ? { ...b, is_favorite: newValue } : b
          )
        );
      } else {
        // For read status changes
        const bookElement = document.getElementById(`book-${bookId}`);
        if (bookElement) {
          bookElement.style.transition = 'all 0.3s ease-out';
          bookElement.style.opacity = '0';
          bookElement.style.transform = 'scale(0.95)';
        }
        
        // Update the state after the fade-out animation
        setTimeout(() => {
          setBooks(prevBooks => 
            prevBooks.map(b => 
              b.id === bookId ? { ...b, is_read: newValue } : b
            )
          );

          // Reset the book element style if it's in multiple sections
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

  // Group books into different categories
  const bookCategories = useMemo(() => {
    // Get unique genres from all books
    const genres = [...new Set(books.flatMap(book => 
      book.genre ? book.genre.split(',').map(g => g.trim()) : []
    ))];

    // Create genre categories for read and unread books
    const readGenres = {};
    const unreadGenres = {};
    genres.forEach(genre => {
      readGenres[genre] = books.filter(book => 
        book.genre?.includes(genre) && book.is_read
      );
      unreadGenres[genre] = books.filter(book => 
        book.genre?.includes(genre) && !book.is_read
      );
    });

    return {
      'Recently Added': books.slice(0, 10),
      'Favorites': books.filter(book => book.is_favorite),
      readGenres,
      unreadGenres
    };
  }, [books]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto">
      {books.length === 0 ? (
        <p className="text-gray-500">No books found. Add some books to get started!</p>
      ) : (
        <div>
          {/* First section: Cool gray background */}
          <div className="bg-slate-100 px-4 py-16">
            <div className="max-w-[1320px] mx-auto space-y-12">
              {/* Recently Added - Mixed */}
              {bookCategories['Recently Added'].length > 0 && (
                <BookRow 
                  title="Recently Added" 
                  books={bookCategories['Recently Added']}
                  onToggleStatus={toggleBookStatus}
                />
              )}
              
              {/* Favorites - Mixed */}
              {bookCategories['Favorites'].length > 0 && (
                <BookRow 
                  title="Favorites" 
                  books={bookCategories['Favorites']}
                  onToggleStatus={toggleBookStatus}
                />
              )}
              
              {/* Read Books by Genre */}
              {Object.entries(bookCategories.readGenres)
                .filter(([_, books]) => books.length > 0)
                .map(([genre, books]) => (
                  <BookRow 
                    key={genre}
                    title={`${genre} • Read`}
                    books={books}
                    onToggleStatus={toggleBookStatus}
                  />
                ))}
            </div>
          </div>

          {/* Recommendations: White background */}
          <div className="bg-white px-4 py-16">
            <div className="max-w-[1320px] mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-12">Recommendations</h2>
              <div className="space-y-12">
                {Object.entries(bookCategories.unreadGenres)
                  .filter(([_, books]) => books.length > 0)
                  .map(([genre, books]) => (
                    <BookRow 
                      key={genre}
                      title={`${genre} • Unread`}
                      books={books}
                      onToggleStatus={toggleBookStatus}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookList;