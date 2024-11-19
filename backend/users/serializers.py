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
        fields = ['id', 'title', 'author', 'genre', 'description', 'cover_image_url']
        extra_kwargs = {
            'title': {'required': False},
            'author': {'required': False},
            'genre': {'required': False},
            'description': {'required': False},
            'cover_image_url': {'required': False},
        }

class UserBookSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='book.title', read_only=True)
    author = serializers.CharField(source='book.author', read_only=True)
    genre = serializers.CharField(source='book.genre', read_only=True)
    description = serializers.CharField(source='book.description', read_only=True)
    cover_image_url = serializers.CharField(source='book.cover_image_url', read_only=True)

    class Meta:
        model = UserBook
        fields = [
            'id',
            'title',
            'author',
            'genre',
            'description',
            'cover_image_url',
            'is_read',
            'is_favorite'
        ]