from rest_framework.permissions import BasePermission

from user.models import User


class IsAuthenticatedCustom(BasePermission):

    def has_permission(self, request, view):
        token = request.COOKIES.get('access_token')
        if User.objects.filter(access_token=token).exists():
            return True
        return False

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsAdminCustom(BasePermission):

    def has_permission(self, request, view):
        token = request.COOKIES.get('access_token')
        if User.objects.filter(access_token=token, is_admin=True).exists():
            return True
        return False

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)
