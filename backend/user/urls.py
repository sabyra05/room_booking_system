from django.urls import path

from user.views import (
    AddUserView,
    DeleteUserView,
    GoogleAuthCallback,
    LogoutView,
    ModifyUserView,
    RefreshAccessToken,
    UserListView,
    UserLoginView,
    google_auth_init,
)

urlpatterns = [
    path('account/google/login', google_auth_init),
    path('account/google/google-callback', GoogleAuthCallback.as_view()),
    path('account/google/refresh-token', RefreshAccessToken.as_view()),
    path('account/logout', LogoutView.as_view()),
    path('account/login', UserLoginView.as_view()),
    path('user-list', UserListView.as_view()),
    path('modify-user', ModifyUserView.as_view()),
    path('create-user', AddUserView.as_view()),
    path('delete-user', DeleteUserView.as_view()),
]
