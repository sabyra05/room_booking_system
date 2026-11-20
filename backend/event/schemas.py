from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiExample, OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers


# --- Serializers for OpenAPI documentation ---

EventDataSerializer = inline_serializer(
    name='EventData',
    fields={
        'id': serializers.CharField(),
        'title': serializers.CharField(allow_null=True),
        'start': serializers.CharField(help_text='Event start datetime as string.'),
        'end': serializers.CharField(help_text='Event end datetime as string.'),
        'description': serializers.CharField(allow_null=True),
        'room': serializers.IntegerField(help_text='Assigned room number (-1 if unassigned, 0 for meeting room, 1-7 for rooms).'),
        'teacher': serializers.EmailField(allow_null=True, help_text='Teacher email address.'),
        'color': serializers.CharField(help_text='Calendar badge background color derived from room.'),
        'textColor': serializers.CharField(help_text='Calendar badge text color derived from room.'),
    },
)

EventDataListSerializer = inline_serializer(
    name='EventDataList',
    fields={
        'id': serializers.CharField(),
        'title': serializers.CharField(allow_null=True),
        'start': serializers.CharField(help_text='Event start datetime as string.'),
        'end': serializers.CharField(help_text='Event end datetime as string.'),
        'description': serializers.CharField(allow_null=True),
        'room': serializers.IntegerField(help_text='Assigned room number (-1 if unassigned, 0 for meeting room, 1-7 for rooms).'),
        'teacher': serializers.EmailField(allow_null=True, help_text='Teacher email address.'),
        'color': serializers.CharField(help_text='Calendar badge background color derived from room.'),
        'textColor': serializers.CharField(help_text='Calendar badge text color derived from room.'),
    },
    many=True,
)

ModifyEventRequestSerializer = inline_serializer(
    name='ModifyEventRequest',
    fields={
        'id': serializers.CharField(help_text='Unique event ID.'),
        'room': serializers.IntegerField(help_text='New room number to assign to the event.'),
    },
)

FreeTimePeriodSerializer = inline_serializer(
    name='FreeTimePeriod',
    fields={
        'free_time_start': serializers.CharField(help_text='ISO datetime when free time starts.'),
        'free_time_end': serializers.CharField(help_text='ISO datetime when free time ends.'),
    },
)

MonitorResponseSerializer = inline_serializer(
    name='MonitorResponse',
    fields={
        'event': EventDataSerializer,
        'free_time': FreeTimePeriodSerializer,
    },
)

BigMonitorSlotSerializer = inline_serializer(
    name='BigMonitorSlot',
    fields={
        'id': serializers.CharField(allow_null=True, help_text='Event ID or null if room is empty.'),
        'title': serializers.CharField(required=False, allow_null=True),
        'start': serializers.CharField(required=False),
        'end': serializers.CharField(required=False),
        'description': serializers.CharField(required=False, allow_null=True),
        'room': serializers.IntegerField(help_text='Room slot number (1-9).'),
        'teacher': serializers.EmailField(required=False, allow_null=True),
        'color': serializers.CharField(required=False),
        'textColor': serializers.CharField(required=False),
    },
    many=True,
)

BigMonitorResponseSerializer = inline_serializer(
    name='BigMonitorResponse',
    fields={
        'morning': BigMonitorSlotSerializer,
        'afternoon': BigMonitorSlotSerializer,
    },
)


# --- Endpoint Schemas ---

