import React, { useState, useEffect, useRef } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import api from '../../services/api';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { EditBookDetails } from './EditBookDetails';

// Helper functions for text formatting
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

const formatTitle = (title) => {
  if (!title) return '';
  const MAX_LENGTH = 50;
  return title.length > MAX_LENGTH ? title.substring(0, MAX_LENGTH) + '...' : title;
};

const API_BASE_URL = 'http://localhost:8000';

const getImageUrl = (book) => {
  if (!book?.cover_image_url) return '/placeholder-cover.svg';
  
  // Case 1: Full URL (e.g., from Google Books)
  if (book.cover_image_url.startsWith('http')) {
    return book.cover_image_url;
  }
  
  // Case 2: Local path
  return `${API_BASE_URL}/media/${book.cover_image_url}`;
};

export const BookRow = React.memo(({ title, books, onToggleStatus, onDeleteBook, onUpdateBook }) => {
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [scrollInterval, setScrollInterval] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const scrollContainerRef = useRef(null);

  // Get section description
  const getSectionDescription = (title) => {
    switch (title) {
      case 'Currently Reading':
        return 'Books you are actively reading';
      case 'Recently Added':
        return 'Latest additions to your library';
      case 'Favorites':
        return 'Your favorite books';
      default:
        return '';
    }
  };

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

  const handleDelete = async (bookId) => {
    try {
      setIsDeleting(true);
      const bookElement = document.getElementById(`book-${bookId}`);
      if (bookElement) {
        bookElement.style.transition = 'all 0.3s ease-out';
        bookElement.style.opacity = '0';
        bookElement.style.transform = 'scale(0.95)';
      }

      await api.deleteBook(bookId);
      
      // Call onDeleteBook immediately but keep the animation
      onDeleteBook(bookId);
      
      // Remove the element after animation
      setTimeout(() => {
        if (bookElement) {
          bookElement.remove();
        }
      }, 300);
    } catch (error) {
      console.error('Error deleting book:', error);
      // Reset the animation if deletion fails
      const bookElement = document.getElementById(`book-${bookId}`);
      if (bookElement) {
        bookElement.style.opacity = '1';
        bookElement.style.transform = 'scale(1)';
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBookUpdate = (updatedBook) => {
    onUpdateBook(updatedBook);
  };

  return (
    <div className={`mb-8 px-4 ${title === 'Currently Reading' ? 'bg-blue-50 rounded-xl' : ''}`}>
      <div className={`${title === 'Currently Reading' ? 'pt-6' : ''} mb-6`}>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-600 text-sm mt-1">{getSectionDescription(title)}</p>
      </div>
      <div className={`relative min-w-0 group ${title === 'Currently Reading' ? 'pb-6' : ''}`}>
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
                  className="flex-none w-[250px] group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-[2/3] overflow-hidden border border-gray-100">
                    <LazyLoadImage 
                      src={getImageUrl(book.book)}
                      alt={book.book.title}
                      effect="blur"
                      className="w-full h-full object-cover"
                      wrapperClassName="w-full h-full"
                      onError={(e) => {
                        console.error('Image load error:', e.target.src);
                        e.target.src = '/placeholder-cover.svg';
                      }}
                    />
                    
                    {/* Three Dot Menu */}
                    <div className="absolute top-2 right-2">
                      <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-600">
                          <EllipsisHorizontalIcon className="w-5 h-5" />
                        </Menu.Button>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="px-1 py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => onToggleStatus(book.id, 'is_reading')}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                                  >
                                    {!book.is_reading ? 'Start Reading' : 'Mark as Unread'}
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => onToggleStatus(book.id, 'is_read')}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                                  >
                                    {book.is_read ? 'Mark as Unread' : 'Mark as Read'}
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => onToggleStatus(book.id, 'is_favorite')}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                                  >
                                    {book.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                            <div className="px-1 py-1 border-t border-gray-200">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => setEditingBook(book)}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                                  >
                                    Edit Details
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleDelete(book.id)}
                                    disabled={isDeleting}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 text-red-600`}
                                  >
                                    Delete
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => onToggleStatus(book.id, 'is_favorite')}
                      className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        book.is_favorite
                          ? book.is_read 
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500 text-white'
                          : 'bg-white/80 hover:bg-white text-gray-600'
                      }`}
                    >
                      <span className="text-lg">{book.is_favorite ? '★' : '☆'}</span>
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <span className={`${
                        book.is_reading 
                          ? 'bg-blue-600 text-white'
                          : book.is_read 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        } px-2 py-1 rounded-md text-xs font-medium`}
                      >
                        {book.is_reading 
                          ? 'Reading'
                          : book.is_read 
                            ? 'Read' 
                            : 'Unread'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 whitespace-normal break-words line-clamp-2">
                      {formatTitle(book.book.title)}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {formatAuthors(book.book.author)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {editingBook && (
        <EditBookDetails
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onUpdate={(updatedBook) => {
            handleBookUpdate(updatedBook);
            setEditingBook(null);
          }}
        />
      )}
    </div>
  );
});
