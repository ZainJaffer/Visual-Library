from rest_framework.exceptions import APIException
from rest_framework import status

class BaseAPIException(APIException):
    def __init__(self, detail=None, code=None):
        super().__init__(detail, code)
        self.detail = {'error': str(detail)} if detail else {'error': self.default_detail}

class ExternalAPIError(BaseAPIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'External API service is currently unavailable'

class InvalidDataError(BaseAPIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid data provided'

class ResourceNotFoundError(BaseAPIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Requested resource not found'