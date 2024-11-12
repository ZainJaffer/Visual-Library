from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.conf import settings

# Create your models here.
class CustomUser(AbstractUser):
    is_verified = models.BooleanField(default=False)  # Track email verification status

    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'  # Make email the login field
    REQUIRED_FIELDS = ['username']  # Username still required for admin

       # Fix the relationship conflicts by adding related_name
    groups = models.ManyToManyField(
        Group,
        related_name="customuser_set",  # Use a unique related name to prevent conflicts
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_permissions_set",  # Use a unique related name to prevent conflicts
        blank=True
    )

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    cover_image_url = models.URLField(max_length=500, blank=True)

    def __str__(self):
        return self.title
    
class UserBook(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    is_read = models.BooleanField(default=False)
    is_favorite = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.book.title}"