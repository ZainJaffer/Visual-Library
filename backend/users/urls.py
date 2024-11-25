from django.urls import path
from .views import (
    UserRegistrationView,
    EmailTokenObtainPairView,
    UnifiedAddBookView,
    UpdateBookStatusView,
    ListUserBooksView,
    LogoutView,
    UpdateBookDetailsView,
    DeleteBookView,
    test_protected_route,
    get_random_cover,
    test_errors,
    DeleteUserBookView,
    update_book
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('test-protected/', test_protected_route, name='test-protected'),
    path('books/add/', UnifiedAddBookView.as_view(), name='add-book'),
    path('books/status/<int:pk>/', UpdateBookStatusView.as_view(), name='update-book-status'),
    path('books/', ListUserBooksView.as_view(), name='list-user-books'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('books/<int:pk>/', UpdateBookDetailsView.as_view(), name='update-book-details'),
    path('books/<int:book_id>/delete/', DeleteUserBookView.as_view(), name='delete-book'),
    path('books/random-cover/', get_random_cover, name='random-cover'),
    path('test-errors/', test_errors, name='test-errors'),
]