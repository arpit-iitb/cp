# views.py
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from batches.models import ChildBatch

from .models import Discussion
from .serializers import DiscussionSerializer
from services.authentication import CJAuthentication
from services.permissions import UserAuthenticated

class DiscussionAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            discussion_type = request.query_params.get('discussion_type', '').strip().upper()
            discussion_type_id = request.query_params.get('discussion_type_id')
        except IndexError:
            return Response({'error': 'Discussion Type and Discussion Type ID are required'}, status=status.HTTP_400_BAD_REQUEST)

        if discussion_type == 'A':
            discussions = Discussion.objects.filter(assignment=discussion_type_id)
        elif discussion_type == 'P':
            discussions = Discussion.objects.filter(problem=discussion_type_id,problem__full_stack_evaluation=False)
        elif discussion_type == 'V':
            discussions = Discussion.objects.filter(video=discussion_type_id)
        elif discussion_type == 'M':
            discussions = Discussion.objects.filter(mcq_assignment=discussion_type_id)
        elif discussion_type == 'F':
            discussions = Discussion.objects.filter(problem=discussion_type_id,problem__full_stack_evaluation=True)
        else:
            return Response({'error': 'Invalid discussion type'}, status=status.HTTP_400_BAD_REQUEST)

        if discussions.exists():
            serializer = DiscussionSerializer(discussions, many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        else:
            return Response([], status=status.HTTP_200_OK)
        
    def post(self, request, *args, **kwargs):
        try:
            discussion_type = request.query_params.get('discussion_type', '').strip().upper()
            discussion_type_id = request.query_params.get('discussion_type_id')
        except IndexError:
            return Response({'error': 'Discussion Type and Discussion Type ID are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        
        data = request.data.copy()
        if discussion_type == 'A':
            data['assignment'] = discussion_type_id
        elif discussion_type == 'P' or discussion_type == 'F':
            data['problem'] = discussion_type_id
        elif discussion_type == 'V':
            data['video'] = discussion_type_id
        elif discussion_type == 'M':
            data['mcq_assignment'] = discussion_type_id
        else:
            return Response({'error': 'Invalid discussion type'}, status=status.HTTP_400_BAD_REQUEST)
        
        batch_name = data.get('batch_name')
        if not batch_name:
            return Response({'error': 'Batch name is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            batch=ChildBatch.objects.get(name=batch_name)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Given Batch Does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user['id']
        data['user'] = user
        data['type'] = discussion_type
        data['created_on'] = timezone.now() 
        data['batch']= batch.id
        serializer = DiscussionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
