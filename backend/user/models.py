from django.db import models
from django.contrib.auth.models import AbstractUser
from google.oauth2.credentials import Credentials

from display_back import settings


class User(AbstractUser):
    refresh_token = models.CharField(max_length=255, null=True, blank=True)
    access_token = models.CharField(max_length=255, null=True, blank=True)
    id = models.CharField(max_length=255, null=True, blank=True)
    username = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True, primary_key=True, default='')
    is_active = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['id', ]

    def get_user_data(self):
        return {
            'refresh_token': self.refresh_token,
            'access_token': self.access_token,
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
        }

    def get_public_user_data(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
        }

    def get_credentials(self):
        user_info = {
            'token': self.access_token,
            'refresh_token': self.refresh_token,
            'token_uri':'https://oauth2.googleapis.com/token',
            'client_id':settings.GOOGLE_OAUTH2_CONFIG['web'].get('client_id'),
            'client_secret': settings.GOOGLE_OAUTH2_CONFIG['web'].get('client_secret'),
            'scopes': settings.SCOPE
        }

        credentials = Credentials.from_authorized_user_info(user_info)
        return credentials
