# users/urls.py
from django.urls import path
from .views import UserRegistrationView
from django.http import HttpResponse

try:
    from .views import UserRegistrationView
    print("Loading URLs from users/urls.py")  # DEBUG print to check if the URLs are loaded successfully
except Exception as e:
    print(f"Failed to load UserRegistrationView: {e}")

print("Loading URLs from users/urls.py")  # DEBUG print

def test_view(request):
    return HttpResponse("Simple Test View is working!")

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
]

