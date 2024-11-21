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

      const response = await api.post('/books/add/', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Success response:', response.data);
      toast.success('Book added successfully!');
      navigate('/');
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
    if (!file) return;

    // Log the original file details
    console.log('Original file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      e.target.value = '';
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('File must be a JPEG, PNG, or WebP image');
      e.target.value = '';
      return;
    }

    // Use the original filename or generate one with proper extension
    const filename = file.name || `book_cover_${Date.now()}.${file.type.split('/')[1]}`;

    // Create a new file with the proper filename
    const newFile = new File([file], filename, {
      type: file.type
    });

    // Log the new file details
    console.log('New file:', {
      name: newFile.name,
      type: newFile.type,
      size: newFile.size
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setFormData(prev => ({
      ...prev,
      cover_image_url: newFile
    }));
    setError('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add New Book</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="author" className="block text-gray-700 font-medium mb-2">
            Author
          </label>
          <input
            type="text"
            id="author"
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="genre" className="block text-gray-700 font-medium mb-2">
            Genre
          </label>
          <input
            type="text"
            id="genre"
            value={formData.genre}
            onChange={(e) => setFormData({...formData, genre: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="cover" className="block text-gray-700 font-medium mb-2">
            Cover Image (Optional)
          </label>
          <input
            type="file"
            id="cover"
            accept={ALLOWED_FILE_TYPES.join(',')}
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-32 h-48 object-cover rounded"
              />
            </div>
          )}
          <div className="mt-1 text-sm text-gray-500">
            <p>If no cover is provided, a random cover will be assigned.</p>
            <p>Maximum file size: 50MB</p>
            <p>Allowed formats: JPEG, PNG, WebP</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded font-medium text-white 
            ${loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors duration-200`}
        >
          {loading ? 'Adding Book...' : 'Add Book'}
        </button>
      </form>
    </div>
  );
}

export default AddBook;