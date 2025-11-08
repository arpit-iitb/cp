from rest_framework.permissions import BasePermission



class UserAuthenticated(BasePermission):
    def has_permission(self, request, view):
        if isinstance(request.user, dict) and request.user.get('id') is not None:
            return True
        return False





