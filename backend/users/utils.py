from django.core.cache import cache
from django.conf import settings
from functools import wraps
import logging
import time

logger = logging.getLogger(__name__)

def cache_book_query(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        user_id = self.request.user.id
        params = self.request.query_params.urlencode()
        cache_key = f'user_books_{user_id}_{params}'
        
        # Try to get from cache
        start_time = time.time()
        result = cache.get(cache_key)
        
        if result is not None:
            query_time = time.time() - start_time
            logger.info(f"Cache HIT for key: {cache_key}")
            logger.info(f"Query time (cached): {query_time:.4f} seconds")
            return result

        # If not in cache, execute query
        logger.info(f"Cache MISS for key: {cache_key}")
        start_time = time.time()
        result = func(self, *args, **kwargs)
        query_time = time.time() - start_time
        logger.info(f"Query time (database): {query_time:.4f} seconds")
        
        # Cache the result
        cache.set(cache_key, result, settings.BOOK_CACHE_TTL)
        return result
    return wrapper