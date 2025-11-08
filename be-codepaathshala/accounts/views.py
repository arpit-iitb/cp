from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from accounts.serializers import UserRegistrationSerializer, LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from services.authentication import CJAuthentication
from services.permissions import UserAuthenticated 
from accounts.models import UserProfile, User, UserSessions, Otp
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from .serializers import ChildBatchSerializer, UserProfileUpdateSerializer, ChangePasswordSerializer
from django.contrib.auth.hashers import make_password
from utils.util import forget_password_email
from django.template.loader import render_to_string
from django.utils import timezone
from datetime import timedelta
import random

class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Registration Successful'}, status=status.HTTP_201_CREATED)
        error_msg = serializer.errors.get('error',['Some thing went wrong'])[0]
        return Response({"message":error_msg}, status=status.HTTP_400_BAD_REQUEST)

class LoginAPIView(APIView):
    
    def post(self, request):        
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            token = RefreshToken.for_user(validated_data)
            response_data = {
                'message': 'Login successful',
                'token': str(token.access_token),
            }
            
            queryset = UserProfile.objects.select_related('user').filter(user=validated_data)
            obj = queryset.first()
            if obj is None:
                # Create a profile if it doesn't exist for the authenticated user
                obj = UserProfile.objects.create(user=validated_data)
            res = UserProfileUpdateSerializer(obj)
            response_data.update(dict(res.data))
            if validated_data.is_staff:
                response_data['client_id_vimeo']=obj.client.client_id_vimeo
                response_data['project_id_vimeo']=obj.client.project_id_vimeo
            response_data["user_id"] = validated_data.pk
            response = Response(response_data, status=status.HTTP_200_OK)

            return response
        else:
            error_msg = serializer.errors.get('error',['Some thing went wrong'])[0]
            return Response({"message":error_msg}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(RetrieveUpdateAPIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    serializer_class = UserProfileUpdateSerializer

    def get_queryset(self):
        return UserProfile.objects.select_related('user').filter(user=self.request.user.get('id'))

    def get_object(self):
        queryset = self.get_queryset()
        obj = queryset.first()
        if obj is None:
            # Create a profile if it doesn't exist for the authenticated user
            obj = UserProfile.objects.create(user=self.request.user.get('id'))
        return obj

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Updated Successfully'})


class ChangePasswordView(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]

    def get_object(self):
        return User.objects.get(id=self.request.user.get('id'))

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = self.get_object()
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            confirm_new_password = serializer.validated_data['confirm_new_password']

            if not User.is_password_valid(old_password,user.password):
                return Response({"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

            if new_password != confirm_new_password:
                return Response({"error": "New passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()

            # Generate new refresh token
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)
            # Set the cookie
            response.set_cookie(key='cjcookie', value=access_token, secure=False, httponly=False)
            return response
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AssosiatedBatchesView(ListAPIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    serializer_class = ChildBatchSerializer

    def get_queryset(self):
        user_id = self.request.user.get('id')        
        user = UserProfile.objects.get(user__id=user_id)
        return user.assosiatedbatches.all()
        




class RestPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({'message': 'Email field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        associated_user = User.objects.filter(email=email).first()

        if not associated_user:
            return Response({'message': 'No user associated with this email.'}, status=status.HTTP_404_NOT_FOUND)
        otp = random.randint(1001, 9999)

        user_otp = Otp.objects.filter(user = associated_user).first()
        if user_otp:
            if user_otp.creation_time + timedelta(minutes = 10) > timezone.now():
                return Response ({'message': 'OTP has already been sent.'}, status=status.HTTP_200_OK)
            
        otp_entry, created = Otp.objects.update_or_create(
        user=associated_user,
        defaults={'otp': otp, 'creation_time': timezone.now()}
        )

        email_subject = 'CodingJudge || Password Reset Request'
        email_body = render_to_string('password_reset_email.html', {
            'user': associated_user,
            'OTP': otp
        })
  
        forget_password_email(email_subject,email_body,[associated_user.email])

        return Response({'message': 'OTP has been sent.'}, status=status.HTTP_200_OK)
    

class SetNewPassword(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        newpass = request.data.get('newpass')
        newpass_again = request.data.get('newpass_again')
        if not email or not newpass or not newpass_again or not otp:
            return Response({'message' : 'Please Send All the Required Fields'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            associated_user = User.objects.filter(email=email).first()
            if not associated_user:
                return Response({'message' : 'No user associated with this email.'}, status=status.HTTP_404_NOT_FOUND)
            if newpass != newpass_again:
                return Response({'message' : 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
            latest_otp = Otp.objects.filter(user=associated_user).order_by('-creation_time').first()
            if not latest_otp:
                return Response({'message' : 'Please Generate the OTP first'}, status=status.HTTP_401_UNAUTHORIZED)
            valid_time = latest_otp.creation_time + timedelta(minutes=10)
            if timezone.now() > valid_time:
                return Response({'message' : 'Please Generate the OTP again, OTP time has been expired'}, status=status.HTTP_401_UNAUTHORIZED)
            try:
                if otp.strip() == str(latest_otp.otp):
                    associated_user.set_password(newpass)
                    associated_user.save()
                    Otp.objects.filter(user=associated_user).delete()
                    return Response({'message' : 'Password Changes Successfully'}, status=status.HTTP_200_OK)
            except:
                return Response({'message' : 'Unable to Change Password please try again'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({'message' : 'OTP incorrect'}, status=status.HTTP_401_UNAUTHORIZED)
        
class SessionLogger(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self, request, action):
        try:
            user_id = self.request.user.get('id')
            user = User.objects.get(id = user_id)
            username = user.username
            if action == 'start':
                session = UserSessions.objects.filter(user = user, ended = False).order_by("-session_start").first()
                if session:
                    return Response({"message": "Running session present"})

                usersession = UserSessions(user = user, session_start = timezone.now(), session_end = timezone.now())
                usersession.save()
                return Response({"message": "Session Started"})
            elif action == 'end':
                usersession = UserSessions.objects.filter(user = user).order_by("-session_start").first()
                if usersession.ended:
                    return Response({"message": "No running session Present"})
                usersession.session_end = timezone.now()
                usersession.ended = True
                usersession.save()
                # threshold_date = timezone.now() - timedelta(days = 7)
                # UserSessions.objects.filter(session_end__lt=threshold_date).delete()
                return Response({"message": "Session Ended"})
            elif action == 'endprev':
                sessions = UserSessions.objects.filter(user = user, ended = False).order_by("-session_start")
                for session in sessions:
                    session.ended = True
                    session.save()
                return Response({"message": "All Previous sessions Ended"})
            elif action == 'keep_alive':
                usersession = UserSessions.objects.filter(user = user).order_by("-session_start").first()
                if usersession.ended:
                    return Response({"message": "No running session Present"})
                usersession.session_end = timezone.now()
                usersession.save()
                return Response({"message": "kept alive"})
            else:
                return Response({"message": "Not a valid Action"})
        except:
            return Response({"message": 'Unable to Log this session or No running session present'})

class GetSpentTimeInfoUser(APIView):
    authentication_classes = [CJAuthentication]
    permission_classes = [UserAuthenticated]
    def post(self,request):
        user_id = self.request.user.get('id')
        user = User.objects.get(id=user_id)
        weekly_time_spent    = {}
        aggregate_time = 0
        usersessions_all   = UserSessions.objects.filter(user = user)
        for days in range(6,-1,-1):
            start_day_time = timezone.now() - timedelta(days = days + 1)
            end_day_time   = timezone.now() - timedelta(days = days)
            usersessions   = usersessions_all.filter(session_start__gt = start_day_time, session_end__lt = end_day_time)
            total_session_time = timedelta(weeks=0, days=0, hours=0, minutes=0)

            for session in usersessions:
                start_time = session.session_start
                end_time = session.session_end
                session_time = end_time - start_time 
                total_session_time = total_session_time + session_time
            total_seconds = total_session_time.total_seconds()              
            seconds_in_hour = 60 * 60                     
            total_session_time_hrs = total_seconds / seconds_in_hour  
            aggregate_time = aggregate_time + total_session_time_hrs
            weekly_time_spent[f"{end_day_time.date()}"] = f"{total_session_time_hrs:.2f}"

        res = {
            "weekly_time_spent" : weekly_time_spent,
            "aggregate_time" : f"{aggregate_time:.2f}",
        }
        return Response(res, status= status.HTTP_200_OK)

from .tasks import test_task
from django.http import HttpResponse
class CeleryTest(APIView):
    def get(self, request):
        try:
            test_task.delay()
            return HttpResponse("success")
        except Exception as e:
            print(e)
            return HttpResponse("fail")