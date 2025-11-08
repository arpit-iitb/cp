from rest_framework import serializers
from .models import ZoomMeeting

class ZoomMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZoomMeeting
        fields = ['meeting_id', 'topic', 'start_time', 'duration', 'join_url']
