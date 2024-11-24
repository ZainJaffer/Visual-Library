import React, { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import api from '../../services/api';

// Helper function for formatting authors
const formatAuthors = (authorString) => {
  if (!authorString) return '';
  
  const MAX_LENGTH = 30;
  const authors = authorString.split(',').map(author => author.trim());
  
  if (authors.length === 1) {
    return authors[0].length > MAX_LENGTH 
      ? authors[0].substring(0, MAX_LENGTH) + '...'
      : authors[0];
  }
  
  return authors[0].length > MAX_LENGTH
    ? authors[0].substring(0, MAX_LENGTH) + '...'
    : `${authors[0]} et al.`;
};

export const BookRow = React.memo(({ title, books, onToggleStatus }) => {
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

  const handleScroll = (e) => {
    const container = e.target;
    setShowLeftScroll(container.scrollLeft > 0);
    setShowRightScroll(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const startScroll = (direction) => {
    const container = document.getElementById(`scroll-${title}`);
    const isLeft = direction === 'left';
    
    container.scrollBy({
      left: isLeft ? -700 : 700,
      behavior: 'smooth'
    });

    if (scrollInterval) clearInterval(scrollInterval);

    const interval = setInterval(() => {
      container.scrollBy({
        left: isLeft ? -700 : 700,
        behavior: 'auto'
      });
      
      const atStart = container.scrollLeft === 0;
      const atEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth;
      
      if ((isLeft && atStart) || (!isLeft && atEnd)) {
        clearInterval(interval);
        setScrollInterval(null);
      }
    }, 150);

    setScrollInterval(interval);
  };

  const stopScroll = () => {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      setScrollInterval(null);
    }
  };

  useEffect(() => {
    const container = document.getElementById(`scroll-${title}`);
    if (container) {
      setShowRightScroll(
        container.scrollWidth > container.clientWidth
      );
      
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
      </div>
      <div className="relative min-w-0 group">
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
                  <div className="relative aspect-[2/3] overflow-hidden border border-gray-100">
                    <LazyLoadImage 
                      src={book.cover_image_url 
                        ? `http://localhost:8000/media/${book.cover_image_url}`
                        : `http://localhost:8000/media/${coverUrls[book.id] || ''}`
                      }
                      alt={book.title}
                      effect="blur"
                      className="w-full h-full object-cover"
                      wrapperClassName="w-full h-full"
                      onError={async (e) => {
                        e.target.onerror = null;
                        const randomCover = await getRandomCover();
                        if (randomCover) {
                          e.target.src = `http://localhost:8000/media/${randomCover}`;
                        }
                      }}
                    />
                    
                    {book.is_favorite && (
                      <div className={`absolute top-2 right-2 ${
                        book.is_read 
                          ? 'bg-red-500'  // Keep red for read favorites
                          : 'bg-blue-500' // New blue for wishlist items
                        } text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg`}>
                        <span className="text-base">★</span>
                      </div>
                    )}

                    <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                      book.is_read 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-400 text-gray-800'
                    }`}>
                      {book.is_read ? 'Read' : 'Unread'}
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-base font-semibold mb-1.5 line-clamp-1 group-hover:text-gray-900 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3" title={book.author}>
                      {formatAuthors(book.author)}
                    </p>

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
                            ? book.is_read 
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'  // Read + Favorite
                              : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'  // Unread + Favorite (Wishlist)
                            : 'border-gray-200 hover:bg-gray-50'  // Not favorited
                        }`}
                        title={book.is_read ? 'Add to Favorites' : 'Add to Wishlist'}
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
