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
    cover_image = serializers.ImageField(required=False, allow_null=True)

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

    def to_representation(self, instance):
        # Get the base representation
        ret = super().to_representation(instance)
        
        # Handle cover_image field (file upload)
        if instance.cover_image and hasattr(instance.cover_image, 'url'):
            ret['cover_image'] = instance.cover_image.url
        else:
            ret['cover_image'] = None
            
        # Handle cover_image_url field (external URL or local path)
        if instance.cover_image_url:
            # If it's already a full URL, keep it as is
            if instance.cover_image_url.startswith('http'):
                ret['cover_image_url'] = instance.cover_image_url
            else:
                # For local paths, make sure they start with /media/
                path = instance.cover_image_url
                if not path.startswith('/media/'):
                    path = f'/media/{path}'
                ret['cover_image_url'] = path
        else:
            ret['cover_image_url'] = None
            
        return ret

    def update(self, instance, validated_data):
        # Handle cover_image and cover_image_url separately
        cover_image = validated_data.pop('cover_image', None)
        cover_image_url = validated_data.pop('cover_image_url', None)
        
        # Update other fields first
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Handle image fields
        if cover_image is not None:
            instance.cover_image = cover_image
            instance.cover_image_url = None
        elif cover_image_url is not None:
            instance.cover_image_url = cover_image_url
            instance.cover_image = None
        
        instance.save()
        return instance

class UserBookSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    date_added = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = UserBook
        fields = ['id', 'book', 'is_read', 'is_reading', 'is_favorite', 'date_added']