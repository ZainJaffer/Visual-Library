# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Book, UserBook

# Register the CustomUser model to make it accessible in the admin panel
admin.site.register(CustomUser, UserAdmin)
admin.site.register(Book)
admin.site.register(UserBook)
