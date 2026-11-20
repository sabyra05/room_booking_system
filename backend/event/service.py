import datetime
from apiclient import discovery
import httplib2
from django.db.models import QuerySet
from django.utils import timezone
from oauth2client.service_account import ServiceAccountCredentials

from display_back import settings
from event.models import Event
from user.models import User

SERVICE_ACCOUNT_KEY_FILE = settings.SERVICE_ACCOUNT_KEY_FILE


def get_credential():
    credential = ServiceAccountCredentials.from_json_keyfile_name(
        SERVICE_ACCOUNT_KEY_FILE, settings.SCOPE)

    if not credential or credential.invalid:
        raise Exception('Unable to authenticate using service account key.')
    return credential


def get_service():
    http_auth = get_credential().authorize(httplib2.Http())
    return discovery.build('calendar', 'v3', http=http_auth)


def parse_google_data(event):
    try:
        res = {
            'id': event['description'].split('ID:')[-1],
        }
    except Exception as e:
        return None

    if 'creator' in event.keys():
        if 'email' in event['creator'].keys():
            res.update({'teacher': event['creator']['email']})
    if 'summary' in event.keys():
        res.update({'title': event['summary']})
    if 'start' in event.keys():
        if 'dateTime' in event['start'].keys():
            res.update({'start': event['start']['dateTime']})
    if 'end' in event.keys():
        if 'dateTime' in event['end'].keys():
            res.update({'end': event['end']['dateTime']})
    if 'description' in event.keys():
        res.update({'description': event['description']})

    return res


# checks if event was modified
# checks only start and end time
# returns True if event was modified and False if it wasn't
def check_event(old_event: Event, new_event: dict):
    old_time = (old_event.start, old_event.end)
    new_time = (new_event['start'], new_event['end'])
    if old_time == new_time:
        return False
    return True


# gets data from google calendar and checks if any events in google calendar were deleted
# input is new refreshed list of events from google calendar and events that were saved in DB before
# return list of id of events that are no longer exist in google calendar, but exist in DB
def get_nonexistent_events(new_events: list, old_events: QuerySet):
    old_events_ids = set([i.id for i in old_events])
    new_events_ids = set([i['id'] for i in new_events])

    nonexistent_events_ids = old_events_ids - new_events_ids

    if not nonexistent_events_ids:
        return False

    return nonexistent_events_ids


def change_event_data(event: dict, field: str, new_value: any):
    res = event
    res.update({field: new_value})
    return res


def find_duplicate_field(events: list, field: str):
    seen = {}
    duplicates = []

    for i in events:
        key = i.get(field)
        if key in seen:
            if seen[key] not in duplicates:
                duplicates.append(seen[key])
            duplicates.append(i)
        else:
            seen[key] = i

    return duplicates


def format_events_for_big_monitor(events: QuerySet):
    print(len(events))
    res = []
    if len(events) < 1:
        for i in range(1, 10):
            res.append({
                'id': None,
                'room': i
            })
        return res

    for i in events:
        # handle meeting room
        if i.room == 0:
            res.append(change_event_data(i.get_event_data(), 'room', 9))
        else:
            res.append(i.get_event_data())

    # handle duplicated rooms
    duplicate_rooms = find_duplicate_field(res, 'room')

    if len(duplicate_rooms) > 1:
        duplicate_index = res.index(duplicate_rooms[-1])
        del res[duplicate_index]
        res.append(change_event_data(duplicate_rooms[-1], 'room', 8))

    booked_rooms = []
    for i in res:
        booked_rooms.append(i.get('room'))

    rooms = [i for i in range(1, 10)]

    temp = set(rooms) - set(booked_rooms)

    for i in temp:
        res.append({
            'id': None,
            'room': i
        })

    formatted_events = sorted(res, key=lambda i: i['room'])

    return formatted_events


