import axios from 'axios';

const GOOGLE_BOOKS_API_KEY = 'AIzaSyBJNZn4cp5wJEuqIgFuqWw8Gr3E7Uj3xgQ';
const BASE_URL = 'https://www.googleapis.com/books/v1';

// Create a separate axios instance for Google Books API
const googleBooksApi = axios.create({
    baseURL: BASE_URL
});

// Add response caching
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const searchBooks = async (query, maxResults = 10) => {
    const cacheKey = `search:${query}:${maxResults}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
        const { data, timestamp } = cache.get(cacheKey);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
        cache.delete(cacheKey);
    }

    try {
        const response = await googleBooksApi.get('/volumes', {
            params: {
                q: query,
                maxResults,
                key: GOOGLE_BOOKS_API_KEY
            }
        });

        // Normalize the data to match our Book model
        const normalizedBooks = response.data.items.map(item => ({
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
            genre: item.volumeInfo.categories ? item.volumeInfo.categories.join(', ') : 'Uncategorized',
            description: item.volumeInfo.description || '',
            cover_image_url: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
            google_books_id: item.id,
            published_date: item.volumeInfo.publishedDate,
            page_count: item.volumeInfo.pageCount,
            preview_link: item.volumeInfo.previewLink,
            source: 'google'
        }));

        // Cache the normalized results
        cache.set(cacheKey, {
            data: normalizedBooks,
            timestamp: Date.now()
        });

        return normalizedBooks;
    } catch (error) {
        console.error('Google Books API Error:', error);
        throw new Error('Failed to fetch books from Google Books API');
    }
};