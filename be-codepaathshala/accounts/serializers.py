from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError
from django.core.validators import validate_email
import re
from accounts.models import User, UserProfile
from batches.models import ChildBatch
from django.db import transaction
from submissions.models import CodeSubmission
from submissions.serializers import CodeSubmissionSerializer
from django.db.models import Count
from django.db.models.functions import TruncDate

class UserRegistrationSerializer(serializers.ModelSerializer):
    
    username = serializers.CharField(required=True,write_only=True)
    email = serializers.CharField(required=True,write_only=True)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'password','confirm_password', 'email')
    
    def validate_email(self, value):
        # Validate that the input is a valid email address
        try:
            validate_email(value)
        except ValidationError:
            raise ValidationError({"error":"Enter a valid email address."})
        
        # Check if email already exists
        if not User.is_email_available(email=value):
            raise ValidationError({"error":"Email is already in use."})
        return value
    
    def validate_username(self, value):
        # Check for special characters in username
        if not re.match("^[a-zA-Z0-9_.-]+$", value):
            raise ValidationError({"error":"Username should only contain letters, numbers, dots, hyphens, and underscores."})
        
        # Check if username already exists
        if not User.is_username_available(username=value):
            raise ValidationError({"error":"Username is already taken."})
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise ValidationError({"error": "Passwords do not match."})
        return attrs
   
    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['email'],
            validated_data['username'],
            validated_data['password']
        )
        # UserProfile.objects.create(user=user)
        return user

class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    
    def validate(self, data):
        from rest_framework_simplejwt.tokens import RefreshToken
        if '@' not in data["username_or_email"]:
            # Login with username
            try:
                user = User.objects.get(username=data['username_or_email'])
            except User.DoesNotExist:
                raise ValidationError({"error": "Username does not exist"})
        else:
            # Login with email
            try:
                user = User.objects.get(email__iexact=data['username_or_email'])
            except User.DoesNotExist:
                raise ValidationError({"error": "Email does not exist"})

        if not User.is_password_valid(data['password'], user.password):
            raise ValidationError({"error": "Invalid credentials"})

        return user

class ChildBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildBatch
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'name', 'phone_number', 'is_staff'] 

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    recent_problems = serializers.SerializerMethodField()
    total_submissions = serializers.SerializerMethodField()
    submission_count_by_date = serializers.SerializerMethodField()
    # rank = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = '__all__'  # Include all fields by default
    
    def get_recent_problems(self, obj):
        submissions = CodeSubmission.objects.filter(user=obj.user,judgment='Passed').order_by('-submission_date')[:3]
        serializer = CodeSubmissionSerializer(submissions, many=True)
        return serializer.data
    
    def get_total_submissions(self, obj):
        submissions_count = CodeSubmission.objects.filter(user=obj.user).count()
        return submissions_count
    
    # def get_rank(self, obj):
    #     # submissions = CodeSubmission.objects.filter(user=obj.user,judgment='Passed').order_by('-submission_date')[:3]
    #     # serializer = CodeSubmissionSerializer(submissions, many=True)
    #     return 1

    def update(self, instance, validated_data):
        # Only update linkedin_url and github_url
        instance.linkedin_url = validated_data.get('linkedin_url', instance.linkedin_url)
        instance.github_url = validated_data.get('github_url', instance.github_url)
        instance.save()
        return instance

    def get_submission_count_by_date(self, obj):
        user = obj.user  # Assuming UserProfile has a 'user' ForeignKey
        submission_count_by_date = CodeSubmission.objects.filter(user=user) \
         .annotate(date=TruncDate('submission_date')) \
            .values('date') \
            .annotate(value=Count('id'))
        return submission_count_by_date

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)