event_list_schema = extend_schema(
    tags=['Events'],
    summary='List calendar events in date range',
    description=(
        'Returns events between `start` and `end` ISO timestamps ordered by `start`. '
        'Admin users receive all events; non-admin users receive only events where `teacher` matches their email.'
    ),
    parameters=[
        OpenApiParameter(
            name='start',
            type=OpenApiTypes.DATETIME,
            location=OpenApiParameter.QUERY,
            required=True,
            description='Start of date range in ISO 8601 format (e.g. `2025-05-01T00:00:00.000Z`).',
        ),
        OpenApiParameter(
            name='end',
            type=OpenApiTypes.DATETIME,
            location=OpenApiParameter.QUERY,
            required=True,
            description='End of date range in ISO 8601 format (e.g. `2025-05-31T23:59:59.000Z`).',
        ),
        OpenApiParameter(
            name='room',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            required=False,
            description='Optional room parameter passed by frontend home page.',
        ),
        OpenApiParameter(
            name='access_token',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.COOKIE,
            required=True,
            description='Authenticated user access token cookie.',
        ),
    ],
    responses={
        200: OpenApiResponse(
            response=EventDataListSerializer,
            description='JSON array of formatted event objects.',
        ),
        403: OpenApiResponse(description='Not authenticated.'),
    },
)

modify_event_schema = extend_schema(
    tags=['Events'],
    summary='Assign or change event room',
    description='Updates the `room` number for the specified event `id`.',
    parameters=[
        OpenApiParameter(
            name='access_token',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.COOKIE,
            required=True,
            description='Authenticated user access token cookie.',
        ),
    ],
    request=ModifyEventRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.STR,
            description='Result message string.',
            examples=[
                OpenApiExample('Modified', value='Event was successfully modified'),
                OpenApiExample('Not Modified', value='Event wasnt modified'),
            ],
        ),
        403: OpenApiResponse(description='Not authenticated.'),
    },
)

refresh_events_schema = extend_schema(
    tags=['Events'],
    summary='Synchronize events from Google Calendar',
    description=(
        'Fetches events for all registered teachers from Google Calendar API (from 2 days ago to 30 days ahead) '
        'using the service account, creates or updates events in the local database, and deletes local events '
        'that were removed from Google Calendar.'
    ),
    parameters=[
        OpenApiParameter(
            name='access_token',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.COOKIE,
            required=True,
            description='Authenticated user access token cookie.',
        ),
    ],
    request=None,
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.STR,
            description='Synchronization status message.',
            examples=[
                OpenApiExample('Success', value='Everything was successfully refreshed'),
                OpenApiExample('Partial Failure', value="Everything was'nt successfully refreshed"),
            ],
        ),
        403: OpenApiResponse(description='Not authenticated.'),
    },
)

monitor_view_schema = extend_schema(
    tags=['Monitors'],
    summary='Get current event and free time for a room monitor',
    description=(
        'Returns the current/upcoming event and next free time window for a specific `room` today. '
        'Requires valid monitor `password` query parameter.'
    ),
    parameters=[
        OpenApiParameter(
            name='room',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            required=True,
            description='Room number (0 for meeting room, 1-7 for classrooms).',
        ),
        OpenApiParameter(
            name='password',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            required=True,
            description='Monitor access password.',
        ),
    ],
    responses={
        200: OpenApiResponse(
            response=MonitorResponseSerializer,
            description='Current/upcoming event and next free time interval.',
        ),
        204: OpenApiResponse(
            response=OpenApiTypes.STR,
            description='No events scheduled for this room today.',
        ),
        401: OpenApiResponse(
            response=OpenApiTypes.STR,
            description='Missing or invalid monitor password (`"Not authorized"`).',
        ),
    },
)

big_monitor_view_schema = extend_schema(
    tags=['Monitors'],
    summary='Get daily schedule for big overview monitor',
    description=(
        'Returns all room bookings for today split into `morning` (start <= 11:59) and `afternoon` (start > 11:59) '
        'lists, formatted and sorted across room slots 1..9.'
    ),
    responses={
        200: OpenApiResponse(
            response=BigMonitorResponseSerializer,
            description='Morning and afternoon room schedule arrays.',
        ),
        400: OpenApiResponse(
            response=OpenApiTypes.STR,
            description='Error message (`"Something went wrong"`).',
        ),
    },
)
