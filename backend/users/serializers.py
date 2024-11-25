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
    cover_image_url = serializers.URLField(required=False, allow_null=True)
    cover_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'genre', 'description', 'cover_image', 'cover_image_url', 'source']
        extra_kwargs = {
            'title': {'required': True},
            'author': {'required': True},
            'genre': {'required': True},
            'description': {'required': False},
            'source': {'required': False, 'default': 'manual'},
        }

class UserBookSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    date_added = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = UserBook
        fields = ['id', 'book', 'is_read', 'is_reading', 'is_favorite', 'date_added']