from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from accounts.models import User
from admin_dashboard.serializers import ChildBatchListSerializer
from batches.models import Batch, ChildBatch, Lesson, VideoLectures
from services.authentication import CJAuthentication
from services.permissions import UserAuthenticated
from support.models import ReportAnIssue
from support.serializers import ReportAnIssueSerializer
from support.aitools import AIMCQ, AIDescription
from utils.VideoTranscript import get_video_transcript

# Create your views here.

class ReportAnIssueAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            lesson_type = request.query_params.get('lesson_type', '').strip().upper()
            id = request.query_params.get('id')
        except IndexError:
            return Response({'error': 'Lesson Type and Lesson Type ID are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data.copy()
        if lesson_type == 'A':
            data['assignment'] = id
        elif lesson_type == 'P':
            data['problem'] = id
        elif lesson_type == 'V':
            data['video'] = id
        elif lesson_type == 'M':
            data['mcq_assignment'] = id
        else:
            return Response({'error': 'Invalid lesson type'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user['id']
        data['user'] = user
        data['type'] = lesson_type
        data['created_on'] = timezone.now() 
         
        serializer = ReportAnIssueSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class VideoTitleListAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get(self, request):
        try:
            batch_name = request.query_params.get('batch_name')
            weekno = request.query_params.get('weekno')
        except IndexError:
            return Response({'error': 'Lesson Type and Lesson Type ID are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            batch = ChildBatch.objects.get(name=batch_name)
        except IndexError:
            return Response({'error': 'child batch not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        lessons = Lesson.objects.filter(type='V', week_number=weekno, batch=batch.parentbatch)
        titles = [{'id':lesson.video.id, 'title':lesson.video.title} for lesson in lessons]

        return Response({'titles': titles}, status=status.HTTP_200_OK)
    
class AIVideoDescriptionAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def post(self, request, *args, **kwargs):
        videos = request.data.get('videos')
        sys_prompt = request.data.get('prompt')
        if not videos:
            return Response({'error': 'A list of videos with titles and ids is required'}, status=status.HTTP_400_BAD_REQUEST)

        descriptions = []
        for video in videos:
            video_id = video.get('id')
            video_title = video.get('title')
            print(video_id, video_title)
            try:
                current_video = VideoLectures.objects.get(id=video_id)
                transcript = current_video.transcript
                if not transcript:
                    get_video_transcript(video_id)
                    current_video.refresh_from_db()
                    transcript = current_video.transcript
                descriptions.append(AIDescription(transcript, sys_prompt))
                current_video.description = descriptions[-1]
                current_video.save()
            except IndexError:
                return Response({'error': 'something went wrong'}, status=status.HTTP_400_BAD_REQUEST)
        

        return Response({'descriptions': descriptions}, status=status.HTTP_200_OK)
    
class AllBatchesListAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id = user_id)
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            
            batches = ChildBatch.objects.all()
            serializer = ChildBatchListSerializer(batches, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
        except ChildBatch.DoesNotExist:
            return Response({"message": "something went wrong"}, status=status.HTTP_404_NOT_FOUND)

    
class AIVideoMCQAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def post(self, request, *args, **kwargs):
        videos = request.data.get('videos')
        sys_prompt = request.data.get('prompt')
        if not videos:
            return Response({'error': 'A list of videos with titles and ids is required'}, status=status.HTTP_400_BAD_REQUEST)

        mcqs = []
        for video in videos:
            video_id = video.get('id')
            video_title = video.get('title')
            print(video_id, video_title)
            try:
                current_video = VideoLectures.objects.get(id=video_id)
                transcript = current_video.transcript
                mcqs.append(AIMCQ(transcript, sys_prompt))
                current_video.practice_questions = mcqs[-1]
                current_video.save()
            except IndexError:
                return Response({'error': 'something went wrong'}, status=status.HTTP_400_BAD_REQUEST)
        

        return Response({'mcqs': mcqs}, status=status.HTTP_200_OK)

