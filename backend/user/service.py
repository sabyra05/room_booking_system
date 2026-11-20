import datetime
import requests
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from display_back import settings
from .models import User


def parse_user_data(profile):
    res = {}

    profile_keys = profile.keys()

    if 'names' in profile_keys:
        if 'displayName' in profile['names'][0]:
            res.update({
                'username': profile['names'][0]['displayName'],
                'id': profile['resourceName'].split('/')[-1]
            })
    if 'emailAddresses' in profile_keys:
        if 'value' in profile['emailAddresses'][0]:
            res.update({
                'email': profile['emailAddresses'][0]['value']
            })
    return res


def get_google_auth_flow():
    return Flow.from_client_config(
        client_config=settings.GOOGLE_OAUTH2_CONFIG,
        scopes=settings.SCOPE,
        redirect_uri=settings.GOOGLE_OAUTH2_CONFIG['web']['redirect_uri']
    )


def get_google_authorization_url():
    flow = get_google_auth_flow()
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
    )
    return authorization_url, state


def fetch_google_tokens_and_credentials(authentication_code):
    flow = get_google_auth_flow()
    tokens = flow.fetch_token(code=authentication_code)
    credentials = flow.credentials
    return tokens, credentials


def fetch_google_user_data(credentials):
    people_service = build(serviceName='people', version='v1', credentials=credentials)
    profile = people_service.people().get(resourceName='people/me', personFields='names,emailAddresses').execute()
    return parse_user_data(profile)


def update_user_on_google_login(user_data, tokens):
    user = User.objects.get(email=user_data['email'])
    user.refresh_token = tokens.get('refresh_token')
    user.access_token = tokens.get('access_token')
    user.is_active = True
    if user.username != user_data['username']:
        user.username = user_data['username']
        user.id = user_data['id']
    user.save()
    return user


def refresh_user_google_access_token(user, token):
    credentials = {
        'client_id': settings.GOOGLE_OAUTH2_CONFIG['web'].get('client_id'),
        'client_secret': settings.GOOGLE_OAUTH2_CONFIG['web'].get('client_secret'),
        'refresh_token': user.refresh_token,
        'grant_type': 'refresh_token',
    }

    url = settings.GOOGLE_OAUTH2_CONFIG['web']['token_uri']
    r = requests.post(url, data=credentials)
    new_token = r.json()['access_token']

    user.access_token = new_token
    user.save()
    return new_token


def revoke_user_google_tokens(user, token):
    # revoke refresh token
    requests.post(
        'https://oauth2.googleapis.com/revoke',
        params={'token': user.refresh_token},
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    # revoke access token
    requests.post(
        'https://oauth2.googleapis.com/revoke',
        params={'token': token},
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )

    user.access_token = ''
    user.refresh_token = ''
    user.save()


def get_formatted_user_list():
    user_list = User.objects.all().order_by('date_joined')

    formatted_list = []

    for i in range(len(user_list)):
        user_data = user_list[i].get_public_user_data()
        user_data.update({'key': str(i + 1)})

        formatted_list.append(user_data)

    return formatted_list


def update_existing_user(data):
    if data.get('id'):
        user = User.objects.get(id=data.get('id'))
        user.email = data.get('email')
        user.username = data.get('username')
        user.is_admin = data.get('is_admin')
        user.save()
    else:
        user = User.objects.get(email=data.get('email'))
        user.username = data.get('username')
        user.is_admin = data.get('is_admin')
        user.save()
    return user


def create_new_user_from_data(data):
    data.pop('key')
    user = User.objects.create_user(**data)
    user.save()
    return user


def delete_user_from_data(data):
    data.pop('key')
    user = User.objects.get(**data)
    user.delete()
