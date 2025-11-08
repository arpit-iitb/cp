from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from accounts.models import User, UserProfile, UserSessions
from accounts.serializers import UserRegistrationSerializer, UserSerializer
from admin_dashboard.serializers import ChildBatchListSerializer,CSVUploadSerializer
from batches.models import Batch, ChildBatch, Lesson, VideoLectures, Problem, MCQAssignment, Assignments
from submissions.models import UserActivity, UserScoreData
from services.authentication import CJAuthentication
from services.permissions import UserAuthenticated
import ast
from django.db.models import Q
from django.db import transaction

from utils.util import batchEmail
from .models import AdminActions
import json
from django.utils import timezone
from datetime import timedelta,datetime,date
from django.db.models import Count
from admin_dashboard import csv_to_mcq, csv_to_questions
import pandas
import io
from admin_dashboard.tasks import send_batch_stats_email, start_sending_batch_emails

class AdminBatchUsersAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id = user_id)
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)

            batch_names_param = request.query_params.get('batch')
            
            if not batch_names_param:
                return Response({"message": "No batch names provided"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                batch_names = ast.literal_eval(batch_names_param)
                if not isinstance(batch_names, list):
                    raise ValueError("The evaluated result is not a list")
            except (ValueError, SyntaxError):
                return Response({"message": "Invalid format for batch names"}, status=status.HTTP_400_BAD_REQUEST)
            
            batch_queries = [Q(assosiatedbatches__name=batch_name) for batch_name in batch_names]

            # Combine all the Q objects using the OR operator to check if any of the batches match
            combined_query = Q()
            for query in batch_queries:
                combined_query |= query

            user_profiles = UserProfile.objects.filter(combined_query).distinct()

            users = User.objects.filter(profile__in=user_profiles,is_staff=False).distinct()

            serializer = UserSerializer(users, many=True)
            studentList = serializer.data
            for student in studentList:
                username = student['username']
                user = User.objects.get(username=username)
                userprofile = UserProfile.objects.get(user=user)
                student['problems_solved'] = UserScoreData.objects.filter(user=user, type='P').count()
                student['videos_watched'] = UserScoreData.objects.filter(user=user, type='V').count()
                student['assignments_solved'] = UserScoreData.objects.filter(user=user, type='A').count()
                student['mcqs_solved'] = UserScoreData.objects.filter(user=user, type='M').count()
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminBatchListAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id = user_id)
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            user_profiles = UserProfile.objects.get(user=user)
            client_name = user_profiles.client
            batches = Batch.objects.filter(client=client_name)
            child_batches = ChildBatch.objects.filter(client = client_name)
            serializer = ChildBatchListSerializer(child_batches, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
        except ChildBatch.DoesNotExist:
            return Response({"message": "something went wrong"}, status=status.HTTP_404_NOT_FOUND)
        
class CreateStudentAccountAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id = user_id)
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            user_profiles = UserProfile.objects.get(user=user)
            client_name = user_profiles.client
            
            # post request body
            data = request.data
            registration_data = data.get('registration_data', {})
            program = data['program']
            batches = data['batch_name']
            if not batches:
                return Response({"message": "Batch names are required."}, status=status.HTTP_400_BAD_REQUEST)
            
            batches_obj = ChildBatch.objects.filter(name__in=batches)
            if not batches_obj.exists():
                raise ValueError("One or more batches not found.")

            # print(registration_data)
            # print(registration_data.get('username'))
            #create account and userprofile
            serializer = UserRegistrationSerializer(data=registration_data)
            if serializer.is_valid():
                with transaction.atomic():
                    user = serializer.save()
                    user.name = registration_data.get('name')
                    user.phone_number = registration_data.get('phone')
                    user_profile =UserProfile.objects.create(user=user, program=program, client=client_name)
                    user_profile.assosiatedbatches.add(*batches_obj)
                    user.save()
                    user_profile.save()
                    if data.get('send_email', False):
                        print('sending email...')
                        batchEmail(user.username, user.email, user.name, registration_data.get('password'), client_name)
                
                #logging action
                try:
                    incoming_data = dict(request.data)
                    del incoming_data['registration_data']['password']
                    del incoming_data['registration_data']['confirm_password']
                    admin_action = AdminActions(admin_name= User.objects.get(id = user_id).username , 
                                                action='CREATED_USER', 
                                                user_name = registration_data.get('username'),
                                                request_payload = json.dumps(incoming_data))
                    admin_action.save()
                except:
                    print("Unable to LOG action!")

                return Response({"message": "User account created successfully."}, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "Validation Error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CreateBulkStudentAccountAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def post(self, request):
        try:
            # Get the authenticated user
            user_id = self.request.user.get('id')
            user = User.objects.get(id=user_id)
            
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            
            user_profiles = UserProfile.objects.get(user=user)
            client_name = user_profiles.client

            # Parse request data
            data = request.data
            students = data.get('students', [])
            program = data.get('college_name')
            batches = data.get('batch_name')
            print(batches)
            # Validate required fields
            if not program:
                return Response({"message": "College name is required."}, status=status.HTTP_400_BAD_REQUEST)
            if not batches:
                return Response({"message": "Batch names are required."}, status=status.HTTP_400_BAD_REQUEST)
            if not students:
                return Response({"message": "Students data is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Validate batches
            batches_obj = ChildBatch.objects.filter(name__iexact=batches)
            print(batches_obj)
            if not batches_obj.exists():
                return Response({"message": "One or more batches not found."}, status=status.HTTP_404_NOT_FOUND)

            # Check if any user already exists in the system
            existing_users = []
            for student in students:
                username = student.get('username')
                email = student.get('email')
                if User.objects.filter(username=username).exists():
                    existing_users.append(username)
                elif User.objects.filter(email=email).exists():
                    existing_users.append(email)

            if existing_users:
                return Response({
                    "message": "The following users already exist in the system.",
                    "existing_users": existing_users
                }, status=status.HTTP_400_BAD_REQUEST)

                # Wrap the entire student creation in a transaction
            with transaction.atomic():
                for registration_data in students:
                    # Check if user already exists
                    if User.objects.filter(
                        username=registration_data.get("username")
                    ).exists():
                        raise ValueError(
                            f"User with username {registration_data.get('username')} already exists."
                        )
                    if User.objects.filter(
                        phone_number=registration_data.get("phone")
                    ).exists():
                        raise ValueError(
                            f"User with phone number {registration_data.get('phone')} already exists."
                        )

                    serializer = UserRegistrationSerializer(data=registration_data)
                    if serializer.is_valid():
                        user = serializer.save()
                        user.name = registration_data.get("name")
                        user.phone_number = registration_data.get("phone")
                        user_profile = UserProfile.objects.create(
                            user=user, program=program, client=client_name
                        )
                        user_profile.assosiatedbatches.add(*batches_obj)
                        user.save()
                        user_profile.save()

                        # Send email if needed
                        if data.get("send_email", False):
                            batchEmail(
                                user.username,
                                user.email,
                                user.name,
                                registration_data.get("password"),
                                client_name,
                            )

                        # Log action
                        incoming_data = dict(registration_data)
                        del incoming_data["password"]
                        del incoming_data["confirm_password"]
                        AdminActions.objects.create(
                            admin_name=user.username,
                            action="CREATED_USER",
                            user_name=registration_data.get("username"),
                            request_payload=json.dumps(incoming_data),
                        )
                    else:
                        raise ValueError(
                            f"Validation error for student {registration_data.get('name')}: {serializer.errors}"
                        )

                return Response(
                    {"message": "All students created successfully."},
                    status=status.HTTP_201_CREATED,
                )

        except ValueError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class RetriveveUpdateDeleteStudentAccountAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request,username):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id = user_id)
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            
            try:
                student = User.objects.get(username=username)
                user_serializer = UserSerializer(student)
                try:
                    user_profile = UserProfile.objects.get(user=student)
                    batches = user_profile.assosiatedbatches.all()
                    batch_names = [batch.name for batch in batches]
                except UserProfile.DoesNotExist:
                    batch_names = []
                # Combine the user data and batch names
                response_data = {
                    "user": user_serializer.data,
                    "batches": batch_names
                }
                
                return Response(response_data, status=status.HTTP_200_OK)
       
            except User.DoesNotExist:
                return Response({"message": "Student not found."}, status=status.HTTP_404_NOT_FOUND)
            
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request,username):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id=user_id)
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            
            try:
                student = User.objects.get(username=username)
                student.delete()

                #logging action
                try:
                    admin_action = AdminActions(admin_name= User.objects.get(id = user_id).username,
                                                action='DELETED_USER', 
                                                user_name = username)
                    admin_action.save()
                except:
                    print("Unable to LOG action!")

                return Response({"message": "Student deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
       
            except User.DoesNotExist:
                return Response({"message": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
    def patch(self, request, username):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id=user_id)
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
            
            data = request.data
            student_user=User.objects.get(username=username)
            user_fields = ['email', 'name', 'phone_number']

            for field in user_fields:
                if field in data:
                    setattr(student_user, field, data[field])
            if('email' in data or 'name' in data or 'phone_number' in data):
                student_user.save()
            

            batch_names_param = request.query_params.get('batch')
            if batch_names_param:
                
                try:
                    batch_names = ast.literal_eval(batch_names_param)
                    if not isinstance(batch_names, list):
                        raise ValueError("The evaluated result is not a list")
                except (ValueError, SyntaxError):
                    return Response({"message": "Invalid format for batch names"}, status=status.HTTP_400_BAD_REQUEST)
                
                with transaction.atomic():
                    batches = ChildBatch.objects.filter(name__in=batch_names)
                    if not batches.exists():
                        raise ValueError("One or more batches not found.")


                    user_profile = UserProfile.objects.get(user__username=username)
                        
                    user_profile.assosiatedbatches.clear()
                        
                    user_profile.assosiatedbatches.add(*batches)
            
            #logging action
            try:
                admin_action = AdminActions(admin_name= User.objects.get(id = user_id).username,
                                            action='UPDATED_USER', 
                                            user_name = username, 
                                            request_payload = json.dumps(request.data))
                admin_action.save()
            except:
                print("Unable to LOG action!")

            return Response({"message": "User information updated successfully."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class ChangePasswordAPIView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id = user_id)
            username = request.query_params.get('username')
            if not user.is_staff:
                return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)

            user = User.objects.get(username=username)
            if not user:
                return Response({"message": "User does not exist."}, status=status.HTTP_403_FORBIDDEN)
            # post request body
            data = request.data
            password = data['password']
            confirm_password = data['confirm_password']

            if password != confirm_password:
                return Response({"message": "password mismatch."}, status=status.HTTP_403_FORBIDDEN)
            
            user.set_password(password)
            user.save()

            #logging action
            try:
                admin_action = AdminActions(admin_name= User.objects.get(id = user_id).username, 
                                            action='CHANGE_PASSWORD', 
                                            user_name = username, 
                                            )#request_payload = json.dumps(request.data)
                admin_action.save()
            except:
                print("Unable to LOG action!")

            return Response({"message": "Password changed."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"message": "Something went wrong"}, status=status.HTTP_404_NOT_FOUND)


# class GetBatchStats(APIView):
#     authentication_classes = [CJAuthentication]
#     permission_classes = [UserAuthenticated]
#     def get(self,request):
#         user_id = self.request.user.get('id')
#         user = User.objects.get(id=user_id)
#         if not user.is_staff:
#             return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
#         else:
#             staff_profile = UserProfile.objects.get(user = user)
#             staff_client = staff_profile.client   
#             # print("Staff Client " + staff_client.name)
#             clients = set()
#             all_user_program_count = 0
#             all_user_videos_count = 0
#             all_user_mcq_assignments_count = 0
#             all_user_completed_lesson = 0
#             all_user_assignments_sub_count = 0
#             last_seven_days_users = 0
#             total_lessons_count = 0
#             total_problem_count = 0
#             total_videos_count = 0
#             total_assignment_count = 0
#             total_mcq_assignment_count = 0           
#             try:
#                 child_batch_names = request.data['batch']
#                 user_profiles = UserProfile.objects.filter(assosiatedbatches__name__in= child_batch_names).distinct()            
#                 parent_batches = set()
#                 for batch in child_batch_names:
#                     child_batch = ChildBatch.objects.get(name=batch)
#                     parent_batch = child_batch.parentbatch
#                     parent_batches.add(parent_batch.name)
#                     clients.add(parent_batch.client)
#                 client_list = list(clients)
#                 # print(client_list[0])
#                 if len(client_list) > 1 or staff_client.name != client_list[0].name:
#                     return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
#                 for batch in parent_batches:
#                     queryset = Lesson.objects.filter(batch=parent_batch).select_related('problem', 'video', 'assignment', 'MCQ_assignment')
#                     week_numbers = set(queryset.values_list('week_number', flat=True))
#                     for week_number in week_numbers:
#                         week_lessons = queryset.filter(week_number=week_number)
#                         total_lessons_count = total_lessons_count + week_lessons.count()
#                         total_problem_count = total_problem_count + week_lessons.exclude(problem_id=None).count()
#                         total_videos_count = total_videos_count + week_lessons.exclude(video_id=None).count()
#                         total_assignment_count = total_assignment_count + week_lessons.exclude(assignment_id=None).count()
#                         total_mcq_assignment_count = total_mcq_assignment_count + week_lessons.exclude(MCQ_assignment_id=None).count()
#                         week_total_problem_count = week_lessons.exclude(problem_id=None).count()
#                         week_total_videos_count = week_lessons.exclude(video_id=None).count()
#                         week_total_assignment_count = week_lessons.exclude(assignment_id=None).count()
#                         week_total_mcq_assignment_count = week_lessons.exclude(MCQ_assignment_id=None).count()
#                         for user_profile in user_profiles:
#                             total_problems_solved = week_lessons.filter(Q(problem_id__in=user_profile.solved_problems.values_list('id', flat=True))).count()
#                             total_videos_watched = week_lessons.filter(Q(video_id__in = user_profile.watched_videos.values_list('id', flat=True))).count()
#                             total_assignment_solved = week_lessons.filter(Q(assignment_id__in=user_profile.assignment_Submission.values_list('id', flat=True))).count()
#                             total_MCQassignment_solved = week_lessons.filter(Q(MCQ_assignment_id__in=user_profile.mcq_assignments.values_list('id', flat=True))).count()
#                             all_user_program_count = all_user_program_count + total_problems_solved
#                             all_user_videos_count = all_user_videos_count + total_videos_watched 
#                             all_user_assignments_sub_count = all_user_assignments_sub_count + total_assignment_solved
#                             all_user_mcq_assignments_count = all_user_mcq_assignments_count + total_MCQassignment_solved
#                             if week_total_problem_count == total_problems_solved and week_total_videos_count == total_videos_watched and week_total_mcq_assignment_count == total_MCQassignment_solved and week_total_assignment_count == total_assignment_solved:
#                                 all_user_completed_lesson = all_user_completed_lesson + 1        
#                 now = timezone.now()
#                 seven_days_ago = now - timezone.timedelta(days=7)
#                 for user in user_profiles:
#                     try:
#                         if seven_days_ago <= user.last_login <= now:
#                             last_seven_days_users += 1
#                     except:
#                         pass
#                 response_dict = {
#                     "total_user_count" : user_profiles.count(),
#                     "all_user_program_count" : all_user_program_count,
#                     "all_user_videos_count" : all_user_videos_count,
#                     "all_user_assignments_sub_count" : all_user_assignments_sub_count,
#                     "all_user_mcq_assignments_count" : all_user_mcq_assignments_count,
#                     "all_user_completed_lesson" : all_user_completed_lesson,
#                     "last_seven_days_users" : last_seven_days_users,
#                     "total_lessons_count" : total_lessons_count,
#                     "total_problem_count" : total_problem_count,
#                     "total_videos_count" : total_videos_count,
#                     "total_assignment_count" : total_assignment_count,
#                     "total_mcq_assignment_count": total_mcq_assignment_count
#                 }
#                 return Response(data=response_dict)
#             except :
#                 return Response({"message": "Error Fetching Batch Stats"})
            
            
class GetBatchStats(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self,request):
        user_id = self.request.user.get('id')
        user = User.objects.get(id=user_id)
        if not user.is_staff:
            return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
        else:
            try:
                child_batch_names = request.data['batch']
                print(request.data['batch'])
                if child_batch_names == []: 
                    return Response({"message": "Please send batch"}, status=status.HTTP_400_BAD_REQUEST)

                # Checking Staff client and Batch Client are same or not
                staff_profile = UserProfile.objects.get(user = user)
                staff_client = staff_profile.client

                clients = set()  
            
                for batch in child_batch_names:
                    child_batch = ChildBatch.objects.get(name=batch)
                    parent_batch = child_batch.parentbatch
                    clients.add(parent_batch.client)

                client_list = list(clients)

                if len(client_list) > 1 or staff_client.name != client_list[0].name:
                    return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
                
                parent_batch  = Batch.objects.filter(childbatch__name__in = child_batch_names).distinct()
                lessons       = Lesson.objects.filter(batch__in = parent_batch)

                user_profiles = UserProfile.objects.filter(assosiatedbatches__name__in = child_batch_names, user__is_staff = False).distinct()
                    # print(user_profiles.count())

                total_videos         = VideoLectures.objects.filter(id__in=lessons.values('video'))
                total_mcq_assignment = MCQAssignment.objects.filter(id__in=lessons.values('MCQ_assignment'))
                total_problem        = Problem.objects.filter(id__in=lessons.values('problem'))
                total_assignment     = Assignments.objects.filter(id__in=lessons.values('assignment'))

                
                total_videos_watched_count        = 0
                total_solved_mcq_assignment_count = 0
                total_solved_problems             = 0
                total_solved_assignments          = 0 

                user_profiles_with_watch_count = user_profiles.annotate(watched_video_count=Count('watched_videos'))
                total_videos_watched_count = user_profiles_with_watch_count.filter(
                    watched_videos__in=total_videos).aggregate(
                        total_watched_videos_count=Count('watched_videos'))['total_watched_videos_count']

                user_profiles_with_mcq_count = user_profiles.annotate(solved_mcq_count=Count('mcq_assignments'))
                total_solved_mcq_assignment_count = user_profiles_with_mcq_count.filter(
                    mcq_assignments__in=total_mcq_assignment).aggregate(
                        total_solved_mcq_count=Count('mcq_assignments'))['total_solved_mcq_count']
                
                user_profiles_with_problem_count = user_profiles.annotate(solved_problems_count=Count('solved_problems'))
                total_solved_problems = user_profiles_with_problem_count.filter(
                    solved_problems__in=total_problem).aggregate(
                        total_solve_problem_count=Count('solved_problems'))['total_solve_problem_count']
                
                user_profiles_with_assignment_count = user_profiles.annotate(solved_assignment_count=Count('assignment_Submission'))
                total_solved_assignments = user_profiles_with_assignment_count.filter(
                    assignment_Submission__in=total_assignment).aggregate(
                        total_solve_assignment_count=Count('watched_videos'))['total_solve_assignment_count']

                #for getting Active users, Previously called last_seven_day_users                
                try:
                    start = request.data['start']
                    end   = request.data['end']
                except:
                    start = ''
                    end   = ''

                start_date = ''
                end_date   = ''
                total_days = 6
                if start == '' or end == '':
                    end_date = datetime.today()
                    end_date = end_date.date()
                    start_date = end_date - timezone.timedelta(days=7)

                else:
                    start_date = datetime.strptime(start, "%Y-%m-%d")
                    end_date   = datetime.strptime(end,   "%Y-%m-%d")
                    start_date = start_date.date()
                    end_date   = end_date.date()
                    total_days_time = end_date - start_date
                    total_days = total_days_time.days

                active_users = 0
                for user in user_profiles:
                    try:
                        if start_date <= user.last_login.date() <= end_date:
                            active_users += 1
                    except:
                        pass
                
                user_activities = UserActivity.objects.filter(batch_name__in = child_batch_names)
                user_activity_dict = {}

                for days in range(total_days ,-1,-1):
                    start_day_time = end_date - timedelta(days = days)
                    end_day_time   = end_date - timedelta(days = days - 1)
                    user_activity_dict[f"{start_day_time}"] = {
                        'P':user_activities.filter(content_type = "P",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
                        'A':user_activities.filter(content_type = "A",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
                        'M':user_activities.filter(content_type = "M",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
                        'V':user_activities.filter(content_type = "V",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
                    }
                
                completion_percent = ((total_videos_watched_count + total_solved_mcq_assignment_count + total_solved_problems + total_solved_assignments)*100)/((total_videos.count() + total_mcq_assignment.count() + total_problem.count() + total_assignment.count())*user_profiles.count())
                response_dict = {
                    "total_videos"                      : total_videos.count(),
                    "total_mcq_assignment"              : total_mcq_assignment.count(),
                    "total_problem"                     : total_problem.count(),
                    "total_assignment"                  : total_assignment.count(),
                    "total_user_count"                  : user_profiles.count(),
                    "total_videos_watched_count"        : total_videos_watched_count,
                    "total_solved_mcq_assignment_count" : total_solved_mcq_assignment_count,
                    "total_solved_problems"             : total_solved_problems,
                    "total_solved_assignments"          : total_solved_assignments,
                    "active_users"                      : active_users,
                    'user_activity'                     : user_activity_dict,
                    "completion_percent"                : (int(completion_percent * 100))/100
                }
                return Response(response_dict)
            except:
                return Response({"message": "Error Fetching Batch stats"})


class GetSpentTimeInfo(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self,request):
        user_id = self.request.user.get('id')
        user = User.objects.get(id=user_id)
        if not user.is_staff:
            return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
        else:
            staff_profile = UserProfile.objects.get(user = user)
            staff_client = staff_profile.client  

            child_batch_names = request.data['batch']
            try:
                start = request.data['start']
                end   = request.data['end']
            except:
                start = ''
                end   = ''
            start_date = ''
            end_date   = ''
            total_days = 6
            if start == '' or end == '':
                # date_time = timezone.now()
                # start_date = date_time.date()
                end_date = datetime.today()
                end_date = end_date.date()
                # total_days_time = end_date - start_date
                total_days = 6

            else:
                start_date = datetime.strptime(start, "%Y-%m-%d")
                end_date   = datetime.strptime(end, "%Y-%m-%d")
                start_date = start_date.date()
                end_date   = end_date.date()
                total_days_time = end_date - start_date
                total_days = total_days_time.days

            if child_batch_names == []: return Response("Please Provide child batch names", status= status.HTTP_400_BAD_REQUEST)

            user_profiles = UserProfile.objects.filter(assosiatedbatches__name__in = child_batch_names)
            
            # students = request.data['students']

            users = User.objects.filter(profile__in=user_profiles, is_staff = False).distinct()

            time_spent    = {}
            distinct_user = {}
            aggregate_time = 0
            aggregate_distinct_user_count = 0

            for days in range(total_days ,-1,-1):
                start_day_time = end_date - timedelta(days = days)
                end_day_time   = end_date - timedelta(days = days - 1)
                # print(end_day_time)
                usersessions   = UserSessions.objects.filter(user__in = users, session_start__gt = start_day_time, session_end__lt = end_day_time)
                # print(start_day_time.date())
                
                distinct_user_count = 0
                distinct_user_count = usersessions.values('user').distinct().count()
                aggregate_distinct_user_count = aggregate_distinct_user_count + distinct_user_count
                total_session_time = timedelta(weeks=0, days=0, hours=0, minutes=0)
                distinct_user[f"{start_day_time}"] = distinct_user_count

                for session in usersessions:
                    start_time = session.session_start
                    end_time = session.session_end
                    session_time = end_time - start_time 
                    # print(session_time)
                    total_session_time = total_session_time + session_time
                # print(total_session_time)
                total_seconds = total_session_time.total_seconds()              
                seconds_in_hour = 60 * 60                     
                total_session_time_hrs = total_seconds / seconds_in_hour  
                aggregate_time = aggregate_time + total_session_time_hrs
                time_spent[f"{start_day_time}"] = f"{total_session_time_hrs:.2f}"

            average_daily_distinct_users = aggregate_distinct_user_count/(total_days+1)
            res = {
                "time_spent" : time_spent,
                "distinct_user" : distinct_user,
                "aggregate_time" : f"{aggregate_time:.2f}",
                "average_daily_distinct_users" : f"{average_daily_distinct_users:.2f}"
            }

            return Response(res, status= status.HTTP_200_OK)
            
class CSVtoMCQ(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self,request):
        user_id = self.request.user.get('id')
        user = User.objects.get(id=user_id)
        if not user.is_staff:
            return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
        else:
            serializer = CSVUploadSerializer(data=request.data)
            if serializer.is_valid():
                file = request.FILES['file']
                batch = request.data['batch']
                try:
                    decoded_file = file.read().decode('utf-8')
                    io_string = io.StringIO(decoded_file)
                    df = pandas.read_csv(io_string)
                    res = csv_to_mcq.csv_to_mcq(df,batch)
                    return Response(res)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
class CSVtoQuestions(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request):        
        user_id = self.request.user.get('id')
        user = User.objects.get(id=user_id)
        if not user.is_staff:
            return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
        else:
            serializer = CSVUploadSerializer(data=request.data)
            if serializer.is_valid():
                file = request.FILES['file']
                try:
                    decoded_file = file.read().decode('utf-8')
                    io_string = io.StringIO(decoded_file)
                    df = pandas.read_csv(io_string)
                    res = csv_to_questions.csv_to_questions(df)
                    return Response(res)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        


class GetUserStats(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self,request):
        user_id = self.request.user.get('id')
        user = User.objects.get(id=user_id)
        if not user.is_staff:
            return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
        else:
            try:
                child_batch_names = request.data['batch']
                if child_batch_names == []: 
                    return Response({"message": "Please send batch"}, status=status.HTTP_400_BAD_REQUEST)
                staff_profile = UserProfile.objects.get(user = user)
                staff_client = staff_profile.client

                clients = set()  
            
                for batch in child_batch_names:
                    child_batch = ChildBatch.objects.get(name=batch)
                    parent_batch = child_batch.parentbatch
                    clients.add(parent_batch.client)

                client_list = list(clients)

                if len(client_list) > 1 or staff_client.name != client_list[0].name:
                    return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
                
                parent_batch  = Batch.objects.filter(childbatch__name__in = child_batch_names).distinct()
                lessons       = Lesson.objects.filter(batch__in = parent_batch)

                student = request.data['student']
                
                user_profile = UserProfile.objects.get(user__username = student)
                student_user  = User.objects.get(username = student)

                total_videos         = VideoLectures.objects.filter(id__in=lessons.values('video'))
                total_mcq_assignment = MCQAssignment.objects.filter(id__in=lessons.values('MCQ_assignment'))
                total_problem        = Problem.objects.filter(id__in=lessons.values('problem'))
                total_assignment     = Assignments.objects.filter(id__in=lessons.values('assignment'))

                
                total_videos_watched_count        = user_profile.watched_videos.filter(id__in = total_videos).count()
                total_solved_mcq_assignment_count = user_profile.mcq_assignments.filter(id__in = total_mcq_assignment).count()
                total_solved_problems             = user_profile.solved_problems.filter(id__in = total_videos).count()
                total_solved_assignments          = user_profile.assignment_Submission.filter(id__in = total_videos).count()

                # for getting Active users, Previously called last_seven_day_users                
                
                try:
                    start = request.data['start']
                    end   = request.data['end']
                except:
                    start = ''
                    end   = ''

                start_date = ''
                end_date   = ''
                total_days = 6
                if start == '' or end == '':
                    end_date = datetime.today()
                    end_date = end_date.date()
                    start_date = end_date - timezone.timedelta(days=7)

                else:
                    start_date = datetime.strptime(start, "%Y-%m-%d")
                    end_date   = datetime.strptime(end,   "%Y-%m-%d")
                    start_date = start_date.date()
                    end_date   = end_date.date()
                    total_days_time = end_date - start_date
                    total_days = total_days_time.days

                if start_date <= user.last_login.date() <= end_date:
                    active = True
                else:
                    active = False
                
                user_activities = UserActivity.objects.filter(batch_name__in = child_batch_names, user = student_user)
                user_activity_dict = {}

                for days in range(total_days ,-1,-1):
                    start_day_time = end_date - timedelta(days = days)
                    end_day_time   = end_date - timedelta(days = days - 1)
                    user_activity_dict[f"{start_day_time}"] = {
                        'P':user_activities.filter(content_type = "P",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
                        'A':user_activities.filter(content_type = "A",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
                        'M':user_activities.filter(content_type = "M",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
                        'V':user_activities.filter(content_type = "V",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
                    }
                
                completion_percent = ((total_videos_watched_count + total_solved_mcq_assignment_count + total_solved_problems + total_solved_assignments)*100)/(total_videos.count() + total_mcq_assignment.count() + total_problem.count() + total_assignment.count())
                response_dict = {
                    "total_videos"                      : total_videos.count(),
                    "total_mcq_assignment"              : total_mcq_assignment.count(),
                    "total_problem"                     : total_problem.count(),
                    "total_assignment"                  : total_assignment.count(),
                    "total_user_count"                  : 1,
                    "total_videos_watched_count"        : total_videos_watched_count,
                    "total_solved_mcq_assignment_count" : total_solved_mcq_assignment_count,
                    "total_solved_problems"             : total_solved_problems,
                    "total_solved_assignments"          : total_solved_assignments,
                    "active"                            : active,
                    'user_activity'                     : user_activity_dict,
                    "completion_percent"                : (int(completion_percent * 100))/100
                }
                return Response(response_dict)
            except:
                return Response({"message": "Error Fetching user stats"})


class SpentTimeInfoUser(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self,request):
        user_id = self.request.user.get('id')
        user = User.objects.get(id=user_id)
        if not user.is_staff:
            return Response({"message": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
        else:
            child_batch_names = request.data['batch']
            try:
                start = request.data['start']
                end   = request.data['end']
            except:
                start = ''
                end   = ''
            start_date = ''
            end_date   = ''
            total_days = 6
            if start == '' or end == '':
                end_date = datetime.today()
                end_date = end_date.date()
                total_days = 6

            else:
                start_date = datetime.strptime(start, "%Y-%m-%d")
                end_date   = datetime.strptime(end, "%Y-%m-%d")
                start_date = start_date.date()
                end_date   = end_date.date()
                total_days_time = end_date - start_date
                total_days = total_days_time.days

            if child_batch_names == []: return Response("Please Provide child batch names", status= status.HTTP_400_BAD_REQUEST)

            student = request.data['student']
                
            user_profiles = UserProfile.objects.filter(user__username = student).distinct()
            if user_profiles.count() == 0:
                return Response("User doesn't exist", status= status.HTTP_400_BAD_REQUEST)
            users = User.objects.filter(profile__in=user_profiles).distinct()

            time_spent    = {}
            active_days = {}
            aggregate_time = 0

            for days in range(total_days ,-1,-1):
                start_day_time = end_date - timedelta(days = days)
                end_day_time   = end_date - timedelta(days = days - 1)
                usersessions   = UserSessions.objects.filter(user__in = users, session_start__gt = start_day_time, session_end__lt = end_day_time)
                count = usersessions.values('user').distinct().count()
                active = False
                if count != 0: active = True
                
                total_session_time = timedelta(weeks=0, days=0, hours=0, minutes=0)
                active_days[f"{start_day_time}"] = active

                for session in usersessions:
                    start_time = session.session_start
                    end_time = session.session_end
                    session_time = end_time - start_time 
                    # print(session_time)
                    total_session_time = total_session_time + session_time
                # print(total_session_time)
                total_seconds = total_session_time.total_seconds()              
                seconds_in_hour = 60 * 60                     
                total_session_time_hrs = total_seconds / seconds_in_hour  
                aggregate_time = aggregate_time + total_session_time_hrs
                time_spent[f"{start_day_time}"] = f"{total_session_time_hrs:.2f}"

            res = {
                "time_spent" : time_spent,
                "active_days" : active_days,
                "aggregate_time" : f"{aggregate_time:.2f}",
            }

            return Response(res, status= status.HTTP_200_OK)

class TriggerBatchStatsEmail(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def get(self, request):
        emails = ["dhruvgupta3377@gmail.com", "dgupta7_be21@thapar.edu"]
        # send_batch_stats_email("Capabl DS-0124",emails)   
        start_sending_batch_emails()
        return Response("triggered", status= status.HTTP_200_OK)

class UserDataExportAPIView(APIView):
    """
    API endpoint to export user data for specified usernames.
    """
    def post(self, request):
        usernames = request.data.get("usernames", [])
        
        if not usernames or not isinstance(usernames, list):
            return Response(
                {"error": "Please provide a valid list of usernames."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_data = []

        for i, username in enumerate(usernames, start=1):
            print(f"Processing {i}/{len(usernames)}: {username}")

            user = User.objects.filter(username=username).first()
            if user:
                videos_watched = UserScoreData.objects.filter(
                    user=user, type="V", score__gt=0
                ).values_list("title", flat=True)
                quizzes_attempted = UserScoreData.objects.filter(
                    user=user, type="M", score__gt=0
                ).values_list("title", flat=True)
                problems_solved = UserScoreData.objects.filter(
                    user=user, type="P", score__gt=0
                ).values_list("title", flat=True)
                assignments_solved = UserScoreData.objects.filter(
                    user=user, type="A", score__gt=0
                ).values_list("title", flat=True)

                user_data.append({
                    "username": username,
                    "videos_watched": list(videos_watched),
                    "videos_watched_count": len(videos_watched),
                    "quizzes_attempted": list(quizzes_attempted),
                    "quizzes_attempted_count": len(quizzes_attempted),
                    "problems_solved": list(problems_solved),
                    "problems_solved_count": len(problems_solved),
                    "assignments_solved": list(assignments_solved),
                    "assignments_solved_count": len(assignments_solved),
                })
            else:
                print(f"User not found: {username}")
                user_data.append({
                    "username": username,
                    "error": "User not found"
                })

        return Response(user_data, status=status.HTTP_200_OK)