from django.urls import path
from ..views import AddBookView, UpdateBookStatusView  # Adjust the relative import if needed

urlpatterns = [
    path('add/', AddBookView.as_view(), name='add-book'),
    path('<int:pk>/update-status/', UpdateBookStatusView.as_view(), name='update-book-status'),
]