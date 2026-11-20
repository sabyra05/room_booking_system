from django.db import models
from django.utils.timezone import now


class EventManager(models.Manager):
    def create(self, **kwargs):
        defaults = kwargs.pop('defaults', {})
        for key, value in kwargs.items():
            if not value:
                kwargs[key] = defaults.get(key)
        return super(EventManager, self).create(**kwargs)


class Event(models.Model):
    id = models.CharField(primary_key=True, unique=True, max_length=255)
    title = models.CharField(max_length=255, null=True, blank=True)
    start = models.DateTimeField(null=True, blank=True)
    end = models.DateTimeField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    room = models.SmallIntegerField(default=-1, null=True, blank=True)
    teacher = models.CharField(null=True, blank=True, max_length=255)

    objects = EventManager()

    def get_color(self):
        if self.room < 0:
            return ''
        colors = ['gray', 'green', 'red', 'yellow', 'orange', 'pink', 'purple', 'cyan']
        return colors[self.room]

    def get_text_color(self):
        if self.room < 0:
            return ''
        if self.room in [3, 7, 5]:
            return 'black'
        return ''

    def get_event_data(self):
        res = {
            'id': self.id,
            'title': self.title,
            'start': str(self.start),
            'end': str(self.end),
            'description': self.description,
            'room': self.room,
            'teacher': self.teacher,
            'color': self.get_color(),
            'textColor': self.get_text_color()
        }
        return res
