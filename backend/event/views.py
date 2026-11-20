import json

from django.http import HttpResponse
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView

from user.models import User
from user.permissions import IsAuthenticatedCustom
from .schemas import (
    big_monitor_view_schema,
    event_list_schema,
    modify_event_schema,
    monitor_view_schema,
    refresh_events_schema,
)
from .service import (
    get_big_monitor_daily_schedule,
    get_formatted_events_for_user,
    get_monitor_room_schedule,
    sync_events_with_google_calendar,
    update_event_room,
)


@event_list_schema
class EventListView(ListAPIView):
    permission_classes = [IsAuthenticatedCustom, ]

    def get(self, request):
        token = request.COOKIES.get('access_token')
        user = User.objects.get(access_token=token)

        start = request.GET.get('start')
        end = request.GET.get('end')

        formatted_events = get_formatted_events_for_user(user, start, end)

        response = HttpResponse(json.dumps(formatted_events), 200)

        return response


@modify_event_schema
class ModifyEventView(APIView):
    permission_classes = [IsAuthenticatedCustom, ]

    def post(self, request):
        id = request.data.get('id')
        room = request.data.get('room')

        try:
            if update_event_room(id, room):
                return HttpResponse('Event was successfully modified', 200)
        except Exception as e:
            return HttpResponse('Event wasnt modified', 200)


@refresh_events_schema
class RefreshEventsView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request):
        is_refreshed = sync_events_with_google_calendar()

        if not is_refreshed:
            return HttpResponse('Everything was\'nt successfully refreshed', 200)

        return HttpResponse('Everything was successfully refreshed', 200)


@monitor_view_schema
class MonitorView(APIView):

    def get(self, request):
        room = request.query_params.get('room')
        password = request.query_params.get('password')

        if not password:
            return HttpResponse('Not authorized', status=401)

        if password != 'atelier0404':
            return HttpResponse('Not authorized', status=401)

        try:
            res = get_monitor_room_schedule(room)

            if not res:
                return HttpResponse('There is no events today', status=204)

            return HttpResponse(json.dumps(res), status=200)

        except Exception as e:
            return HttpResponse('There is no events today', status=204)


@big_monitor_view_schema
class BigMonitorView(ListAPIView):
    def get(self, request):
        try:
            res = get_big_monitor_daily_schedule()
            return HttpResponse(json.dumps(res), status=200)

        except Exception as e:
            print(e)
            return HttpResponse('Something went wrong', status=400)
