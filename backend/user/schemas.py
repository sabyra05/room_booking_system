from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiExample, OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers


# --- Serializers for OpenAPI documentation ---

GoogleAuthCallbackRequestSerializer = inline_serializer(
    name='GoogleAuthCallbackRequest',
    fields={
        'authentication_code': serializers.CharField(help_text='Authorization code returned by Google OAuth2 callback.'),
        'state': serializers.CharField(required=False, allow_blank=True, help_text='OAuth2 state parameter.'),
    },
)

GoogleAuthCallbackResponseSerializer = inline_serializer(
    name='GoogleAuthCallbackResponse',
    fields={
        'id': serializers.CharField(help_text='Google profile resource ID.'),
        'username': serializers.CharField(help_text='Display name from Google profile.'),
        'email': serializers.EmailField(help_text='User email address.'),
    },
)

PublicUserDataSerializer = inline_serializer(
    name='PublicUserData',
    fields={
        'id': serializers.CharField(allow_null=True),
        'username': serializers.CharField(allow_null=True),
        'email': serializers.EmailField(),
        'is_admin': serializers.BooleanField(),
    },
)

UserListItemSerializer = inline_serializer(
    name='UserListItem',
    fields={
        'id': serializers.CharField(allow_null=True),
        'username': serializers.CharField(allow_null=True),
        'email': serializers.EmailField(),
        'is_admin': serializers.BooleanField(),
        'key': serializers.CharField(help_text='1-based string index for frontend table row key.'),
    },
    many=True,
)

ModifyUserRequestSerializer = inline_serializer(
    name='ModifyUserRequest',
    fields={
        'id': serializers.CharField(required=False, allow_blank=True, allow_null=True),
        'email': serializers.EmailField(),
        'username': serializers.CharField(),
        'is_admin': serializers.BooleanField(),
        'key': serializers.CharField(required=False),
    },
)

ChosenUserPayloadSerializer = inline_serializer(
    name='ChosenUserPayload',
    fields={
        'id': serializers.CharField(required=False, allow_blank=True),
        'username': serializers.CharField(),
        'email': serializers.EmailField(),
        'is_admin': serializers.BooleanField(default=False),
        'key': serializers.IntegerField(help_text='Temporary row key stripped before user creation.'),
    },
)

AddUserRequestSerializer = inline_serializer(
    name='AddUserRequest',
    fields={
        'chosenUser': ChosenUserPayloadSerializer,
    },
)

DeleteUserRequestSerializer = inline_serializer(
    name='DeleteUserRequest',
    fields={
        'id': serializers.CharField(required=False, allow_blank=True, allow_null=True),
        'username': serializers.CharField(required=False, allow_blank=True, allow_null=True),
        'email': serializers.EmailField(),
        'is_admin': serializers.BooleanField(required=False),
        'key': serializers.CharField(help_text='Row key stripped before lookup.'),
    },
)


# --- Endpoint Schemas ---

google_auth_callback_schema = extend_schema(
    tags=['Authentication'],
    summary='Complete Google OAuth2 authentication',
    description=(
        'Exchanges the Google OAuth2 `authentication_code` for access and refresh tokens, '
        'fetches user profile details from Google People API, updates an existing user in the database, '
        'and sets the `access_token` cookie (valid for 7 days).'
    ),
    request=GoogleAuthCallbackRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=GoogleAuthCallbackResponseSerializer,
            description='User authenticated successfully; sets `access_token` cookie.',
        ),
        400: OpenApiResponse(
            response=OpenApiTypes.STR,
            description='Google authentication error or user email is not registered in the system.',
            examples=[
                OpenApiExample('Google Auth Error', value='Error occurred with google authentication'),
                OpenApiExample('User Not Found', value='user is not in list'),
            ],
        ),
    },
)

refresh_access_token_schema = extend_schema(
    tags=['Authentication'],
    summary='Refresh Google OAuth2 access token',
    description=(
        'Uses the current user credentials associated with the `access_token` cookie '
        'to request a new access token from Google OAuth2 token endpoint and updates the cookie.'
    ),
    parameters=[
        OpenApiParameter(
            name='access_token',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.COOKIE,
            required=True,
            description='Current access token stored in cookies.',
        ),
    ],
    request=None,
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.STR,
            description='Token refreshed successfully or error details returned with HTTP 200.',
            examples=[
                OpenApiExample('Success', value='token was refreshed'),
                OpenApiExample('Invalid Token', value='error'),
            ],
        ),
    },
)

