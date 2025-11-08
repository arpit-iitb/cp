import csv
import json
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.models import User, UserProfile
from apis.serializers import ProblemSerializer
from assessment_V2.serializer import AssessmentSerializer
from assessment_V2.v2grade import grade_submission
from services.authentication import CJAuthentication
from services.permissions import UserAuthenticated
from .models import Assessment_v2, AssessmentItem_v2, MCQSet, OpenAssessmentEvaluation_V2, ProblemSet, SubjectiveSet, AsessmentResultMeta, AssessmentResultVerbose
from random import randint, sample
from batches.serializers import MCQQuestionsSerializer, AssignemntsSerializer
from itertools import chain
from django.forms.models import model_to_dict
from assessment_V2.runcode import CodeRunner
# Create your views here.
from rest_framework.views import APIView
from django.db.models import Avg, Count
from celery.result import AsyncResult
from batches.models import Problem, MCQQuestions, MultiCorrectMCQs, Assignments
from datetime import datetime
from django.db.models import Sum, Case, When, FloatField

class UserAssessmentInfo(APIView):
    def get(self, request):
        try:
            assessment_id = request.query_params.get('assessment_id')
            assessment = Assessment_v2.objects.get(test_id=assessment_id)
        except IndexError:
            return Response({'error': 'Assessment ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        except Assessment_v2.DoesNotExist:
            return Response({"error": "Assessment does not exist"}, status=status.HTTP_404_NOT_FOUND)
        response_data = {
            "id": assessment.pk,
            "test_id" : assessment.test_id,
            "title": assessment.title,
            "proctored" : assessment.proctored,
            "brand_logo": assessment.brand_logo,
            "show_result" : assessment.show_result,
            "timed_assessment" :assessment.timed_assessments,
        }
        return Response(response_data, status=status.HTTP_200_OK)

class UserAssessmentQuestionsView(ListAPIView):
    def get(self, request):
        try:
            assessment_id = request.query_params.get('assessment_id')
            assessment = Assessment_v2.objects.get(test_id=assessment_id)
        except IndexError:
            return Response({'error': 'Assessment ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        except Assessment_v2.DoesNotExist:
            return Response({"error": "Assessment does not exist"}, status=status.HTTP_404_NOT_FOUND)

        assessment_items = AssessmentItem_v2.objects.filter(assessment=assessment).order_by('priority_order')

        response_data = {
        "id": assessment.pk,
        "test_id" : assessment.test_id,
        "title": assessment.title,
        "description": assessment.description,
        "passing_marks": assessment.passing_marks,
        "total_marks": assessment.Total_marks,
        "brand_logo": assessment.brand_logo,
        "duration": assessment.duration,
        "proctored" : assessment.proctored,
        "show_result" : assessment.show_result,
        "timed_assessment" :assessment.timed_assessments,
        "totalQuestions": assessment_items.count(),
        # "assessmentType": ["MCQ Question", "Subjective", "CodingProblem"],
        "max_violations": assessment.max_violations,
        "assessmentType": set(),
        "assessment_items": [],
        }

        for item in assessment_items:
            assessment_item_content = {
                "type"                   : "", 
                "title"                  : item.title,
                "duration"               : "",
                "easy_question_marks"    : item.easy_question_marks,
                "medium_question_marks"  : item.medium_question_marks,
                "hard_question_marks"    : item.hard_question_marks,
                "questions"              : [],
                
            }

            if item.sections_type == "M":
                response_data["assessmentType"].add("MCQ Question")
                assessment_item_content["type"]= "mcq"
                mcq_sets = item.mcq.all()

                if mcq_sets.exists():
                    random_index   = randint(0, mcq_sets.count() - 1)
                    random_mcq_set = mcq_sets[random_index]
                    # mcq_questions  = random_mcq_set.mcqs.all()

                    easy_mcqs_single   = random_mcq_set.mcqs.filter(difficulty_level=1)
                    medium_mcqs_single = random_mcq_set.mcqs.filter(difficulty_level=2)
                    hard_mcqs_single   = random_mcq_set.mcqs.filter(difficulty_level=3)

                    easy_multi_mcqs   = random_mcq_set.multi_mcqs.filter(difficulty_level=1)
                    medium_multi_mcqs = random_mcq_set.multi_mcqs.filter(difficulty_level=2)
                    hard_multi_mcqs   = random_mcq_set.multi_mcqs.filter(difficulty_level=3)

                    easy_mcqs   = list(chain(easy_mcqs_single,   easy_multi_mcqs))
                    medium_mcqs = list(chain(medium_mcqs_single, medium_multi_mcqs))
                    hard_mcqs   = list(chain(hard_mcqs_single,   hard_multi_mcqs))

                    # print(easy_mcqs)
                    # print(medium_mcqs)
                    # print(hard_mcqs)
                    
                    # print(random_mcq_set.number_of_easy_mcqs,   easy_mcqs.count())
                    # print(random_mcq_set.number_of_medium_mcqs, medium_mcqs.count())
                    # print(random_mcq_set.number_of_hard_mcqs,   hard_mcqs.count())
                    if random_mcq_set.number_of_easy_mcqs is None: selected_easy_mcqs = sample(easy_mcqs, len(easy_mcqs))
                    else:
                        selected_easy_mcqs   = sample(easy_mcqs,   min(random_mcq_set.number_of_easy_mcqs,   len(easy_mcqs)))
                    if random_mcq_set.number_of_medium_mcqs is None: selected_medium_mcqs = sample(medium_mcqs, len(medium_mcqs))
                    else:
                        selected_medium_mcqs = sample(medium_mcqs, min(random_mcq_set.number_of_medium_mcqs, len(medium_mcqs)))
                    if random_mcq_set.number_of_hard_mcqs is None: selected_hard_mcqs = sample(hard_mcqs, len(hard_mcqs))
                    else:
                        selected_hard_mcqs   = sample(hard_mcqs,   min(random_mcq_set.number_of_hard_mcqs,   len(hard_mcqs)))
                    
                    
                    selected_mcqs = selected_easy_mcqs + selected_medium_mcqs + selected_hard_mcqs

                    
                    for mcq in selected_mcqs:
                        # serializer = MCQQuestionsSerializer(mcq)
                        question_data = model_to_dict(mcq)
                        try: 
                            if len(question_data['correct_answer']) == 1:
                                is_multiple = 'false'
                                id = "sc_" + str(question_data['id'])
                        except:
                            is_multiple = 'true'
                            id = "mc_" + str(question_data['id'])
                        question = {
                            "id" : id,
                            "question_text": question_data['question_text'],
                            "options": [
                                {"label": question_data['option_a'] , "value": "a" },
                                {"label": question_data['option_b'] , "value": "b" },
                                {"label": question_data['option_c'] , "value": "c" },
                                {"label": question_data['option_d'] , "value": "d" }
                            ],
                            "flagged": 'false',
                            "topic": question_data['topic'],
                            "is_multiple": is_multiple,
                            "difficulty_level": question_data['difficulty_level'],
                        }
                        # print(question_data)
                        # print(question)
                        assessment_item_content["questions"].append(question)    

                    # assessment_item_content["title"]    = random_mcq_set.title
                    assessment_item_content["duration"] = item.time_duration
                    response_data["assessment_items"].append(assessment_item_content)
                    
            elif item.sections_type == "P":
                assessment_item_content['type'] = 'coding'
                response_data["assessmentType"].add("CodingProblem")
                coding_sets = item.coding_problem.all()

                if coding_sets.exists():
                    random_index = randint(0, coding_sets.count() - 1)
                    random_coding_set = coding_sets[random_index]

                    easy_problems   = random_coding_set.problems.filter(difficulty_level=1)
                    medium_problems = random_coding_set.problems.filter(difficulty_level=2)
                    hard_problems   = random_coding_set.problems.filter(difficulty_level=3)
                    if random_coding_set.number_of_easy_problems is None: selected_easy_problems = sample(list(easy_problems), easy_problems.count())
                    else:
                        selected_easy_problems   = sample(list(easy_problems),   min(random_coding_set.number_of_easy_problems,   easy_problems.count()))
                    if random_coding_set.number_of_medium_problems is None: selected_medium_problems = sample(list(medium_problems), medium_problems.count() )
                    else:
                        selected_medium_problems = sample(list(medium_problems), min(random_coding_set.number_of_medium_problems, medium_problems.count()))
                    if random_coding_set.number_of_hard_problems is None: selected_hard_problems = sample(list(hard_problems),hard_problems.count()) 
                    else:
                        selected_hard_problems   = sample(list(hard_problems),   min(random_coding_set.number_of_hard_problems,   hard_problems.count()))
                    
                    selected_problem = selected_easy_problems + selected_medium_problems + selected_hard_problems

                    for problem in selected_problem:
                        serializer = ProblemSerializer(problem)
                        data = serializer.data
                        # Check if there are any template_codes
                        if data.get('template_codes'):
                            # Set default_language to the language of the first template_code
                            data['default_language'] = data['template_codes'][0]['language']
                        else:
                            # If no template_codes, use the provided default language
                            data['default_language'] = ''
                        assessment_item_content["questions"].append(data)

                    #mcq_questions = random_mcq_set.mcqs.all()
                    # assessment_item_content["title"]    = random_coding_set.title
                    assessment_item_content["duration"] = item.time_duration
                    response_data["assessment_items"].append(assessment_item_content)

            elif item.sections_type == "A":
                assessment_item_content['type'] = 'subjective'
                response_data["assessmentType"].add("Subjective")
                question_sets = item.subjective.all()
                # print(question_sets)

                if question_sets.exists():
                    random_index = randint(0, question_sets.count() - 1)
                    random_subjective_set = question_sets[random_index]
            
                    easy_questions   = random_subjective_set.questions.filter(difficulty_level=1)
                    medium_questions = random_subjective_set.questions.filter(difficulty_level=2)
                    hard_questions   = random_subjective_set.questions.filter(difficulty_level=3)
                    if random_subjective_set.number_of_easy_questions is None: selected_easy_problems = sample(list(easy_questions), easy_questions.count())
                    else:
                        selected_easy_problems   = sample(list(easy_questions),   min(random_subjective_set.number_of_easy_questions,   easy_questions.count()))
                    if random_subjective_set.number_of_medium_questions is None: selected_medium_problems = sample(list(medium_questions), medium_questions.count())
                    else:
                        selected_medium_problems = sample(list(medium_questions), min(random_subjective_set.number_of_medium_questions, medium_questions.count()))
                    if random_subjective_set.number_of_hard_questions is None: selected_hard_problems = sample(list(hard_questions), hard_questions.count())
                    else:
                        selected_hard_problems   = sample(list(hard_questions),   min(random_subjective_set.number_of_hard_questions,   hard_questions.count()))
                    
                    selected_questions = selected_easy_problems + selected_medium_problems + selected_hard_problems

                    for questions in selected_questions:
                        serializer = AssignemntsSerializer(questions)
                        assessment_item_content["questions"].append(serializer.data)    

                    # assessment_item_content["title"]    = random_subjective_set.title
                    assessment_item_content["duration"] = item.time_duration
                    response_data["assessment_items"].append(assessment_item_content)
                    
        return Response(response_data, status=status.HTTP_200_OK)
    
class OpenAssessmentSubmissionView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Capture the payload from the request data
            payload = request.data

            # Capture query parameters
            query_params = request.query_params
            assessment_id = query_params.get('assessment_id')
            assessment = Assessment_v2.objects.get(test_id = assessment_id)
            # Extracting specific fields from the payload
            violations = payload.get('violations')
            video_violations = payload.get('videoViolations')
            open_data = payload.get('openData', {})
            assessment_items = payload.get('assessment_items', [])

            # Extracting fields from openData
            name = open_data.get('name')
            email = open_data.get('email')
            mobile = open_data.get('mobile')
            graduation = open_data.get('graduation')
            usn = open_data.get('usn')
            resume_link = open_data.get('resume_link')

            # Save data to the OpenAssessmentEvaluation_V2 model
            evaluation = OpenAssessmentEvaluation_V2(
                name=name,
                email=email,
                mobile=mobile,
                test_id=assessment_id,
                responsesheet=str(payload)  # Convert the complete payload to a string for saving
            )
            evaluation.save()

            grade_submission(evaluation, assessment)


            # Return a successful response
            return Response({"message": "Payload received and saved successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            # Handle exceptions and return an error response
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CompileRunProblemAPI(APIView):
    def post(self, request, *args, **kwargs):
        problem_id = request.query_params.get('problem_id')

        source_code = request.data.get('source_code')
        language_id = str(request.data.get('language_id'))
        
        task = CodeRunner.delay(source_code, language_id, problem_id)
        return Response({'status': 'Request is being processed', 'task_id': task.id}, status=202)

class GetSubmitTaskStatus(APIView):
    def get(self, request, task_id):
        task = AsyncResult(task_id)
        if task.state == 'PENDING':
            response = {
                'state': task.state,
                'status': 'Pending...'
            }
        elif task.state == 'STARTED':
            response = {
                'state': task.state,
                'status': 'In progress...'
            }
        elif task.state == 'SUCCESS':
            response = {
                'state': task.state,
                'status': 'Completed',
                'result': task.result
            }
        elif task.state == 'FAILURE':
            response = {
                'state': task.state,
                'status': 'Failed',
                'error': str(task.info) 
            }
        else:
            response = {
                'state': task.state,
                'status': 'Unknown state'
            }
        return Response(response)
        
    
class AdminAssessmentListView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request, *args, **kwargs):
        user_id = self.request.user.get('id')
        user = get_object_or_404(User, id=user_id)
        userprofile = get_object_or_404(UserProfile, user=user)

        if not user.is_staff:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=403)

        client = userprofile.client
        assessments = Assessment_v2.objects.filter(client=client)

        # Assuming you want to serialize the assessments
        serialized_assessments = AssessmentSerializer(assessments, many=True).data

        return Response(serialized_assessments, status=200)

class AdminAssessmentDetailView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get(self, request):
        user_id = self.request.user.get('id')
        user = get_object_or_404(User, id=user_id)
        userprofile = get_object_or_404(UserProfile, user=user)
        test_id = request.query_params.get('test_id')

        if not user.is_staff:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=403)
        
        assessmentv2 = get_object_or_404(Assessment_v2, test_id=test_id)

        # Initialize counters for easy, medium, and hard questions
        easy_questions = 0
        medium_questions = 0
        hard_questions = 0

        # Retrieve all related AssessmentItem_v2 objects for this assessment
        assessment_items = AssessmentItem_v2.objects.filter(assessment=assessmentv2)
        marking_scheme = []
        max_marks = 0
        # Iterate through each assessment item and accumulate the question counts
        for item in assessment_items:
            item_marks = 0
            item_e_question_count = 0 
            item_m_question_count = 0 
            item_h_question_count = 0 
            # Calculate the total easy, medium, and hard questions for coding problems
            for problem_set in item.coding_problem.all():
                easy_questions += problem_set.number_of_easy_problems or 0
                item_e_question_count += problem_set.number_of_easy_problems or 0
                item_marks += (problem_set.number_of_easy_problems or 0)*item.easy_question_marks

                medium_questions += problem_set.number_of_medium_problems or 0
                item_m_question_count += problem_set.number_of_medium_problems or 0
                item_marks += (problem_set.number_of_medium_problems or 0)*item.medium_question_marks

                hard_questions += problem_set.number_of_hard_problems or 0
                item_h_question_count += problem_set.number_of_hard_problems or 0
                item_marks += (problem_set.number_of_hard_problems or 0)*item.medium_question_marks

            # Calculate the total easy, medium, and hard MCQs
            for mcq_set in item.mcq.all():
                easy_questions += mcq_set.number_of_easy_mcqs or 0
                item_e_question_count += mcq_set.number_of_easy_mcqs or 0
                item_marks += (mcq_set.number_of_easy_mcqs or 0) * item.easy_question_marks

                medium_questions += mcq_set.number_of_medium_mcqs or 0
                item_m_question_count += mcq_set.number_of_medium_mcqs or 0
                item_marks += (mcq_set.number_of_medium_mcqs or 0) * item.medium_question_marks

                hard_questions += mcq_set.number_of_hard_mcqs or 0
                item_h_question_count += mcq_set.number_of_hard_mcqs or 0
                item_marks += (mcq_set.number_of_hard_mcqs or 0) * item.hard_question_marks

            # Calculate the total easy, medium, and hard subjective questions
            for subjective_set in item.subjective.all():
                easy_questions += subjective_set.number_of_easy_questions or 0
                medium_questions += subjective_set.number_of_medium_questions or 0
                hard_questions += subjective_set.number_of_hard_questions or 0
            
            marking_scheme.append({
                'type': item.sections_type,
                'title': item.title,
                'easy_question_count': item_e_question_count,
                'medium_question_count': item_m_question_count,
                'hard_question_count': item_h_question_count,
                'marks' : item_marks
            })
            max_marks += item_marks

        assessments = OpenAssessmentEvaluation_V2.objects.filter(test_id=test_id)
        total_submissions = assessments.count()
        average_marks = assessments.aggregate(Avg('total_marks'))['total_marks__avg']
        submissions_per_user = assessments.values('email').annotate(submission_count=Count('id'))
        average_attempts = submissions_per_user.aggregate(Avg('submission_count'))['submission_count__avg']
        submission_list = []
        section_marks = dict()
        for assessment in assessments:
            try:
                result_sheet_json = json.loads(assessment.resultSheet)
                for result in result_sheet_json:
                    # Get the title and section_score from the result
                    title = result.get('title')
                    section_score = result.get('section_score', 0)

                    # Check if the title is already in the dictionary
                    if title in section_marks:
                        # Add the section_score to the existing total
                        section_marks[title] += section_score
                    else:
                        # Initialize the dictionary key with the section_score
                        section_marks[title] = section_score

            except json.JSONDecodeError:
                result_sheet_json = None  # Handle the case where the JSON is invalid
            
            #passing Marks
            passing_marks = float(assessmentv2.passing_marks)
            result = 'NR'
            if passing_marks > 0:
                if float(assessment.total_marks) > passing_marks:
                    result = 'Pass'
                else:
                    result = 'Fail'

            submission_list.append({
                'name': assessment.name,
                'submission_id': assessment.id,
                'test_id' : test_id,
                'email': assessment.email,
                'total_marks': assessment.total_marks,
                'result': result,
                'subjective_assignment_score': assessment.subjective_assignment_score,
                'mcq_score': assessment.mcq_score,
                'coding_problem_score': assessment.coding_problem_score,
                'resultSheet': result_sheet_json
            })
        
        
        for title, section_score in section_marks.items():
            print(title, section_score, total_submissions)
            section_marks[title] = section_score/total_submissions
            for data in marking_scheme:
                if data.get('title') == title:
                    section_marks[title] = (section_marks[title]/data.get('marks'))*100

        print(section_marks)

        return Response(
            {
                'total_submissions': total_submissions,
                'average_marks': average_marks,
                'maximum_marks': max_marks,
                'number_of_questions': easy_questions + medium_questions + hard_questions,
                'average_attempts': average_attempts,
                'topic_wise_avg_marks': {
                    "sql": 10,
                    'python': 23,
                    'aptitute': 34
                },
                'section_wise_avg_marks': section_marks,
                'question_counts': {
                    'easy': easy_questions,
                    'medium': medium_questions,
                    'hard': hard_questions
                },
                'marking_scheme': marking_scheme,
                'submission_list': submission_list
            }, 
            status=200
        )


class GetAllAssessment(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        user_id = self.request.user.get('id')
        user = User.objects.get(id=user_id)
        profile = UserProfile.objects.get(user = user)
        if not user.is_staff:
            return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
        else:
            client = profile.client
            assessments = Assessment_v2.objects.filter(client = client)
            res = []
            for assessment in assessments:
                details = {
                    "id ": assessment.test_id,
                    "name" : assessment.title,
                    "total_test_takers": OpenAssessmentEvaluation_V2.objects.filter(test_id = assessment.test_id).count(),
                }
                res.append(details)
        return Response(res, status = status.HTTP_200_OK)

class GetAllProblems(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        problems = Problem.objects.values('pk','title','topics', 'difficulty_level')
        problem_list = list(problems)
        return Response(problem_list, status = status.HTTP_200_OK)

class GetAllSingleMCQ(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        questions = MCQQuestions.objects.values('pk','question_text', 'topic', 'difficulty_level')
        question_list = list(questions)
        return Response(question_list, status = status.HTTP_200_OK)

class GetAllMultiMCQ(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        questions = MultiCorrectMCQs.objects.values('pk','question_text', 'topic', 'difficulty_level')
        question_list = list(questions)
        return Response(question_list, status = status.HTTP_200_OK)
    
class GetAllSubjectiveQue(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        questions = Assignments.objects.values('pk','title','difficulty_level')
        question_list = list(questions)
        return Response(question_list, status = status.HTTP_200_OK)

class CreateAssessment(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request):
        user_id = self.request.user.get('id')
        user = User.objects.get(id=user_id)
        profile = UserProfile.objects.get(user = user)
        if not user.is_staff:
            return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
        else:
            try:
                test_id           = request.data.get("test_id")
                title             = request.data.get("title")
                description       = request.data.get("description")
                language          = request.data.get("language")
                passing_marks     = request.data.get("passing_marks")
                Total_marks       = request.data.get("Total_marks")
                timed_assessments = request.data.get("timed_assessments")
                duration          = request.data.get("duration")
                max_violations    = request.data.get("max_violations")
                proctored         = request.data.get("proctored")
                show_result       = request.data.get("show_result")
                if not show_result: 
                    show_result = False
            except Exception as e:
                return Response({"message": f"{e}"}, status=status.HTTP_400_BAD_REQUEST)
            
            c = Assessment_v2.objects.filter(test_id = test_id).count()
            if c != 0 :
                return Response({"message": "Test_id must be unique"}, status=status.HTTP_400_BAD_REQUEST)
            
            assessment = Assessment_v2.objects.create(
                test_id           = test_id,
                title             = title,
                description       = description,
                language          = language,
                passing_marks     = passing_marks,
                Total_marks       = Total_marks,
                timed_assessments = timed_assessments,
                duration          = duration,
                max_violations    = max_violations,
                proctored         = proctored,
                show_result       = show_result,
                client            = profile.client
            )
            assessment.save()
            return Response({"message": "Assessment Created"}, status=status.HTTP_200_OK)


class CreateAssessmentItem(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request):
        user_id = self.request.user.get('id')
        user = User.objects.get(id=user_id)
        profile = UserProfile.objects.get(user = user)
        if not user.is_staff:
            return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
        else:
            try:
                section_cutoff        = request.data.get("section_cutoff")
                title                 = request.data.get("title")
                priority_order        = request.data.get("priority_order")
                sections_type         = request.data.get("sections_type")
                set_ids               = request.data.get("set_ids")
                set_count             = request.data.get("set_count")
                Total_marks           = request.data.get("Total_marks")
                test_id               = request.data.get("test_id")
                time_duration         = request.data.get("time_duration")
                easy_question_marks   = request.data.get("easy_question_marks")
                medium_question_marks = request.data.get("medium_question_marks")
                hard_question_marks   = request.data.get("hard_question_marks")
            except Exception as e:
                return Response({"message": f"{e}"}, status=status.HTTP_400_BAD_REQUEST)

        assessment = Assessment_v2.objects.get(test_id = test_id)

        assessment_item = AssessmentItem_v2.objects.create(
            sections_type         = sections_type,
            title                 = title,
            priority_order        = priority_order,
            set_count             = set_count,
            section_cutoff        = section_cutoff,
            Total_marks           = Total_marks,
            assessment            = assessment,
            easy_question_marks   = easy_question_marks,
            medium_question_marks = medium_question_marks,
            hard_question_marks   = hard_question_marks,
            time_duration         = time_duration
        )

        if sections_type   == 'P':
            assessment_item.coding_problem.set(set_ids)
        elif sections_type == 'A':
            assessment_item.mcq.set(set_ids)
        elif sections_type == 'M':
            assessment_item.subjective.set(set_ids)

        assessment_item.save()

        return Response({"message": "Assessment item Created Successfully"}, status=status.HTTP_200_OK)

class GetAssessmentItem(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        try:
            assessment_id = request.query_params.get('test_id')
        except:
            return Response({"message": "Test Id not provided"})
        assessment_items = AssessmentItem_v2.objects.filter(assessment__test_id = assessment_id).values("pk", "title", "sections_type", "section_cutoff", "Total_marks")
        return Response(assessment_items, status=status.HTTP_200_OK)

class GetSets(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        try:
            content_type = request.query_params.get('set_type')
            if content_type not in ['P', 'A', 'M']: 
                return Response({'message': 'Proper content type not provided'}, status= status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'message': 'Content type not provided'}, status= status.HTTP_400_BAD_REQUEST)

        if content_type == 'P':
            sets =  ProblemSet.objects.all().values('pk', 'title')
        elif content_type == 'A':
            sets = SubjectiveSet.objects.all().values('pk', 'title')
        elif content_type == 'M':
            sets = MCQSet.objects.all().values('pk', 'title')
        return Response(sets, status=status.HTTP_200_OK)

class CreateSet(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request):
        # try:
        #     content_type = request.query_params.get('set_type')
        #     if content_type not in ['P', 'A', 'M']: 
        #         return Response({'message': 'Proper content type not provided'}, status= status.HTTP_400_BAD_REQUEST)
        # except:
        #     return Response({'message': 'Content type not provided'}, status= status.HTTP_400_BAD_REQUEST)

        try:
            content_type               = request.data.get('set_type')
            title                      = request.data.get('title')
            number_of_easy_problems    = request.data.get("number_of_easy_problems", None)
            number_of_medium_problems  = request.data.get("number_of_medium_problems", None)
            number_of_hard_problems    = request.data.get("number_of_hard_problems", None)
            single_questions_ids       = request.data.get("single_questions_ids", [])
            multi_questions_ids        = request.data.get("multi_questions_ids", [])
            questions_ids              = request.data.get("questions_ids")

            if questions_ids == []: 
                return Response({"message" : "Question ids were not provided"}, status = status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message" : f"{e}"}, status = status.HTTP_400_BAD_REQUEST)

        if content_type not in ['P', 'A', 'M']: 
                return Response({'message': 'Proper content type not provided'}, status= status.HTTP_400_BAD_REQUEST)
            
        if content_type == 'P':
            set =  ProblemSet.objects.create(
                title =  title,
                number_of_easy_problems   = number_of_easy_problems,
                number_of_medium_problems = number_of_medium_problems,
                number_of_hard_problems   = number_of_hard_problems,
            )
            set.problems.set(questions_ids)
            
        elif content_type == 'A':
            set =  SubjectiveSet.objects.create(
                title =  title,
                number_of_easy_questions   = number_of_easy_problems,
                number_of_medium_questions = number_of_medium_problems,
                number_of_hard_questions   = number_of_hard_problems,
            )
            set.questions.set(questions_ids)
            
        elif content_type == 'M':
            set =  MCQSet.objects.create(
                title =  title,
                number_of_easy_mcqs   = number_of_easy_problems,
                number_of_medium_mcqs = number_of_medium_problems,
                number_of_hard_mcqs   = number_of_hard_problems,
            )
            set.mcqs.set(single_questions_ids)
            set.multi_mcqs.set(multi_questions_ids)

        set.save()
            
        return Response({"message": "Set Created successfully"}, status=status.HTTP_200_OK)

class SetOrder(APIView):
    def post(self, request):
        try:
            order = request.data.get("order")
            statements = [ When(pk= int(pk), then=order) for pk, order in order.items()]
            AssessmentItem_v2.objects.filter(pk__in = order.keys()).update(
                priority_order = Case(
                *statements,
                output_field=FloatField()
                )
            )
            return Response({"message": "Order Changed Successfully"}, status=status.HTTP_200_OK)
        except:
            return Response({"message": "Order Change Unsuccessful"}, status=status.HTTP_400_BAD_REQUEST)
            
    

class ExportGradedAssessmentsAPIView(APIView):
    def get(self, request, *args, **kwargs):
        # Retrieve all graded submissions based on test_id
        test_id = request.query_params.get('test_id')
        submissions = OpenAssessmentEvaluation_V2.objects.filter(graded=True, test_id=test_id)

        # Prepare data for JSON
        json_data = []
        dynamic_headers = set()  # Dynamic headers from resultSheet

        for submission in submissions:
            json_str = submission.responsesheet.replace("'", '"')
            try:
                responsesheet_data = json.loads(json_str)
            except json.JSONDecodeError:
                continue

            result_sheet_str = submission.resultSheet
            try:
                result_sheet_data = json.loads(result_sheet_str)
            except json.JSONDecodeError:
                result_sheet_data = []

            violations = responsesheet_data.get("violations", "")
            remaining_time = responsesheet_data.get("remaining_time", "00:00:00")

            # Create a dictionary for each submission's data
            submission_data = {
                'name': submission.name,
                'email': submission.email,
                'mobile': submission.mobile,
                'mcq_score': submission.mcq_score,
                'coding_score': submission.coding_problem_score,
                "SubmissionDateTime": submission.submission_date,
                "violations": violations,
                "remaining_time": remaining_time
            }

            # Add dynamic fields based on the resultSheet
            for item in result_sheet_data:
                title = item.get('title', '').replace(' ', '_')
                section_score = item.get('section_score', 0)
                submission_data[title] = section_score
                dynamic_headers.add(title)

            json_data.append(submission_data)

        # Return the JSON response
        return Response({"data": json_data}, status=200)


class GetStudentReport(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request):
        email = request.data.get("email")
        test_id = request.data.get("test_id")
        submission_id = request.data.get("submission_id")
        entries = AssessmentResultVerbose.objects.filter(email = email, test_id = test_id, submission_id = submission_id)

#uncomment this later

        # if entries.count() == 0:
        #     return Response({"message: No result data Present"}, status = status.HTTP_400_BAD_REQUEST)

        # overall_score =  entries.aggregate(Sum('obtained_marks'))['obtained_marks__sum']
        # max_marks  = entries.aggregate(Sum('max_marks'))['max_marks__sum']

        # topics_vs_marks = {}
        # item_vs_marks = {}
        # item_vs_type = {}
        
        # for entry in entries:
        #     #for strength moderate and weakness
        #     if entry.parent_topic not in topics_vs_marks:
        #         topics_vs_marks[entry.parent_topic] = [0, 0]
        #     topics_vs_marks[entry.parent_topic][0] += entry.obtained_marks 
        #     topics_vs_marks[entry.parent_topic][1] += entry.max_marks

        #     #for summary
        #     if entry.assessment_item_name not in item_vs_marks:
        #         item_vs_marks[entry.assessment_item_name] = {}
        #         item_vs_type[entry.assessment_item_name] = {
        #             "easy" : [0, 0],
        #             "medium" : [0, 0],
        #             "hard" : [0, 0]
        #         }
                
        #     if entry.parent_topic not in item_vs_marks[entry.assessment_item_name]: 
        #         item_vs_marks[entry.assessment_item_name][entry.parent_topic] = [0, 0]
                
        #     item_vs_marks[entry.assessment_item_name][entry.parent_topic][0] += entry.obtained_marks
        #     item_vs_marks[entry.assessment_item_name][entry.parent_topic][1] += entry.max_marks

        #     if entry.difficulty == 1:
        #         item_vs_type[entry.assessment_item_name]['easy'][0] += entry.obtained_marks
        #         item_vs_type[entry.assessment_item_name]['easy'][1] += entry.max_marks
        #     elif entry.difficulty == 2:
        #         item_vs_type[entry.assessment_item_name]['medium'][0] += entry.obtained_marks
        #         item_vs_type[entry.assessment_item_name]['medium'][1] += entry.max_marks
        #     elif entry.difficulty == 3:
        #         item_vs_type[entry.assessment_item_name]['hard'][0] += entry.obtained_marks
        #         item_vs_type[entry.assessment_item_name]['hard'][1] += entry.max_marks
                

        # #strength analysis
        # strength = []
        # moderate = []
        # weakness = []
        # for key, values in topics_vs_marks.items():
        #     if values[1] != 0:
        #         if values[0]/values[1] >= 70:
        #             strength.append(
        #                 {
        #                     "name": key,
        #                     "value": values[0]/values[1]
        #                 }
        #             )

                
        #         elif values[0]/values[1] >= 30:
        #             moderate.append(
        #                 {
        #                     "name": key,
        #                     "value": values[0]/values[1]
        #                 }
        #             )

                
        #         elif values[0]/values[1] >= 0:
        #             weakness.append(
        #                 {
        #                     "name": key,
        #                     "value": values[0]/values[1]
        #                 }
        #             )
        # v = 0
        # assessment = Assessment_v2.objects.get(test_id = test_id)
        # max_v =  assessment.max_violations
        # for key , values in item_vs_type.items():
        #     item = AsessmentResultMeta.objects.get(email = email, assessment_item_name = key, submission_id = submission_id)
        #     v = item.violations
        #     values['percentage'] = (item.obtained_marks * 100)/item.max_marks
        #     values['score']      = [item.obtained_marks, item.max_marks]
        #     values['timetaken']  = item.time_taken

                
        # response = {
        #     "name" : entries[0].student_name,
        #     "assessment_name" : assessment.title,
        #     "email" : email,
        #     "qualified" : False,
        #     "intigrity" : [v, max_v],
        #     "submitted_on" : entries[0].submitted_at,
        #     "overall_score" : overall_score,
        #     "max_score" : max_marks,
        #     "overall_percentage" : (overall_score * 100)/max_marks,
        #     "location" : None,
        #     "IPaddr": None,
        #     "strengths" : strength,
        #     "moderate" : moderate,
        #     "weakness" : weakness,
        #     "performance_summary" : item_vs_marks,
        #     "section_summary" : item_vs_type
        # }


         
        response = {
            "name" : "David Sharma",
            "assessment_name" : "Assessment 1 Title",
            "email" : "davidsharma@gmail.com",
            "submitted_on": datetime.now(),
            "qualified" : True,
            "intigrity" : [7.7, 10],
            "overall_percentage" : 80, 
            "overall_score" : 125,
            "max_score" : 150,
            "location" : None,
            "IPaddr": None,
            "strengths" : [
                {"name" : "Javascript",
                "value" : 100},
                {"name" : "Reactjs",
                "value" : 100},
                {"name" : "Aptitude",
                "value" : 90}
                ],
            "moderate" :[
                {"name" : "C++",
                "value" : 70},
                {"name" : "Jave",
                "value" : 65},
                {"name" : "Verbal",
                "value" : 60}
                ],
            "weakness" : [
                {"name" : "Python",
                "value" : 40},
                {"name" : "Numpy",
                "value" : 30},
                {"name" : "Pandas",
                "value" : 20}
                ],
            "performance_summary" : {
                "Aptitude" : {
                    "Reading" : [2,2],
                    "Vocabulary" : [2,2],
                    "Verbal": [3,6]
                },
                "Technical" : {
                    "DSA" : [5,9],
                    "Python" : [6,6],
                    "C++" : [8,10]
                },
                "Coding":{
                    "Trees" : [5, 8],
                    "Graphs" : [7, 9]
                }
            },
            "section_summary": {
                "Aptitude" : {
                    "percentage" : 85,
                    "score" : [34, 50],
                    "timetaken" : [30.4],
                    "easy" : [4,5],
                    "medium" : [4,5],
                    "hard" : [4,5]
                    },
                "Technical" : {
                    "percentage" : 85,
                    "score" : [34, 50],
                    "timetaken" : [30.4],
                    "easy" : [4,5],
                    "medium" : [4,5],
                    "hard" : [4,5]
                    },
                "Coding":{
                    "percentage" : 85,
                    "score" : [34, 50],
                    "timetaken" : [30.4],
                    "easy" : [4,5],
                    "medium" : [4,5],
                    "hard" : [4,5]
                }
            }
        }
        
        return Response(response, status=status.HTTP_200_OK) 