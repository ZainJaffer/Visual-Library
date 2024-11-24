from django.urls import path
from .views import (
    UserRegistrationView, 
    AddBookView, 
    UpdateBookStatusView,
    EmailTokenObtainPairView,
    LogoutView,
    test_protected_route,
    ListUserBooksView, 
    UpdateBookDetailsView,
    DeleteBookView,
    get_random_cover,
    test_errors,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('books/add/', AddBookView.as_view(), name='add-book'),
    path('test-protected/', test_protected_route, name='test-protected'),
    path('books/<int:pk>/update-status/', UpdateBookStatusView.as_view(), name='update-book-status'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('books/', ListUserBooksView.as_view(), name='list-books'),
    path('books/<int:pk>/update/', UpdateBookDetailsView.as_view(), name='update-book-details'),
    path('books/<int:pk>/delete/', DeleteBookView.as_view(), name='delete-book'),
    path('random-cover/', get_random_cover, name='random-cover'),
    path('test-errors/', test_errors, name='test-errors'),
]