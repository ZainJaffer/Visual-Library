import logging
from django.http import JsonResponse
from .exceptions import BaseAPIException

logger = logging.getLogger(__name__)

class ErrorHandlingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            return self.handle_exception(e)

    def handle_exception(self, exc):
        if isinstance(exc, BaseAPIException):
            return JsonResponse(
                exc.detail,
                status=exc.status_code
            )

        # Log unexpected errors
        logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
        
        return JsonResponse(
            {'error': 'An unexpected error occurred'},
            status=500
        )