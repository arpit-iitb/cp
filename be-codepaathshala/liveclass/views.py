from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from batches.models import Batch, ChildBatch
from services.authentication import CJAuthentication
from services.permissions import UserAuthenticated
from .models import ZoomMeeting
from .serializers import ZoomMeetingSerializer
from zoomus import ZoomClient
from rest_framework.views import APIView

# client = ZoomClient('API_KEY', 'API_SECRET')

# @api_view(['POST'])
# def create_zoom_meeting(request):
#     data = request.data
#     topic = data.get('topic', 'Live Class')
#     start_time = data.get('start_time')
#     duration = data.get('duration', 60)

#     meeting = client.meeting.create(
#         user_id='your_zoom_email@example.com',
#         topic=topic,
#         type=2,
#         start_time=start_time,
#         duration=duration,
#         settings={
#             'host_video': True,
#             'participant_video': True,
#             'join_before_host': True
#         }
#     )

#     zoom_meeting = ZoomMeeting.objects.create(
#         meeting_id=meeting['id'],
#         topic=meeting['topic'],
#         start_time=meeting['start_time'],
#         duration=meeting['duration'],
#         join_url=meeting['join_url']
#     )

#     serializer = ZoomMeetingSerializer(zoom_meeting)
#     return Response(serializer.data)


class UpcomingClassView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        
        batch_name = request.GET.get('batch_name')
        try:
            child_batch = ChildBatch.objects.get(name=batch_name)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=404)
        
        parent_batch = child_batch.parentbatch
        batch = Batch.objects.get(name=parent_batch)
        # Filter ZoomMeetings that belong to the given batch and have a future start_time
        upcoming_classes = ZoomMeeting.objects.filter(parentbatch=batch, start_time__gte=timezone.now())
        
        # Serialize the data
        serializer = ZoomMeetingSerializer(upcoming_classes, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    