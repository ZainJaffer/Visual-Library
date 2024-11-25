from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
import random
import os
from django.conf import settings
from PIL import Image
import io
from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework.exceptions import NotFound, ValidationError, APIException
import requests
from tempfile import NamedTemporaryFile

# Local imports
from .models import CustomUser, UserBook, Book
from .serializers import (
    UserRegistrationSerializer, 
    UserBookSerializer,
    BookSerializer
)
from .permissions import IsBookOwner, IsUserBookOwner
from .utils import cache_book_query

# Add these custom exceptions at the top of the file
class ResourceNotFoundError(NotFound):
    pass

class ServerError(APIException):
    status_code = 500
    default_detail = 'Internal Server Error'

# Protected Route
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_protected_route(request):
    print("\n=== Protected Route Access ===")
    print("Headers:", request.headers)
    print("Auth header:", request.headers.get('Authorization'))
    print("User:", request.user)
    print("Is authenticated:", request.user.is_authenticated)
    print("===========================\n")
    
    return Response({
        "message": "You have accessed a protected route",
        "user": request.user.email if request.user.is_authenticated else None
    })

# JWT Authentication Views
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

# users/views.py
class UserRegistrationView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]  # Allow anyone to register

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "User registered successfully",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "user": {
                    "id": user.id,
                    "email": user.email
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Book Management Views
class AddBookView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookSerializer

    def compress_image(self, image_file):
        try:
            img = Image.open(image_file)
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Calculate dimensions while maintaining aspect ratio
            max_size = (800, 800)
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Prepare the compressed image
            output = io.BytesIO()
            
            # Save with compression
            img.save(output, format='JPEG', quality=85, optimize=True)
            output.seek(0)
            
            return InMemoryUploadedFile(
                output,
                'ImageField',
                f"{image_file.name.split('.')[0]}_compressed.jpg",
                'image/jpeg',
                output.getbuffer().nbytes,
                None
            )
        except Exception as e:
            print(f"Image compression error: {str(e)}")
            return image_file

    def create(self, request, *args, **kwargs):
        try:
            # Get the cover image from the request
            cover_image = request.FILES.get('cover_image')
            
            if cover_image:
                # Check file size (50MB limit)
                if cover_image.size > 50 * 1024 * 1024:
                    return Response({
                        'error': 'File size too large. Maximum size is 50MB.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Check if image needs compression (over 2MB)
                if cover_image.size > 2 * 1024 * 1024:
                    compressed_image = self.compress_image(cover_image)
                    request.FILES['cover_image'] = compressed_image

            # Create the book
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            book = serializer.save()
            
            # Create UserBook entry
            UserBook.objects.create(user=request.user, book=book)
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
                
        except Exception as e:
            print(f"Error in create book: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateBookStatusView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsUserBookOwner]
    serializer_class = UserBookSerializer

    def get_queryset(self):
        return UserBook.objects.filter(user=self.request.user)

class ListUserBooksView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserBookSerializer

    def get_queryset(self):
        status_filter = self.request.query_params.get('status', None)
        queryset = UserBook.objects.filter(user=self.request.user).select_related('book')
        
        if status_filter == 'reading':
            return queryset.filter(is_reading=True).order_by('-created_at')
        elif status_filter == 'recent':
            return queryset.order_by('-created_at')[:5]
        
        return queryset.order_by('-created_at')

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            return Response({
                "message": "Successfully logged out."
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def handle_exception(self, exc):
        if isinstance(exc, PermissionDenied):
            return Response(
                {"error": "You do not have permission to perform this action"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().handle_exception(exc)

class UpdateBookDetailsView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookSerializer
    
    def get_queryset(self):
        return Book.objects.filter(userbook__user=self.request.user)

    def get(self, request, *args, **kwargs):
        # Add GET method to show current data
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        # Enable PATCH for partial updates
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

class DeleteBookView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Book.objects.filter(userbook__user=self.request.user)

    def perform_destroy(self, instance):
        # This will delete both the UserBook and Book entries
        instance.delete()

class DeleteUserBookView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, book_id):
        try:
            # Find the UserBook instance for this user and book
            user_book = UserBook.objects.get(user=request.user, id=book_id)
            
            # Delete the UserBook instance
            user_book.delete()
            
            return Response({
                'status': 'success',
                'message': 'Book removed successfully'
            }, status=status.HTTP_200_OK)
            
        except UserBook.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Book not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Add this new view for random covers
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_random_cover(request):
    """Return a random cover image from the book_covers directory"""
    try:
        covers_dir = os.path.join(settings.MEDIA_ROOT, 'book_covers')
        if os.path.exists(covers_dir):
            available_covers = [
                f for f in os.listdir(covers_dir) 
                if f.lower().endswith(('.jpg', '.jpeg', '.png'))
            ]
            
            if available_covers:
                random_cover = random.choice(available_covers)
                return Response({
                    'status': 'success',
                    'cover_url': f'book_covers/{random_cover}'
                })
            
        return Response({
            'status': 'error',
            'message': 'No cover images available'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Add a test endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_errors(request):
    error_type = request.query_params.get('error', 'none')
    
    if error_type == 'bad_request':
        return Response(
            {"error": "Invalid data provided"},
            status=status.HTTP_400_BAD_REQUEST
        )
    elif error_type == 'not_found':
        raise ResourceNotFoundError('Test resource not found')
    elif error_type == 'server_error':
        raise ServerError('Test server error')
    
    return Response({'message': 'No error'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_book(request):
    try:
        is_manual = not request.data.get('google_books_id')
        
        # For manual uploads
        if is_manual:
            book = Book.objects.create(
                title=request.data.get('title'),
                author=request.data.get('author'),
                genre=request.data.get('genre'),
                description=request.data.get('description'),
                cover_image=request.data.get('cover_image'),
                is_manual=True
            )
        # For Google Books API
        else:
            book, created = Book.objects.get_or_create(
                google_books_id=request.data.get('google_books_id'),
                defaults={
                    'title': request.data.get('title'),
                    'author': request.data.get('author'),
                    'genre': request.data.get('genre'),
                    'description': request.data.get('description'),
                    'cover_image_url': request.data.get('cover_image_url'),
                    'is_manual': False
                }
            )

        # Create the UserBook relationship
        user_book, created = UserBook.objects.get_or_create(
            user=request.user,
            book=book,
            defaults={
                'is_read': False,
                'is_favorite': False
            }
        )

        if not created:
            return Response(
                {'error': 'Book already in your library'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({'message': 'Book added successfully'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class UnifiedAddBookView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookSerializer

    def compress_image(self, image_file):
        try:
            img = Image.open(image_file)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            max_size = (800, 800)
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=85, optimize=True)
            output.seek(0)
            return InMemoryUploadedFile(
                output, 'ImageField',
                f"{image_file.name.split('.')[0]}_compressed.jpg",
                'image/jpeg', output.getbuffer().nbytes, None
            )
        except Exception as e:
            print(f"Image compression error: {str(e)}")
            return image_file

    def create(self, request, *args, **kwargs):
        try:
            print("Adding book for user:", request.user.email)
            is_google_books = bool(request.data.get('google_books_id'))
            
            if is_google_books:
                book_data = request.data
                print("Google Books data:", book_data)

                # Download and save cover image if it exists
                cover_image_url = book_data.get('cover_image_url')
                local_cover_path = None
                if cover_image_url:
                    try:
                        # Download image from Google Books
                        response = requests.get(cover_image_url)
                        if response.status_code == 200:
                            # Create a temporary file
                            img_temp = NamedTemporaryFile(delete=True)
                            img_temp.write(response.content)
                            img_temp.flush()

                            # Create a proper file name
                            file_name = f"google_book_{book_data['google_books_id']}.jpg"
                            
                            # Save to media/book_covers
                            save_path = os.path.join('book_covers', file_name)
                            full_path = os.path.join(settings.MEDIA_ROOT, save_path)
                            os.makedirs(os.path.dirname(full_path), exist_ok=True)
                            
                            # Compress and save the image
                            img = Image.open(img_temp)
                            if img.mode != 'RGB':
                                img = img.convert('RGB')
                            img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                            img.save(full_path, 'JPEG', quality=85, optimize=True)
                            
                            local_cover_path = save_path
                    except Exception as e:
                        print(f"Error downloading cover image: {str(e)}")

                book, created = Book.objects.get_or_create(
                    google_books_id=book_data['google_books_id'],
                    defaults={
                        'title': book_data['title'],
                        'author': book_data['author'],
                        'genre': book_data.get('genre', 'Uncategorized'),
                        'description': book_data.get('description', ''),
                        'cover_image_url': local_cover_path,  # Use the local path
                        'source': 'google'
                    }
                )

                if not created and local_cover_path:
                    # Update cover image for existing book if we got a new one
                    book.cover_image_url = local_cover_path
                    book.save()

                print("Book created:", created, "Book ID:", book.id)
            else:
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                cover_image = request.FILES.get('cover_image')
                if cover_image:
                    if cover_image.size > 50 * 1024 * 1024:
                        raise ValidationError('File size too large. Maximum size is 50MB.')
                    if cover_image.size > 2 * 1024 * 1024:
                        cover_image = self.compress_image(cover_image)
                book = serializer.save(cover_image=cover_image, source='manual')

            # Check if user already has this book
            existing_user_book = UserBook.objects.filter(user=request.user, book=book).first()
            if existing_user_book:
                return Response({
                    'status': 'error',
                    'message': 'Book already exists in your library',
                    'book_id': book.id
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create new UserBook with proper read status
            user_book = UserBook.objects.create(
                user=request.user,
                book=book,
                is_read=request.data.get('is_read', False),
                is_favorite=False
            )
            print("UserBook created with ID:", user_book.id)

            # Serialize the user_book for response
            serializer = UserBookSerializer(user_book)
            print("Serialized response:", serializer.data)
            
            return Response({
                'status': 'success',
                'message': 'Book added successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({
                'status': 'error',
                'message': str(e),
                'errors': e.detail if hasattr(e, 'detail') else None
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Error adding book:", str(e))
            return Response({
                'status': 'error',
                'message': 'An unexpected error occurred',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)