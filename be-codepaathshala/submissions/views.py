from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.models import User, UserProfile
from batches.models import Assignments, MCQAssignment, MCQQuestions, VideoLectures
from services.authentication import CJAuthentication
from services.permissions import UserAuthenticated
from submissions.assignment.AI_evaluations import AI_evaluation
from submissions.frontendEvaluate.fe_evaluate import CreateFrontendSubmission
from submissions.models import AssignmentSubmission, CodeSubmission, MCQSubmission, AssignmentSubmissionFile, UserScoreData, UserActivity
from submissions.problem.batch_submission import CreateProblemSubmission
from submissions.runcode import CodeRunner
from submissions.serializers import CodeSubmissionSerializer, AssignmentSubmissionFileSerializer, AssignmentSubmissionSerializer
from submissions.utils import calculate_marks

class CompileRunProblemAPI(APIView):

    def post(self, request, *args, **kwargs):
        # Accessing batch_name and problem_id from query parameters
        batch_name = request.query_params.get('batch_name')
        problem_id = request.query_params.get('problem_id')

        source_code = request.data.get('source_code')
        language_id = str(request.data.get('language_id'))
        stdin = request.data.get('stdin')
        
        result = CodeRunner(source_code, language_id, stdin, problem_id, batch_name)
        print(result)
        return Response(result)

class CreateProblemSubmissionAPI(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request, *args, **kwargs):
        batch_name = request.query_params.get('batch_name')
        problem_id = request.query_params.get('problem_id')

        source_code = request.data.get('source_code')
        language_id = str(request.data.get('language_id'))
        stdin = request.data.get('stdin')
        time_taken = request.data.get('time_taken')
        user_id = self.request.user.get('id')
        user = User.objects.get(pk=user_id)
        try:
            UserActivity.objects.create(user = user, content_type = "P", batch_name = batch_name)
        except:
            print("Unable to log User Activity")
                    
        result = CreateProblemSubmission(user, source_code, language_id, stdin, time_taken, batch_name, problem_id)
        print(result)
        return Response(result)
    
class AssessmentCreateProblemSubmissionAPI(APIView):
    def post(self, request, *args, **kwargs):
        batch_name = request.query_params.get('batch_name')
        problem_id = request.query_params.get('problem_id')

        source_code = request.data.get('source_code')
        language_id = str(request.data.get('language_id'))
        stdin = request.data.get('stdin')
        time_taken = request.data.get('time_taken')
        user = User.objects.get(pk=4)
        result = CreateProblemSubmission(user, source_code, language_id, stdin, time_taken, batch_name, problem_id)
        print(result)
        return Response(result)
    
class FrontendEvaluationView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request, *args, **kwargs):
        batch_name = request.query_params.get('batch_name')
        problem_id = request.query_params.get('problem_id')
        user_id = self.request.user.get('id')
        user = User.objects.get(pk=user_id)
        try:
            UserActivity.objects.create(user = user, content_type = "P", batch_name = batch_name)
        except:
            print("Unable to log User Activity")
                    
        htmlCode = request.data.get('htmlCode')
        cssCode = request.data.get('cssCode')
        jsCode = request.data.get('jsCode')

        totalTestCases= request.data.get('totalTestCases')
        passedTests= request.data.get('passedTests')
        failedTests= request.data.get('failedTests')

        result = CreateFrontendSubmission(user, problem_id, htmlCode, cssCode, jsCode, passedTests, failedTests, batch_name)
        print(result)
        return Response(result)

