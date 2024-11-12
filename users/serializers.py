# users/serializers.py
from rest_framework import serializers
from .models import CustomUser, Book, UserBook

# users/serializers.py
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['title', 'author', 'genre', 'description', 'cover_image_url']

class UserBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBook
        fields = ['is_read', 'is_favorite']