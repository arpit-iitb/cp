from django.db import models

from batches.models import Batch

class ZoomMeeting(models.Model):
    meeting_id = models.CharField(max_length=20, unique=True)
    topic = models.CharField(max_length=255)
    parentbatch = models.ForeignKey(Batch, on_delete=models.CASCADE, blank=True, null=True)
    start_time = models.DateTimeField()
    duration = models.IntegerField()  # in minutes
    join_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.topic} - {self.start_time}"