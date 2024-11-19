from rest_framework import permissions

class IsBookOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a book to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the book
        return obj.user == request.user

class IsUserBookOwner(permissions.BasePermission):
    """
    Custom permission for UserBook objects.
    """
    def has_object_permission(self, request, view, obj):
        # Check if the requesting user owns this UserBook entry
        return obj.user == request.user