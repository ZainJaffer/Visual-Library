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

# Local imports
from .models import CustomUser, UserBook, Book
from .serializers import (
    UserRegistrationSerializer, 
    UserBookSerializer,
    BookSerializer
)


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
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def perform_create(self, serializer):
        book = serializer.save()
        UserBook.objects.create(user=self.request.user, book=book)

class UpdateBookStatusView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = UserBook.objects.all()
    serializer_class = UserBookSerializer

    def get_queryset(self):
        return UserBook.objects.filter(user=self.request.user)

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