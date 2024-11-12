# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Book, UserBook

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'date_joined', 'is_staff')
    ordering = ('email',)
    search_fields = ('email', 'username')

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Book)
admin.site.register(UserBook)