user_login_schema = extend_schema(
    tags=['Authentication'],
    summary='Get current authenticated user session',
    description=(
        'Checks the `access_token` cookie and returns the public profile data of the logged-in user, '
        'or `"User is not logged in"` (with HTTP 200) if no valid session exists.'
    ),
    parameters=[
        OpenApiParameter(
            name='access_token',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.COOKIE,
            required=False,
            description='Access token stored in cookies.',
        ),
    ],
    responses={
        200: OpenApiResponse(
            response=PublicUserDataSerializer,
            description='Returns public user JSON object if logged in, or `"User is not logged in"` string.',
        ),
    },
)

logout_schema = extend_schema(
    tags=['Authentication'],
    summary='Log out current user and revoke Google tokens',
    description=(
        'Revokes the user\'s Google `refresh_token` and `access_token` via Google OAuth2 revoke endpoint, '
        'clears stored tokens in the database, and deletes the `access_token` cookie.'
    ),
    parameters=[
        OpenApiParameter(
            name='access_token',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.COOKIE,
            required=True,
            description='Active access token cookie.',
        ),
    ],
    request=None,
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.STR,
            description='Credentials revoked and cookie deleted.',
            examples=[OpenApiExample('Success', value='Credentials successfully revoked.')],
        ),
        400: OpenApiResponse(
            response=OpenApiTypes.STR,
            description='Error occurred while revoking tokens.',
            examples=[OpenApiExample('Error', value='An error occurred.')],
        ),
    },
)

user_list_schema = extend_schema(
    tags=['Users (Admin)'],
    summary='List all users',
    description='Returns a list of all users ordered by `date_joined` with a 1-based `key` field. Requires admin privileges.',
    parameters=[
        OpenApiParameter(
            name='access_token',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.COOKIE,
            required=True,
            description='Admin user access token cookie.',
        ),
    ],
    responses={
        200: OpenApiResponse(
            response=UserListItemSerializer,
            description='JSON array of public user objects with `key`.',
        ),
        403: OpenApiResponse(description='Not authorized as admin.'),
    },
)

modify_user_schema = extend_schema(
    tags=['Users (Admin)'],
    summary='Modify existing user',
    description=(
        'Updates a user\'s `email`, `username`, and `is_admin` status (lookup by `id` if provided, otherwise by `email`). '
        'Requires admin privileges.'
    ),
    parameters=[
        OpenApiParameter(
            name='access_token',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.COOKIE,
            required=True,
            description='Admin user access token cookie.',
        ),
    ],
    request=ModifyUserRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=PublicUserDataSerializer,
            description='Updated user data JSON object, or `"User wasnt modified"` string on failure.',
        ),
        403: OpenApiResponse(description='Not authorized as admin.'),
    },
)

add_user_schema = extend_schema(
    tags=['Users (Admin)'],
    summary='Create a new user',
    description='Creates a new user from the `chosenUser` object payload. Requires admin privileges.',
    parameters=[
        OpenApiParameter(
            name='access_token',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.COOKIE,
            required=True,
            description='Admin user access token cookie.',
        ),
    ],
    request=AddUserRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.STR,
            description='Result message string.',
            examples=[
                OpenApiExample('Created', value='user was successfully created'),
                OpenApiExample('Failed', value='user wasnt successfully created'),
            ],
        ),
        403: OpenApiResponse(description='Not authorized as admin.'),
    },
)

delete_user_schema = extend_schema(
    tags=['Users (Admin)'],
    summary='Delete a user',
    description='Deletes a user matching the provided fields (after stripping `key`). Requires admin privileges.',
    parameters=[
        OpenApiParameter(
            name='access_token',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.COOKIE,
            required=True,
            description='Admin user access token cookie.',
        ),
    ],
    request=DeleteUserRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.STR,
            description='Result message string.',
            examples=[
                OpenApiExample('Deleted', value='user was successfully deleted'),
                OpenApiExample('Failed', value='user wasnt successfully deleted'),
            ],
        ),
        403: OpenApiResponse(description='Not authorized as admin.'),
    },
)
