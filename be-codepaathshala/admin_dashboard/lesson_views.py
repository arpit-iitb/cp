import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q

from accounts.models import User, UserProfile
from apis.serializers import LessonSerializer
from .serializers import LessonPriorityUpdateSerializer, VideoLectureSerializer
from batches.models import Batch, ChildBatch, Lesson, Problem
from services.authentication import CJAuthentication
from services.permissions import UserAuthenticated

class CreateVideoLectureAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id = user_id)
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            
            child_batch_name = request.query_params.get('batch_name')
            week_number = request.query_params.get('week_number')

            if not child_batch_name or not week_number:
                return Response({"message": "Batch name and week number are required."}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                child_batch = ChildBatch.objects.get(name=child_batch_name)
            except ChildBatch.DoesNotExist:
                return Response({'error': 'Batch not found'}, status=404)
                
            batch = child_batch.parentbatch
            priority_order = request.data.get('priority_order', None)
            serializer = VideoLectureSerializer(data=request.data)

            if serializer.is_valid():
                video_lecture = serializer.save()
                
                lesson_data = {
                'type': 'V',
                'week_number': week_number,
                'video': video_lecture,
                'batch': batch
                }

                if priority_order is not None:
                    lesson_data['priority_order'] = priority_order
                # Create a Lesson instance of type 'V' for VideoLectures
                lesson= Lesson.objects.create(**lesson_data)

                response = {
                    'message': 'Video lecture added to the given week created successfully.',
                    'id':video_lecture.id,
                    'type': 'V',
                    'title': video_lecture.title,
                    'difficulty_level':video_lecture.difficulty_level,
                    'priority_order': lesson.priority_order,
                    'lesson_id':lesson.id,
                }

                return Response(response, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except object.DoesNotExist as e:
            return Response({"message": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DeleteLessonAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def delete(self, request):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id=user_id)
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)

            lesson_id = request.query_params.get('lesson_id')
            child_batch_name = request.query_params.get('batch_name')
            week_number = request.query_params.get('week_number')

            if not child_batch_name or not week_number or not lesson_id:
                return Response({"message": "Batch name, lesson id and week number are required."}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                child_batch = ChildBatch.objects.get(name=child_batch_name)
            except ChildBatch.DoesNotExist:
                return Response({'error': 'Batch not found'}, status=404)
                
            batch = child_batch.parentbatch

            try:
                lesson = Lesson.objects.get(id=lesson_id, week_number=week_number, batch=batch)
                lesson.delete()
                return Response({"message": "Lesson deleted successfully."}, status=status.HTTP_200_OK)
            except Lesson.DoesNotExist:
                return Response({"message": f"Lesson with ID {lesson_id} not found in the specified batch and week."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UpdateLessonPriorityAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request):
        user_id = self.request.user.get('id')
        user = User.objects.get(id = user_id)
        if not user.is_staff:
            return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
        
        child_batch_name = request.query_params.get('batch_name')
        week_number = request.query_params.get('week_number')

        if not child_batch_name or not week_number:
            return Response({"message": "Batch name and week number are required."}, status=status.HTTP_400_BAD_REQUEST)
           
        try:
            child_batch = ChildBatch.objects.get(name=child_batch_name)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=404)
            
        batch = child_batch.parentbatch
        serializer = LessonPriorityUpdateSerializer(data=request.data,many=True)
        if serializer.is_valid():
            lessons_data = serializer.validated_data

            try:
                lessons = Lesson.objects.filter(batch=batch, week_number=week_number)
            except Lesson.DoesNotExist:
                return Response({"message": "No lessons found for the given week."}, status=status.HTTP_404_NOT_FOUND)

            for lesson_data in lessons_data:
                try:
                    lesson = lessons.get(id=lesson_data['lesson_id'])
                    lesson.priority_order = lesson_data['priority_order']
                    lesson.save()
                except Lesson.DoesNotExist:
                    return Response({"message": f"Lesson with ID {lesson_data['lesson_id']} not found."}, status=status.HTTP_404_NOT_FOUND)

            return Response({"message": "Lesson priorities updated successfully."}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
class LessonAdminAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id = user_id)
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            user_profiles = UserProfile.objects.get(user=user)
            client = user_profiles.client
            
            child_batch_name = request.query_params.get('batch_name')
            week_number = request.query_params.get('week_number')

            if not child_batch_name or not week_number:
                return Response({"message": "Batch name and week number are required."}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                child_batch = ChildBatch.objects.get(name=child_batch_name)
            except ChildBatch.DoesNotExist:
                return Response({'error': 'Batch not found'}, status=404)
            
            parent_batch = child_batch.parentbatch
            if(parent_batch.client!=client):
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            
            week_lessons = Lesson.objects.filter(batch=parent_batch, week_number=week_number).select_related('problem', 'video', 'assignment', 'MCQ_assignment').order_by('priority_order')
            serialized_lessons = []
            for lesson in week_lessons:
                lesson_data = LessonSerializer(lesson).data
                lesson_data['lesson_id']=lesson.id
                # Check if the user has completed the lesson and set its status
                if lesson_data['type'] == 'P':
                    lesson_data['id'] = lesson.problem_id
                    problem = Problem.objects.get(id=lesson_data['id'])
                    lesson_data['isFullStackProblem'] = problem.full_stack_evaluation
                    
                elif lesson_data['type'] == 'V':
                    lesson_data['id'] = lesson.video_id
                    
                elif lesson_data['type'] == 'A':
                    lesson_data['id'] = lesson.assignment_id
                    
                elif lesson_data['type'] == 'M':
                    lesson_data['id'] = lesson.MCQ_assignment_id
                    
                serialized_lessons.append(lesson_data)

            return Response(serialized_lessons, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class BatchLessonsAdminAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get(self, request):
        batch_name = request.GET.get('batch_name')
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id = user_id)
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            user_profile = UserProfile.objects.get(user=user)
            client = user_profile.client
            
            child_batch_name = request.query_params.get('batch_name')
            if not child_batch_name:
                return Response({"message": "Batch name and week number are required."}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                child_batch = ChildBatch.objects.get(name=child_batch_name)
            except ChildBatch.DoesNotExist:
                return Response({'error': 'Batch not found'}, status=404)
            
            parent_batch = child_batch.parentbatch
            if(parent_batch.client!=client):
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            

            # Access the parent batch name
            parent_batch = Batch.objects.get(name=parent_batch)
            client_name = parent_batch.client.name

            queryset = Lesson.objects.filter(batch=parent_batch).select_related('problem', 'video', 'assignment', 'MCQ_assignment')
            week_numbers = set(queryset.values_list('week_number', flat=True))
            response_data = []

            for week_number in week_numbers:
                week_lessons = queryset.filter(week_number=week_number)
                total_lessons = week_lessons.count()
                # total_lessons_completed = week_lessons.filter(
                # Q(problem_id__in=user_profile.solved_problems.values_list('id', flat=True)) |
                # Q(video_id__in=user_profile.watched_videos.values_list('id', flat=True)) |
                # Q(assignment_id__in=user_profile.assignment_Submission.values_list('id', flat=True)) |
                # Q(MCQ_assignment_id__in=user_profile.mcq_assignments.values_list('id', flat=True))
                # ).count()
                serialized_lessons = []

                # weekly_topics_json = json.loads(parent_batch.weekly_topics)
                # topic_description = weekly_topics_json.get(str(week_number), "")

                response_data.append({
                    'week_number': int(week_number),
                    'total_lessons': int(total_lessons),
                    'canSolve': True,
                    # 'total_lessons_completed': int(total_lessons_completed),
                    'pending': 0,
                    # 'topic_description': topic_description,
                    # 'lessons': serialized_lessons
                    
                })
            
            batch_data = {
                "client_name" : client_name,
                "weekwise_data": response_data
            }

            return Response(batch_data)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
  