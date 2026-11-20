from django.urls import path

from event.views import (
    BigMonitorView,
    EventListView,
    ModifyEventView,
    MonitorView,
    RefreshEventsView,
)

urlpatterns = [
    path('event-list', EventListView.as_view()),
    path('modify-event', ModifyEventView.as_view()),
    path('refresh-events', RefreshEventsView.as_view()),
    path('monitor', MonitorView.as_view()),
    path('monitor/big', BigMonitorView.as_view()),
]
