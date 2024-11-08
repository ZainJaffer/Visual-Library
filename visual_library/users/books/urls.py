from django.urls import path
from ..views import AddBookView  # Adjust the relative import if needed

urlpatterns = [
    path('add/', AddBookView.as_view(), name='add-book'),
]