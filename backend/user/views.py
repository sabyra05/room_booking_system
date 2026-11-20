import json

from django.http import HttpResponse
from django.shortcuts import redirect
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView

from .models import User
from .permissions import IsAdminCustom, IsAuthenticatedCustom
from .schemas import (
    add_user_schema,
    delete_user_schema,
    google_auth_callback_schema,
    logout_schema,
    modify_user_schema,
    refresh_access_token_schema,
    user_list_schema,
    user_login_schema,
)
from .service import (
    create_new_user_from_data,
    delete_user_from_data,
    fetch_google_tokens_and_credentials,
    fetch_google_user_data,
    get_formatted_user_list,
    get_google_authorization_url,
    refresh_user_google_access_token,
    revoke_user_google_tokens,
    update_existing_user,
    update_user_on_google_login,
)


def google_auth_init(request):
    authorization_url, state = get_google_authorization_url()
    return redirect(authorization_url)


@google_auth_callback_schema
class GoogleAuthCallback(APIView):
    def post(self, request):
        data = request.data
        authentication_code = data.get('authentication_code')
        state = data.get('state')

        tokens, credentials = None, None

        try:
            tokens, credentials = fetch_google_tokens_and_credentials(authentication_code)
        except Exception as e:
            return HttpResponse('Error occurred with google authentication', status=400)

        user_data = fetch_google_user_data(credentials)

        try:
            update_user_on_google_login(user_data, tokens)
        except Exception as e:
            return HttpResponse('user is not in list', 400)

        response = HttpResponse(json.dumps(user_data), 200)
        response.set_cookie(
            'access_token',
            tokens.get('access_token'),
            max_age=604800,
            path='/',
            samesite='Lax',
        )

        return response


@refresh_access_token_schema
class RefreshAccessToken(APIView):
    permission_classes = [IsAuthenticatedCustom, ]

    def post(self, request):
        token = request.COOKIES.get('access_token')
        user = User.objects.get(access_token=token)

        try:
            token = refresh_user_google_access_token(user, token)

            response = HttpResponse('token was refreshed', status=200)
            response.set_cookie(
                'access_token',
                token,
                max_age=604800,
                path='/',
                samesite='Lax',
            )

            return response

        except Exception as e:
            print(e)
            return HttpResponse({'error': 'Invalid refresh token'}, status=200)


@user_login_schema
class UserLoginView(APIView):

    def get(self, request):
        if 'access_token' in request.COOKIES.keys():
            token = request.COOKIES['access_token']

            try:
                user = User.objects.get(access_token=token)
                return HttpResponse(json.dumps(user.get_public_user_data()), 200)

            except Exception as e:
                return HttpResponse('User is not logged in', 200)

        return HttpResponse('User is not logged in', 200)


@logout_schema
class LogoutView(APIView):
    permission_classes = [IsAuthenticatedCustom, ]

    def post(self, request):
        token = request.COOKIES.get('access_token')
        user = User.objects.get(access_token=token)

        try:
            revoke_user_google_tokens(user, token)

            response = HttpResponse('Credentials successfully revoked.', status=200)
            response.delete_cookie('access_token', path='/', samesite='Lax')
            return response

        except Exception as e:
            return HttpResponse('An error occurred.', status=400)


@user_list_schema
class UserListView(ListAPIView):
    permission_classes = [IsAdminCustom, ]

    def get(self, request):
        formatted_list = get_formatted_user_list()

        response = HttpResponse(json.dumps(formatted_list), 200)
        return response


@modify_user_schema
class ModifyUserView(APIView):
    permission_classes = [IsAdminCustom, ]

    def post(self, request):
        data = request.data

        try:
            user = update_existing_user(data)
            return HttpResponse(json.dumps(user.get_public_user_data()), 200)
        except Exception as e:
            return HttpResponse('User wasnt modified', 200)


@add_user_schema
class AddUserView(APIView):
    permission_classes = [IsAdminCustom, ]

    def post(self, request):
        data = request.data.get('chosenUser')
        try:
            create_new_user_from_data(data)
            return HttpResponse('user was successfully created', 200)
        except Exception as e:
            print(e)
            return HttpResponse('user wasnt successfully created', 200)


@delete_user_schema
class DeleteUserView(APIView):
    permission_classes = [IsAdminCustom, ]

    def post(self, request):
        data = request.data
        try:
            delete_user_from_data(data)
            return HttpResponse('user was successfully deleted', 200)
        except Exception as e:
            print(e)
            return HttpResponse('user wasnt successfully deleted', 200)