class CreateAssignmentSubmissionAPI(APIView):
    
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request, *args, **kwargs):
        batch_name = request.query_params.get('batch_name')
        assignment_id = request.query_params.get('assignment_id')
        user_id = self.request.user.get('id')
        user = User.objects.get(pk=user_id)
        user_profile = UserProfile.objects.get(user=user)

        try:
            UserActivity.objects.create(user = user, content_type = "A", batch_name = batch_name)
        except:
            print("Unable to log User Activity")
            
        editor_data = request.data.get("editor_data")
        link = request.data.get("link")

        assignment = Assignments.objects.get(id=assignment_id)
        description = assignment.description
        grading_prompt = assignment.grading_prompt
        solution = assignment.solution
        user_solution = editor_data
        result = AI_evaluation(description, user_solution, solution, grading_prompt)


        submission = AssignmentSubmission(
           user=user,
           assignment=assignment,
           text_source=editor_data,
           batch_name=batch_name,
           file=link,
           score=result['final_score'],
           feedback=result['feedback']
        )
        print(submission)
        submission.save()
        user_profile.assignment_Submission.add(assignment)
        
        try:
            diff_level = int(assignment.difficulty_level)
            Calculated_score = (int(result['final_score'])*diff_level*20)/100
            max_score = diff_level*20
        except:
            Calculated_score = 0
            max_score = 0
        # Record data in high level table
        try:
            user_score_data = UserScoreData.objects.get(
                user=user,
                content_id=assignment_id,
                type='A'
            )
            # Update the score if the new score is greater than the existing score
            existing_score = float(user_score_data.score)
            if Calculated_score > existing_score:
                user_score_data.score = Calculated_score
                user_score_data.title = assignment.title
                user_score_data.maximum_possible_score = max_score
                user_score_data.batch_name = batch_name
                user_score_data.save()
        except UserScoreData.DoesNotExist:
            # Create a new record if it doesn't exist
            UserScoreData.objects.create(
                user=user,
                content_id=assignment_id,
                type='A',
                title=assignment.title,
                score=Calculated_score,
                maximum_possible_score=max_score,
                batch_name=batch_name
            )
        message = f"Your submission was successful. \n You have scored {result['final_score']}% \n Feedback: {result['feedback']}"
        return Response(
            {"success": True, 
             "message": message,
             "score": result['final_score']
             }
        )

