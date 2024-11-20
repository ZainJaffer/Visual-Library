import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AddBook() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover_image_url: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create FormData object for file upload
      const form = new FormData();
      form.append('title', formData.title);
      form.append('author', formData.author);
      if (formData.cover_image_url) {
        form.append('cover_image_url', formData.cover_image_url);
      }

      await api.post('/users/books/add/', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/books');
    } catch (err) {
      console.error('Error adding book:', err);
      setError('Failed to add book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        cover_image_url: file
      }));
    }
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
          <label htmlFor="cover" className="block text-gray-700 font-medium mb-2">
            Cover Image (Optional)
          </label>
          <input
            type="file"
            id="cover"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            If no cover is provided, a random cover will be assigned.
          </p>
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