import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const EditBookDetails = ({ book, onClose, onUpdate }) => {
  console.log('Initial book data:', book); // Debug log

  const [formState, setFormState] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    cover_image_url: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    // Initialize form state from book data
    setFormState({
      title: book.book.title || '',
      author: book.book.author || '',
      genre: book.book.genre || '',
      description: book.book.description || '',
      cover_image_url: book.book.cover_image_url || ''
    });
    
    // Set initial preview URL
    setPreviewUrl(getImageUrl(book));
  }, [book]);

  const getImageUrl = (book) => {
    if (!book?.book?.cover_image_url && !book?.book?.cover_image) return '/placeholder-cover.svg';
    
    // Case 1: Full URL (e.g., from Google Books or Django media)
    if (book.book.cover_image_url?.startsWith('http')) {
      return book.book.cover_image_url;
    }

    // Case 2: Cover image from file upload
    if (book.book.cover_image?.startsWith('http')) {
      return book.book.cover_image;
    }
    
    // Case 3: Local path (either cover_image or cover_image_url)
    const imagePath = book.book.cover_image || book.book.cover_image_url;
    if (imagePath) {
      return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    }
    
    return '/placeholder-cover.svg';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      // Clear the cover_image_url in the form state
      setFormState(prev => ({
        ...prev,
        cover_image_url: null
      }));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    // Clear the file selection when entering a URL
    setSelectedFile(null);
    setFormState(prev => ({
      ...prev,
      cover_image_url: url
    }));
    // Update preview with the new URL
    setPreviewUrl(url || '/placeholder-cover.svg');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', formState.title.trim());
      formData.append('author', formState.author.trim());
      formData.append('genre', formState.genre.trim());
      formData.append('description', formState.description.trim());
      
      // Only append one of either file or URL, not both
      if (selectedFile) {
        formData.append('cover_image', selectedFile);
        formData.append('cover_image_url', ''); // Clear URL when uploading file
      } else if (formState.cover_image_url) {
        formData.append('cover_image_url', formState.cover_image_url);
        // No need to explicitly clear cover_image as it's handled by the backend
      }

      console.log('Submitting form data:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.patch(
        `${API_BASE_URL}/api/users/books/${book.book.id}/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      console.log('Server response:', response.data);

      // Update the book data with the response
      const updatedBook = {
        ...book,
        book: response.data
      };

      onUpdate(updatedBook);
      onClose();
    } catch (error) {
      console.error('Error updating book:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to update book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Book Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-6">
              <div className="w-1/3 space-y-4">
                <div className="aspect-[2/3] rounded-lg shadow-md overflow-hidden bg-gray-100">
                  <img
                    src={previewUrl}
                    alt={formState.title || 'Book cover'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', e.target.src);
                      setPreviewUrl('/placeholder-cover.svg');
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Or use Image URL
                    </label>
                    <input
                      type="text"
                      name="cover_image_url"
                      value={formState.cover_image_url || ''}
                      onChange={handleImageUrlChange}
                      placeholder="Enter image URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="w-2/3 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formState.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={formState.author}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={formState.genre}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formState.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
