from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError
from django.core.validators import validate_email
import re
from batches.models import Assignments,  MCQAssignment, Problem, MCQQuestions
from accounts.models import User
from .models import Assessment_v2, AssessmentItem_v2
from batches.models import ChildBatch
from django.db import transaction
from submissions.models import CodeSubmission
from submissions.serializers import CodeSubmissionSerializer
from django.db.models import Count
from django.db.models.functions import Random
from django.db.models import Q

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'name', 'phone_number', 'is_staff']

class UserAssessmentQuestionsSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    coding_easy_problems = serializers.SerializerMethodField()
    coding_medium_problems = serializers.SerializerMethodField()
    coding_hard_problems = serializers.SerializerMethodField()
    mcq_technical = serializers.SerializerMethodField()
    mcq_aptitude = serializers.SerializerMethodField()
    # rank = serializers.SerializerMethodField()

    class Meta:
        model = AssessmentItem_v2
        fields = '__all__'  # Include all fields by default
    
    
    def get_coding_easy_problems(self, obj):
        coding_easy_problems = AssessmentItem_v2.objects.filter(Q(sections_type='CodingProblem') & Q(coding_problem__difficulty_level="easy")).order_by(Random())[:2]
        return coding_easy_problems
    
    def get_coding_medium_problems(self, obj):
        coding_medium_problems = AssessmentItem_v2.objects.filter(Q(sections_type='CodingProblem') & Q(coding_problem__difficulty_level="medium")).order_by(Random())[:2]    #     return coding_medium_problems
        return coding_medium_problems

    def get_coding_hard_problems(self, obj):
        coding_hard_problems = AssessmentItem_v2.objects.filter(Q(sections_type='CodingProblem') & Q(coding_problem__difficulty_level="hard")).order_by(Random())[:2]
        return coding_hard_problems
    
    
    def get_mcq_technical(self, obj):
        get_coding_hard_problems = AssessmentItem_v2.objects.filter(sections_type='MCQ(Technical)').order_by(Random())[:30]
        return get_coding_hard_problems
    
    
    def get_mcq_aptitude(self, obj):
        get_coding_hard_problems = Problem.objects.filter(sections_type="MCQ(QuantitativeAptitude)").order_by(Random())[:30]
        return get_coding_hard_problems
  
class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment_v2
        fields = '__all__'
