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
    cover_image_url = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    cover_image = serializers.ImageField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'genre', 'description', 'cover_image', 'cover_image_url', 'source']
        extra_kwargs = {
            'title': {'required': True},
            'author': {'required': True},
            'genre': {'required': True},
            'description': {'required': False, 'allow_blank': True},
            'source': {'required': False, 'default': 'manual'},
        }

    def update(self, instance, validated_data):
        # Handle cover_image separately
        cover_image = validated_data.pop('cover_image', None)
        
        # Update other fields first
        for attr, value in validated_data.items():
            if value is not None:  # Only update if value is provided
                setattr(instance, attr, value)
        
        # Handle image update if provided
        if cover_image:
            # Save the new image
            instance.cover_image = cover_image
            instance.save()
            
            # Update cover_image_url to the new image's URL
            instance.cover_image_url = instance.cover_image.name  # Use name instead of url
            instance.save()
        
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # For uploaded images, return the relative path
        if instance.cover_image and instance.cover_image.name:
            data['cover_image_url'] = instance.cover_image.name
        # For external URLs (like Google Books), return the full URL
        elif instance.cover_image_url and instance.cover_image_url.startswith('http'):
            data['cover_image_url'] = instance.cover_image_url
            
        return data

class UserBookSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    date_added = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = UserBook
        fields = ['id', 'book', 'is_read', 'is_reading', 'is_favorite', 'date_added']