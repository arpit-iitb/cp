# views.py
import json
from accounts.models import UserProfile,User
from batches.models import Assignments, Batch, ChildBatch, Lesson, MCQAssignment, Problem, ProblemReport, VideoLectures, Text
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q

from batches.serializers import MCQAssignmentSerializer
from services.authentication import CJAuthentication
from services.permissions import UserAuthenticated
from submissions.models import AssignmentSubmission, CodeSubmission, MCQSubmission, UserScoreData
from submissions import utils
from .serializers import AssignmentsSerializer, LessonSerializer, ProblemReportSerializer, ProblemSerializer, VideoLecturesSerializer, TextSerializer

class LessonListAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get(self, request):
        batch_name = request.GET.get('batch_name')
        user = self.request.user.get('id')
        try:
            child_batch = ChildBatch.objects.get(name=batch_name)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=404)

        user_profile = UserProfile.objects.filter(user=user, assosiatedbatches=child_batch).first()

        if not user_profile:
            return Response({'error': 'Access denied. User does not have associated batch with the specified name.'}, status=403)

        # Access the parent batch name
        parent_batch = child_batch.parentbatch
        parent_batch = Batch.objects.get(name=parent_batch)
        client_name = parent_batch.client.name
        logo = parent_batch.client.logo

        queryset = Lesson.objects.filter(batch=parent_batch).select_related('problem', 'video', 'assignment', 'MCQ_assignment', 'Text')
        week_numbers = set(queryset.values_list('week_number', flat=True))
        response_data = []

        for week_number in week_numbers:
            week_lessons = queryset.filter(week_number=week_number)
            total_lessons = week_lessons.count()
            serialized_lessons = []

            weekly_topics_json = json.loads(parent_batch.weekly_topics) if parent_batch.weekly_topics else {}
            topic_description = weekly_topics_json.get(str(week_number), "")

            total_videos = week_lessons.filter(video_id__isnull=False).count()
            total_problems = week_lessons.filter(problem_id__isnull=False).count()
            total_assignments = week_lessons.filter(assignment_id__isnull=False).count()
            total_mcq_assignments = week_lessons.filter(MCQ_assignment_id__isnull=False).count()

            completed_videos = week_lessons.filter(video_id__in=user_profile.watched_videos.values_list('id', flat=True)).count()
            completed_problems= week_lessons.filter(problem_id__in=user_profile.solved_problems.values_list('id', flat=True)).count()
            completed_assignments = week_lessons.filter(assignment_id__in=user_profile.assignment_Submission.values_list('id', flat=True)).count()
            completed_mcq_assignments = week_lessons.filter(MCQ_assignment_id__in=user_profile.mcq_assignments.values_list('id', flat=True)).count()

            total_lessons_completed= completed_assignments+completed_mcq_assignments+completed_problems+completed_videos

            # for lesson in week_lessons:
            #     lesson_data = LessonSerializer(lesson).data

            #     # Check if the user has completed the lesson and set its status
            #     if lesson_data['type'] == 'P':
            #         lesson_data['id'] = lesson.problem_id
            #         problem = Problem.objects.get(id=lesson_data['id'])
            #         lesson_data['isFullStackProblem'] = problem.full_stack_evaluation
            #         lesson_data['status'] = 'completed' if lesson.problem_id in user_profile.solved_problems.values_list('id', flat=True) else 'pending'
            #     elif lesson_data['type'] == 'V':
            #         lesson_data['id'] = lesson.video_id
            #         lesson_data['status'] = 'completed' if lesson.video_id in user_profile.watched_videos.values_list('id', flat=True) else 'pending'
            #     elif lesson_data['type'] == 'A':
            #         lesson_data['id'] = lesson.assignment_id
            #         lesson_data['status'] = 'completed' if lesson.assignment_id in user_profile.assignment_Submission.values_list('id', flat=True) else 'pending'
            #     elif lesson_data['type'] == 'M':
            #         lesson_data['id'] = lesson.MCQ_assignment_id
            #         lesson_data['status'] = 'completed' if lesson.MCQ_assignment_id in user_profile.mcq_assignments.values_list('id', flat=True) else 'pending'

                # # Check if the lesson is completed and increment the total lessons completed
                # if lesson_data['status'] == 'completed':
                #     total_lessons_completed += 1
                
                # serialized_lessons.append(lesson_data)

            response_data.append({
                'week_number': int(week_number),
                'total_lessons': int(total_lessons),
                'canSolve': True,
                'total_lessons_completed': int(total_lessons_completed),
                'pending': 0,
                'topic_description': topic_description,
                'total_videos': total_videos,
                'total_assignments': total_assignments,
                'total_mcq_assignments': total_mcq_assignments,
                'total_problems': total_problems,
                'completed_videos': completed_videos,
                'completed_problems': completed_problems,
                'completed_assignments': completed_assignments,
                'completed_mcq_assignments': completed_mcq_assignments,
            })
        
        batch_data = {
            "client_name" : client_name,
            "logo":logo,
            "weekwise_data": response_data
        }

        return Response(batch_data)

class LessonListWeekAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get(self, request,weeknumber):
        batch_name = request.GET.get('batch_name')
        user = self.request.user.get('id')
        try:
            child_batch = ChildBatch.objects.get(name=batch_name)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=404)

        user_profile = UserProfile.objects.filter(user=user, assosiatedbatches=child_batch).first()

        if not user_profile:
            return Response({'error': 'Access denied. User does not have associated batch with the specified name.'}, status=403)

        # Access the parent batch name
        parent_batch = child_batch.parentbatch
        week_lessons = Lesson.objects.filter(batch=parent_batch,week_number=weeknumber).select_related('problem', 'video', 'assignment', 'MCQ_assignment','Text')

        problem_ids = week_lessons.values_list('problem_id', flat=True)
        video_ids = week_lessons.values_list('video_id', flat=True)
        assignment_ids = week_lessons.values_list('assignment_id', flat=True)
        mcq_assignment_ids = week_lessons.values_list('MCQ_assignment_id', flat=True)
        Text_ids = week_lessons.values_list('Text_id', flat=True)

        content_ids = set(problem_ids).union(video_ids, assignment_ids, mcq_assignment_ids,Text_ids)
        user_score_data = UserScoreData.objects.filter(content_id__in=content_ids)

        code_submissions = CodeSubmission.objects.filter(user=user,batch_name=child_batch.name, problem_id__in=problem_ids).values_list('problem_id', flat=True)
        assignment_submissions = AssignmentSubmission.objects.filter(user=user,batch_name=child_batch.name, assignment_id__in=assignment_ids).values_list('assignment_id', flat=True)
        mcq_submissions = MCQSubmission.objects.filter(user=user,batch_name=child_batch.name, mcq_id__in=mcq_assignment_ids).values_list('mcq_id', flat=True)

        response_data = {}
        serialized_lessons = []

        for lesson in week_lessons:
            lesson_data = LessonSerializer(lesson).data

            # Check if the user has completed the lesson and set its status
            if lesson_data['type'] == 'P':
                lesson_data['id'] = lesson.problem_id
                user_score = UserScoreData.objects.filter(user=user, type='P', content_id=lesson_data['id']).first()
                problem = Problem.objects.get(id=lesson_data['id'])
                problem_submissions=code_submissions.filter(problem_id=lesson.problem_id).count() if code_submissions.exists() else 0
                if(lesson.attempts):
                    lesson_data['attempts']=lesson.attempts - problem_submissions if lesson.attempts>problem_submissions else 0
                else: 
                    lesson_data['attempts']=lesson.attempts
                lesson_data['score'] = user_score.score if user_score else 0
                lesson_data['maximum_possible_score'] = int(problem.difficulty_level)*50
                lesson_data['isFullStackProblem'] = problem.full_stack_evaluation
                lesson_data['status'] = 'completed' if lesson.problem_id in user_profile.solved_problems.values_list('id', flat=True) else 'unsolved'
            elif lesson_data['type'] == 'V':
                lesson_data['id'] = lesson.video_id
                user_score = UserScoreData.objects.filter( user=user, type='V', content_id=lesson_data['id']).first()
                lesson_data['score'] = user_score.score if user_score else 0
                lesson_data['maximum_possible_score'] = 10
                lesson_data['status'] = 'completed' if lesson.video_id in user_profile.watched_videos.values_list('id', flat=True) else 'unsolved'
                video=VideoLectures.objects.get(id=lesson.video_id)
                lesson_data['video_duration']=video.duration
            elif lesson_data['type'] == 'A':
                lesson_data['id'] = lesson.assignment_id
                assignment_submission=assignment_submissions.filter(assignment_id=lesson.assignment_id).count() if assignment_submissions.exists() else 0
                if(lesson.attempts):
                    lesson_data['attempts']=lesson.attempts - assignment_submission if lesson.attempts>assignment_submission else 0
                else: 
                    lesson_data['attempts']=lesson.attempts
                assignment = Assignments.objects.get(id = lesson.assignment_id)
                user_score = UserScoreData.objects.filter( user=user, type='A', content_id=lesson_data['id']).first()
                lesson_data['score'] = user_score.score if user_score else 0
                lesson_data['maximum_possible_score'] = int(assignment.difficulty_level)*20
                lesson_data['status'] = 'completed' if lesson.assignment_id in user_profile.assignment_Submission.values_list('id', flat=True) else 'unsolved'
            elif lesson_data['type'] == 'M':
                lesson_data['id'] = lesson.MCQ_assignment_id
                mcq_submission=mcq_submissions.filter(mcq_id=lesson.MCQ_assignment_id).count() if mcq_submissions.exists() else 0
                if(lesson.attempts):
                    lesson_data['attempts']=lesson.attempts - mcq_submission if lesson.attempts>mcq_submission else 0
                else: 
                    lesson_data['attempts']=lesson.attempts
                user_score = UserScoreData.objects.filter( user=user, type='M', content_id=lesson_data['id']).first()
                lesson_data['score'] = user_score.score if user_score else 0
                lesson_data['maximum_possible_score'] = utils.max_marks_mcq_assignment(lesson.MCQ_assignment_id)
                lesson_data['status'] = 'completed' if lesson.MCQ_assignment_id in user_profile.mcq_assignments.values_list('id', flat=True) else 'unsolved'
            
            elif lesson_data['type'] == 'T':
                lesson_data['id'] = lesson.Text_id
                lesson_data['attempts']=lesson.attempts
                text = Text.objects.get(id = lesson.Text_id)
                user_score = UserScoreData.objects.filter( user=user, type='T', content_id=lesson_data['id']).first()
                lesson_data['score'] = user_score.score if user_score else 0
                lesson_data['maximum_possible_score'] = int(text.difficulty_level)*20
                lesson_data['status'] = 'unsolved'

            serialized_lessons.append(lesson_data)

        response_data['lessons'] = serialized_lessons

        return Response(response_data)
    