class UploadAssignmentSubmissionAPI(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request):
        data = request.data
        data['user'] = self.request.user.get('id')
        serializer = AssignmentSubmissionFileSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UploadOpenAssignmentSubmissionAPI(APIView):
    def post(self, request):
        data = request.data
        data['user'] = 2341
        serializer = AssignmentSubmissionFileSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteAssignmentSubmissionAPI(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def delete(self, request, pk):
        try:
            document = AssignmentSubmissionFile.objects.get(pk=pk)
        except AssignmentSubmissionFile.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        # Delete the file from S3
        document.file.delete()
        # Delete the document entry from the database
        document.delete()
        return Response({'Assignment deleted successfully': 'Document not found'}, status=status.HTTP_204_NO_CONTENT)

class MarkVideoAsWatchedAPI(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def post(self, request, *args, **kwargs):
        video_id = request.query_params.get('video_id')
        user_id = self.request.user.get('id')
        user = User.objects.get(pk=user_id)
        user_profile = UserProfile.objects.get(user=user)
        new_score = request.data.get('new_score', 10)  # Default value is 10
        batch_name = request.data.get('batch_name', 'default')
        current_video = get_object_or_404(VideoLectures, id=video_id)
        try:
            user_score_data = UserScoreData.objects.get(
                user=user,
                content_id=video_id,
                type='V'
            )
            # Update the score if the new score is greater than the existing score
            existing_score = float(user_score_data.score)
            if new_score > existing_score:
                user_score_data.score = new_score
                user_score_data.title = current_video.title
                user_score_data.maximum_possible_score = 10
                user_score_data.batch_name = batch_name
                user_score_data.save()
                user_profile.total_Score += new_score - existing_score
                user_profile.save()
        except UserScoreData.DoesNotExist:
            # Create a new record if it doesn't exist
            UserScoreData.objects.create(
                user=user,
                content_id=video_id,
                type='V',
                title=current_video.title,
                score=new_score,
                maximum_possible_score=10,
                batch_name=batch_name
            )
            user_profile.total_Score += new_score
            user_profile.save()
        user_profile.watched_videos.add(current_video)

        return Response({"message": "Marked this video as watched"})
        


class ViewWatchedVideoAPI(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request, *args, **kwargs):
        video_id = request.query_params.get('video_id')
        user_id = self.request.user.get('id')
        user = User.objects.get(pk=user_id)
        user_profile = UserProfile.objects.get(user=user)

        video = get_object_or_404(VideoLectures, id=video_id)
        if user_profile.watched_videos.filter(id=video.id).exists():
            return Response({"watched": True})
        else:
            return Response({"watched": False})

class UserProblemSubmissionListView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = request.user['id']
        problem_id = request.query_params.get('problem_id')
        if not problem_id:
            return Response({'error': 'Problem ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            submissions = CodeSubmission.objects.filter(user=user, problem_id=problem_id)
            serializer = CodeSubmissionSerializer(submissions, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserAssignmentPastSubmissionsListView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request, *args, **kwargs):
        user = request.user['id']
        assignment_id = request.query_params.get('assignment_id')
        if not assignment_id:
            return Response({'error': 'Assignment ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            submissions = AssignmentSubmission.objects.filter(user=user, assignment_id=assignment_id)
            serializer =  AssignmentSubmissionSerializer(submissions, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class MCQAssignmentSubmissionEvalutationView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user_id = request.user['id']
        user = User.objects.get(id=user_id)
        mcq_assignment_id = request.query_params.get('mcq_assignment_id')
        if not mcq_assignment_id:
            return Response({'error': 'MCQ Assignment ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            mcq_assignment = MCQAssignment.objects.get(id=mcq_assignment_id)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        data = request.data
        total_score=0
        total_marks=0
        response_single = data['single-correct']
        response_multi = data['multi-correct']
        batch_name = data['batch_name']
        
        try:
            UserActivity.objects.create(user = user, content_type = "M", batch_name = batch_name)
        except:
            print("Unable to log User Activity")

        marks_obtained, maximum_marks, correct_ids, incorrect_ids = calculate_marks(response_single, response_multi)

        percentage_score = (marks_obtained / maximum_marks) * 100

        userprofile = UserProfile.objects.get(user = user)
        if percentage_score>=33:
            userprofile.mcq_assignments.add(mcq_assignment)


        submission = MCQSubmission.objects.create(
            user=user,
            responseSheet=data,
            mcq=mcq_assignment,
            batch_name=batch_name,
            score=marks_obtained,
            correct_question_ids = ",".join(correct_ids),
            wrong_question_ids = ",".join(incorrect_ids),
            result='Passed' if percentage_score >= 33 else 'Failed'
        )

        try:
            user_score_data = UserScoreData.objects.get(
                user=user,
                content_id=mcq_assignment_id,
                type='M'
            )
            # Update the score if the new score is greater than the existing score
            existing_score = float(user_score_data.score)
            if marks_obtained > existing_score:
                user_score_data.score = marks_obtained
                user_score_data.title = mcq_assignment.title
                user_score_data.maximum_possible_score = maximum_marks
                user_score_data.batch_name = batch_name
                user_score_data.save()
                userprofile.total_Score += marks_obtained - existing_score
                userprofile.save()
        except UserScoreData.DoesNotExist:
            # Create a new record if it doesn't exist
            UserScoreData.objects.create(
                user=user,
                content_id=mcq_assignment_id,
                type='M',
                title=mcq_assignment.title,
                score=marks_obtained,
                maximum_possible_score=maximum_marks,
                batch_name=batch_name
            )

            userprofile.total_Score += marks_obtained
            userprofile.save()


        return Response({'success': 'true', 'marks_obtained':marks_obtained, 'total_marks':maximum_marks}, status=status.HTTP_201_CREATED)

class LogWatchedVideo(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            # video_id = request.query_params.get('video_id')
            user_id = self.request.user.get('id')
            user = User.objects.get(pk=user_id)
            batch_name = request.query_params.get('batch_name')
            try:
                UserActivity.objects.create(user = user, content_type = "V", batch_name = batch_name)
            except:
                print("Unable to log User Activity")

            return Response("Video Logged", status=status.HTTP_200_OK)
        except:
            return Response("Unable to log video", status=status.HTTP_400_BAD_REQUEST)