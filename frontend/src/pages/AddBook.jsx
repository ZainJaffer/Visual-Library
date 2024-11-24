import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-hot-toast';

// Constants for file validation
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

function AddBook() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    cover_image_url: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.author.trim() || !formData.genre.trim()) {
      setError('Title, Author, and Genre are required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('author', formData.author.trim());
      form.append('genre', formData.genre.trim());
      form.append('description', formData.description.trim());
      
      if (formData.cover_image_url) {
        const compressedImage = await compressImage(formData.cover_image_url);
        const extension = compressedImage.type.split('/')[1];
        const finalImage = new File(
          [compressedImage], 
          `book_cover.${extension}`,
          { type: compressedImage.type }
        );
        form.append('cover_image_url', finalImage);
      }

      // Log form data for debugging
      for (let pair of form.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await api.post('/users/books/add/', form, {  // Updated endpoint path to match backend
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Success response:', response.data);
      
      if (response.data.status === 'success') {  // Handle standardized response format
        toast.success(response.data.message);
        navigate('/my-books');  // Updated to navigate to my-books instead of home
      } else {
        throw new Error(response.data.message || 'Failed to add book');
      }
    } catch (err) {
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error details:', err);
      
      const errorMessage = err.response?.data?.error || 'Failed to add book. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setError('');
      setFormData(prev => ({ ...prev, cover_image_url: null }));
      setImagePreview(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size should not exceed 50MB');
      return;
    }

    setError('');
    setFormData(prev => ({ ...prev, cover_image_url: file }));

    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold mb-6">Add New Book</h1>
          
          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre *
              </label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/my-books')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-white bg-black rounded-lg ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                }`}
              >
                {loading ? 'Adding...' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddBook;