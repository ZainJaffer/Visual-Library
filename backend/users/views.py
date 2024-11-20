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

# Local imports
from .models import CustomUser, UserBook, Book
from .serializers import (
    UserRegistrationSerializer, 
    UserBookSerializer,
    BookSerializer
)
from .permissions import IsBookOwner, IsUserBookOwner


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

    def perform_create(self, serializer):
        book = serializer.save()
        UserBook.objects.create(user=self.request.user, book=book)

class UpdateBookStatusView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsUserBookOwner]
    serializer_class = UserBookSerializer

    def get_queryset(self):
        return UserBook.objects.filter(user=self.request.user)

class ListUserBooksView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserBookSerializer

    def get_queryset(self):
        queryset = UserBook.objects.filter(user=self.request.user)
        
        # Add filtering by read status
        status_param = self.request.query_params.get('status', None)
        if status_param == 'read':
            queryset = queryset.filter(is_read=True)
        elif status_param == 'unread':
            queryset = queryset.filter(is_read=False)

        # For books without covers, assign random covers
        covers_dir = os.path.join(settings.MEDIA_ROOT, 'book_covers')
        if os.path.exists(covers_dir):
            available_covers = [
                f for f in os.listdir(covers_dir) 
                if f.lower().endswith(('.jpg', '.jpeg', '.png'))
            ]
            
            for userbook in queryset:
                if not userbook.book.cover_image_url and available_covers:
                    random_cover = random.choice(available_covers)
                    userbook.book.temp_cover = f'book_covers/{random_cover}'
            
        return queryset

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