class ProblemReportCreateView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def post(self, request, problem_id, format=None):
        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found'}, status=status.HTTP_404_NOT_FOUND)
        
        request.data['problem_id'] = problem_id
        serializer = ProblemReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': 'Problem Report created'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
class ProblemAPIView(APIView):
    # ? authentication added in this api
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        problem_id = request.query_params.get('problem_id')
        batch_name = request.query_params.get('batch_name')
        user = self.request.user.get('id')

        if not problem_id or not batch_name:
            return Response({'error': 'Problem ID and batch name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            child_batch = ChildBatch.objects.get(name=batch_name)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=404)
        

        # Access the parent batch name
        parent_batch = child_batch.parentbatch
        parent_batch = Batch.objects.get(name=parent_batch)
        language = parent_batch.language

        try:
            problem = Problem.objects.get(pk=problem_id)
            
            # Check if full_stack_evaluation is True, if yes, include test cases
            if problem.full_stack_evaluation:
                serializer = ProblemSerializer(problem, context={'request': request})
            else:
                serializer = ProblemSerializer(problem)
                
            data = serializer.data

            # Check if there are any template_codes
            if data.get('template_codes'):
                # Set default_language to the language of the first template_code
                data['default_language'] = data['template_codes'][0]['language']
            else:
                # If no template_codes, use the provided default language
                data['default_language'] = language

            
            lesson=Lesson.objects.filter(batch=parent_batch,type='P',problem_id=problem_id).first()
            user_submission=CodeSubmission.objects.filter(user=user,batch_name=child_batch.name, problem_id=problem_id).count()
            data['can_solve']=True
            data['week_number']=lesson.week_number if lesson else None
            if(lesson and lesson.attempts):
                attempts= lesson.attempts - user_submission 
                data['can_solve']=True if attempts>0 else False

            data['batch_name'] = batch_name
            return Response(data)
        
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found'}, status=status.HTTP_404_NOT_FOUND)
        

class VideoLecturesAPIView(APIView):
    def get(self, request):
        video_lecture_id = request.query_params.get('video_lecture_id')
        batch_name = request.query_params.get('batch_name')
        try:
            child_batch = ChildBatch.objects.get(name=batch_name)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=404)
        
        if not video_lecture_id:
            return Response({'error': 'Video lecture ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            video_lecture = VideoLectures.objects.get(pk=video_lecture_id)
            serializer = VideoLecturesSerializer(video_lecture)
            data = serializer.data
            data['batch_name'] = batch_name
            lesson=Lesson.objects.filter(batch=child_batch.parentbatch,type='V',video_id=video_lecture_id).first()
            data['week_number']=lesson.week_number if lesson else None
            return Response(data)
        except VideoLectures.DoesNotExist:
            return Response({'error': 'Video lecture not found'}, status=status.HTTP_404_NOT_FOUND)

class TextAPIView(APIView):
    def get(self, request):
        text_id = request.query_params.get('text_id')
        batch_name = request.query_params.get('batch_name')
        try:
            child_batch = ChildBatch.objects.get(name=batch_name)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=404)
        
        if not text_id:
            return Response({'error': 'Text ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            text = Text.objects.get(pk=text_id)
            serializer = TextSerializer(text)
            data = serializer.data
            data['batch_name'] = batch_name
            lesson=Lesson.objects.filter(batch=child_batch.parentbatch, type='T', Text_id=text_id).first()
            data['week_number']=lesson.week_number if lesson else None
            return Response(data)
        except Text.DoesNotExist:
            return Response({'error': 'Text not found'}, status=status.HTTP_404_NOT_FOUND)


class AssignmentsAPIView(APIView):
    # ? authentication added in this api
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        assignment_id = request.query_params.get('assignment_id')
        batch_name = request.query_params.get('batch_name')
        user = self.request.user.get('id')
        
        if not assignment_id or not batch_name:
            return Response({'error': 'Assignment ID and Batch name is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            child_batch = ChildBatch.objects.get(name=batch_name)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=404)
        

        try:
            assignment = Assignments.objects.get(pk=assignment_id)
            serializer = AssignmentsSerializer(assignment)
            data = serializer.data
            data['batch_name'] = batch_name
            lesson=Lesson.objects.filter(batch=child_batch.parentbatch,type='A',assignment_id=assignment_id).first()
            user_submission=AssignmentSubmission.objects.filter(user=user,batch_name=child_batch.name, assignment_id=assignment_id).count()
            data['can_solve']=True
            data['week_number']=lesson.week_number if lesson else None
            if(lesson and lesson.attempts):
                attempts= lesson.attempts - user_submission 
                data['can_solve']=True if attempts>0 else False
            return Response(data)
        except Assignments.DoesNotExist:
            return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)
        

class LeaderboardAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get(self, request):
        batch_name = request.query_params.get('batch_name')

        if not batch_name:
            return Response({'error': 'Batch name is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve user profiles associated with the specified batch name
        id = self.request.user.get('id')
        user = User.objects.get(id=id)
        if(user.is_staff):
            user_profiles = UserProfile.objects.filter(assosiatedbatches__name=batch_name)
        else:
            user_profiles = UserProfile.objects.filter(assosiatedbatches__name=batch_name,user__is_staff=False)
            

        # Sort user profiles based on their total score in descending order
        sorted_profiles = user_profiles.order_by('-total_Score')

        # Calculate ranks for each user profile
        for rank, profile in enumerate(sorted_profiles, start=1):
            profile.rank = rank

        # Serialize the sorted list of user profiles along with their ranks
        serialized_profiles = [
            {
                'rank': profile.rank,
                'username': profile.user.name,
                'total_score': profile.total_Score,
                'identifier':profile.user.username,
                # Add other fields you want to include in the response
            }
            for profile in sorted_profiles
        ]
        
        user_name = user.username
        desired_identifier = user_name

        result_dict = next(item for item in serialized_profiles if item["identifier"] == desired_identifier)
        
        res = serialized_profiles[:10]

        if result_dict not in res:
            res.append(result_dict)

        return Response(res)
    

class ActiveDaysAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get(self, request):
        batch_name = request.query_params.get('batch_name')
        user = self.request.user.get('id')
        if not batch_name:
            return Response({'error': 'Batch name is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve user profiles associated with the specified batch name
        id = self.request.user.get('id')
        user = User.objects.get(id=id)
        if(user.is_staff):
            user_profiles = UserProfile.objects.filter(assosiatedbatches__name=batch_name)
        else:
            user_profiles = UserProfile.objects.filter(assosiatedbatches__name=batch_name,user__is_staff=False)
            
        # Sort user profiles based on their total score in descending order
        sorted_profiles = user_profiles.order_by('-current_streak')[:3]

        # Calculate ranks for each user profile
        for rank, profile in enumerate(sorted_profiles, start=1):
            profile.rank = rank

        # Serialize the sorted list of user profiles along with their ranks
        serialized_profiles = [
            {
                'rank': profile.rank,
                'username': profile.user.name,
                'activeDays': profile.current_streak,
                # Add other fields you want to include in the response
            }
            for profile in sorted_profiles
        ]

        return Response(serialized_profiles)
    

class NextLesson(APIView):
    def post(self, request):
        batch_name = request.query_params.get('batch_name')

        if not batch_name:
            return Response({'error': 'Batch name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        type = request.data.get('type')
        title = request.data.get('title')
        id = request.data.get('id')

        print(type, title, id)
        try:
            child_batch = ChildBatch.objects.get(name=batch_name)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=404)
        
        parent_batch = child_batch.parentbatch

        if type == 'P':
            problem = Problem.objects.get(id = id)
            current_lesson = Lesson.objects.get(batch=parent_batch, type=type, problem=problem)
        elif type == 'A':
            assignment = Assignments.objects.get(id = id)
            current_lesson = Lesson.objects.get(batch=parent_batch, type=type, assignment=assignment)

        elif type == 'V':
            video = VideoLectures.objects.get(id = id)
            current_lesson = Lesson.objects.get(batch=parent_batch, type=type, video=video)
        
        elif type == 'M':
            mcq_assignment = MCQAssignment.objects.get(id = id)
            current_lesson = Lesson.objects.get(batch=parent_batch, type=type, MCQ_assignment=mcq_assignment)

        priority_order = current_lesson.priority_order
        print(priority_order)
        # Get the next lesson based on priority order
        next_lesson = Lesson.objects.filter(
            batch=parent_batch,
            priority_order__gte=current_lesson.priority_order,
            id__gt=current_lesson.id
        ).order_by('priority_order').first()

        if next_lesson:
            # Next lesson found
            if next_lesson.type == 'P':
                serializer = ProblemSerializer(next_lesson.problem)
            elif next_lesson.type == 'A':
                serializer = AssignmentsSerializer(next_lesson.assignment)
            elif next_lesson.type == 'V':
                serializer = VideoLecturesSerializer(next_lesson.video)
            elif next_lesson.type == 'M':
                serializer = MCQAssignmentSerializer(next_lesson.MCQ_assignment)
            
            # Serialize the next lesson data
            serialized_data = serializer.data
            return Response(serialized_data)
        else:
            # No next lesson found
            return Response({'message': 'No next lesson found.'})
        
class PrevLesson(APIView):
    def post(self, request):
        batch_name = request.query_params.get('batch_name')

        if not batch_name:
            return Response({'error': 'Batch name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        type = request.data.get('type')
        title = request.data.get('title')
        id = request.data.get('id')

        print(type, title, id)
        try:
            child_batch = ChildBatch.objects.get(name=batch_name)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=404)
        
        parent_batch = child_batch.parentbatch

        if type == 'P':
            problem = Problem.objects.get(id = id)
            current_lesson = Lesson.objects.get(batch=parent_batch, type=type, problem=problem)
        elif type == 'A':
            assignment = Assignments.objects.get(id = id)
            current_lesson = Lesson.objects.get(batch=parent_batch, type=type, assignment=assignment)

        elif type == 'V':
            video = VideoLectures.objects.get(id = id)
            current_lesson = Lesson.objects.get(batch=parent_batch, type=type, video=video)
        
        elif type == 'M':
            mcq_assignment = MCQAssignment.objects.get(id = id)
            current_lesson = Lesson.objects.get(batch=parent_batch, type=type, MCQ_assignment=mcq_assignment)

        priority_order = current_lesson.priority_order
        print(priority_order)
        # Get the next lesson based on priority order
        prev_lesson = Lesson.objects.filter(
            batch=parent_batch,
            priority_order__lte=priority_order,
            id__lt=current_lesson.id  # Exclude the current lesson
        ).order_by('priority_order').first()

        if prev_lesson:
            # Next lesson found
            if prev_lesson.type == 'P':
                serializer = ProblemSerializer(prev_lesson.problem)
            elif prev_lesson.type == 'A':
                serializer = AssignmentsSerializer(prev_lesson.assignment)
            elif prev_lesson.type == 'V':
                serializer = VideoLecturesSerializer(prev_lesson.video)
            elif prev_lesson.type == 'M':
                serializer = MCQAssignmentSerializer(prev_lesson.MCQ_assignment)
            
            # Serialize the next lesson data
            serialized_data = serializer.data
            return Response(serialized_data)
        else:
            # No next lesson found
            return Response({'message': 'No prev lesson found.'})
        
        
class GetPracticeQuestions(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get(self, request):
        vid_id = request.GET.get('video_id')
        try:
            video = VideoLectures.objects.get(pk = vid_id)
        except:
            return Response({'message': 'Video Lecture not found or Invalid Video_ID.'}, status= status.HTTP_400_BAD_REQUEST)

        if not video.practice_questions:
            return Response({'message': 'No practice questions for this Video Lecture.'}, status= status.HTTP_204_NO_CONTENT)
        else:
            return Response(video.practice_questions, status= status.HTTP_200_OK)