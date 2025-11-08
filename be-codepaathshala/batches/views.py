from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.models import UserProfile
from submissions.models import MCQSubmission, UserScoreData
from .models import Batch, ChildBatch, Lesson, MCQAssignment
from .serializers import ChildBatchSerializer, MCQAssignmentSerializer
from services.authentication import CJAuthentication
from services.permissions import UserAuthenticated
from django.db.models import Q

class UserAssociatedBatchListView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        try:
            user = request.user['id']
            user_profile = UserProfile.objects.get(user=user)
            child_batches = user_profile.assosiatedbatches.all()
            user_watched_videos = set(user_profile.watched_videos.values_list('id', flat=True))
            user_solved_problems = set(user_profile.solved_problems.values_list('id', flat=True))
            user_assignment_submissions = set(user_profile.assignment_Submission.values_list('id', flat=True))
            user_mcq_assignments = set(user_profile.mcq_assignments.values_list('id', flat=True))
        
            child_batches = child_batches.prefetch_related(
                'parentbatch__lesson_set__video',
                'parentbatch__lesson_set__problem',
                'parentbatch__lesson_set__assignment',
                'parentbatch__lesson_set__MCQ_assignment'
            )


            data = []

            for child_batch in child_batches:
                parent_batch = child_batch.parentbatch
                lessons = parent_batch.lesson_set.all()

                total_videos = lessons.filter(video_id__isnull=False).count()
                total_problems = lessons.filter(problem_id__isnull=False).count()
                total_assignments = lessons.filter(assignment_id__isnull=False).count()
                total_mcq_assignments = lessons.filter(MCQ_assignment_id__isnull=False).count()

                completed_videos_queryset = lessons.filter(video_id__in=user_watched_videos)
                completed_problems_queryset = lessons.filter(problem_id__in=user_solved_problems)
                completed_assignments_queryset = lessons.filter(assignment_id__in=user_assignment_submissions)
                completed_mcq_assignments_queryset = lessons.filter(MCQ_assignment_id__in=user_mcq_assignments)

                completed_videos = completed_videos_queryset.count()
                completed_problems = completed_problems_queryset.count()
                completed_assignments = completed_assignments_queryset.count()
                completed_mcq_assignments = completed_mcq_assignments_queryset.count()
                
                video_info = [(lesson.video.pk, 'V') for lesson in completed_videos_queryset]
                problem_info = [(lesson.problem.pk, 'P') for lesson in completed_problems_queryset]
                assignment_info = [(lesson.assignment.pk, 'A') for lesson in completed_assignments_queryset]
                mcq_assignment_info = [(lesson.MCQ_assignment.pk, 'M') for lesson in completed_mcq_assignments_queryset]
                
                all_info = video_info + problem_info + assignment_info + mcq_assignment_info
                query = Q()

                for pk, type in all_info:
                    query |= Q(user = user, content_id = pk, type = type )

                # Loop through each child batch and get the user's score
                # Filter the child batches with the common parent batch
                child_batches_with_common_parent = ChildBatch.objects.filter(parentbatch=parent_batch)
                
                # Initialize the best score
                best_score = Decimal('0')
                if len(all_info) != 0:
                    for cb in child_batches_with_common_parent:
                        all_scores = UserScoreData.objects.filter(query).values('score')
                        if all_scores:
                            max_score = sum(Decimal(score['score']) for score in all_scores if score['score'])
                            if max_score:
                                best_score = max(best_score, max_score)

                total_score = best_score
                total_lessons = lessons.count()
                completed_lessons = completed_videos + completed_problems + completed_assignments + completed_mcq_assignments

                child_batch_data = ChildBatchSerializer(child_batch).data
                child_batch_data.update({
                    'total_videos': total_videos,
                    'completed_videos': completed_videos,
                    'total_problems': total_problems,
                    'completed_problems': completed_problems,
                    'total_assignments': total_assignments,
                    'completed_assignments': completed_assignments,
                    'total_mcq_assignments': total_mcq_assignments,
                    'completed_mcq_assignments': completed_mcq_assignments,
                    'total_lessons': total_lessons,
                    'completed_lessons': completed_lessons,
                    'total_score': total_score,
                })
                data.append(child_batch_data)

            return Response(data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
class UserBatchDetailsView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get(self, request):
        try:
            user_id = request.user['id']
            user_profile = UserProfile.objects.get(user=user_id)
            child_batch_id = request.query_params.get('batch_id')
            child_batch = ChildBatch.objects.get(id=child_batch_id)
            if user_profile.assosiatedbatches.filter(id=child_batch_id).exists():
                serializer = ChildBatchSerializer(child_batch)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        except ChildBatch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)
        

class MCQAssignmentsView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get(self, request):
        mcq_assignment_id = request.query_params.get('mcq_assignment_id')
        batch_name = request.query_params.get('batch_name')
        user = self.request.user.get('id')
        if mcq_assignment_id and batch_name:
            try:
                mcq_assignment = MCQAssignment.objects.get(id=mcq_assignment_id)
            except MCQAssignment.DoesNotExist:
                return Response({"error": "MCQ Assignment does not exist"}, status=status.HTTP_404_NOT_FOUND)

            try:
                child_batch = ChildBatch.objects.get(name=batch_name)
            except ChildBatch.DoesNotExist:
                return Response({'error': 'Batch not found'}, status=404)
            

            # ? checking if the attempts are there if no then make can_solve false
            lesson=Lesson.objects.filter(batch=child_batch.parentbatch,type='M',MCQ_assignment_id=mcq_assignment_id).first()
            mcq_data = {
                "id": mcq_assignment.id,
                "title": mcq_assignment.title,
                "questions": [],
                "can_solve":True,
                "week_number": lesson.week_number if lesson else None,
            }
            user_submission=MCQSubmission.objects.filter(user=user,batch_name=child_batch.name, mcq_id=mcq_assignment_id).count()
            if(lesson and lesson.attempts):
                attempts= lesson.attempts - user_submission 
                mcq_data['can_solve']=True if attempts>0 else False


            for question in mcq_assignment.questions.all():
                mcq_data["questions"].append({
                    "type": "single-correct",
                    "questionNumber": "sc"+str(question.id),
                    "question_text": question.question_text,
                    "choices": [question.option_a, question.option_b, question.option_c, question.option_d],
                    "difficulty_level":question.difficulty_level,
                    "correct_answer":question.correct_answer,
                    "topic":question.topic
                })
            
            for question in mcq_assignment.multicorrectmcqs.all():
                mcq_data["questions"].append({
                    "type": "multi-correct",
                    "questionNumber": "mc"+ str(question.id),
                    "question_text": question.question_text,
                    "choices": [question.option_a, question.option_b, question.option_c, question.option_d],
                    "difficulty_level":question.difficulty_level,
                    "correct_answer":question.correct_answers,
                    "topic":question.topic
                })
            return Response(mcq_data, status=status.HTTP_200_OK)
        else:
            return Response({"error": "MCQ Assignment ID and batch name is required"}, status=status.HTTP_400_BAD_REQUEST)