def get_formatted_events_for_user(user: User, start_str: str, end_str: str):
    start = datetime.datetime.fromisoformat(start_str)
    end = datetime.datetime.fromisoformat(end_str).replace(hour=23)

    if user.is_admin:
        events = Event.objects.all().filter(
            start__gte=start,
            end__lte=end,
        ).order_by('start')
    else:
        events = Event.objects.all().filter(
            start__gte=start,
            end__lte=end,
            teacher=user.email
        ).order_by('start')

    formatted_events = []

    for i in events:
        formatted_events.append(i.get_event_data())

    return formatted_events


def update_event_room(event_id, room):
    event = Event.objects.get(id=event_id)
    if event:
        event.room = int(room)
        event.save()
        return True
    return False


def sync_events_with_google_calendar():
    max_date = datetime.datetime.now() + datetime.timedelta(days=30)
    min_date = datetime.datetime.now() - datetime.timedelta(days=2)

    time_min = min_date.isoformat() + 'Z'
    time_max = max_date.isoformat() + 'Z'

    teacher_list = User.objects.all()

    service = get_service()
    unformatted_events = []
    for i in teacher_list:
        try:
            events_result = (
                service.events()
                .list(calendarId=i.email, timeMin=time_min, timeMax=time_max,
                      singleEvents=True, orderBy="startTime", )
                .execute())
            unformatted_events.append(events_result)
        except Exception as e:
            print('Error occurred in refreshing events from google calendar\t', i, '\t', e, '\n')

    formatted_events = []
    for i in unformatted_events:
        for j in i['items']:
            parsed_event = parse_google_data(j)
            if parsed_event:
                formatted_events.append(parsed_event)
            else:
                pass

    for i in formatted_events:
        event, created = Event.objects.get_or_create(id=i['id'], defaults=i)
        if not created:
            if check_event(event, i):
                event.start = i['start']
                event.end = i['end']
                event.save()

    # get all events from DB, there can be events, that are already deleted from google calendar
    old_events = Event.objects.filter(
        start__gte=time_min,
        end__lte=time_max,
    )

    # check and get all events that are no longer in google calendar, but still in DB
    nonexistent_event_ids = get_nonexistent_events(formatted_events, old_events)

    # check if there is no nonexistent events
    if not nonexistent_event_ids:
        return True

    # if there is any nonexistent events, delete all of them from DB
    for i in nonexistent_event_ids:
        try:
            event = Event.objects.get(id=i)
            event.delete()
        except Exception as e:
            print('When deleting old events occurred an Error: ', i, '\n', e)
            return False

    return True


def get_monitor_room_schedule(room):
    now = timezone.now()
    end_of_day = timezone.now().replace(hour=23, minute=59)

    events = Event.objects.filter(start__lt=end_of_day, end__gt=now, room=room).order_by('start')
    events_quantity = len(events)

    if not events_quantity:
        return None

    elif events_quantity == 1:
        return {
            'event': events[0].get_event_data(),
            'free_time': {
                'free_time_start': events[0].end.isoformat(),
                'free_time_end': datetime.datetime.now().replace(hour=19, minute=00).isoformat()
            }
        }

    else:
        return {
            'event': events[0].get_event_data(),
            'free_time': {
                'free_time_start': events[0].end.isoformat(),
                'free_time_end': events[1].start.isoformat()
            }
        }


def get_big_monitor_daily_schedule():
    beginning_of_day = timezone.now().replace(hour=0, minute=1)
    end_of_day = timezone.now().replace(hour=23, minute=59)
    middle_of_day = timezone.now().replace(hour=11, minute=59)

    morning_events = []
    afternoon_events = []

    events = Event.objects.filter(start__lt=end_of_day, end__gt=beginning_of_day).exclude(room=-1).order_by('room')
    res = {
        'morning': [],
        'afternoon': []
    }
    for i in events:
        if i.start <= middle_of_day:
            morning_events.append(i)
        else:
            afternoon_events.append(i)

    res.update({'morning': format_events_for_big_monitor(morning_events)})
    res.update({'afternoon': format_events_for_big_monitor(afternoon_events)})

    return res
